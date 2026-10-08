/**
 * BLUEWELL VENTURES - MAIN APPLICATION JAVASCRIPT
 * Handles Cart, LocalStorage, Mobile Navigation, Checkout, Dynamic Pages & WhatsApp API
 */

// ==========================================
// 1. CART MANAGEMENT (localStorage)
// ==========================================
const CART_STORAGE_KEY = 'bluewell_cart';
const ORDERS_STORAGE_KEY = 'bluewell_orders';

function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Cart read error", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, selectedVariantWeight, quantity = 1) {
  const product = PRODUCTS.find(p => p.id === parseInt(productId));
  if (!product) return;

  const variant = product.variants.find(v => v.weight === selectedVariantWeight) || product.variants[0];
  const cart = getCart();

  // Check if item with identical id & variant is already present
  const existingIndex = cart.findIndex(
    item => item.id === product.id && item.weight === variant.weight
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      category: product.categoryLabel,
      image: product.image,
      weight: variant.weight,
      variantLabel: variant.label,
      price: variant.price,
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`Added ${quantity}x ${product.name} (${variant.weight}) to bag!`);
}

function updateCartItemQty(index, change) {
  const cart = getCart();
  if (!cart[index]) return;

  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
  renderCartPage();
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
  showToast("Item removed from your bag");
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = count;
  });
}

// ==========================================
// 2. TOAST NOTIFICATION UTILITY
// ==========================================
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// ==========================================
// 3. MOBILE MENU TOGGLE
// ==========================================
function setupMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const closeBtn = document.querySelector('.close-menu-btn');
  const drawer = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.mobile-overlay');

  if (!toggleBtn || !drawer) return;

  const openMenu = () => {
    drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);
}

// ==========================================
// 4. SHOP & HOME PRODUCT RENDERING
// ==========================================
function createProductCardHTML(product) {
  const defaultVariant = product.variants.find(v => v.default) || product.variants[0];
  const tagsHTML = product.tastingNotes
    .map(t => `<span class="tag-pill">${t}</span>`)
    .join('');

  return `
    <article class="product-card" data-category="${product.category}">
      ${product.badge ? `<span class="product-card-badge">${product.badge}</span>` : ''}
      <a href="product.html?id=${product.id}" class="product-card-image">
        <img src="${product.image}" alt="${product.name} packaging" loading="lazy" width="400" height="240">
      </a>
      <div class="product-card-body">
        <span class="product-card-cat">${product.categoryLabel}</span>
        <h3 class="product-card-title">
          <a href="product.html?id=${product.id}">${product.name}</a>
        </h3>
        <div class="product-card-tags">
          ${tagsHTML}
        </div>
        <div class="product-card-footer">
          <div class="price-box">
            <span class="price-label">From (${defaultVariant.weight})</span>
            <span class="product-price">₹${defaultVariant.price.toLocaleString('en-IN')}</span>
          </div>
          <a href="product.html?id=${product.id}" class="btn btn-primary" style="min-height: 44px; padding: 0.5rem 1rem;">
            Select Pack
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedProducts() {
  const container = document.getElementById('featured-products-grid');
  if (!container) return;
  container.innerHTML = PRODUCTS.slice(0, 4).map(createProductCardHTML).join('');
}

function renderShopPage() {
  const container = document.getElementById('shop-products-grid');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const activeCategory = urlParams.get('cat') || 'all';

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    if (btn.getAttribute('data-filter') === activeCategory) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      displayFiltered(cat);
    });
  });

  function displayFiltered(cat) {
    const filtered = (cat === 'all')
      ? PRODUCTS
      : PRODUCTS.filter(p => p.category === cat);
    container.innerHTML = filtered.map(createProductCardHTML).join('');
  }

  displayFiltered(activeCategory);
}

// ==========================================
// 5. PRODUCT DETAIL PAGE (Dynamic ?id=X)
// ==========================================
function renderProductDetailPage() {
  const container = document.getElementById('product-detail-view');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get('id')) || 1;
  const product = PRODUCTS.find(p => p.id === id);

  if (!product) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <h2>Product not found</h2>
        <p style="margin: 1rem 0;">We couldn't locate this specialty brew.</p>
        <a href="shop.html" class="btn btn-primary">Browse All Blends</a>
      </div>
    `;
    return;
  }

  // Update Page Title and SEO Meta
  document.title = `${product.name} | Bluewell Ventures`;

  let currentVariant = product.variants.find(v => v.default) || product.variants[0];
  let qty = 1;

  const renderContent = () => {
    const pillsHTML = product.variants.map(v => `
      <button type="button" class="variant-pill ${v.weight === currentVariant.weight ? 'active' : ''}" data-weight="${v.weight}">
        ${v.label} (₹${v.price})
      </button>
    `).join('');

    const notesHTML = product.tastingNotes.map(n => `<span class="tag-pill" style="font-size:0.85rem; padding: 0.35rem 0.8rem;">${n}</span>`).join('');

    container.innerHTML = `
      <div class="product-detail-grid">
        <div class="detail-gallery">
          <div class="detail-main-img">
            <img src="${product.image}" alt="${product.name} packaging" id="detail-active-img">
          </div>
        </div>

        <div class="detail-info">
          <div class="detail-header-meta">
            <span class="category">${product.categoryLabel}</span>
            <h1 style="font-size: 2.2rem; margin: 0.25rem 0;">${product.name}</h1>
            <div class="rating-badge">
              ★ ${product.rating} <span>(${product.reviewsCount} verified reviews)</span>
            </div>
          </div>

          <p style="font-size: 1.05rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            ${product.description}
          </p>

          <div style="margin-bottom: 1.5rem;">
            <strong style="display:block; font-size:0.85rem; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.4rem;">Tasting Notes</strong>
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">${notesHTML}</div>
          </div>

          <div class="detail-price-box">
            <span class="detail-price" id="active-price-display">₹${currentVariant.price.toLocaleString('en-IN')}</span>
            <span class="detail-shipping-note">✓ In Stock & Freshly Sealed</span>
          </div>

          <!-- Weight / Quantity Selector -->
          <div class="variant-selector">
            <label>Select Pack Size (Weight):</label>
            <div class="variant-pills" id="variant-pills-wrap">
              ${pillsHTML}
            </div>
          </div>

          <!-- Quantity Counter & Buy Actions -->
          <div class="purchase-controls">
            <label style="font-size: 0.9rem; font-weight: 700;">Quantity:</label>
            <div class="qty-control">
              <button type="button" class="qty-btn" id="qty-minus" aria-label="Decrease quantity">-</button>
              <input type="text" class="qty-input" id="qty-display" value="${qty}" readonly>
              <button type="button" class="qty-btn" id="qty-plus" aria-label="Increase quantity">+</button>
            </div>

            <div class="detail-action-buttons">
              <button type="button" class="btn btn-primary" id="add-to-cart-action">
                Add to Bag • <span id="btn-total-display">₹${(currentVariant.price * qty).toLocaleString('en-IN')}</span>
              </button>
              <button type="button" class="btn btn-forest" id="buy-now-action">
                Order Directly via WhatsApp
              </button>
            </div>
          </div>

          <!-- Interactive Brewing Guide -->
          <div class="brew-guide-card">
            <h4>☕ Recommended Brewing Ritual</h4>
            <div class="brew-specs-list">
              <div class="brew-spec-item">
                <strong>Recommended Gear:</strong>
                <span>${product.brewGuide.equipment}</span>
              </div>
              <div class="brew-spec-item">
                <strong>Ratio:</strong>
                <span>${product.brewGuide.ratio}</span>
              </div>
              <div class="brew-spec-item">
                <strong>Water Temperature:</strong>
                <span>${product.brewGuide.temp}</span>
              </div>
              <div class="brew-spec-item">
                <strong>Extraction Time:</strong>
                <span>${product.brewGuide.time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach Event Listeners to Pills & Quantity
    document.querySelectorAll('#variant-pills-wrap .variant-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const weight = pill.getAttribute('data-weight');
        currentVariant = product.variants.find(v => v.weight === weight);
        renderContent();
      });
    });

    document.getElementById('qty-plus').addEventListener('click', () => {
      qty++;
      document.getElementById('qty-display').value = qty;
      document.getElementById('btn-total-display').textContent = `₹${(currentVariant.price * qty).toLocaleString('en-IN')}`;
    });

    document.getElementById('qty-minus').addEventListener('click', () => {
      if (qty > 1) {
        qty--;
        document.getElementById('qty-display').value = qty;
        document.getElementById('btn-total-display').textContent = `₹${(currentVariant.price * qty).toLocaleString('en-IN')}`;
      }
    });

    document.getElementById('add-to-cart-action').addEventListener('click', () => {
      addToCart(product.id, currentVariant.weight, qty);
    });

    document.getElementById('buy-now-action').addEventListener('click', () => {
      addToCart(product.id, currentVariant.weight, qty);
      window.location.href = 'cart.html';
    });
  };

  renderContent();
}

// ==========================================
// 6. CART & CHECKOUT PAGE LOGIC
// ==========================================
let appliedPromo = null;

function renderCartPage() {
  const container = document.getElementById('cart-page-content');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4.5rem 1rem; background: var(--sand-card); border-radius: var(--radius-md); border: 1px solid var(--border);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🛍️</div>
        <h2>Your Bag is Empty</h2>
        <p style="color: var(--text-muted); margin: 0.75rem 0 2rem;">Discover our freshly roasted estate coffees and spring-harvested teas.</p>
        <a href="shop.html" class="btn btn-primary">Browse All Blends</a>
      </div>
    `;
    return;
  }

  const subtotal = getCartSubtotal();
  const freeThreshold = STORE_CONFIG.freeShippingThreshold;
  const shippingFee = (subtotal >= freeThreshold) ? 0 : STORE_CONFIG.flatShippingFee;

  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discount = Math.round((subtotal * appliedPromo.value) / 100);
    } else if (appliedPromo.type === 'flat') {
      discount = appliedPromo.value;
    }
  }

  const grandTotal = Math.max(0, (subtotal + shippingFee) - discount);

  const cartItemsHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-variant">Size: <strong>${item.weight}</strong> • ₹${item.price.toLocaleString('en-IN')} each</div>
        <div class="cart-item-row">
          <div class="qty-control" style="transform: scale(0.9); transform-origin: left;">
            <button type="button" class="qty-btn" onclick="updateCartItemQty(${idx}, -1)">-</button>
            <input type="text" class="qty-input" value="${item.quantity}" readonly>
            <button type="button" class="qty-btn" onclick="updateCartItemQty(${idx}, 1)">+</button>
          </div>
          <strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong>
          <button type="button" class="remove-btn" onclick="removeCartItem(${idx})">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  const shippingBarHTML = (subtotal >= freeThreshold)
    ? `<div class="free-shipping-progress" style="background:#E8F5E9; border-color:#C8E6C9; color:#2E7D32;">🎉 You've unlocked <strong>FREE Express Shipping</strong>!</div>`
    : `<div class="free-shipping-progress">Add <strong>₹${(freeThreshold - subtotal).toLocaleString('en-IN')}</strong> more to unlock <strong>FREE Express Shipping</strong>!</div>`;

  container.innerHTML = `
    <div class="cart-layout">
      <!-- Left: Item List -->
      <div class="cart-items-wrapper">
        <h3 style="margin-bottom: 1rem;">Review Your Bag (${getCartCount()} items)</h3>
        ${shippingBarHTML}
        ${cartItemsHTML}
      </div>

      <!-- Right: Summary & Direct WhatsApp/UPI Checkout -->
      <div class="order-summary-card">
        <h3>Order Summary</h3>
        <div class="summary-row" style="margin-top: 1rem;">
          <span>Subtotal</span>
          <span>₹${subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div class="summary-row">
          <span>Delivery Charges</span>
          <span>${shippingFee === 0 ? '<strong style="color:var(--success);">FREE</strong>' : '₹' + shippingFee}</span>
        </div>
        ${discount > 0 ? `
          <div class="summary-row" style="color:var(--accent);">
            <span>Coupon Discount</span>
            <span>- ₹${discount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}

        <div class="summary-row total-row">
          <span>Total Amount</span>
          <span>₹${grandTotal.toLocaleString('en-IN')}</span>
        </div>

        <!-- Coupon input -->
        <div class="coupon-box">
          <input type="text" id="coupon-input" placeholder="Enter coupon (e.g. BLUEWELL10)" value="${appliedPromo ? appliedPromo.code : ''}">
          <button type="button" class="btn btn-outline" id="apply-coupon-btn" style="min-height:44px; padding: 0.5rem 1rem;">Apply</button>
        </div>

        <!-- Checkout Info Form -->
        <form id="checkout-form" class="checkout-form">
          <h4 style="margin-bottom: 1rem; color: var(--espresso);">Shipping & Contact Details</h4>

          <div class="form-group">
            <label for="cust-name">Full Name *</label>
            <input type="text" id="cust-name" class="form-control" required placeholder="Suraj Rathore">
          </div>

          <div class="form-group">
            <label for="cust-phone">WhatsApp Number (For tracking & updates) *</label>
            <input type="tel" id="cust-phone" class="form-control" required placeholder="e.g. 9876543210" pattern="[0-9]{10}">
          </div>

          <div class="form-group">
            <label for="cust-address">Delivery Address *</label>
            <textarea id="cust-address" class="form-control" rows="2" required placeholder="House / Flat No, Street, Landmark"></textarea>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem;">
            <div class="form-group">
              <label for="cust-city">City *</label>
              <input type="text" id="cust-city" class="form-control" required placeholder="Faridabad">
            </div>
            <div class="form-group">
              <label for="cust-pincode">Pin Code *</label>
              <input type="text" id="cust-pincode" class="form-control" required placeholder="121002" pattern="[0-9]{6}">
            </div>
          </div>

          <!-- Payment Mode Selection -->
          <label style="font-size:0.85rem; font-weight:700; margin-top:0.5rem; display:block;">Select Payment Method *</label>
          <div class="payment-methods">
            <label class="payment-tile active" id="tile-upi">
              <input type="radio" name="paymentMethod" value="UPI" checked style="accent-color: var(--accent);">
              <div>
                <strong>Pay via UPI (GPay / PhonePe / Paytm)</strong>
                <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">Zero gateway transaction fee</p>
              </div>
            </label>

            <label class="payment-tile" id="tile-cod">
              <input type="radio" name="paymentMethod" value="COD" style="accent-color: var(--accent);">
              <div>
                <strong>Cash on Delivery (COD)</strong>
                <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">Pay cash to courier upon arrival</p>
              </div>
            </label>
          </div>

          <!-- Dynamic UPI Display box -->
          <div class="upi-details-box" id="upi-display-area">
            <strong>UPI ID:</strong> <code style="font-weight:bold; color:var(--accent);">${STORE_CONFIG.upiId}</code>
            <div class="qr-placeholder">
              <!-- Inline clean UPI QR representation -->
              <svg viewBox="0 0 100 100" width="120" height="120">
                <rect width="100" height="100" fill="#fff"/>
                <rect x="10" y="10" width="25" height="25" fill="#1B3B2B"/>
                <rect x="15" y="15" width="15" height="15" fill="#fff"/>
                <rect x="18" y="18" width="9" height="9" fill="#1B3B2B"/>
                <rect x="65" y="10" width="25" height="25" fill="#1B3B2B"/>
                <rect x="70" y="15" width="15" height="15" fill="#fff"/>
                <rect x="73" y="18" width="9" height="9" fill="#1B3B2B"/>
                <rect x="10" y="65" width="25" height="25" fill="#1B3B2B"/>
                <rect x="15" y="70" width="15" height="15" fill="#fff"/>
                <rect x="18" y="73" width="9" height="9" fill="#1B3B2B"/>
                <rect x="42" y="15" width="16" height="6" fill="#1B3B2B"/>
                <rect x="45" y="30" width="10" height="40" fill="#C85A32"/>
                <rect x="65" y="65" width="25" height="25" fill="#1B3B2B"/>
              </svg>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">Scan with GPay/PhonePe or send payment to UPI ID after placing order.</p>
          </div>

          <button type="submit" class="btn btn-primary btn-block" style="min-height: 52px; font-size: 1.05rem;">
            Place Order & Connect on WhatsApp →
          </button>
        </form>
      </div>
    </div>
  `;

  // Attach Coupon Handler
  document.getElementById('apply-coupon-btn').addEventListener('click', () => {
    const code = document.getElementById('coupon-input').value.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      appliedPromo = { ...PROMO_CODES[code], code: code };
      showToast(`Promo '${code}' Applied: ${appliedPromo.desc}`);
      renderCartPage();
    } else {
      showToast("Invalid promo code. Try BLUEWELL10");
    }
  });

  // Toggle UPI box on payment choice change
  const upiRadio = document.querySelector('input[value="UPI"]');
  const codRadio = document.querySelector('input[value="COD"]');
  const upiArea = document.getElementById('upi-display-area');

  const updatePaymentVisual = () => {
    document.querySelectorAll('.payment-tile').forEach(t => t.classList.remove('active'));
    if (upiRadio.checked) {
      document.getElementById('tile-upi').classList.add('active');
      upiArea.style.display = 'block';
    } else {
      document.getElementById('tile-cod').classList.add('active');
      upiArea.style.display = 'none';
    }
  };

  upiRadio.addEventListener('change', updatePaymentVisual);
  codRadio.addEventListener('change', updatePaymentVisual);

  // Submit Handler: Store Order + Send formatted WhatsApp Message
  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const city = document.getElementById('cust-city').value.trim();
    const pincode = document.getElementById('cust-pincode').value.trim();
    const method = document.querySelector('input[name="paymentMethod"]:checked').value;

    const orderId = 'BWV-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const newOrder = {
      orderId,
      date: dateStr,
      customer: { name, phone, address, city, pincode },
      items: cart,
      subtotal,
      shippingFee,
      discount,
      grandTotal,
      paymentMethod: method,
      status: 'Pending'
    };

    // 1. Save order to localStorage for Admin view
    const allOrders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
    allOrders.unshift(newOrder);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allOrders));

    // 2. Prepare pre-filled WhatsApp message
    let itemsText = cart.map((i, idx) => `${idx + 1}. ${i.name} (${i.weight}) x ${i.quantity} = ₹${i.price * i.quantity}`).join('%0A');

    const whatsappMessage = `*NEW ORDER - BLUEWELL VENTURES*%0A`
      + `*Order ID:* ${orderId}%0A`
      + `*Date:* ${dateStr}%0A`
      + `----------------------------------%0A`
      + `*Items Ordered:*%0A${itemsText}%0A`
      + `----------------------------------%0A`
      + `*Subtotal:* ₹${subtotal}%0A`
      + `*Shipping:* ${shippingFee === 0 ? 'FREE' : '₹' + shippingFee}%0A`
      + (discount > 0 ? `*Discount:* -₹${discount}%0A` : '')
      + `*Total Payable:* ₹${grandTotal}%0A`
      + `*Payment Method:* ${method}%0A`
      + `----------------------------------%0A`
      + `*Delivery To:*%0A`
      + `*Name:* ${name}%0A`
      + `*Phone:* ${phone}%0A`
      + `*Address:* ${address}, ${city} - ${pincode}%0A%0A`
      + `Please confirm order fulfillment!`;

    // 3. Clear cart
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartBadge();

    // 4. Open WhatsApp directly to merchant number
    const waURL = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${whatsappMessage}`;
    
    // Show success dialog
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1.5rem; background: var(--sand-card); border-radius: var(--radius-md); border: 2px solid var(--primary); max-width: 600px; margin: 0 auto;">
        <div style="font-size: 3.5rem; margin-bottom: 1rem;">🎉</div>
        <h2 style="color: var(--primary);">Order Received Successfully!</h2>
        <p style="margin: 0.75rem 0 1.5rem; font-size: 1.05rem;">Order Reference: <strong>#${orderId}</strong></p>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">
          Your order has been recorded. Tap the button below to send your order summary directly to our WhatsApp support team to start packing your freshly roasted blend.
        </p>
        <a href="${waURL}" target="_blank" class="btn btn-primary btn-block" style="background-color: #25D366; border: none; font-size: 1.1rem; min-height: 52px;">
          💬 Chat on WhatsApp to Confirm Order
        </a>
        <a href="index.html" class="btn btn-outline btn-block" style="margin-top: 1rem;">
          Back to Home
        </a>
      </div>
    `;
  });
}

// ==========================================
// 7. ADMIN DASHBOARD LOGIC (admin.html)
// ==========================================
function renderAdminDashboard() {
  const container = document.getElementById('admin-orders-content');
  if (!container) return;

  const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
  
  // Calculate analytics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const totalOrders = orders.length;

  document.getElementById('admin-total-orders').textContent = totalOrders;
  document.getElementById('admin-total-revenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;

  if (orders.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 3rem; color: var(--text-muted);">
          No customer orders placed yet. Place a test order from the cart page!
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = orders.map((o, index) => {
    const itemsList = o.items.map(i => `${i.name} (${i.weight}) x ${i.quantity}`).join(', ');
    return `
      <tr>
        <td><strong>#${o.orderId}</strong></td>
        <td>${o.date}</td>
        <td>
          <strong>${o.customer.name}</strong><br>
          <small>${o.customer.phone}</small><br>
          <small style="color:var(--text-muted);">${o.customer.city} (${o.customer.pincode})</small>
        </td>
        <td style="max-width: 250px;">${itemsList}</td>
        <td><strong>₹${o.grandTotal}</strong> (${o.paymentMethod})</td>
        <td>
          <select onchange="changeOrderStatus(${index}, this.value)" style="padding: 0.35rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Packed" ${o.status === 'Packed' ? 'selected' : ''}>Packed</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
        <td>
          <a href="https://wa.me/91${o.customer.phone}?text=Hello%20${encodeURIComponent(o.customer.name)},%20regarding%20your%20Bluewell%20Ventures%20order%20${o.orderId}..." target="_blank" class="btn btn-outline" style="min-height:36px; padding: 0.25rem 0.6rem; font-size:0.8rem;">
            WhatsApp
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function changeOrderStatus(orderIndex, newStatus) {
  const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
  if (orders[orderIndex]) {
    orders[orderIndex].status = newStatus;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    showToast(`Order status updated to ${newStatus}`);
  }
}

function clearAllOrders() {
  if (confirm("Are you sure you want to delete all order history from localStorage?")) {
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    renderAdminDashboard();
    showToast("All orders wiped.");
  }
}

// ==========================================
// 8. GLOBAL INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  updateCartBadge();

  // Route-specific rendering
  renderFeaturedProducts();
  renderShopPage();
  renderProductDetailPage();
  renderCartPage();
  renderAdminDashboard();
});
