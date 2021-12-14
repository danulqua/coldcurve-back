const { Router } = require('express');
const service = require('../services/stores.service');

const router = Router();

// Request all store names
router.get('/', async (req, res) => {
  try {
    const stores = await service.getRetailChains();
    res.status(200).send(stores);
  } catch (err) {
    throw new Error(err);
  }
});

// Request products by store id and product name
router.post('/:storeId/:name', async (req, res) => {
  try {
    const { storeId, name } = req.params;
    const filters = JSON.parse(req.body.body);
    const data = await service.searchProductsByStore(name, storeId, filters);
    res.status(200).send(data);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = router;
