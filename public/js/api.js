// Fetch shops and products from backend API

document.addEventListener('DOMContentLoaded', () => {
  loadShops();
  const select = document.getElementById('shopSelect');
  if (select) {
    select.addEventListener('change', () => {
      if (select.value) {
        loadProducts(select.value);
      }
    });
  }
});

async function loadShops() {
  try {
    const res = await fetch('/api/shops');
    const shops = await res.json();
    const select = document.getElementById('shopSelect');
    const list = document.getElementById('shopList');
    if (select) {
      select.innerHTML = '<option value="">V\u00e6lg en shop</option>';
    }
    if (list) list.innerHTML = '';
    shops.forEach(shop => {
      if (select) {
        const opt = document.createElement('option');
        opt.value = shop.id;
        opt.textContent = shop.name;
        select.appendChild(opt);
      }
      if (list) {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.textContent = `${shop.name} - ${shop.url}`;
        list.appendChild(div);
      }
    });
  } catch (err) {
    console.error('Failed to load shops', err);
  }
}

async function loadProducts(shopId) {
  const tbody = document.getElementById('productTableBody');
  if (tbody) tbody.innerHTML = '';
  try {
    const res = await fetch(`/api/products/${shopId}`);
    const products = await res.json();
    products.forEach(prod => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td></td>
        <td>${prod.name}</td>
        <td>${prod.sku || ''}</td>
        <td>${prod.stock_status || ''}</td>
        <td>${prod.price || ''}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${prod.images && prod.images[0] ? `<img src="${prod.images[0].src}" class="product-image">` : ''}</td>`;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Failed to load products', err);
  }
}
