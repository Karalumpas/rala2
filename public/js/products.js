// Product and variation logic for ralawise-v2

function tryProcessData() {
    if (parentData && variationData) {
        processAndDisplayData();
    }
}

function mapApiProduct(p) {
    const colourAttr = p.attributes.find(a => /colour|color/i.test(a.name));
    const sizeAttr = p.attributes.find(a => /size/i.test(a.name));
    const brandAttr = p.attributes.find(a => /brand/i.test(a.name));
    return {
        post_title: p.name,
        sku: p.sku,
        stock_status: p.stock_status,
        'attribute:Colour': colourAttr && colourAttr.options[0],
        'attribute:Size': sizeAttr && sizeAttr.options[0],
        'attribute:pa_Brand': brandAttr && brandAttr.options[0],
        'tax:product_cat': p.categories.map(c => c.name).join(', '),
        images: p.images && p.images[0] ? p.images[0].src : ''
    };
}

async function loadProductsForShop(index) {
    const shop = shops[index];
    if (!shop) return;
    try {
        const res = await fetch(`/api/products/${shop.id}`);
        const data = await res.json();
        parentData = data.products.map(mapApiProduct);
        variationData = [];
        tryProcessData();
    } catch (err) {
        console.error('Failed to load products', err);
    }
}

function processAndDisplayData() {
    combinedData = [];
    selectedProducts.clear();
    updateSelectedCount();
    collapsedProducts = new Set();

    parentData.forEach(parent => {
        combinedData.push({ type: 'parent', data: parent });
        collapsedProducts.add(parent.sku);

        const variations = variationData.filter(v => v.parent_sku === parent.sku);
        variations.forEach(variation => {
            combinedData.push({ type: 'variation', data: variation, parent });
        });
    });

    filteredData = [...combinedData];
    totalPages = Math.ceil(filteredData.length / itemsPerPage);
    currentPage = 1;

    displayProducts();
    updateStats();
    updatePaginationControls();

    document.getElementById('controls').classList.remove('hidden');
    document.getElementById('stats').classList.remove('hidden');
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('productTable').classList.remove('hidden');
    paginationControls.classList.remove('hidden');
}

function displayProducts() {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, parentData.length);
    const pageParents = parentData.slice(startIndex, endIndex);
    pageParents.forEach(parent => {
        const parentRow = document.createElement('tr');
        const isSelected = selectedProducts.has(parent.sku);
        const variationCount = variationData.filter(v => v.parent_sku === parent.sku).length;
        const isCollapsed = collapsedProducts.has(parent.sku);
        parentRow.classList.add('parent-row');
        parentRow.setAttribute('data-parent-sku', parent.sku);
        parentRow.innerHTML = `
            <td class="checkbox-cell">
                <input type="checkbox" class="product-checkbox" data-sku="${parent.sku}" 
                    data-type="parent" ${isSelected ? 'checked' : ''}
                    onchange="toggleProductSelection(this)">
            </td>
            <td>
                <span class="collapse-toggle ${isCollapsed ? 'collapsed' : ''}" onclick="event.stopPropagation(); toggleVariations('${parent.sku}')">▼</span>
                <span class="parent-title" onclick="toggleVariations('${parent.sku}')">
                    <strong>${parent.post_title || ''}</strong>
                    <span class="variation-count">${variationCount} variationer</span>
                </span>
            </td>
            <td><strong>${parent.sku || ''}</strong></td>
            <td><span class="stock-status stock-${parent.stock_status}">${parent.stock_status || ''}</span></td>
            <td>-</td>
            <td>${(parent.attribute && parent.attribute.Colour) || parent['attribute:Colour'] || ''}</td>
            <td>${(parent.attribute && parent.attribute.Size) || parent['attribute:Size'] || ''}</td>
            <td>${parent['attribute:pa_Brand'] || ''}</td>
            <td class="editable" contenteditable="true" data-field="category" data-sku="${parent.sku}" onblur="saveEdit(this)">${parent['tax:product_cat'] || ''}</td>
            <td>${parent.images ? `<img src="${parent.images}" alt="Product" class="product-image">` : ''}</td>
        `;
        tbody.appendChild(parentRow);
        const variations = variationData.filter(v => v.parent_sku === parent.sku);
        variations.forEach(variation => {
            const variationRow = document.createElement('tr');
            const isSelectedVar = selectedProducts.has(variation.sku);
            const isHidden = collapsedProducts.has(parent.sku);
            variationRow.classList.add('variation-row');
            if (isHidden) {
                variationRow.classList.add('hidden-variation');
            }
            variationRow.setAttribute('data-parent-sku', parent.sku);
            const currentPrice = editedData.get(`${variation.sku}_price`) || variation.regular_price || '';
            const currentCategory = editedData.get(`${parent.sku}_category`) || parent['tax:product_cat'] || '';
            variationRow.innerHTML = `
                <td class="checkbox-cell">
                    <input type="checkbox" class="product-checkbox" data-sku="${variation.sku}" 
                        data-type="variation" data-parent-sku="${parent.sku}" 
                        ${isSelectedVar ? 'checked' : ''} onchange="toggleProductSelection(this)">
                </td>
                <td>${parent.post_title || ''}</td>
                <td>${variation.sku || ''}</td>
                <td><span class="stock-status stock-${variation.stock_status}">${variation.stock_status || ''}</span></td>
                <td class="editable" contenteditable="true" data-field="price" data-sku="${variation.sku}" onblur="saveEdit(this)">£${currentPrice}</td>
                <td>${variation['meta:attribute_Colour'] || ''}</td>
                <td>${variation['meta:attribute_Size'] || ''}</td>
                <td>${parent['attribute:pa_Brand'] || ''}</td>
                <td>${currentCategory}</td>
                <td>${variation.images ? `<img src="${variation.images}" alt="Variation" class="product-image">` : ''}</td>
            `;
            tbody.appendChild(variationRow);
        });
    });
}

function toggleProductSelection(checkbox) {
    const sku = checkbox.getAttribute('data-sku');
    if (checkbox.checked) {
        selectedProducts.add(sku);
    } else {
        selectedProducts.delete(sku);
        document.getElementById('selectAll').checked = false;
    }
    updateSelectedCount();
}

function toggleSelectAll(checkbox) {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
        const sku = cb.getAttribute('data-sku');
        if (checkbox.checked) {
            selectedProducts.add(sku);
        } else {
            selectedProducts.delete(sku);
        }
    });
    updateSelectedCount();
}

function sendToWooCommerce() {
    const shopIndex = shopSelect.value;
    if (shopIndex === '') {
        alert('Vælg en shop først');
        return;
    }
    if (selectedProducts.size === 0) {
        alert('Vælg mindst ét produkt');
        return;
    }
    const shop = shops[shopIndex];
    if (!confirm(`Er du sikker på du vil sende ${selectedProducts.size} produkter til ${shop.name}?`)) {
        return;
    }
    alert(`Sender ${selectedProducts.size} produkter til ${shop.name}...\n\nDette er en demo. I en rigtig applikation ville dette sende produkterne via WooCommerce REST API.`);

    selectedProducts.clear();
    document.querySelectorAll('.product-checkbox').forEach(cb => (cb.checked = false));
    document.getElementById('selectAll').checked = false;
    updateSelectedCount();

    alert('Produkter sendt til WooCommerce!');
}
