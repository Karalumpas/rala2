// Shop management JS for ralawise-v2

function openShopManager() {
    shopManagerModal.classList.add('active');
    hideShopForm();
    renderShops();
}

function closeShopManager() {
    shopManagerModal.classList.remove('active');
}

function showShopForm(index = null) {
    shopListSection.classList.add('hidden');
    shopFormSection.classList.remove('hidden');
    if (index !== null) {
        editingIndex = index;
        const shop = shops[index];
        document.getElementById('shopName').value = shop.name;
        document.getElementById('shopUrl').value = shop.url;
        document.getElementById('consumerKey').value = shop.consumerKey;
        document.getElementById('consumerSecret').value = shop.consumerSecret;
        document.getElementById('shopSSL').checked = shop.ssl || false;
    } else {
        editingIndex = null;
        document.getElementById('shopName').value = '';
        document.getElementById('shopUrl').value = '';
        document.getElementById('consumerKey').value = '';
        document.getElementById('consumerSecret').value = '';
        document.getElementById('shopSSL').checked = false;
    }
}

function hideShopForm() {
    editingIndex = null;
    shopFormSection.classList.add('hidden');
    shopListSection.classList.remove('hidden');
}

function renderShops() {
    shopList.innerHTML = '';
    if (shops.length === 0) {
        shopList.innerHTML = '<div class="shop-item"><p>Ingen shops tilføjet endnu</p></div>';
        return;
    }
    shops.forEach((shop, index) => {
        const shopItem = document.createElement('div');
        shopItem.className = 'shop-item';
        let statusColor = '#ffc107';
        let statusText = 'Ukendt';
        if (shop.apiStatus === 'success') {
            statusColor = '#28a745';
            statusText = 'Forbundet';
        } else if (shop.apiStatus === 'error') {
            statusColor = '#dc3545';
            statusText = 'Fejl';
        }
        shopItem.innerHTML = `
            <div class="shop-info">
                <h3>${shop.name}</h3>
                <p>${shop.url}</p>
                <p><small>Key: ${shop.consumerKey.substring(0, 8)}...${shop.consumerKey.slice(-8)}</small></p>
                <p><small>SSL: ${shop.ssl ? 'Ja' : 'Nej'}</small></p>
                <p><span style="color:${statusColor};font-weight:bold;">API status: ${statusText}</span> <button style="margin-left:10px;" onclick="testApiConnection(${index})">Test</button></p>
            </div>
            <div class="shop-actions">
                <button class="btn-icon edit" onclick="editShop(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="deleteShop(${index})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        shopList.appendChild(shopItem);
    });
}

function updateShopSelect() {
    shopSelect.innerHTML = '<option value="">Vælg en shop</option>';
    shops.forEach((shop, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = shop.name + (shop.ssl ? ' (SSL)' : '');
        shopSelect.appendChild(option);
    });
}

function saveShop() {
    const name = document.getElementById('shopName').value;
    const url = document.getElementById('shopUrl').value;
    const key = document.getElementById('consumerKey').value;
    const secret = document.getElementById('consumerSecret').value;
    const ssl = document.getElementById('shopSSL').checked;
    if (!name || !url || !key || !secret) {
        alert('Udfyld alle felter');
        return;
    }
    if (editingIndex !== null) {
        const shop = shops[editingIndex];
        shop.name = name;
        shop.url = url;
        shop.consumerKey = key;
        shop.consumerSecret = secret;
        shop.ssl = ssl;
    } else {
        const newShop = {
            id: Date.now(),
            name: name,
            url: url,
            consumerKey: key,
            consumerSecret: secret,
            ssl: ssl,
            apiStatus: 'unknown'
        };
        shops.push(newShop);
    }
    localStorage.setItem('woocommerceShops', JSON.stringify(shops));
    document.getElementById('shopName').value = '';
    document.getElementById('shopUrl').value = '';
    document.getElementById('consumerKey').value = '';
    document.getElementById('consumerSecret').value = '';
    document.getElementById('shopSSL').checked = false;
    hideShopForm();
    renderShops();
    updateShopSelect();
    alert('Shop gemt!');
}

function editShop(index) {
    showShopForm(index);
}

function deleteShop(index) {
    if (confirm('Er du sikker på du vil slette denne shop?')) {
        shops.splice(index, 1);
        localStorage.setItem('woocommerceShops', JSON.stringify(shops));
        renderShops();
        updateShopSelect();
    }
}

function testApiConnection(index) {
    const shop = shops[index];
    shop.apiStatus = 'testing';
    renderShops();
    setTimeout(() => {
        if (shop.ssl) {
            shop.apiStatus = 'success';
        } else {
            shop.apiStatus = 'error';
        }
        localStorage.setItem('woocommerceShops', JSON.stringify(shops));
        renderShops();
    }, 1000);
}
