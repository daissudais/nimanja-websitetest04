/* brands.js - Upgraded to Firebase Architecture with Improved Design System */

import { ref, get } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";
import { db } from "./firebase_config.js";

async function loadBrandProducts() {
    const params = new URLSearchParams(window.location.search);
    const brandName = params.get('brand');
    const titleElement = document.getElementById('brand-title');
    const container = document.getElementById('brand-catalog-container');
    const navSlider = document.getElementById('brand-nav-slider');
    const searchInput = document.getElementById('brand-search-input');
    const searchForm = document.getElementById('brand-search-form');

    container.innerHTML = `<div class="product-skeleton-loader">Fetching brand data...</div>`;

    try {
        let allProducts = [];
        const cachedData = sessionStorage.getItem('nimanja_products_cache');

        if (cachedData) {
            allProducts = JSON.parse(cachedData);
        } else {
            const snapshot = await get(ref(db, 'products'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                allProducts = Object.values(data);
                sessionStorage.setItem('nimanja_products_cache', JSON.stringify(allProducts));
            } else {
                container.innerHTML = "<p>No products found.</p>";
                return;
            }
        }

        const uniqueBrands = [...new Set(allProducts.map(p => p.brand).filter(b => b && b.trim() !== ""))].sort();

        // Always render top slider navigation
        if (navSlider) {
            navSlider.innerHTML = uniqueBrands.map(brand => {
                const isActive = brandName && brand.toLowerCase() === brandName.toLowerCase();
                // Assumes logos are named matching the brand (e.g., "Keos" -> "keos.png")
                const logoPath = `images/brands/${brand.replace(/\s+/g, '').toLowerCase()}.png`;

                return `
                    <div class="brand-card ${isActive ? 'active' : ''}" onclick="window.location.href=window.BASE_URL + 'brands/index.html?brand=${encodeURIComponent(brand)}'">
                        <img src="${window.resolveImg(logoPath)}" alt="${brand}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                        <span style="display:none;">${brand}</span>
                    </div>
                `;
            }).join('');

            // Initialize Slider Arrows
            const prevBtn = document.getElementById('brand-prev');
            const nextBtn = document.getElementById('brand-next');
            if (prevBtn && nextBtn) {
                prevBtn.onclick = () => navSlider.scrollBy({ left: -300, behavior: 'smooth' });
                nextBtn.onclick = () => navSlider.scrollBy({ left: 300, behavior: 'smooth' });
            }
        }

        // Rendering Helpers for dynamic filtering
        const renderBrandDirectory = (brands) => {
            if (brands.length === 0) {
                container.innerHTML = `<p class="empty-state">No brands matching your search.</p>`;
                return;
            }
            container.innerHTML = brands.map(brand => {
                const logoPath = `images/brands/${brand.replace(/\s+/g, '').toLowerCase()}.png`;
                return `
                    <div class="brand-card" onclick="window.location.href=window.BASE_URL + 'brands/index.html?brand=${encodeURIComponent(brand)}'">
                        <img src="${window.resolveImg(logoPath)}" alt="${brand}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                        <span style="display:none;">${brand}</span>
                    </div>
                `;
            }).join('');
        };

        let currentPage = 1;
        const itemsPerPage = 20;
        let currentFilteredProducts = [];

        window.goToPage = (page) => {
            currentPage = page;
            renderProductCatalog(currentFilteredProducts);
            const containerEl = document.querySelector('.brand-catalog-section');
            if (containerEl) containerEl.scrollIntoView({ behavior: 'smooth' });
        };

        const renderPagination = (totalItems) => {
            const paginationContainer = document.querySelector('.pagination');
            if (!paginationContainer) return;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            if (totalPages <= 1) {
                paginationContainer.innerHTML = '';
                return;
            }

            let html = '';
            html += `<a href="#" class="page-btn arrow ${currentPage === 1 ? 'disabled' : ''}" onclick="event.preventDefault(); if(${currentPage} > 1) window.goToPage(${currentPage - 1})">&laquo;</a>`;

            for (let i = 1; i <= totalPages; i++) {
                if (
                    i === 1 ||
                    i === totalPages ||
                    (i >= currentPage - 2 && i <= currentPage + 2)
                ) {
                    html += `<a href="#" class="page-btn ${i === currentPage ? 'active' : ''}" onclick="event.preventDefault(); window.goToPage(${i})">${i}</a>`;
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                    html += `<span class="page-ellipsis">...</span>`;
                }
            }

            html += `<a href="#" class="page-btn arrow ${currentPage === totalPages ? 'disabled' : ''}" onclick="event.preventDefault(); if(${currentPage} < ${totalPages}) window.goToPage(${currentPage + 1})">&raquo;</a>`;
            paginationContainer.innerHTML = html;
        };

        const renderProductCatalog = (products) => {
            currentFilteredProducts = products;
            if (products.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="emoji">🐾</div>
                        <h3>No Results Found</h3>
                        <p>No products match your search within ${brandName}.</p>
                    </div>`;
                renderPagination(0);
                return;
            }

            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedItems = products.slice(start, end);

            container.innerHTML = paginatedItems.map(p => {
                const sibuPart = p.sibuPrice ? `<div class="deal-location-badge sibu"><span class="loc-tag">Sibu</span><span class="loc-price">RM ${p.sibuPrice}</span></div>` : '';
                const miriPart = p.miriPrice ? `<div class="deal-location-badge miri"><span class="loc-tag">Miri</span><span class="loc-price">RM ${p.miriPrice}</span></div>` : '';
                return `
                <div class="product-card" onclick="window.location.href=window.BASE_URL + 'details/index.html?name=${encodeURIComponent(p.name)}'">
                    <div class="img-wrap"><img src="${window.resolveImg(p.image)}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300'"></div>
                    <div class="product-info">
                        <span class="tag">${p.category}</span>
                        <h3>${p.name}</h3>
                        <div class="price-container">
                            <div class="standard-price-row"><span class="price">RM ${p.price}</span></div>
                            <div class="regional-deals-grid">${sibuPart}${miriPart}</div>
                        </div>
                        <div class="cart-btn-wrapper">
                            <button class="add-to-cart-btn btn primary btn-sm" style="width: 100%;" onclick="window.addToCart('${p.name.replace(/'/g, "\\'").replace(/"/g, "&quot;")}', '${p.price}', '${window.resolveImg(p.image)}', event, '${p.sibuPrice || ''}', '${p.miriPrice || ''}')">🛒 Add to Order</button>
                        </div>
                    </div>
                </div>`;
            }).join('');

            renderPagination(products.length);
        };

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

        if (filteredProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">🐾</div>
                    <h3>No Products Found</h3>
                    <p>Currently no products available for ${brandName}.</p>
                    <a href=window.BASE_URL + 'product/index.html' class="btn primary" style="margin-top:20px;">View All Products</a>
                </div>`;
            return;
        }

        // Logic for specific Brand Product View
        renderProductCatalog(filteredProducts);

        if (searchInput) {
            const filterCatalog = () => {
                currentPage = 1;
                const query = searchInput.value.toLowerCase().trim();
                const filtered = filteredProducts.filter(p =>
                    p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
                );
                renderProductCatalog(filtered);
            };
            searchInput.addEventListener('input', filterCatalog);
            if (searchForm) {
                searchForm.onsubmit = (e) => e.preventDefault();
            }
        }

    } catch (error) {
        console.error("Error loading brand products:", error);
        container.innerHTML = "<p>Error loading products. Please try again later.</p>";
    }
}

loadBrandProducts();