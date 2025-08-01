// Search and filter logic for ralawise-v2

function filterProducts() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    if (!searchTerm) {
        filteredData = [...combinedData];
    } else {
        filteredData = combinedData.filter(item => {
            const data = item.data;
            const parent = item.parent || data;
            return (
                (parent.post_title && parent.post_title.toLowerCase().includes(searchTerm)) ||
                (data.sku && data.sku.toLowerCase().includes(searchTerm)) ||
                (data['meta:attribute_Colour'] && data['meta:attribute_Colour'].toLowerCase().includes(searchTerm)) ||
                (parent['attribute:Colour'] && parent['attribute:Colour'].toLowerCase().includes(searchTerm)) ||
                (parent['attribute:pa_Brand'] && parent['attribute:pa_Brand'].toLowerCase().includes(searchTerm))
            );
        });
    }
    totalPages = Math.ceil(filteredData.length / itemsPerPage);
    currentPage = 1;
    displayProducts();
    updatePaginationControls();
}
