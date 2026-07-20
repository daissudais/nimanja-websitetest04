const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'brands.js');

let code = fs.readFileSync(file, 'utf-8');

// strip all carriage returns
code = code.replace(/\\r\\n/g, '\\n');

const brokenTarget = `        };

                        e.preventDefault(); // Stay on page and use current filtered view
                    };
                }
            }
            return;
        }`;

const fixedReplacement = `        };

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
        }`;

if (code.includes(brokenTarget)) {
    code = code.replace(brokenTarget, fixedReplacement);
    fs.writeFileSync(file, code, 'utf-8');
    console.log('Fixed syntax error in brands.js');
} else {
    // maybe spaces are slightly different? Let's just use substring after the known point
    const splitToken = "            renderPagination(products.length);\\n        };";
    const parts = code.split(splitToken);
    
    if (parts.length > 1) {
        // Find "titleElement.innerText = brandName;"
        const split2 = "        titleElement.innerText = brandName;";
        const parts2 = parts[1].split(split2);
        
        if (parts2.length > 1) {
            // Reconstruct perfectly
            const newMiddle = `

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

`;
            code = parts[0] + splitToken + newMiddle + split2 + parts2[1];
            fs.writeFileSync(file, code, 'utf-8');
            console.log('Fixed syntax error in brands.js with fallback');
        } else {
            console.log('Could not find split2');
        }
    } else {
        console.log('Could not find splitToken');
    }
}
