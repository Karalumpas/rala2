// Shop management using server API

window.shops = [];

async function loadShops() {
    try {
        const res = await fetch('/api/shops');
        window.shops = await res.json();
        updateShopSelect();
    } catch (err) {
        console.error('Failed to load shops', err);
    }
}

document.addEventListener('DOMContentLoaded', loadShops);

function openShopManager() {
    renderShops();
    shopManagerModal.classList.add('active');
}

function closeShopManager() {
    shopManagerModal.classList.remove('active');
}

function renderShops() {
    shopList.innerHTML = '';
    if (shops.length === 0) {
        shopList.innerHTML = '<div class="shop-item"><p>Ingen shops tilgængelige</p></div>';
        return;
    }
    shops.forEach(shop => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.innerHTML = `<div class="shop-info"><h3>${shop.name}</h3><p>${shop.url}</p></div>`;
        shopList.appendChild(item);
    });
}

function updateShopSelect() {
    shopSelect.innerHTML = '<option value="">Vælg en shop</option>';
    shops.forEach((shop, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = shop.name;
        shopSelect.appendChild(option);
    });
}
