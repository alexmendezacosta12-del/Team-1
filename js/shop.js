// Main shop functionality - orchestrates all components

let productFilter;
let recommendationEngine;
let currentProducts = [];
let recommendedIds = [];

// Initialize shop when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize cart
  cart = new ShoppingCart();

  // Initialize filter and recommendation systems
  productFilter = new ProductFilter(products);
  recommendationEngine = new ShoeRecommendation(products);

  // Initial render
  currentProducts = products;
  renderProducts(currentProducts);

  // Setup event listeners
  setupSearchListener();
  setupFilterListeners();
  setupSortListener();
  setupModalListeners();
  setupRecommendationForm();
  setupCartListeners();
  setupCheckoutForm();

  // Update filter counts
  updateFilterUI();
});

// Render products to the grid
function renderProducts(productsToRender) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  if (productsToRender.length === 0) {
    grid.innerHTML =
      '<div class="no-products"><p>No products match your filters. Try adjusting your selection.</p></div>';
    return;
  }

  productsToRender.forEach((product) => {
    const isRecommended = recommendedIds.includes(product.id);
    const card = createProductCard(product, isRecommended);
    grid.appendChild(card);
  });
}

// Create individual product card
function createProductCard(product, isRecommended) {
  const card = document.createElement("div");
  card.className = "product-card" + (isRecommended ? " recommended" : "");

  const displayPrice = (typeof getDisplayPrice === 'function') ? getDisplayPrice(product.price) : product.price;
  const memberPriceHtml = displayPrice < product.price
    ? `<span class="product-price product-price-member">£${displayPrice.toFixed(2)}</span><span class="product-price-original">£${product.price}</span>`
    : `<span class="product-price">£${product.price}</span>`;

  card.innerHTML = `
        ${isRecommended ? '<div class="recommended-badge">AI Recommended</div>' : ""}
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-colorway">${product.colorway}</p>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <div>${memberPriceHtml}</div>
                <button class="btn-view-sizes" data-product-id="${product.id}">View Details</button>
            </div>
        </div>
    `;

  // Click anywhere on card OR the button → go to product detail page
  card.addEventListener("click", (e) => {
    window.location.href = `sport-product.html?id=${product.id}`;
  });

  return card;
}

// Setup search listener
function setupSearchListener() {
  const input = document.getElementById("sport-search-input");
  if (!input) return;
  input.addEventListener("input", function () {
    productFilter.updateSearch(this.value);
    applyFiltersAndRender();
  });
}

// Setup filter event listeners
function setupFilterListeners() {
  // Color filters
  document.querySelectorAll(".color-filter").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      productFilter.toggleColor(this.value);
      applyFiltersAndRender();
    });
  });

  // Size filters
  document.querySelectorAll(".size-filter").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      productFilter.toggleSize(parseInt(this.value));
      applyFiltersAndRender();
    });
  });

  // Price range
  const minPrice = document.getElementById("min-price");
  const maxPrice = document.getElementById("max-price");

  if (minPrice && maxPrice) {
    const updatePriceFilter = () => {
      productFilter.updatePriceRange(
        parseInt(minPrice.value),
        parseInt(maxPrice.value),
      );
      applyFiltersAndRender();
    };

    minPrice.addEventListener("input", updatePriceFilter);
    maxPrice.addEventListener("input", updatePriceFilter);
  }

  // Clear filters button
  const clearBtn = document.getElementById("clear-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      productFilter.clearFilters();
      resetFilterUI();
      applyFiltersAndRender();
    });
  }
}

// Setup sort listener
function setupSortListener() {
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      productFilter.updateSort(this.value);
      applyFiltersAndRender();
    });
  }
}

// Apply filters and re-render products
function applyFiltersAndRender() {
  currentProducts = productFilter.applyFilters();
  renderProducts(currentProducts);
  updateFilterUI();
}

// Update filter UI (counts, etc.)
function updateFilterUI() {
  const count = productFilter.getActiveFilterCount();
  const countElement = document.getElementById("filter-count");
  if (countElement) {
    countElement.textContent = count > 0 ? `(${count})` : "";
  }

  const resultCount = document.getElementById("result-count");
  if (resultCount) {
    resultCount.textContent = `${currentProducts.length} ${currentProducts.length === 1 ? "product" : "products"}`;
  }
}

// Reset filter UI
function resetFilterUI() {
  document
    .querySelectorAll(".color-filter, .size-filter")
    .forEach((cb) => (cb.checked = false));
  document.getElementById("min-price").value = 79;
  document.getElementById("max-price").value = 129;
  document.getElementById("sort-select").value = "newest";
  const searchInp = document.getElementById("sport-search-input");
  if (searchInp) searchInp.value = "";
}

// Setup modal listeners
function setupModalListeners() {
  // Size chart modal
  const sizeChartBtn = document.getElementById("size-chart-btn");
  const sizeChartModal = document.getElementById("size-chart-modal");
  const closeButtons = document.querySelectorAll(".modal-close");

  if (sizeChartBtn && sizeChartModal) {
    sizeChartBtn.addEventListener("click", () => {
      sizeChartModal.classList.add("active");
    });
  }

  // Close modals
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      this.closest(".modal").classList.remove("active");
    });
  });

  // Close on overlay click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.classList.remove("active");
      }
    });
  });
}

// Show size selection for a product
function showSizeSelection(product) {
  const modal = document.getElementById("size-selection-modal");
  const sizeGrid = document.getElementById("size-grid");

  // Populate size grid
  sizeGrid.innerHTML = "";
  product.sizes.forEach((size) => {
    const sizeBtn = document.createElement("button");
    sizeBtn.className = "size-option";
    sizeBtn.textContent = `UK ${size}`;
    sizeBtn.addEventListener("click", () => {
      cart.addItem(product, size);
      modal.classList.remove("active");
    });
    sizeGrid.appendChild(sizeBtn);
  });

  modal.classList.add("active");
}

// Setup recommendation form
function setupRecommendationForm() {
  const form = document.getElementById("recommendation-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const userProfile = {
      height: parseFloat(document.getElementById("height").value),
      weight: parseFloat(document.getElementById("weight").value),
      colorPreference: document.getElementById("color-preference").value,
      footType: document.querySelector('input[name="foot-type"]:checked').value,
    };

    // Get recommendations
    const recommendations =
      recommendationEngine.getRecommendations(userProfile);

    // Display recommendations
    displayRecommendations(recommendations);

    // Highlight recommended products
    recommendedIds = recommendations.map((rec) => rec.product.id);
    renderProducts(currentProducts);
  });
}

// Display recommendations
function displayRecommendations(recommendations) {
  const container = document.getElementById("recommendation-results");
  container.innerHTML = "<h3>Your Personalized Recommendations</h3>";

  recommendations.forEach((rec, index) => {
    const product = rec.product;
    const explanation = recommendationEngine.getExplanation(rec);

    const recCard = document.createElement("div");
    recCard.className = "recommendation-card";
    recCard.innerHTML = `
            <div class="rec-number">#${index + 1}</div>
            <img src="${product.image}" alt="${product.name}">
            <div class="rec-info">
                <h4>${product.name}</h4>
                <p class="rec-price">£${product.price}</p>
                <p class="rec-reason">${explanation}</p>
            </div>
        `;

    container.appendChild(recCard);
  });

  container.style.display = "block";
}

// Made with Bob

// Setup cart event listeners
function setupCartListeners() {
  const cartBtn = document.getElementById("cart-btn");
  const cartModal = document.getElementById("cart-modal");

  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      cart.renderCartModal();
      cartModal.classList.add("active");
    });
  }

  // Checkout button
  const checkoutBtn = document.querySelector(".btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.getTotalItems() === 0) {
        alert("Your basket is empty!");
        return;
      }
      showCheckout();
    });
  }
}

// Show checkout modal — seeds subtotal on the form for delivery calculation
function showCheckout() {
  const cartModal = document.getElementById("cart-modal");
  if (cartModal) cartModal.classList.remove("active");

  const checkoutModal = document.getElementById("checkout-modal");
  const summaryEl = document.getElementById("checkout-summary");
  if (!checkoutModal) return;

  if (summaryEl) {
    const isLoggedIn = (typeof Auth !== 'undefined') && Auth.isLoggedIn();
    const savings = cart.getSavings();

    const itemsHtml = cart.items
      .map((item) => {
        const lineRaw = item.price * item.quantity;
        const linePrice = isLoggedIn && typeof getDisplayTotal === 'function'
          ? getDisplayTotal(lineRaw) : lineRaw;
        return `<div class="s-checkout-item">
          <span>${item.name} (UK ${item.size}) x ${item.quantity}</span>
          <span>£${linePrice.toFixed(2)}</span>
        </div>`;
      })
      .join("");

    const savingsHtml = savings > 0
      ? `<div class="s-checkout-savings">
           <span>Member saving (10%)</span>
           <span style="color:#4caf50;">-£${savings.toFixed(2)}</span>
         </div>`
      : '';

    summaryEl.innerHTML = itemsHtml + savingsHtml;
  }

  // Seed basket total on form for delivery cost calculation
  const form = document.getElementById("checkout-form");
  if (form) {
    const basketTotal = cart.getTotalPrice();
    form.dataset.subtotal = basketTotal.toFixed(2);
    // Reset delivery selection
    document.querySelectorAll('input[name="sdelivery"]').forEach(r => r.checked = false);
    const grandTotalEl = checkoutModal.querySelector('.cv-checkout-grand-total');
    if (grandTotalEl) grandTotalEl.textContent = '£' + basketTotal.toFixed(2);
    const deliveryCostEl = checkoutModal.querySelector('.cv-checkout-delivery-cost');
    if (deliveryCostEl) deliveryCostEl.textContent = '—';
  }

  checkoutModal.classList.add("active");
}

// Handle checkout form submission — saves order to history
function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Read delivery selection
    const deliveryInput  = document.querySelector('input[name="sdelivery"]:checked');
    const deliveryCost   = deliveryInput ? parseFloat(deliveryInput.dataset.cost) : 0;
    const deliveryMethod = deliveryInput ? deliveryInput.value : 'standard';
    const deliveryLabels = { standard: 'Standard Delivery', fast: 'Fast Delivery', 'next-day': 'Next-Day Delivery' };

    // Build and save order
    const user     = (typeof Auth !== 'undefined') ? Auth.currentUser() : null;
    const orderId  = (typeof OrderStore !== 'undefined') ? OrderStore.generateId() : ('CK-' + Date.now());
    const subtotal = parseFloat(this.dataset.subtotal || '0');
    const total    = +(subtotal + deliveryCost).toFixed(2);

    if (typeof OrderStore !== 'undefined') {
      const emailKey = user ? user.email : 'guest';
      OrderStore.saveOrder(emailKey, {
        id:               orderId,
        date:             new Date().toISOString(),
        collection:       'sport',
        items:            cart.items.map(i => ({ name: i.name, colorway: i.colorway, size: i.size, quantity: i.quantity, price: i.price })),
        subtotal,
        deliveryCost,
        deliveryMethod,
        deliveryLabel:    deliveryLabels[deliveryMethod] || deliveryMethod,
        total,
        status:           'received',
        trackingNumber:   'TRK-' + Date.now().toString(36).toUpperCase(),
        estimatedDelivery: OrderStore.estimatedDeliveryDate({ date: new Date().toISOString(), deliveryMethod }),
      });
    }

    document.getElementById("checkout-modal").classList.remove("active");
    cart.clearCart();

    const confirmModal = document.getElementById("confirm-modal");
    if (confirmModal) {
      // Update confirm modal with order reference if element exists
      const refEl = document.getElementById('s-confirm-order-ref') || confirmModal.querySelector('.s-order-ref');
      if (refEl) refEl.textContent = 'Order reference: ' + orderId;
      confirmModal.classList.add("active");
    }
  });
}
