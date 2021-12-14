require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3001;

// Import routes
const storesRoutes = require('./routes/stores.routes');
const productsRoutes = require('./routes/products.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use('/stores', storesRoutes);
app.use('/products', productsRoutes);

app.get('/', async (req, res) => {
  res.status(200).send({ ok: true });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
