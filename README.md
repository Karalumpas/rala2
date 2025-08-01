# WooCommerce Product Viewer (Node.js)

This project displays parent and variation products from CSV files and allows basic management features. Selected products can be updated directly on your WooCommerce shops using the built in API endpoints.

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

## Updating products via API

When products are selected in the UI, the "Send til WooCommerce" button will post
the changes to `/api/products/{shopId}`. The server locates each product by SKU
and updates the price and category on the chosen shop using the WooCommerce REST
API.

## Loading products from WooCommerce

Selecting a shop now triggers a request to `/api/products/{shopId}` which
fetches all products from the configured WooCommerce store. For each product the
server also requests its variations so the response contains two arrays:
`products` and `variations`. The client maps these and shows variation images in
the product table.

## Shop management persistence

The list of shops is stored in the browser's `localStorage`. When the page
loads, the application tries to read the cached list before requesting
`/api/shops`. Adding, editing or deleting a shop triggers a refresh which
updates the cached data so the latest list is available on the next visit.
