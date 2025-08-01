// Shop management using server API

window.shops = [];

function saveShopsLocal() {
    try {
        localStorage.setItem('shops', JSON.stringify(window.shops));
    } catch (e) {
        console.error('Failed to store shops locally', e);
    }
}

async function loadShops(forceServer = false) {
    if (!forceServer) {
        const stored = localStorage.getItem('shops');
        if (stored) {
            try {
                window.shops = JSON.parse(stored);
                updateShopSelect();
                return;
            } catch (e) {
                console.error('Failed to parse shops from storage', e);
            }
        }
    }
    try {
        const res = await fetch('/api/shops');
        window.shops = await res.json();
        saveShopsLocal();
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
        item.innerHTML = `
            <div class="shop-info">
                <h3>${shop.name}</h3>
                <p>${shop.url}</p>
            </div>
            <div class="shop-actions">
                <button class="btn-icon edit" onclick="showShopForm(${shop.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteShop(${shop.id})"><i class="fas fa-trash"></i></button>
                <button class="btn-icon" onclick="testShopConnectionFromList('${shop.url}', '${shop.consumerKey}', '${shop.consumerSecret}')"><i class="fas fa-plug"></i></button>
            </div>
        `;
        shopList.appendChild(item);
    });
}
// Form og CRUD logik
const shopFormSection = document.getElementById('shopFormSection');
const shopListSection = document.getElementById('shopListSection');
const shopForm = document.getElementById('shopForm');

function showShopForm(id = null) {
    shopFormSection.classList.remove('hidden');
    shopListSection.classList.add('hidden');
    if (id) {
        const shop = shops.find(s => s.id === id);
        document.getElementById('shopName').value = shop.name;
        document.getElementById('shopUrl').value = shop.url;
        document.getElementById('shopConsumerKey').value = shop.consumerKey || '';
        document.getElementById('shopConsumerSecret').value = shop.consumerSecret || '';
        shopForm.dataset.editId = shop.id;
    } else {
        shopForm.reset();
        shopForm.dataset.editId = '';
    }
    document.getElementById('testResult').textContent = '';
}

function hideShopForm() {
    shopFormSection.classList.add('hidden');
    shopListSection.classList.remove('hidden');
}

shopForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('shopName').value;
    const url = document.getElementById('shopUrl').value;
    const consumerKey = document.getElementById('shopConsumerKey').value;
    const consumerSecret = document.getElementById('shopConsumerSecret').value;
    const editId = shopForm.dataset.editId;
    const method = editId ? 'PUT' : 'POST';
    const endpoint = editId ? `/api/shops/${editId}` : '/api/shops';
    await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, consumerKey, consumerSecret })
    });
    hideShopForm();
    loadShops(true);
});

async function testShopConnection() {
    const url = document.getElementById('shopUrl').value;
    const consumerKey = document.getElementById('shopConsumerKey').value;
    const consumerSecret = document.getElementById('shopConsumerSecret').value;
    const res = await fetch('/api/shops/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, consumerKey, consumerSecret })
    });
    const result = await res.json();
    document.getElementById('testResult').textContent = result.success ? 'Forbindelse OK!' : 'Fejl: ' + result.message;
}

async function testShopConnectionFromList(url, consumerKey, consumerSecret) {
    const res = await fetch('/api/shops/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, consumerKey, consumerSecret })
    });
    const result = await res.json();
    alert(result.success ? 'Forbindelse OK!' : 'Fejl: ' + result.message);
}

async function deleteShop(id) {
    if (!confirm('Er du sikker på du vil slette denne shop?')) return;
    await fetch(`/api/shops/${id}`, { method: 'DELETE' });
    loadShops(true);
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
