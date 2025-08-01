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

// VAT settings
window.VAT_RATE = 0.25; // 25%
window.includeVAT = false;

// DOM Elements
window.shopManagerModal = document.getElementById('shopManagerModal');
window.shopSelect = document.getElementById('shopSelect');
window.shopList = document.getElementById('shopList');
window.selectedProductsCount = document.getElementById('selectedProductsCount');
window.paginationControls = document.getElementById('paginationControls');
window.shopListSection = document.getElementById('shopListSection');
window.shopFormSection = document.getElementById('shopFormSection');
window.vatToggle = document.getElementById('vatToggle');

// Initialisering af event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('parentFile').addEventListener('change', window.handleParentFile);
    document.getElementById('variationFile').addEventListener('change', window.handleVariationFile);
    document.getElementById('searchBox').addEventListener('input', window.filterProducts);
    document.getElementById('vatToggle').addEventListener('change', function(e) {
        window.includeVAT = e.target.checked;
        if (window.displayProducts) window.displayProducts();
    });

    if (window.setupDragAndDrop) {
        window.setupDragAndDrop('parentUploadBox', 'parentFile', window.handleParentFile);
        window.setupDragAndDrop('variationUploadBox', 'variationFile', window.handleVariationFile);
    }

    // Load shops
    if (window.renderShops) window.renderShops();
    if (window.updateShopSelect) window.updateShopSelect();
});
