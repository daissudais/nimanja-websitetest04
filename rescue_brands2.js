const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'brands.js');

let lines = fs.readFileSync(file, 'utf-8').split(/\\r?\\n/);

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('renderPagination(products.length);')) {
        startIdx = i + 2; // the line after };
    }
    if (lines[i].includes('if (filteredProducts.length === 0) {') && startIdx !== -1 && endIdx === -1) {
        endIdx = i; // the line itself
    }
}

if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    const fixedReplacement = `
        // Logic for "Our Brands" Directory View
        if (!brandName) {
            titleElement.innerText = "All Brands";
            renderBrandDirectory(uniqueBrands);
            
            if (searchInput) {
                const filterDirectory = () => {
                    currentPage = 1;
                    const query = searchInput.value.toLowerCase().trim();
                    const filtered = uniqueBrands.filter(b => b.toLowerCase().includes(query));
                    renderBrandDirectory(filtered);
                };
                searchInput.addEventListener('input', filterDirectory);
                if (searchForm) {
                    searchForm.onsubmit = (e) => {
                        e.preventDefault(); // Stay on page and use current filtered view
                    };
                }
            }
            return;
        }

        titleElement.innerText = brandName;

        const filteredProducts = allProducts.filter(p => 
            p.brand && p.brand.toLowerCase() === brandName.toLowerCase()
        );

        if (filteredProducts.length === 0) {`.split('\\n');

    lines.splice(startIdx, endIdx - startIdx + 1, ...fixedReplacement);
    
    fs.writeFileSync(file, lines.join('\\n'), 'utf-8');
    console.log("Success with array splice!");
} else {
    console.log("Indices not found", startIdx, endIdx);
}
