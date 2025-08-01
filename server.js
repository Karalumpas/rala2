const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3500;

const shops = JSON.parse(process.env.SHOPS || '[]');

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// List shops without exposing credentials
app.get('/api/shops', (req, res) => {
  const publicShops = shops.map(({ id, name, url }) => ({ id, name, url }));
  res.json(publicShops);
});

// Fetch products from WooCommerce for a given shop
app.get('/api/products/:shopId', async (req, res) => {
  const { shopId } = req.params;
  const shop = shops.find(s => String(s.id) === String(shopId));
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  try {
    const baseUrl = shop.url.replace(/\/$/, '');
    const apiUrl = `${baseUrl}/wp-json/wc/v3/products?per_page=100&consumer_key=${shop.consumerKey}&consumer_secret=${shop.consumerSecret}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
