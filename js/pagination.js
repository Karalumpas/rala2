// Pagination logic for ralawise-v2

let currentPage = 1;
let itemsPerPage = 25;
let totalPages = 1;
let filteredData = [];

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayProducts();
        updatePaginationControls();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        displayProducts();
        updatePaginationControls();
    }
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayProducts();
        updatePaginationControls();
    }
}

function goToLastPage() {
    currentPage = totalPages;
    displayProducts();
    updatePaginationControls();
}

function changePageSize() {
    itemsPerPage = parseInt(document.getElementById('pageSizeSelect').value);
    totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (totalPages < 1) totalPages = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    displayProducts();
    updatePaginationControls();
}

function updatePaginationControls() {
    const pageInfo = document.getElementById('pageInfo');
    const firstPageBtn = document.getElementById('firstPageBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const lastPageBtn = document.getElementById('lastPageBtn');
    pageInfo.textContent = `Side ${currentPage} af ${totalPages}`;
    firstPageBtn.disabled = currentPage === 1;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    lastPageBtn.disabled = currentPage === totalPages;
}
