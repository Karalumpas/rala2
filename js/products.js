// Product and variation logic for ralawise-v2

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
