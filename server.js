const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3500;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let shops = [];
if (process.env.SHOP_CONFIGS) {
  try {
    shops = JSON.parse(process.env.SHOP_CONFIGS);
  } catch (err) {
    console.error('Invalid SHOP_CONFIGS JSON');
  }
}

app.get('/api/shops', (req, res) => {
  const sanitized = shops.map(({ id, name, url }) => ({ id, name, url }));
  res.json(sanitized);
});

app.get('/api/products/:shopId', async (req, res) => {
  const shop = shops.find((s) => s.id === req.params.shopId);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  const baseUrl = shop.url.replace(/\/$/, '');
  const url = `${baseUrl}/wp-json/wc/v3/products?consumer_key=${shop.consumerKey}&consumer_secret=${shop.consumerSecret}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).json({ error: await response.text() });
    const products = await response.json();
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
