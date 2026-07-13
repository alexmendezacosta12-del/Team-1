// ─── Clerks Auth & Discount System ───────────────────────────────────────────
// Client-side authentication with localStorage persistence.
// Provides a 10% discount to signed-in users, applied at checkout.
// Also stores and retrieves order history per-user.

const DISCOUNT_RATE = 0.10; // 10%
const STORAGE_KEY   = 'clerks_user';

// ─── Input validation helpers ─────────────────────────────────────────────────

const AuthValidate = {
  // Email: standard format check
  email(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
  },

  // Password: 8–64 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char
  password(v) {
    if (!v || v.length < 8 || v.length > 64) return false;
    if (!/[A-Z]/.test(v)) return false;
    if (!/[a-z]/.test(v)) return false;
    if (!/[0-9]/.test(v)) return false;
    if (!/[^A-Za-z0-9]/.test(v)) return false;
    return true;
  },

  // Password strength message for UI feedback
  passwordMessage(v) {
    if (!v || v.length === 0)   return 'Password is required.';
    if (v.length < 8)           return 'Password must be at least 8 characters.';
    if (v.length > 64)          return 'Password must be 64 characters or fewer.';
    if (!/[A-Z]/.test(v))       return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(v))       return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(v))       return 'Password must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(v)) return 'Password must contain at least one special character (e.g. ! @ # $).';
    return '';
  },

  // Name: letters, spaces, apostrophes, hyphens. 2–50 chars.
  name(v) {
    if (!v || v.trim().length < 2 || v.trim().length > 50) return false;
    return /^[A-Za-zÀ-ÖØ-öø-ÿ '\-]+$/.test(v.trim());
  },

  nameMessage(v) {
    if (!v || !v.trim()) return 'This field is required.';
    if (v.trim().length < 2) return 'Must be at least 2 characters.';
    if (v.trim().length > 50) return 'Must be 50 characters or fewer.';
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ '\-]+$/.test(v.trim()))
      return 'Only letters, spaces, hyphens and apostrophes are allowed.';
    return '';
  },
};

// ─── Mock user database (replace with real API calls) ─────────────────────────
function _getUserDb() {
  try {
    const raw = localStorage.getItem('clerks_user_db');
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}
function _saveUserDb(db) {
  localStorage.setItem('clerks_user_db', JSON.stringify(db));
}

// ─── Order history storage ─────────────────────────────────────────────────────
// Orders are stored per email under 'clerks_orders' key.
// Shape: { [email]: Order[] }
// Order shape: { id, date, items, subtotal, deliveryCost, deliveryMethod, total,
//               status, trackingNumber, estimatedDelivery, collection }

const OrderStore = {
  _key: 'clerks_orders',

  _load() {
    try {
      return JSON.parse(localStorage.getItem(this._key) || '{}');
    } catch (e) { return {}; }
  },
  _save(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
  },

  // Save a new order for a given email
  saveOrder(email, order) {
    const data = this._load();
    const key  = (email || '').toLowerCase();
    if (!data[key]) data[key] = [];
    data[key].unshift(order); // newest first
    this._save(data);
  },

  // Get all orders for a given email
  getOrders(email) {
    const data = this._load();
    return data[(email || '').toLowerCase()] || [];
  },

  // Update the status of a specific order
  updateStatus(email, orderId, newStatus) {
    const data = this._load();
    const key  = (email || '').toLowerCase();
    const orders = data[key] || [];
    const order  = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this._save(data);
    }
  },

  // Generate a unique order ID
  generateId() {
    return 'CK-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  },

  // Simulate order status progression (for demo) — advances status by time
  simulatedStatus(order) {
    const ageMs = Date.now() - new Date(order.date).getTime();
    const ageH  = ageMs / (1000 * 60 * 60);
    const method = order.deliveryMethod || 'standard';

    // Time thresholds (hours) per delivery type
    const thresholds = {
      'standard':  { preparing: 4, dispatched: 24, out_for_delivery: 72,  delivered: 96  },
      'fast':      { preparing: 2, dispatched: 12, out_for_delivery: 36,  delivered: 48  },
      'next-day':  { preparing: 1, dispatched: 4,  out_for_delivery: 18,  delivered: 24  },
    };
    const t = thresholds[method] || thresholds['standard'];

    if (ageH >= t.delivered)         return 'delivered';
    if (ageH >= t.out_for_delivery)  return 'out_for_delivery';
    if (ageH >= t.dispatched)        return 'dispatched';
    if (ageH >= t.preparing)         return 'preparing';
    return 'received';
  },

  // Compute estimated delivery date string
  estimatedDeliveryDate(order) {
    const method = order.deliveryMethod || 'standard';
    const placed = new Date(order.date);
    const days   = { 'standard': 5, 'fast': 2, 'next-day': 1 };
    const add    = days[method] || 5;
    const est    = new Date(placed);
    // Skip weekends naively
    let added = 0;
    while (added < add) {
      est.setDate(est.getDate() + 1);
      const day = est.getDay();
      if (day !== 0 && day !== 6) added++;
    }
    return est.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  },
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

const Auth = {
  // Register a new account
  register(firstName, lastName, email, password) {
    // Server-side style validation
    const firstMsg = AuthValidate.nameMessage(firstName);
    if (firstMsg) return { ok: false, error: 'First name: ' + firstMsg };
    const lastMsg  = AuthValidate.nameMessage(lastName);
    if (lastMsg)  return { ok: false, error: 'Last name: ' + lastMsg };
    if (!AuthValidate.email(email))
      return { ok: false, error: 'Please enter a valid email address.' };
    const pwMsg = AuthValidate.passwordMessage(password);
    if (pwMsg) return { ok: false, error: pwMsg };

    const db = _getUserDb();
    if (db[email.toLowerCase()]) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    db[email.toLowerCase()] = {
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.toLowerCase(),
      // In production: bcrypt hash. Here we store a simple hash for demo.
      passwordHash: btoa(unescape(encodeURIComponent(password))),
      createdAt: new Date().toISOString(),
    };
    _saveUserDb(db);
    this._setSession({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.toLowerCase() });
    return { ok: true };
  },

  // Sign in
  login(email, password) {
    if (!AuthValidate.email(email))
      return { ok: false, error: 'Please enter a valid email address.' };
    if (!password || !password.trim())
      return { ok: false, error: 'Password is required.' };

    const db   = _getUserDb();
    const user = db[email.toLowerCase()];
    if (!user) {
      return { ok: false, error: 'No account found with that email.' };
    }
    if (user.passwordHash !== btoa(unescape(encodeURIComponent(password)))) {
      return { ok: false, error: 'Incorrect password. Please try again.' };
    }
    this._setSession({ firstName: user.firstName, lastName: user.lastName, email: user.email });
    return { ok: true };
  },

  // Sign out
  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this._notifyChange();
  },

  // Get current user (null if not signed in)
  currentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  // Is the user currently signed in?
  isLoggedIn() {
    return !!this.currentUser();
  },

  // Apply 10% discount to a price if signed in
  applyDiscount(price) {
    return this.isLoggedIn() ? +(price * (1 - DISCOUNT_RATE)).toFixed(2) : price;
  },

  // Apply discount to a total
  applyDiscountToTotal(total) {
    return this.isLoggedIn() ? +(total * (1 - DISCOUNT_RATE)).toFixed(2) : total;
  },

  discountRate() {
    return DISCOUNT_RATE;
  },

  _setSession(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._notifyChange();
  },

  // Dispatch a custom event so any open page can update its UI
  _notifyChange() {
    window.dispatchEvent(new CustomEvent('clerks:authchange'));
  },
};

// ─── Auth Modal Controller ────────────────────────────────────────────────────

const AuthModal = {
  init() {
    this._injectModal();
    this._bindEvents();
    this._updateHeaderUI();

    window.addEventListener('clerks:authchange', () => this._updateHeaderUI());
  },

  open(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.add('active');
    this._switchTab(tab);
  },

  close() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
    this._clearErrors();
  },

  _switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.querySelectorAll('.auth-panel').forEach(p => {
      p.classList.toggle('active', p.id === `auth-${tab}-panel`);
    });
    this._clearErrors();
  },

  _clearErrors() {
    document.querySelectorAll('.auth-error').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
    // Clear field-level errors
    document.querySelectorAll('.auth-field-error').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
    document.querySelectorAll('#auth-modal input').forEach(el => {
      el.style.borderColor = '';
    });
  },

  // ── Helper: show/clear a field-level error inside the auth modal ───────────
  _setFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.style.borderColor = '#e53e3e';
    let err = input.parentElement.querySelector('.auth-field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'auth-field-error';
      input.insertAdjacentElement('afterend', err);
    }
    err.textContent = message;
    err.style.display = 'block';
  },
  _clearFieldError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.style.borderColor = '';
    const err = input.parentElement.querySelector('.auth-field-error');
    if (err) { err.textContent = ''; err.style.display = 'none'; }
  },

  // Inject the modal HTML into the page body
  _injectModal() {
    if (document.getElementById('auth-modal')) return;

    const isFormal = document.body.classList.contains('f-body');

    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'auth-modal' + (isFormal ? ' auth-modal-formal' : '');
    modal.innerHTML = `
      <div class="auth-modal-content">
        <button class="auth-modal-close" aria-label="Close">&times;</button>

        <div class="auth-brand">C L E R K S.</div>
        <p class="auth-brand-sub">Your account</p>

        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">Sign In</button>
          <button class="auth-tab" data-tab="register">Create Account</button>
        </div>

        <!-- Login panel -->
        <div id="auth-login-panel" class="auth-panel active">
          <div class="auth-discount-banner">
            <span class="auth-discount-icon">✦</span>
            Sign in to unlock <strong>10% off</strong> every order
          </div>
          <form id="auth-login-form" novalidate>
            <div class="auth-form-group">
              <label for="auth-login-email">Email</label>
              <input type="email" id="auth-login-email" placeholder="you@example.com" required autocomplete="email" />
            </div>
            <div class="auth-form-group">
              <label for="auth-login-password">Password</label>
              <input type="password" id="auth-login-password" placeholder="••••••••" required autocomplete="current-password" />
            </div>
            <p class="auth-error" id="auth-login-error" style="display:none;"></p>
            <button type="submit" class="auth-submit">Sign In</button>
          </form>
          <p class="auth-switch">Don't have an account?
            <button class="auth-switch-btn" data-target="register">Create one</button>
          </p>
          <p class="auth-switch" style="margin-top:8px;">
            <button class="auth-switch-btn" data-target="orders" style="font-size:12px;opacity:0.8;">View My Orders</button>
          </p>
        </div>

        <!-- Register panel -->
        <div id="auth-register-panel" class="auth-panel">
          <div class="auth-discount-banner">
            <span class="auth-discount-icon">✦</span>
            Create an account for <strong>10% off</strong> every order
          </div>
          <form id="auth-register-form" novalidate>
            <div class="auth-form-row">
              <div class="auth-form-group">
                <label for="auth-reg-fname">First Name</label>
                <input type="text" id="auth-reg-fname" placeholder="Jamie" required autocomplete="given-name" />
              </div>
              <div class="auth-form-group">
                <label for="auth-reg-lname">Last Name</label>
                <input type="text" id="auth-reg-lname" placeholder="Johnson" required autocomplete="family-name" />
              </div>
            </div>
            <div class="auth-form-group">
              <label for="auth-reg-email">Email</label>
              <input type="email" id="auth-reg-email" placeholder="you@example.com" required autocomplete="email" />
            </div>
            <div class="auth-form-group">
              <label for="auth-reg-password">Password</label>
              <input type="password" id="auth-reg-password" placeholder="Min. 8 characters" required autocomplete="new-password" />
              <span class="auth-pw-hint">8–64 chars, uppercase, lowercase, number &amp; special character</span>
            </div>
            <p class="auth-error" id="auth-register-error" style="display:none;"></p>
            <button type="submit" class="auth-submit">Create Account</button>
          </form>
          <p class="auth-switch">Already have an account?
            <button class="auth-switch-btn" data-target="login">Sign in</button>
          </p>
        </div>

      </div>
    `;
    document.body.appendChild(modal);
  },

  _bindEvents() {
    // Close on backdrop click
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('auth-modal');
      if (e.target === modal) this.close();
    });

    // Close button
    document.addEventListener('click', (e) => {
      if (e.target.closest('.auth-modal-close')) this.close();
    });

    // Tab switching
    document.addEventListener('click', (e) => {
      const tab = e.target.closest('.auth-tab');
      if (tab) this._switchTab(tab.dataset.tab);

      const switchBtn = e.target.closest('.auth-switch-btn');
      if (switchBtn) {
        const target = switchBtn.dataset.target;
        if (target === 'orders') {
          this.close();
          // Navigate to orders page based on site
          const isFormal = document.body.classList.contains('f-body');
          window.location.href = isFormal ? 'formal-orders.html' : 'sport-orders.html';
        } else {
          this._switchTab(target);
        }
      }
    });

    // Login form
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'auth-login-form') {
        e.preventDefault();
        this._handleLogin();
      }
      if (e.target.id === 'auth-register-form') {
        e.preventDefault();
        this._handleRegister();
      }
    });

    // Live password validation feedback
    document.addEventListener('input', (e) => {
      if (e.target.id === 'auth-reg-password') {
        const msg = AuthValidate.passwordMessage(e.target.value);
        if (msg && e.target.value.length > 0) {
          this._setFieldError('auth-reg-password', msg);
        } else {
          this._clearFieldError('auth-reg-password');
        }
      }
    });

    // Header sign-in button / user menu (sport + formal)
    document.addEventListener('click', (e) => {
      if (e.target.closest('#auth-signin-btn')) this.open('login');
      if (e.target.closest('#f-auth-signin-btn')) this.open('login');

      if (e.target.closest('#auth-signout-btn') || e.target.closest('#f-auth-signout-btn')) {
        Auth.logout();
        window.location.reload();
      }
    });

    // Formal discount bar click → open auth modal
    document.addEventListener('click', (e) => {
      if (e.target.closest('#f-discount-bar') && !Auth.isLoggedIn()) {
        this.open('login');
      }
    });

    // Sport ticker SIGN IN link
    const ticker = document.getElementById('p4');
    if (ticker) {
      ticker.style.cursor = 'pointer';
      ticker.addEventListener('click', () => this.open('login'));
    }
  },

  _handleLogin() {
    const email    = (document.getElementById('auth-login-email').value || '').trim();
    const password = document.getElementById('auth-login-password').value;
    const errorEl  = document.getElementById('auth-login-error');

    // Clear previous errors
    errorEl.style.display = 'none';
    errorEl.textContent   = '';

    // Client-side pre-validation
    if (!AuthValidate.email(email)) {
      errorEl.textContent = 'Please enter a valid email address.';
      errorEl.style.display = 'block';
      return;
    }
    if (!password) {
      errorEl.textContent = 'Password is required.';
      errorEl.style.display = 'block';
      return;
    }

    const result = Auth.login(email, password);
    if (!result.ok) {
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
      return;
    }
    this.close();
    window.location.reload(); // refresh so discounted prices show
  },

  _handleRegister() {
    const firstName = (document.getElementById('auth-reg-fname').value || '').trim();
    const lastName  = (document.getElementById('auth-reg-lname').value || '').trim();
    const email     = (document.getElementById('auth-reg-email').value || '').trim();
    const password  = document.getElementById('auth-reg-password').value;
    const errorEl   = document.getElementById('auth-register-error');

    // Clear previous errors
    errorEl.style.display = 'none';
    errorEl.textContent   = '';
    ['auth-reg-fname','auth-reg-lname','auth-reg-email','auth-reg-password'].forEach(id => this._clearFieldError(id));

    let hasError = false;

    const fnameMsg = AuthValidate.nameMessage(firstName);
    if (fnameMsg) { this._setFieldError('auth-reg-fname', fnameMsg); hasError = true; }

    const lnameMsg = AuthValidate.nameMessage(lastName);
    if (lnameMsg) { this._setFieldError('auth-reg-lname', lnameMsg); hasError = true; }

    if (!AuthValidate.email(email)) {
      this._setFieldError('auth-reg-email', 'Please enter a valid email address.');
      hasError = true;
    }

    const pwMsg = AuthValidate.passwordMessage(password);
    if (pwMsg) {
      this._setFieldError('auth-reg-password', pwMsg);
      hasError = true;
    }

    if (hasError) return;

    const result = Auth.register(firstName, lastName, email, password);
    if (!result.ok) {
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
      return;
    }
    this.close();
    window.location.reload();
  },

  // Update the header sign-in button to show user state
  _updateHeaderUI() {
    const user = Auth.currentUser();

    // Sport header button
    const sportBtn = document.getElementById('auth-signin-btn');
    if (sportBtn) {
      if (user) {
        sportBtn.innerHTML = `<span class="auth-user-dot"></span> ${user.firstName}`;
        sportBtn.title = 'Signed in — click to sign out';
        sportBtn.id = 'auth-signout-btn';
      } else {
        sportBtn.innerHTML = 'Sign In';
        sportBtn.title = 'Sign in for 10% off';
      }
    }

    // Formal header button
    const formalBtn = document.getElementById('f-auth-signin-btn');
    if (formalBtn) {
      if (user) {
        formalBtn.innerHTML = `<span class="auth-user-dot"></span> ${user.firstName}`;
        formalBtn.title = 'Signed in — click to sign out';
        formalBtn.id = 'f-auth-signout-btn';
      } else {
        formalBtn.innerHTML = 'Sign In';
        formalBtn.title = 'Sign in for 10% off';
      }
    }

    // Show/hide "My Orders" nav link based on sign-in state
    // Sport pages use id="s-nav-orders-li", Formal pages use id="f-nav-orders-li"
    const sportOrdersLi  = document.getElementById('s-nav-orders-li');
    const formalOrdersLi = document.getElementById('f-nav-orders-li');
    const display = user ? '' : 'none';
    if (sportOrdersLi)  sportOrdersLi.style.display  = display;
    if (formalOrdersLi) formalOrdersLi.style.display = display;

    // Update discount banners
    this._updateDiscountBanners(user);
  },

  _updateDiscountBanners(user) {
    // Sport ticker banner
    const ticker = document.getElementById('p4');
    if (ticker) {
      if (user) {
        ticker.textContent = `✦ 10% MEMBER DISCOUNT ACTIVE — Welcome back, ${user.firstName}! ✦`;
      }
    }

    // Formal discount bar
    const formalBar = document.getElementById('f-discount-bar');
    if (formalBar) {
      if (user) {
        formalBar.textContent = `✦ 10% member discount active — Welcome back, ${user.firstName}. ✦`;
        formalBar.classList.add('f-discount-bar-active');
      } else {
        formalBar.textContent = '✦ Sign in for 10% off every order ✦';
        formalBar.classList.remove('f-discount-bar-active');
      }
    }
  },
};

// ─── Discount integration: patch cart price display ──────────────────────────
function getDisplayPrice(basePrice) {
  return Auth.applyDiscount(basePrice);
}

function getDisplayTotal(baseTotal) {
  return Auth.applyDiscountToTotal(baseTotal);
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => AuthModal.init());
