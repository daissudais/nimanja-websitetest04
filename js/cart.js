window.WHATSAPP_NUMBER = "60105958353";

function getCart() {
    const cart = localStorage.getItem('nimanja_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('nimanja_cart', JSON.stringify(cart));
    if (window.updateCartBadge) {
        window.updateCartBadge();
    }
}

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    // Extract numbers, handles "RM 15.00 - RM 20.00" by taking the first number
    const matches = priceStr.match(/[\d\.]+/g);
    if (matches && matches.length > 0) {
        return parseFloat(matches[0]);
    }
    return 0;
}

window.addToCart = function(productName, productPrice, productImage, event, sibuPrice, miriPrice) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const cart = getCart();
    const existing = cart.find(item => item.name === productName);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: productPrice, // Keep original string for display
            image: productImage,
            quantity: 1,
            numPrice: parsePrice(productPrice), // Keep numeric for calculation
            numSibuPrice: parsePrice(sibuPrice),
            numMiriPrice: parsePrice(miriPrice)
        });
    }
    
    saveCart(cart);
    
    // Provide visual feedback if an event was passed
    if (event && event.target) {
        const btn = event.target.closest('.add-to-cart-btn');
        if (btn) {
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '✔ Added';
            btn.classList.add('added');
            btn.style.backgroundColor = 'var(--green)';
            btn.style.color = 'white';
            
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.classList.remove('added');
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }, 1500);
        }
    }
};

window.updateCartQuantity = function(productName, delta) {
    let cart = getCart();
    const item = cart.find(item => item.name === productName);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== productName);
        }
    }
    saveCart(cart);
    if (window.renderOrderList) window.renderOrderList();
};

window.removeFromCart = function(productName) {
    let cart = getCart();
    cart = cart.filter(item => item.name !== productName);
    saveCart(cart);
    if (window.renderOrderList) window.renderOrderList();
};

window.clearCart = function() {
    localStorage.removeItem('nimanja_cart');
    saveCart([]);
    if (window.renderOrderList) window.renderOrderList();
};

window.checkoutWhatsApp = function() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your order list is empty.");
        return;
    }
    
    // Check for customer form data if on order list page
    const nameInput = document.getElementById('cust-name');
    let customerInfo = "";
    
    if (nameInput) {
        const name = nameInput.value.trim();
        const phone = document.getElementById('cust-phone').value.trim();
        const email = document.getElementById('cust-email').value.trim();
        const methodEl = document.querySelector('input[name="delivery-method"]:checked');
        const method = methodEl ? methodEl.value : 'pickup';
        const branch = document.getElementById('pickup-branch').value;
        const address = document.getElementById('delivery-address').value.trim();
        const region = document.getElementById('delivery-region') ? document.getElementById('delivery-region').value : '';
        
        if (!name || !phone) {
            alert("Please fill in your Full Name and Phone Number.");
            return;
        }
        
        if (method === 'pickup' && !branch) {
            alert("Please select a Nimanja Branch for store pickup.");
            return;
        }
        
        if (method === 'delivery') {
            if (!region) {
                alert("Please select a Delivery Region.");
                return;
            }
            if (!address) {
                alert("Please provide your full delivery address.");
                return;
            }
        }
        
        customerInfo = `*Customer Details:*\nName: ${name}\nPhone: ${phone}\n`;
        if (email) customerInfo += `Email: ${email}\n`;
        
        if (method === 'pickup') {
            customerInfo += `Method: Store Pickup\nBranch: ${branch}\n\n`;
        } else {
            customerInfo += `Method: Delivery\nRegion: ${region}\nAddress: ${address}\n\n`;
        }
    }
    
    // Generate a random alphanumeric order ID
    const generateOrderID = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'ORD-';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };
    
    const orderID = generateOrderID();
    
    let total = 0;
    let message = `Hello Nimanja, I would like to order the following items:\n*Order ID:* ${orderID}\n\n`;
    
    if (customerInfo) {
        message += customerInfo;
    }
    
    message += "*Order Items:*\n";
    
    // Determine active region based on branch selection if available
    const methodEl = document.querySelector('input[name="delivery-method"]:checked');
    const method = methodEl ? methodEl.value : 'pickup';
    const branchSelect = document.getElementById('pickup-branch');
    const branch = branchSelect ? branchSelect.value : '';
    const regionSelect = document.getElementById('delivery-region');
    const region = regionSelect ? regionSelect.value : '';
    
    let isSibu = (method === 'pickup' && (branch === 'Nimanja Lanang' || branch === 'Nimanja Sibu')) || (method === 'delivery' && region === 'Sibu');
    let isMiri = (method === 'pickup' && (branch === 'Nimanja Boulevard' || branch === 'Nimanja Luak Bay' || branch === 'Nimanja Desa Murni')) || (method === 'delivery' && region === 'Miri');

    cart.forEach((item, index) => {
        let activeNumPrice = item.numPrice;
        let activePriceLabel = "RM " + item.numPrice.toFixed(2);
        
        if (isSibu && item.numSibuPrice > 0) {
            activeNumPrice = item.numSibuPrice;
            activePriceLabel = "RM " + item.numSibuPrice.toFixed(2) + " (Sibu Promo)";
        } else if (isMiri && item.numMiriPrice > 0) {
            activeNumPrice = item.numMiriPrice;
            activePriceLabel = "RM " + item.numMiriPrice.toFixed(2) + " (Miri Promo)";
        }

        const itemTotal = item.quantity * activeNumPrice;
        total += itemTotal;
        message += `${index + 1}. ${item.name}\n`;
        message += `   Qty: ${item.quantity} x ${activePriceLabel} = RM ${itemTotal.toFixed(2)}\n\n`;
    });
    
    message += `*Total Estimated Payment: RM ${total.toFixed(2)}*\n\n`;
    message += "Please let me know how to proceed with payment and pickup/delivery!";
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${window.WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
};

window.updateCartBadge = function() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    });
};

// Run immediately to prevent delay, and also on DOM content loaded
window.updateCartBadge();

document.addEventListener('DOMContentLoaded', () => {
    window.updateCartBadge();
});
