const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60, checkperiod: 90 });

const { capitalize } = require('../helpers/helpers');

class Service {
  // API URL
  _apiBase = 'https://stores-api.zakaz.ua';

  // Get all store names
  async getRetailChains() {
    try {
      // Try to read cache
      const cachedValue = cache.get('stores');
      if (cachedValue) {
        return cachedValue;
      }

      // Make request to get known about stores
      const data = (await axios(`${this._apiBase}/stores`)).data;
      const stores = [];

      // Fill stores array with unique stores
      data.forEach((shop) => {
        const { id, retail_chain } = shop;

        if (!stores.find((item) => item.name.toLowerCase() === retail_chain)) {
          stores.push({ id, name: capitalize(retail_chain) });
        }
      });

      // Set cache
      cache.set('stores', stores);
      return stores;
    } catch (err) {
      throw new Error(err);
    }
  }

  // Get products by store id
  async searchProductsByStore(query, storeId, filters) {
    try {
      // Try to read cache
      const cachedValue = cache.get(`${storeId}/${query}`);
      if (cachedValue) {
        return this._filterResults(cachedValue, filters);
      }

      // Make request to get products
      const data = (
        await axios(
          `${this._apiBase}/stores/${storeId}/products/search?q=${encodeURIComponent(query)}`
        )
      ).data;

      // Find store name by the store id
      const storeName = (await this.getRetailChains()).find((item) => item.id === storeId).name;

      // Transform the result set
      let resultsArray = data.results
        .filter((item) => item.in_stock === true)
        .map((item) => this._transformProduct(item, storeName));

      // Set cache
      cache.set(`${storeId}/${query}`, resultsArray);

      // Filter result set with user filters
      resultsArray = this._filterResults(resultsArray, filters);
      return resultsArray;
    } catch (err) {
      throw new Error(err);
    }
  }

  // Get products in all stores
  async searchProductsAllStores(query, filters) {
    try {
      // Try to read cache
      const cachedValue = cache.get(query);
      if (cachedValue) {
        return this._filterResults(cachedValue, filters);
      }

      let resultsArray = [];
      // Get stores
      const stores = await this.getRetailChains();

      // Create promise array where every promise is going to make request to the specific store
      const promiseArray = stores.map((store) =>
        axios.get(
          `${this._apiBase}/stores/${store.id}/products/search?q=${encodeURIComponent(query)}`
        )
      );

      // Wait until all requests will be finished
      const resolvedPromises = await Promise.all(promiseArray);

      // Merge and transform result sets
      resolvedPromises.forEach((response, idx) => {
        resultsArray = [
          ...resultsArray,
          ...response.data.results
            .filter((item) => item.in_stock === true)
            .map((product) => this._transformProduct(product, stores[idx].name)),
        ];
      });

      // Set cache
      cache.set(query, resultsArray);

      // Filter result set with user filters
      resultsArray = this._filterResults(resultsArray, filters);
      return resultsArray;
    } catch (err) {
      throw new Error(err);
    }
  }

  // Transform product item in order to get rid of unnecessary properties
  _transformProduct(product, storeName) {
    return {
      ean: product.ean,
      title: product.title,
      store: storeName,
      url: product.web_url,
      img: product.img?.s350x350,
      description: product.description || null,
      price: product.price / 100,
      discount: !product.discount.value
        ? null
        : {
            value: product.discount.value,
            oldPrice: product.discount.old_price / 100,
          },
      volume: product.volume,
      weight: product.weight,
    };
  }

  // Filter array with user filters
  _filterResults(data, { maxPrice, discountsOnly }) {
    let filteredData = [];

    filteredData = maxPrice ? data.filter((item) => item.price <= maxPrice) : data;
    filteredData = discountsOnly ? filteredData.filter((item) => item.discount) : filteredData;

    return filteredData;
  }
}

module.exports = new Service();
