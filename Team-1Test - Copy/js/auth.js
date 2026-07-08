// ─── Clerks Auth & Discount System ───────────────────────────────────────────
// Client-side authentication with localStorage persistence.
// Provides a 10% discount to signed-in users, applied at checkout.

const DISCOUNT_RATE = 0.10; // 10%
const STORAGE_KEY   = 'clerks_user';

// ─── Mock user database (replace with real API calls) ─────────────────────────
// In production this would be server-side. For now accounts are stored in
// localStorage so the feature works end-to-end in the browser.
function _getUserDb() {
  const raw = localStorage.getItem('clerks_user_db');
  return raw ? JSON.parse(raw) : {};
}
function _saveUserDb(db) {
  localStorage.setItem('clerks_user_db', JSON.stringify(db));
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

const Auth = {
  // Register a new account
  register(firstName, lastName, email, password) {
    const db = _getUserDb();
    if (db[email.toLowerCase()]) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    db[email.toLowerCase()] = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      // In production: bcrypt hash. Here we store a simple hash for demo.
      passwordHash: btoa(password),
      createdAt: new Date().toISOString(),
    };
    _saveUserDb(db);
    this._setSession({ firstName, lastName, email: email.toLowerCase() });
    return { ok: true };
  },

  // Sign in
  login(email, password) {
    const db = _getUserDb();
    const user = db[email.toLowerCase()];
    if (!user) {
      return { ok: false, error: 'No account found with that email.' };
    }
    if (user.passwordHash !== btoa(password)) {
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
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
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
  },

  _clearErrors() {
    document.querySelectorAll('.auth-error').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
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
              <input type="password" id="auth-reg-password" placeholder="Min. 6 characters" required minlength="6" autocomplete="new-password" />
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
      if (switchBtn) this._switchTab(switchBtn.dataset.target);
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

    // Header sign-in button / user menu
    document.addEventListener('click', (e) => {
      if (e.target.closest('#auth-signin-btn')) this.open('login');
      if (e.target.closest('#auth-signout-btn')) {
        Auth.logout();
        // Reload so discounts are recalculated
        window.location.reload();
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
    const email    = document.getElementById('auth-login-email').value.trim();
    const password = document.getElementById('auth-login-password').value;
    const errorEl  = document.getElementById('auth-login-error');

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
    const firstName = document.getElementById('auth-reg-fname').value.trim();
    const lastName  = document.getElementById('auth-reg-lname').value.trim();
    const email     = document.getElementById('auth-reg-email').value.trim();
    const password  = document.getElementById('auth-reg-password').value;
    const errorEl   = document.getElementById('auth-register-error');

    if (!firstName || !lastName) {
      errorEl.textContent = 'Please enter your full name.';
      errorEl.style.display = 'block';
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters.';
      errorEl.style.display = 'block';
      return;
    }

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
      // else keep original text
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
// Called by shop.js / formal-shop.js to get the displayed price for a product.
function getDisplayPrice(basePrice) {
  return Auth.applyDiscount(basePrice);
}

function getDisplayTotal(baseTotal) {
  return Auth.applyDiscountToTotal(baseTotal);
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => AuthModal.init());
