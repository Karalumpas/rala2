// File handling and CSV import/export for ralawise-v2

// Default exchange rate from GBP to DKK. Can be adjusted via the
// input field with id="exchangeRate" in index.html.
window.GBP_TO_DKK_RATE = 8.5;
// Default profit margin percentage applied to prices
window.profitMarginPercent = 0;

// Apply profit margin to a GBP price
function applyProfitMargin(gbp) {
    const val = parseFloat(gbp);
    const margin = parseFloat(window.profitMarginPercent) || 0;
    if (isNaN(val)) return val;
    return val * (1 + margin / 100);
}

// Convert a price in GBP to DKK using the configurable exchange rate
// If the provided value is empty or not numeric, an empty string is returned
function convertGBPtoDKK(gbp) {
    const rateInput = document.getElementById('exchangeRate');
    const rate = rateInput ? parseFloat(rateInput.value) : window.GBP_TO_DKK_RATE;
    const val = parseFloat(gbp);
    if (isNaN(val) || isNaN(rate)) return '';
    return (val * rate).toFixed(2);
}

function handleParentFile(event) {
    const file = event.target.files[0];
    if (file) {
        parentData = [];
        let rowCount = 0;
        updateFileStatus('parentStatus', '⏳ Indlæser...');
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            worker: true,
            chunk: function(results) {
                parentData.push(...results.data);
                rowCount += results.data.length;
                if (rowCount % 100 === 0) {
                    updateFileStatus('parentStatus', `⏳ ${rowCount} rækker indlæst...`);
                }
            },
            complete: function() {
                updateFileStatus('parentStatus', `✅ ${rowCount} produkter indlæst`);
                document.querySelector('#parentFile').closest('.upload-box').classList.add('loaded');
                tryProcessData();
            },
            error: function(error) {
                updateFileStatus('parentStatus', `❌ Fejl: ${error.message}`);
            }
        });
    }
}

function handleVariationFile(event) {
    const file = event.target.files[0];
    if (file) {
        variationData = [];
        let rowCount = 0;
        updateFileStatus('variationStatus', '⏳ Indlæser...');
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            worker: true,
            chunk: function(results) {
                variationData.push(...results.data);
                rowCount += results.data.length;
                if (rowCount % 100 === 0) {
                    updateFileStatus('variationStatus', `⏳ ${rowCount} rækker indlæst...`);
                }
            },
            complete: function() {
                updateFileStatus('variationStatus', `✅ ${rowCount} variationer indlæst`);
                document.querySelector('#variationFile').closest('.upload-box').classList.add('loaded');
                tryProcessData();
            },
            error: function(error) {
                updateFileStatus('variationStatus', `❌ Fejl: ${error.message}`);
            }
        });
    }
}

function updateFileStatus(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

function setupDragAndDrop(boxId, fileInputId, handler) {
    const box = document.getElementById(boxId);
    const fileInput = document.getElementById(fileInputId);
    const overlay = box.querySelector('.drag-overlay');
    box.addEventListener('click', (e) => {
        if (e.target === overlay) return;
        fileInput.click();
    });
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        box.addEventListener(eventName, preventDefaults, false);
    });
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    ['dragenter', 'dragover'].forEach(eventName => {
        box.addEventListener(eventName, () => {
            box.classList.add('drag-over');
            overlay.style.display = 'flex';
        }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        box.addEventListener(eventName, () => {
            box.classList.remove('drag-over');
            overlay.style.display = 'none';
        }, false);
    });
    box.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                const fakeEvent = { target: { files: [file] } };
                handler(fakeEvent);
            } else {
                alert('Venligst upload kun CSV-filer');
            }
        }
    }, false);
}

function exportToCSV() {
    const csvData = [];
    combinedData.forEach(item => {
        if (item.type === 'parent') {
            csvData.push({
                Type: 'Parent',
                Produktnavn: item.data.post_title || '',
                SKU: item.data.sku || '',
                Status: item.data.stock_status || '',
                Pris: '',
                Farve: item.data['attribute:Colour'] || '',
                Størrelse: item.data['attribute:Size'] || '',
                Brand: item.data['attribute:pa_Brand'] || '',
                Kategori: item.data['tax:product_cat'] || ''
            });
        } else {
            const priceGBP = editedData.get(`${item.data.sku}_price`) ?? item.data.regular_price;
            const withProfit = applyProfitMargin(priceGBP);
            const priceDKK = convertGBPtoDKK(withProfit);
            csvData.push({
                Type: 'Variation',
                Produktnavn: item.parent.post_title || '',
                SKU: item.data.sku || '',
                Status: item.data.stock_status || '',
                Pris: priceDKK,
                Farve: item.data['meta:attribute_Colour'] || '',
                Størrelse: item.data['meta:attribute_Size'] || '',
                Brand: item.parent['attribute:pa_Brand'] || '',
                Kategori: item.parent['tax:product_cat'] || ''
            });
        }
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'woocommerce_produkter.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
