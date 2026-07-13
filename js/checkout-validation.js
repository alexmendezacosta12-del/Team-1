// ─── Unified Checkout Validation — Clerks UK (Sport & Formal) ────────────────
// Validates all checkout form fields before the order is placed.
// Works with both the Sport form (IDs prefixed 's-') and the
// Formal form (IDs prefixed 'f-').
// Displays inline error messages next to each invalid field.
// Does NOT change the page layout or alter existing checkout logic.

(function () {
  'use strict';

  // ── UK postcode regex ────────────────────────────────────────────────────────
  const UK_POSTCODE_RE = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-BD-HJLNP-UW-Z]{2}$/i;

  // ── Card number: 13–19 digits, spaces allowed ────────────────────────────────
  const CARD_NUMBER_RE = /^[\d\s]{13,19}$/;

  // ── Expiry: MM/YY ────────────────────────────────────────────────────────────
  const EXPIRY_RE = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;

  // ── CVV: 3 or 4 digits ───────────────────────────────────────────────────────
  const CVV_RE = /^[0-9]{3,4}$/;

  // ── Email ─────────────────────────────────────────────────────────────────────
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ── UK phone (optional unless required flag set) ─────────────────────────────
  const PHONE_RE = /^(\+44\s?|0)[0-9\s\-\(\)]{9,14}$/;

  // ── Name characters (letters, spaces, hyphens, apostrophes) ─────────────────
  const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ '\-]{2,50}$/;

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  // Find an error span in a form group, or create one if missing
  function getOrCreateErrorEl(inputEl) {
    if (!inputEl) return null;
    let err = inputEl.parentElement.querySelector('.cv-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'cv-error';
      inputEl.insertAdjacentElement('afterend', err);
    }
    return err;
  }

  function setError(inputEl, message) {
    if (!inputEl) return;
    inputEl.style.borderColor = '#e53e3e';
    inputEl.style.boxShadow   = '0 0 0 2px rgba(229,62,62,0.15)';
    const err = getOrCreateErrorEl(inputEl);
    if (err) { err.textContent = message; err.style.display = 'block'; }
  }

  function clearError(inputEl) {
    if (!inputEl) return;
    inputEl.style.borderColor = '';
    inputEl.style.boxShadow   = '';
    const err = inputEl.parentElement && inputEl.parentElement.querySelector('.cv-error');
    if (err) { err.textContent = ''; err.style.display = 'none'; }
    // Also clear legacy formal error spans
    const fErr = inputEl.parentElement && inputEl.parentElement.querySelector('.f-validation-error');
    if (fErr) { fErr.textContent = ''; fErr.style.display = 'none'; }
  }

  function val(el) {
    return el ? el.value.trim() : '';
  }

  function hasValue(el) {
    return el && el.value.trim().length > 0;
  }

  // Validate expiry not in the past
  function isExpiryValid(str) {
    if (!EXPIRY_RE.test(str)) return false;
    const [m, y] = str.split('/');
    const expiry = new Date(2000 + parseInt(y, 10), parseInt(m, 10) - 1, 1);
    const now    = new Date();
    return expiry >= new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // ─── Core validation runner ───────────────────────────────────────────────────
  // prefix: 'f-' for formal, 's-' for sport
  function runValidation(prefix) {
    let ok = true;

    const g = id => document.getElementById(prefix + id);

    const firstName  = g('first-name');
    const lastName   = g('last-name');
    const email      = g('email');
    const phone      = g('phone');
    const address    = g('address');
    const city       = g('city');
    const county     = g('county');       // optional field — validate if present
    const postcode   = g('postcode');
    const cardHolder = g('card-holder');  // cardholder name
    const card       = g('card');
    const expiry     = g('expiry');
    const cvv        = g('cvv');

    // First Name
    if (!hasValue(firstName) || !NAME_RE.test(val(firstName))) {
      setError(firstName, 'Please enter a valid first name (letters only, 2–50 chars).');
      ok = false;
    } else { clearError(firstName); }

    // Last Name
    if (!hasValue(lastName) || !NAME_RE.test(val(lastName))) {
      setError(lastName, 'Please enter a valid last name (letters only, 2–50 chars).');
      ok = false;
    } else { clearError(lastName); }

    // Email
    if (!hasValue(email) || !EMAIL_RE.test(val(email))) {
      setError(email, 'Please enter a valid email address.');
      ok = false;
    } else { clearError(email); }

    // Phone — required, not just optional
    if (!hasValue(phone)) {
      setError(phone, 'Phone number is required.');
      ok = false;
    } else if (!PHONE_RE.test(val(phone))) {
      setError(phone, 'Please enter a valid UK phone number.');
      ok = false;
    } else { clearError(phone); }

    // Address
    if (!hasValue(address) || val(address).length < 5) {
      setError(address, 'Please enter your full delivery address.');
      ok = false;
    } else { clearError(address); }

    // City
    if (!hasValue(city) || val(city).length < 2) {
      setError(city, 'Please enter your town or city.');
      ok = false;
    } else { clearError(city); }

    // County — optional but validate if present and non-empty
    if (county && hasValue(county) && val(county).length < 2) {
      setError(county, 'County must be at least 2 characters.');
      ok = false;
    } else if (county) { clearError(county); }

    // Postcode
    if (!hasValue(postcode) || !UK_POSTCODE_RE.test(val(postcode))) {
      setError(postcode, 'Please enter a valid UK postcode (e.g. SW1A 1AA).');
      ok = false;
    } else { clearError(postcode); }

    // Cardholder Name — validate if field exists
    if (cardHolder) {
      if (!hasValue(cardHolder) || !NAME_RE.test(val(cardHolder))) {
        setError(cardHolder, 'Please enter the name as it appears on your card.');
        ok = false;
      } else { clearError(cardHolder); }
    }

    // Card Number
    const cardDigits = card ? card.value.replace(/\s/g, '') : '';
    if (!hasValue(card) || !CARD_NUMBER_RE.test(card.value) || cardDigits.length < 13) {
      setError(card, 'Please enter a valid card number (13–19 digits).');
      ok = false;
    } else { clearError(card); }

    // Expiry
    if (!hasValue(expiry) || !isExpiryValid(val(expiry))) {
      setError(expiry, 'Please enter a valid expiry date (MM/YY) that has not expired.');
      ok = false;
    } else { clearError(expiry); }

    // CVV
    if (!hasValue(cvv) || !CVV_RE.test(val(cvv))) {
      setError(cvv, 'CVV must be 3 or 4 digits.');
      ok = false;
    } else { clearError(cvv); }

    // Delivery option — a radio group with name 'delivery' or 'f-delivery'
    const deliveryInput = document.querySelector(`input[name="${prefix.replace('-','')}delivery"]:checked`)
                       || document.querySelector('input[name="delivery"]:checked');
    if (!deliveryInput) {
      // Show error next to the delivery section
      const deliverySection = document.getElementById(`${prefix}delivery-section`)
                           || document.querySelector('.cv-delivery-section');
      if (deliverySection) {
        let err = deliverySection.querySelector('.cv-error');
        if (!err) {
          err = document.createElement('p');
          err.className = 'cv-error';
          deliverySection.appendChild(err);
        }
        err.textContent = 'Please select a delivery method.';
        err.style.display = 'block';
      }
      ok = false;
    } else {
      const deliverySection = document.getElementById(`${prefix}delivery-section`)
                           || document.querySelector('.cv-delivery-section');
      if (deliverySection) {
        const err = deliverySection.querySelector('.cv-error');
        if (err) { err.textContent = ''; err.style.display = 'none'; }
      }
    }

    return ok;
  }

  // ─── Auto-formatting ─────────────────────────────────────────────────────────

  function setupFormatting(prefix) {
    // Card number: spaces every 4 digits
    const card = document.getElementById(prefix + 'card');
    if (card) {
      card.addEventListener('input', function () {
        const digits = this.value.replace(/\D/g, '').substring(0, 16);
        this.value = digits.replace(/(.{4})/g, '$1 ').trim();
      });
    }

    // Expiry: auto-insert slash
    const expiry = document.getElementById(prefix + 'expiry');
    if (expiry) {
      expiry.addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
        this.value = v;
      });
    }

    // CVV: digits only
    const cvv = document.getElementById(prefix + 'cvv');
    if (cvv) {
      cvv.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').substring(0, 4);
      });
    }
  }

  // ─── Live error clearing on input ────────────────────────────────────────────

  function setupLiveClear(prefix) {
    const ids = [
      'first-name','last-name','email','phone','address',
      'city','county','postcode','card-holder','card','expiry','cvv'
    ];
    ids.forEach(function (id) {
      const el = document.getElementById(prefix + id);
      if (el) el.addEventListener('input', function () { clearError(this); });
    });

    // Delivery radios — clear error on selection
    document.querySelectorAll(`input[name="${prefix.replace('-','')}delivery"], input[name="delivery"]`).forEach(radio => {
      radio.addEventListener('change', function () {
        const section = document.getElementById(`${prefix}delivery-section`)
                     || document.querySelector('.cv-delivery-section');
        if (section) {
          const err = section.querySelector('.cv-error');
          if (err) { err.textContent = ''; err.style.display = 'none'; }
        }
      });
    });
  }

  // ─── Delivery total update ────────────────────────────────────────────────────
  // Called by each radio's change listener to recalculate the displayed total.
  // The function looks for elements with IDs like #cs-total / #fcs-total and
  // a data attribute on the form holding the basket subtotal.

  function setupDeliveryTotalUpdate(prefix) {
    const radios = document.querySelectorAll(`input[name="${prefix.replace('-','')}delivery"], input[name="delivery"]`);
    radios.forEach(radio => {
      radio.addEventListener('change', function () {
        updateTotalWithDelivery(prefix);
      });
    });
  }

  function updateTotalWithDelivery(prefix) {
    const deliveryInput = document.querySelector(`input[name="${prefix.replace('-','')}delivery"]:checked`)
                       || document.querySelector('input[name="delivery"]:checked');
    if (!deliveryInput) return;

    const deliveryCost = parseFloat(deliveryInput.dataset.cost || '0');

    // Try to read basket subtotal from a data attribute on the checkout form
    const form = document.getElementById(prefix + 'checkout-form')
              || document.getElementById('checkout-form')
              || document.getElementById('f-checkout-form');
    if (!form) return;

    const subtotal = parseFloat(form.dataset.subtotal || '0');
    const newTotal = (subtotal + deliveryCost).toFixed(2);

    // The total/delivery rows live inside the modal content (sibling of the form),
    // so search the closest .modal or .modal-content ancestor, then fall back to document.
    const searchRoot = form.closest('.modal-content, .modal, .checkout-modal-content') || document;

    // Update summary total inside the checkout modal
    const totalEl = searchRoot.querySelector('.cv-checkout-grand-total');
    if (totalEl) totalEl.textContent = `£${newTotal}`;

    // Also update the delivery cost line
    const deliveryLineEl = searchRoot.querySelector('.cv-checkout-delivery-cost');
    if (deliveryLineEl) deliveryLineEl.textContent = deliveryCost > 0 ? `£${deliveryCost.toFixed(2)}` : 'Free';
  }

  // ─── Attach validation to submit events ──────────────────────────────────────

  function initValidation() {
    document.addEventListener('submit', function (e) {
      const formId = e.target.id;

      // Formal checkout form
      if (formId === 'f-checkout-form') {
        if (!runValidation('f-')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          scrollToFirstError(e.target);
          return false;
        }
      }

      // Sport checkout form
      if (formId === 'checkout-form') {
        if (!runValidation('s-')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          scrollToFirstError(e.target);
          return false;
        }
      }
    }, true); // capture phase — runs before existing handlers
  }

  function scrollToFirstError(form) {
    // Search the modal container first (delivery errors live outside the <form>),
    // then fall back to the form itself.
    const root = form.closest('.modal-content, .modal, .checkout-modal-content') || form;
    const firstErr = root.querySelector('.cv-error:not(:empty), .f-validation-error:not(:empty)');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    // Formal pages
    if (document.getElementById('f-checkout-form') ||
        document.getElementById('f-first-name')) {
      setupFormatting('f-');
      setupLiveClear('f-');
      setupDeliveryTotalUpdate('f-');
    }

    // Sport pages
    if (document.getElementById('checkout-form') ||
        document.getElementById('s-first-name')) {
      setupFormatting('s-');
      setupLiveClear('s-');
      setupDeliveryTotalUpdate('s-');
    }

    initValidation();
  });

})();
