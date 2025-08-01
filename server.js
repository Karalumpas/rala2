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

app.post('/api/products/:shopId', async (req, res) => {
  const shop = shops.find((s) => s.id === req.params.shopId);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  const updates = Array.isArray(req.body) ? req.body : req.body.products;
  if (!Array.isArray(updates)) return res.status(400).json({ error: 'Invalid request body' });

  const baseUrl = shop.url.replace(/\/$/, '');
  const auth = `consumer_key=${shop.consumerKey}&consumer_secret=${shop.consumerSecret}`;
  const results = [];

  for (const item of updates) {
    if (!item.sku) continue;
    try {
      const searchUrl = `${baseUrl}/wp-json/wc/v3/products?sku=${encodeURIComponent(item.sku)}&${auth}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const product = searchData && searchData[0];
      if (!product) {
        results.push({ sku: item.sku, error: 'not found' });
        continue;
      }

      const updateUrl = `${baseUrl}/wp-json/wc/v3/products/${product.id}?${auth}`;
      const body = {};
      if (item.price) body.regular_price = String(item.price);
      if (item.status) body.status = item.status;
      if (item.category) {
        try {
          const catUrl = `${baseUrl}/wp-json/wc/v3/products/categories?search=${encodeURIComponent(item.category)}&${auth}`;
          const catRes = await fetch(catUrl);
          const categories = await catRes.json();
          const cat = categories.find(c => c.name.toLowerCase() === item.category.toLowerCase());
          if (cat) body.categories = [{ id: cat.id }];
        } catch (e) {
          console.error('Category lookup failed', e);
        }
      }
      const updateRes = await fetch(updateUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (updateRes.ok) {
        results.push({ sku: item.sku, status: 'updated' });
      } else {
        const errText = await updateRes.text();
        results.push({ sku: item.sku, error: errText });
      }
    } catch (err) {
      results.push({ sku: item.sku, error: err.message });
    }
  }

  res.json({ results });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
