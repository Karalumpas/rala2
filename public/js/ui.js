// UI and utility functions for ralawise-v2

function updateStats() {
    const parentCount = parentData.length;
    const variationCount = variationData.length;
    const inStockCount = variationData.filter(v => v.stock_status === 'instock').length;
    const selectedCount = selectedProducts.size;

    document.getElementById('parentCount').textContent = parentCount;
    document.getElementById('variationCount').textContent = variationCount;
    document.getElementById('inStockCount').textContent = inStockCount;
    document.getElementById('selectedCount').textContent = selectedCount;
}

function updateSelectedCount() {
    selectedProductsCount.textContent = selectedProducts.size;
    document.getElementById('selectedCount').textContent = selectedProducts.size;
}

function toggleVariations(parentSku) {
    const isCollapsed = collapsedProducts.has(parentSku);
    const variations = document.querySelectorAll(`tr.variation-row[data-parent-sku="${parentSku}"]`);
    const toggle = document.querySelector(`tr.parent-row[data-parent-sku="${parentSku}"] .collapse-toggle`);
    if (isCollapsed) {
        collapsedProducts.delete(parentSku);
        variations.forEach(row => row.classList.remove('hidden-variation'));
        toggle.classList.remove('collapsed');
    } else {
        collapsedProducts.add(parentSku);
        variations.forEach(row => row.classList.add('hidden-variation'));
        toggle.classList.add('collapsed');
    }
}

function toggleAllProducts() {
    const toggleButton = event.target;
    if (!allCollapsed) {
        parentData.forEach(parent => {
            collapsedProducts.add(parent.sku);
        });
        toggleButton.innerHTML = '<i class="fas fa-folder-open"></i> Fold Alle Ud';
        allCollapsed = true;
    } else {
        collapsedProducts.clear();
        toggleButton.innerHTML = '<i class="fas fa-folder"></i> Fold Alle';
        allCollapsed = false;
    }
    displayProducts();
}

function saveEdit(element) {
    const field = element.getAttribute('data-field');
    const sku = element.getAttribute('data-sku');
    let value = element.textContent.trim();
    if (field === 'price') {
        value = value.replace('£', '');
        if (value && !isNaN(value)) {
            editedData.set(`${sku}_price`, value);
            const num = parseFloat(value);
            const displayValue = includeVAT ? (num * (1 + VAT_RATE)).toFixed(2) : value;
            element.textContent = `£${displayValue}`;
            element.style.background = '#d1ecf1';
            setTimeout(() => { element.style.background = ''; }, 1000);
        } else if (value === '') {
            editedData.set(`${sku}_price`, '');
            element.textContent = '£';
        }
    } else if (field === 'category') {
        editedData.set(`${sku}_category`, value);
        element.style.background = '#d1ecf1';
        setTimeout(() => { element.style.background = ''; }, 1000);
        const variations = document.querySelectorAll(`tr.variation-row[data-parent-sku="${sku}"] td:nth-child(9)`);
        variations.forEach(cell => { cell.textContent = value; });
    }
}
