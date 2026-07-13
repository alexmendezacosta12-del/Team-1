// Shopping Cart functionality for Clerks Shop

class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.updateCartUI();
  }

  // Load cart from localStorage
  loadCart() {
    const saved = localStorage.getItem("clerks_cart");
    return saved ? JSON.parse(saved) : [];
  }

  // Save cart to localStorage
  saveCart() {
    localStorage.setItem("clerks_cart", JSON.stringify(this.items));
  }

  // Add item to cart
  addItem(product, size) {
    const existingItem = this.items.find(
      (item) => item.productId === product.id && item.size === size,
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        productId: product.id,
        name: product.name,
        colorway: product.colorway,
        price: product.price,
        size: size,
        quantity: 1,
        image: product.image,
      });
    }

    this.saveCart();
    this.updateCartUI();
    this.showAddedNotification(product.name, size);
  }

  // Remove item from cart
  removeItem(productId, size) {
    this.items = this.items.filter(
      (item) => !(item.productId === productId && item.size === size),
    );
    this.saveCart();
    this.updateCartUI();
  }

  // Update item quantity
  updateQuantity(productId, size, quantity) {
    const item = this.items.find(
      (item) => item.productId === productId && item.size === size,
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

  // Get total items count
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Get total price
  getTotalPrice() {
    return this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }

  // Clear cart
  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateCartUI();
  }

  // Update cart UI (badge count)
  updateCartUI() {
    const badge = document.getElementById("cart-count");
    const count = this.getTotalItems();

    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "flex" : "none";
    }
  }

  // Show notification when item is added
  showAddedNotification(productName, size) {
    const notification = document.createElement("div");
    notification.className = "cart-notification";
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✓</span>
                <div class="notification-text">
                    <strong>Added to basket!</strong>
                    <p>${productName} - UK ${size}</p>
                </div>
            </div>
        `;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add("show"), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Render cart modal content
  renderCartModal() {
    const container = document.getElementById("cart-items-container");
    const totalElement = document.getElementById("cart-total");

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
                <div class="empty-cart">
                    <p>Your basket is empty</p>
                    <p class="empty-cart-subtitle">Add some shoes to get started!</p>
                </div>
            `;
      if (totalElement) totalElement.textContent = "£0.00";
      return;
    }

    container.innerHTML = this.items
      .map(
        (item) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-colorway">${item.colorway}</p>
                    <p class="cart-item-size">Size: UK ${item.size}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="cart.updateQuantity(${item.productId}, ${item.size}, ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn" onclick="cart.updateQuantity(${item.productId}, ${item.size}, ${item.quantity + 1})">+</button>
                    </div>
                    <p class="cart-item-price">£${(item.price * item.quantity).toFixed(2)}</p>
                    <button class="btn-remove" onclick="cart.removeItem(${item.productId}, ${item.size})">Remove</button>
                </div>
            </div>
        `,
      )
      .join("");

    if (totalElement) {
      totalElement.textContent = `£${this.getTotalPrice().toFixed(2)}`;
    }
  }
}

// Initialize cart globally
let cart;

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = ShoppingCart;
}

// Made with Bob
