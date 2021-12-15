class Product {
  constructor({ ean, title, store, url, img, description, price, discount, volume, weight }) {
    this.ean = ean;
    this.title = title;
    this.store = store;
    this.url = url;
    this.img = img;
    this.description = description;
    this.price = price;
    this.discount = discount;
    this.volume = volume;
    this.weight = weight;
  }
}

module.exports = Product;
