// Formal Shop — orchestration script

let formalFilter;
let formalCurrentProducts = [];
let formalRecommendedIds = [];
let formalCart;

document.addEventListener("DOMContentLoaded", function () {
  formalCart = new FormalCart();

  formalFilter = new FormalFilter(formalProducts);
  formalCurrentProducts = formalProducts;
  formalRenderProducts(formalCurrentProducts);

  formalSetupSearch();
  formalSetupFilterListeners();
  formalSetupSortListener();
  formalSetupModalListeners();
  formalSetupCartListeners();
  formalSetupRecommendationForm();
  formalUpdateFilterUI();
});

// ─── Render ───────────────────────────────────────────────────────────────────

function formalRenderProducts(list) {
  const grid = document.getElementById("formal-product-grid");
  if (!grid) return; // not on shop page

  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML =
      '<div class="f-no-products"><p>No items match your selection. Try adjusting your filters.</p></div>';
    return;
  }

  list.forEach((product) => {
    const card = formalCreateProductCard(product);
    grid.appendChild(card);
  });
}

function formalCreateProductCard(product) {
  const isRecommended = formalRecommendedIds.includes(product.id);
  const card = document.createElement("div");
  card.className =
    "f-product-card" +
    (product.featured ? " f-featured" : "") +
    (isRecommended ? " f-recommended" : "");

  const displayPrice = (typeof getDisplayPrice === 'function') ? getDisplayPrice(product.price) : product.price;
  const memberPriceHtml = displayPrice < product.price
    ? `<span class="f-product-price" style="color:#1a7a40;">£${displayPrice.toFixed(2)}</span><span class="f-product-price-original">£${product.price}</span>`
    : `<span class="f-product-price">£${product.price}</span>`;

  card.innerHTML = `
    <div class="f-product-image">
      ${isRecommended ? '<div class="f-recommended-badge">Recommended</div>' : ""}
      ${product.featured && !isRecommended ? '<div class="f-featured-badge">Featured</div>' : ""}
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="f-product-overlay">
        <span class="f-category-tag">${product.category}</span>
      </div>
    </div>
    <div class="f-product-info">
      <h3 class="f-product-name">${product.name}</h3>
      <p class="f-product-colorway">${product.colorway}</p>
      <p class="f-product-description">${product.description}</p>
      <div class="f-product-footer">
        <div>${memberPriceHtml}</div>
        <button class="f-btn-view-sizes" data-product-id="${product.id}">View Details</button>
      </div>
    </div>
  `;

  // Click anywhere on card → go to formal product detail page
  card.addEventListener("click", () => {
    window.location.href = `formal-product.html?id=${product.id}`;
  });
  return card;
}

// ─── Search ───────────────────────────────────────────────────────────────────

function formalSetupSearch() {
  const input = document.getElementById("formal-search-input");
  if (!input) return;
  input.addEventListener("input", function () {
    formalFilter.updateSearch(this.value);
    formalApplyFiltersAndRender();
  });
}

// ─── Filters ──────────────────────────────────────────────────────────────────

function formalSetupFilterListeners() {
  document.querySelectorAll(".f-color-filter").forEach((cb) => {
    cb.addEventListener("change", function () {
      formalFilter.toggleColor(this.value);
      formalApplyFiltersAndRender();
    });
  });

  document.querySelectorAll(".f-style-filter").forEach((cb) => {
    cb.addEventListener("change", function () {
      formalFilter.toggleStyle(this.value);
      formalApplyFiltersAndRender();
    });
  });

  document.querySelectorAll(".f-size-filter").forEach((cb) => {
    cb.addEventListener("change", function () {
      formalFilter.toggleSize(parseInt(this.value));
      formalApplyFiltersAndRender();
    });
  });

  const minP = document.getElementById("f-min-price");
  const maxP = document.getElementById("f-max-price");
  if (minP && maxP) {
    const update = () => {
      formalFilter.updatePriceRange(parseInt(minP.value), parseInt(maxP.value));
      formalApplyFiltersAndRender();
    };
    minP.addEventListener("input", update);
    maxP.addEventListener("input", update);
  }

  const clearBtn = document.getElementById("f-clear-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      formalFilter.clearFilters();
      formalResetFilterUI();
      formalApplyFiltersAndRender();
    });
  }
}

function formalSetupSortListener() {
  const sel = document.getElementById("f-sort-select");
  if (sel) {
    sel.addEventListener("change", function () {
      formalFilter.updateSort(this.value);
      formalApplyFiltersAndRender();
    });
  }
}

function formalApplyFiltersAndRender() {
  formalCurrentProducts = formalFilter.applyFilters();
  formalRenderProducts(formalCurrentProducts);
  formalUpdateFilterUI();
}

function formalUpdateFilterUI() {
  const count = formalFilter.getActiveFilterCount();
  const countEl = document.getElementById("f-filter-count");
  if (countEl) countEl.textContent = count > 0 ? `(${count})` : "";

  const resultEl = document.getElementById("f-result-count");
  if (resultEl) {
    const n = formalCurrentProducts.length;
    resultEl.textContent = `${n} ${n === 1 ? "item" : "items"}`;
  }
}

function formalResetFilterUI() {
  document
    .querySelectorAll(".f-color-filter, .f-style-filter, .f-size-filter")
    .forEach((cb) => (cb.checked = false));
  const minP = document.getElementById("f-min-price");
  const maxP = document.getElementById("f-max-price");
  if (minP) minP.value = 129;
  if (maxP) maxP.value = 199;
  const sortSel = document.getElementById("f-sort-select");
  if (sortSel) sortSel.value = "newest";
  const searchInp = document.getElementById("formal-search-input");
  if (searchInp) searchInp.value = "";
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function formalSetupModalListeners() {
  const sizeChartBtn = document.getElementById("f-size-chart-btn");
  const sizeChartModal = document.getElementById("f-size-chart-modal");

  if (sizeChartBtn && sizeChartModal) {
    sizeChartBtn.addEventListener("click", () =>
      sizeChartModal.classList.add("active")
    );
  }

  document.querySelectorAll(".f-modal-close").forEach((btn) => {
    btn.addEventListener("click", function () {
      this.closest(".modal").classList.remove("active");
    });
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) this.classList.remove("active");
    });
  });
}

function formalShowSizeSelection(product) {
  const modal = document.getElementById("f-size-selection-modal");
  const grid = document.getElementById("f-size-grid");
  const nameEl = document.getElementById("f-size-modal-product-name");

  if (nameEl) nameEl.textContent = product.name;
  grid.innerHTML = "";

  product.sizes.forEach((size) => {
    const btn = document.createElement("button");
    btn.className = "f-size-btn";
    btn.textContent = `UK ${size}`;
    btn.addEventListener("click", () => {
      formalCart.addItem(product, size);
      modal.classList.remove("active");
    });
    grid.appendChild(btn);
  });

  modal.classList.add("active");
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

function formalSetupCartListeners() {
  const cartBtn = document.getElementById("f-cart-btn");
  const cartModal = document.getElementById("f-cart-modal");

  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      formalCart.renderCartModal();
      cartModal.classList.add("active");
    });
  }

  const checkoutBtn = document.querySelector(".f-btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (formalCart.getTotalItems() === 0) {
        alert("Your basket is empty!");
        return;
      }
      formalShowCheckout();
    });
  }
}

function formalShowCheckout() {
  const cartModal = document.getElementById("f-cart-modal");
  if (cartModal) cartModal.classList.remove("active");

  const modal = document.getElementById("f-checkout-modal");
  if (modal) {
    const summaryEl = document.getElementById("f-checkout-summary");
    if (summaryEl) {
      const isLoggedIn = (typeof Auth !== 'undefined') && Auth.isLoggedIn();
      const savings = formalCart.getSavings();

      const itemsHtml = formalCart.items
        .map((item) => {
          const lineRaw = item.price * item.quantity;
          const linePrice = isLoggedIn && typeof getDisplayTotal === 'function'
            ? getDisplayTotal(lineRaw) : lineRaw;
          return `<div class="f-checkout-item">
            <span>${item.name} (UK ${item.size}) x ${item.quantity}</span>
            <span>£${linePrice.toFixed(2)}</span>
          </div>`;
        })
        .join("");

      const savingsHtml = savings > 0
        ? `<div class="f-checkout-savings">
             <span>Member saving (10%)</span>
             <span class="f-savings-green">-£${savings.toFixed(2)}</span>
           </div>`
        : '';

      summaryEl.innerHTML = itemsHtml + savingsHtml;
    }

    // Seed subtotal on the form and reset delivery display
    const form = document.getElementById("f-checkout-form");
    if (form) {
      const basketTotal = formalCart.getTotalPrice();
      form.dataset.subtotal = basketTotal.toFixed(2);
      // Reset delivery radios
      document.querySelectorAll('input[name="fdelivery"]').forEach(r => r.checked = false);
      const grandTotalEl = modal.querySelector('.cv-checkout-grand-total');
      if (grandTotalEl) grandTotalEl.textContent = '£' + basketTotal.toFixed(2);
      const deliveryCostEl = modal.querySelector('.cv-checkout-delivery-cost');
      if (deliveryCostEl) deliveryCostEl.textContent = '—';
    }

    modal.classList.add("active");
  }
}

// Handle checkout form submission on FormalShop.html only.
// formal-cart.html and formal-product.html have their own inline handlers.
// checkout-validation.js runs first in the capture phase.
document.addEventListener("DOMContentLoaded", function () {
  // Guard: only attach on FormalShop.html (no fcs-checkout-btn and no fpd-add-btn)
  if (document.getElementById("fcs-checkout-btn")) return;
  if (document.getElementById("fpd-add-btn")) return;

  const checkoutForm = document.getElementById("f-checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Read delivery selection
      const deliveryInput  = document.querySelector('input[name="fdelivery"]:checked');
      const deliveryCost   = deliveryInput ? parseFloat(deliveryInput.dataset.cost) : 0;
      const deliveryMethod = deliveryInput ? deliveryInput.value : 'standard';
      const deliveryLabels = { standard: 'Standard Delivery', fast: 'Fast Delivery', 'next-day': 'Next-Day Delivery' };

      // Collect customer details
      const firstName  = (document.getElementById("f-first-name")?.value || "").trim();
      const lastName   = (document.getElementById("f-last-name")?.value  || "").trim();
      const emailAddr  = (document.getElementById("f-email")?.value       || "").trim();
      const isLoggedIn = (typeof Auth !== "undefined") && Auth.isLoggedIn();

      // Build and save order
      const user     = (typeof Auth !== "undefined") ? Auth.currentUser() : null;
      const orderId  = (typeof OrderStore !== "undefined") ? OrderStore.generateId() : ("CK-" + Date.now());
      const subtotal = parseFloat(this.dataset.subtotal || "0");
      const total    = +(subtotal + deliveryCost).toFixed(2);

      if (typeof OrderStore !== "undefined") {
        const emailKey = user ? user.email : "guest";
        OrderStore.saveOrder(emailKey, {
          id:               orderId,
          date:             new Date().toISOString(),
          collection:       "formal",
          items:            formalCart.items.map(i => ({ name: i.name, colorway: i.colorway, size: i.size, quantity: i.quantity, price: i.price })),
          subtotal,
          deliveryCost,
          deliveryMethod,
          deliveryLabel:    deliveryLabels[deliveryMethod] || deliveryMethod,
          total,
          status:           "received",
          trackingNumber:   "TRK-" + Date.now().toString(36).toUpperCase(),
          estimatedDelivery: OrderStore.estimatedDeliveryDate({ date: new Date().toISOString(), deliveryMethod }),
        });
      }

      // Send confirmation email
      if (typeof sendOrderConfirmationEmail === "function") {
        sendOrderConfirmationEmail({ firstName, lastName, email: emailAddr, items: formalCart.items.slice(), total, isLoggedIn });
      }

      const modal = document.getElementById("f-checkout-modal");
      if (modal) modal.classList.remove("active");
      formalCart.clearCart();

      const confirmModal = document.getElementById("f-confirm-modal");
      if (confirmModal) {
        const orderRefEl = document.getElementById("f-confirm-order-ref");
        if (orderRefEl) orderRefEl.textContent = "Order reference: " + orderId;
        confirmModal.classList.add("active");
      }
    });
  }
});

// ─── Formal Recommendation Engine ────────────────────────────────────────────

// Occasion → compatible product styles
const occasionStyleMap = {
  "business":     ["oxford", "derby", "classic", "formal"],
  "black-tie":    ["oxford", "formal", "premium"],
  "smart-casual": ["loafer", "smart-casual", "chelsea", "boot", "summer-formal"],
  "wedding":      ["oxford", "brogue", "monk-strap", "statement", "premium"],
  "any":          ["oxford", "derby", "loafer", "boot", "monk-strap", "brogue", "classic", "formal", "smart-casual", "statement", "premium", "summer-formal"],
};

// Tone preference → product color field match
const toneColorMap = {
  "dark":  "dark",
  "warm":  "bold",   // cognac/brown products tagged "bold" in data
  "light": "light",
  "bold":  "dark",   // bordeaux is tagged "dark"
  "any":   null,
};

function formalGetRecommendations(userProfile) {
  const { occasion, tone, stylePref } = userProfile;

  const compatibleStyles = occasionStyleMap[occasion] || occasionStyleMap["any"];
  const targetColor = toneColorMap[tone] || null;

  const scored = formalProducts.map((product) => {
    let score = 0;
    const reasons = [];

    // Style match against occasion
    const styleOverlap = product.style.filter((s) => compatibleStyles.includes(s));
    if (styleOverlap.length > 0) {
      score += 50;
      if (occasion !== "any") {
        reasons.push(`Well suited for ${occasion.replace("-", " ")} occasions`);
      }
    }

    // Style preference match
    if (stylePref !== "classic" && product.style.includes(stylePref)) {
      score += 25;
      reasons.push(`Matches your ${stylePref.replace("-", " ")} style preference`);
    } else if (stylePref === "classic" && (product.style.includes("oxford") || product.style.includes("derby") || product.style.includes("classic"))) {
      score += 25;
      reasons.push("A timeless classic choice");
    }

    // Tone / colour match
    if (targetColor && product.color === targetColor) {
      score += 20;
      if (tone !== "any") reasons.push(`Matches your ${tone} colour preference`);
    } else if (!targetColor) {
      score += 10;
    }

    // Featured bonus
    if (product.featured) score += 5;

    return { product, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 2);
}

function formalSetupRecommendationForm() {
  const form = document.getElementById("f-recommendation-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const userProfile = {
      occasion:  document.getElementById("f-occasion").value,
      tone:      document.getElementById("f-tone-pref").value,
      stylePref: document.querySelector('input[name="f-style-pref"]:checked').value,
    };

    const recommendations = formalGetRecommendations(userProfile);
    formalDisplayRecommendations(recommendations);

    // Highlight recommended cards in the grid
    formalRecommendedIds = recommendations.map((r) => r.product.id);
    formalRenderProducts(formalCurrentProducts);
  });
}

function formalDisplayRecommendations(recommendations) {
  const container = document.getElementById("f-recommendation-results");
  container.innerHTML = '<p class="f-ai-results-title">Your Recommendations</p>';

  recommendations.forEach((rec, index) => {
    const p = rec.product;
    const explanation =
      rec.reasons.length > 0
        ? rec.reasons.join(". ") + "."
        : "A refined choice for your occasion.";

    const card = document.createElement("div");
    card.className = "f-ai-rec-card";
    card.innerHTML = `
      <div class="f-ai-rec-number">#${index + 1}</div>
      <img src="${p.image}" alt="${p.name}" class="f-ai-rec-img">
      <div class="f-ai-rec-info">
        <p class="f-ai-rec-name">${p.name}</p>
        <p class="f-ai-rec-price">£${p.price}</p>
        <p class="f-ai-rec-reason">${explanation}</p>
      </div>
    `;
    container.appendChild(card);
  });

  container.style.display = "block";
}

// ─── FormalFilter class ───────────────────────────────────────────────────────

class FormalFilter {
  constructor(products) {
    this.products = products;
    this.activeFilters = {
      colors: [],
      styles: [],
      sizes: [],
      priceRange: { min: 129, max: 169 },
      search: "",
    };
    this.sortBy = "newest";
  }

  applyFilters() {
    let filtered = [...this.products];

    if (this.activeFilters.search.trim()) {
      const q = this.activeFilters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.colorway.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.style.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (this.activeFilters.colors.length > 0) {
      filtered = filtered.filter((p) =>
        this.activeFilters.colors.some((c) =>
          p.colorway.toLowerCase().includes(c.toLowerCase())
        )
      );
    }

    if (this.activeFilters.styles.length > 0) {
      filtered = filtered.filter((p) =>
        this.activeFilters.styles.some((s) => p.style.includes(s))
      );
    }

    if (this.activeFilters.sizes.length > 0) {
      filtered = filtered.filter((p) =>
        this.activeFilters.sizes.some((sz) => p.sizes.includes(sz))
      );
    }

    filtered = filtered.filter(
      (p) =>
        p.price >= this.activeFilters.priceRange.min &&
        p.price <= this.activeFilters.priceRange.max
    );

    return this.sortProducts(filtered);
  }

  sortProducts(list) {
    const sorted = [...list];
    switch (this.sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
      default:
        return sorted.sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
        );
    }
  }

  toggleColor(color) {
    const i = this.activeFilters.colors.indexOf(color);
    i > -1
      ? this.activeFilters.colors.splice(i, 1)
      : this.activeFilters.colors.push(color);
  }

  toggleStyle(style) {
    const i = this.activeFilters.styles.indexOf(style);
    i > -1
      ? this.activeFilters.styles.splice(i, 1)
      : this.activeFilters.styles.push(style);
  }

  toggleSize(size) {
    const i = this.activeFilters.sizes.indexOf(size);
    i > -1
      ? this.activeFilters.sizes.splice(i, 1)
      : this.activeFilters.sizes.push(size);
  }

  updatePriceRange(min, max) {
    this.activeFilters.priceRange.min = min;
    this.activeFilters.priceRange.max = max;
  }

  updateSort(method) {
    this.sortBy = method;
  }

  updateSearch(query) {
    this.activeFilters.search = query;
  }

  clearFilters() {
    this.activeFilters = {
      colors: [],
      styles: [],
      sizes: [],
      priceRange: { min: 129, max: 169 },
      search: "",
    };
    this.sortBy = "newest";
  }

  getActiveFilterCount() {
    return (
      this.activeFilters.colors.length +
      this.activeFilters.styles.length +
      this.activeFilters.sizes.length +
      (this.activeFilters.priceRange.min !== 129 ||
      this.activeFilters.priceRange.max !== 199
        ? 1
        : 0) +
      (this.activeFilters.search.trim() ? 1 : 0)
    );
  }
}

// ─── FormalCart class ─────────────────────────────────────────────────────────

class FormalCart {
  constructor() {
    this.items = this.loadCart();
    this.updateCartUI();
  }

  loadCart() {
    const saved = localStorage.getItem("clerks_formal_cart");
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem("clerks_formal_cart", JSON.stringify(this.items));
  }

  addItem(product, size) {
    const existing = this.items.find(
      (i) => i.productId === product.id && i.size === size
    );
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({
        productId: product.id,
        name: product.name,
        colorway: product.colorway,
        price: product.price,
        size,
        quantity: 1,
        image: product.image,
      });
    }
    this.saveCart();
    this.updateCartUI();
    this.showAddedNotification(product.name, size);
  }

  removeItem(productId, size) {
    this.items = this.items.filter(
      (i) => !(i.productId === productId && i.size === size)
    );
    this.saveCart();
    this.updateCartUI();
  }

  updateQuantity(productId, size, quantity) {
    const item = this.items.find(
      (i) => i.productId === productId && i.size === size
    );
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId, size);
      } else {
        item.quantity = quantity;
        this.saveCart();
        this.updateCartUI();
      }
    }
  }

  getTotalItems() {
    return this.items.reduce((t, i) => t + i.quantity, 0);
  }

  getRawTotal() {
    return this.items.reduce((t, i) => t + i.price * i.quantity, 0);
  }

  getTotalPrice() {
    const raw = this.getRawTotal();
    return (typeof getDisplayTotal === 'function') ? getDisplayTotal(raw) : raw;
  }

  getSavings() {
    const raw = this.getRawTotal();
    return +(raw - this.getTotalPrice()).toFixed(2);
  }

  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateCartUI();
  }

  updateCartUI() {
    const badge = document.getElementById("f-cart-count");
    const count = this.getTotalItems();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "flex" : "none";
    }
  }

  showAddedNotification(productName, size) {
    const n = document.createElement("div");
    n.className = "f-cart-notification";
    n.innerHTML = `
      <div class="f-notification-content">
        <span class="f-notification-icon">✓</span>
        <div class="f-notification-text">
          <strong>Added to basket</strong>
          <p>${productName} — UK ${size}</p>
        </div>
      </div>
    `;
    document.body.appendChild(n);
    setTimeout(() => n.classList.add("show"), 10);
    setTimeout(() => {
      n.classList.remove("show");
      setTimeout(() => n.remove(), 300);
    }, 3000);
  }

  renderCartModal() {
    const container = document.getElementById("f-cart-items-container");
    const totalEl = document.getElementById("f-cart-total");
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="f-empty-cart">
          <p>Your basket is empty</p>
          <p class="f-empty-cart-subtitle">Select a size on any item to add it.</p>
        </div>
      `;
      if (totalEl) totalEl.textContent = "£0.00";
      return;
    }

    const isLoggedIn = (typeof Auth !== 'undefined') && Auth.isLoggedIn();

    container.innerHTML = this.items
      .map((item) => {
        const lineRaw = item.price * item.quantity;
        const linePrice = isLoggedIn && typeof getDisplayTotal === 'function'
          ? getDisplayTotal(lineRaw) : lineRaw;
        return `
      <div class="f-cart-item">
        <img src="${item.image}" alt="${item.name}" class="f-cart-item-image">
        <div class="f-cart-item-details">
          <h4>${item.name}</h4>
          <p class="f-cart-item-colorway">${item.colorway}</p>
          <p class="f-cart-item-size">Size: UK ${item.size}</p>
        </div>
        <div class="f-cart-item-controls">
          <div class="f-quantity-controls">
            <button class="f-qty-btn" onclick="formalCart.updateQuantity(${item.productId}, ${item.size}, ${item.quantity - 1})">−</button>
            <span class="f-quantity">${item.quantity}</span>
            <button class="f-qty-btn" onclick="formalCart.updateQuantity(${item.productId}, ${item.size}, ${item.quantity + 1})">+</button>
          </div>
          <p class="f-cart-item-price">£${linePrice.toFixed(2)}</p>
          <button class="f-btn-remove" onclick="formalCart.removeItem(${item.productId}, ${item.size})">Remove</button>
        </div>
      </div>
    `;
      })
      .join("");

    const savings = this.getSavings();
    if (totalEl) totalEl.textContent = `£${this.getTotalPrice().toFixed(2)}`;

    // Insert savings row if logged in
    const footer = document.querySelector('.f-cart-footer');
    const existingSavings = document.getElementById('f-cart-savings-dynamic');
    if (existingSavings) existingSavings.remove();
    if (savings > 0 && footer) {
      const savingsEl = document.createElement('div');
      savingsEl.id = 'f-cart-savings-dynamic';
      savingsEl.innerHTML = `<div class="f-cart-savings-row"><span class="f-cart-savings-label">Member saving (10%)</span><span class="f-cart-savings-amount">−£${savings.toFixed(2)}</span></div>`;
      footer.insertBefore(savingsEl, footer.firstChild);
    }
  }
}
