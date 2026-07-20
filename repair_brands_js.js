const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'brands.js');

let code = fs.readFileSync(file, 'utf-8');

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

// Replace ignoring carriage returns
const regex = new RegExp(brokenTarget.replace(/\\n/g, '\\r?\\n').replace(/\\s+/g, '\\\\s+'), 'g');
code = code.replace(regex, fixedReplacement);

fs.writeFileSync(file, code, 'utf-8');
console.log('Fixed syntax error in brands.js');
