# WooCommerce Product Viewer (Node.js)

This project displays parent and variation products from CSV files and allows basic management features.

## Setup

Install dependencies:

```bash
npm install
```

Set up shops by providing a `SHOP_CONFIGS` environment variable containing a JSON array with shop credentials, for example:

```bash
export SHOP_CONFIGS='[{"id":"demo","name":"Demo Shop","url":"https://example.com","consumerKey":"ck_xxx","consumerSecret":"cs_xxx"}]'
```

Run the development server:

```bash
npm start
```

The application will be available at http://localhost:3500 .
