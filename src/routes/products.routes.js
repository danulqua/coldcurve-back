const { Router } = require('express');
const service = require('../services/stores.service');

const router = Router();

// Request products by product name in all stores
router.post('/:name', async (req, res) => {
  try {
    const filters = JSON.parse(req.body.body);
    const data = await service.searchProductsAllStores(req.params.name, filters);
    res.status(200).json(data);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = router;
