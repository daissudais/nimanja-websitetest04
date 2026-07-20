
window.renderOrderList = function() {
    const container = document.getElementById('order-list-container');
    const totalEl = document.getElementById('order-total-price');
    if (!container) return;
    
    const cart = typeof getCart === 'function' ? getCart() : [];
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart">
            <h3>Your order list is empty.</h3>
            <p>Looks like you haven't added any products yet.</p>
            <br><a href="../product/index.html" class="btn primary" style="margin-top: 20px;">Continue Shopping</a>
        </div>`;
        totalEl.innerText = "RM 0.00";
        if (document.getElementById('customer-details-container')) {
            document.getElementById('customer-details-container').style.display = 'none';
        }
        document.querySelector('.checkout-whatsapp-btn').style.display = 'none';
        return;
    }
    
    if (document.getElementById('customer-details-container')) {
        document.getElementById('customer-details-container').style.display = 'block';
    }
    document.querySelector('.checkout-whatsapp-btn').style.display = 'inline-flex';
    
    const methodEl = document.querySelector('input[name="delivery-method"]:checked');
    const method = methodEl ? methodEl.value : 'pickup';
    const branchSelect = document.getElementById('pickup-branch');
    const branch = branchSelect ? branchSelect.value : '';
    const regionSelect = document.getElementById('delivery-region');
    const region = regionSelect ? regionSelect.value : '';
    
    let isSibu = (method === 'pickup' && (branch === 'Nimanja Lanang' || branch === 'Nimanja Sibu')) || (method === 'delivery' && region === 'Sibu');
    let isMiri = (method === 'pickup' && (branch === 'Nimanja Boulevard' || branch === 'Nimanja Luak Bay' || branch === 'Nimanja Desa Murni')) || (method === 'delivery' && region === 'Miri');
    
    let total = 0;
    const itemsHtml = cart.map(item => {
        let activeNumPrice = item.numPrice;
        let activePriceLabel = item.price;
        
        if (isSibu && item.numSibuPrice > 0) {
            activeNumPrice = item.numSibuPrice;
            activePriceLabel = `RM ${item.numSibuPrice.toFixed(2)} <span style="color:var(--orange); font-size:0.8rem; font-weight:bold;">(Sibu Promo)</span>`;
        } else if (isMiri && item.numMiriPrice > 0) {
            activeNumPrice = item.numMiriPrice;
            activePriceLabel = `RM ${item.numMiriPrice.toFixed(2)} <span style="color:var(--orange); font-size:0.8rem; font-weight:bold;">(Miri Promo)</span>`;
        }
        
        const itemTotal = item.quantity * activeNumPrice;
        total += itemTotal;
        return `
            <div class="order-item">
                <img src="${window.resolveImg(item.image)}" alt="${item.name}">
                <div class="order-item-info">
                    <h4>${item.name}</h4>
                    <p>${activePriceLabel}</p>
                </div>
                <div class="order-item-qty">
                    <button class="qty-btn" onclick="updateCartQuantity('${item.name.replace(/'/g, "\\'")}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
                </div>
                <div class="order-item-total">
                    RM ${itemTotal.toFixed(2)}
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')" title="Remove item">🗑️</button>
            </div>
        `;
    }).join('');
    const headerHtml = `
        <div class="order-list-header">
            <div style="width: 80px;"></div>
            <div style="flex: 1;">Product</div>
            <div style="width: 120px; text-align: center;">Quantity</div>
            <div style="width: 100px; text-align: right;">Estimate</div>
            <div style="width: 24px;"></div>
        </div>
    `;
    
    container.innerHTML = headerHtml + itemsHtml;
    totalEl.innerText = `RM ${total.toFixed(2)}`;
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('order-list-container')) {
        const branchSelect = document.getElementById('pickup-branch');
        if (branchSelect) {
            branchSelect.addEventListener('change', () => {
                window.renderOrderList();
            });
        }
        window.renderOrderList();
    }
});

window.toggleDeliveryMethod = function() {
    const method = document.querySelector('input[name="delivery-method"]:checked').value;
    const pickupOptions = document.getElementById('pickup-options');
    const deliveryOptions = document.getElementById('delivery-options');
    const branchSelect = document.getElementById('pickup-branch');
    const addressTextarea = document.getElementById('delivery-address');
    const regionSelect = document.getElementById('delivery-region');

    if (method === 'pickup') {
        pickupOptions.style.display = 'block';
        deliveryOptions.style.display = 'none';
        branchSelect.setAttribute('required', 'required');
        addressTextarea.removeAttribute('required');
        if (regionSelect) regionSelect.removeAttribute('required');
    } else {
        pickupOptions.style.display = 'none';
        deliveryOptions.style.display = 'block';
        branchSelect.removeAttribute('required');
        addressTextarea.setAttribute('required', 'required');
        if (regionSelect) regionSelect.setAttribute('required', 'required');
    }
    window.renderOrderList();
};
