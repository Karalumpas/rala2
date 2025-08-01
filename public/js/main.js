// Globale variabler
window.parentData = null;
window.variationData = null;
window.combinedData = [];
window.collapsedProducts = new Set();
window.allCollapsed = false;
window.editedData = new Map();
window.selectedProducts = new Set();
window.shops = [];
window.editingIndex = null;

window.currentPage = 1;
window.itemsPerPage = 25;
window.totalPages = 1;
window.filteredData = [];

// Profit margin
window.profitMarginPercent = 0;

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
window.profitMarginInput = document.getElementById('profitMargin');

// Initialisering af event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('parentFile').addEventListener('change', window.handleParentFile);
    document.getElementById('variationFile').addEventListener('change', window.handleVariationFile);
    document.getElementById('searchBox').addEventListener('input', window.filterProducts);
    document.getElementById('vatToggle').addEventListener('change', function(e) {
        window.includeVAT = e.target.checked;
        if (window.displayProducts) window.displayProducts();
    });
    if (window.profitMarginInput) {
        window.profitMarginPercent = parseFloat(window.profitMarginInput.value) || 0;
        window.profitMarginInput.addEventListener('input', function(e) {
            window.profitMarginPercent = parseFloat(e.target.value) || 0;
            if (window.displayProducts) window.displayProducts();
        });
    }

    if (window.setupDragAndDrop) {
        window.setupDragAndDrop('parentUploadBox', 'parentFile', window.handleParentFile);
        window.setupDragAndDrop('variationUploadBox', 'variationFile', window.handleVariationFile);
    }

    if (window.shopSelect) {
        shopSelect.addEventListener('change', function() {
            if (this.value !== '') loadProductsForShop(parseInt(this.value, 10));
        });
    }
});
