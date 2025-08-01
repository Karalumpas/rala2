// Globale variabler
window.parentData = null;
window.variationData = null;
window.combinedData = [];
window.collapsedProducts = new Set();
window.allCollapsed = false;
window.editedData = new Map();
window.selectedProducts = new Set();
window.shops = JSON.parse(localStorage.getItem('woocommerceShops')) || [];
window.editingIndex = null;

window.currentPage = 1;
window.itemsPerPage = 25;
window.totalPages = 1;
window.filteredData = [];

// DOM Elements
window.shopManagerModal = document.getElementById('shopManagerModal');
window.shopSelect = document.getElementById('shopSelect');
window.shopList = document.getElementById('shopList');
window.selectedProductsCount = document.getElementById('selectedProductsCount');
window.paginationControls = document.getElementById('paginationControls');
window.shopListSection = document.getElementById('shopListSection');
window.shopFormSection = document.getElementById('shopFormSection');

// Initialisering af event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('parentFile').addEventListener('change', window.handleParentFile);
    document.getElementById('variationFile').addEventListener('change', window.handleVariationFile);
    document.getElementById('searchBox').addEventListener('input', window.filterProducts);

    if (window.setupDragAndDrop) {
        window.setupDragAndDrop('parentUploadBox', 'parentFile', window.handleParentFile);
        window.setupDragAndDrop('variationUploadBox', 'variationFile', window.handleVariationFile);
    }

    // Load shops
    if (window.renderShops) window.renderShops();
    if (window.updateShopSelect) window.updateShopSelect();
});
