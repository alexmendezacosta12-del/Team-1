// ─── Contact Form Backend — Clerks UK Formal ─────────────────────────────────
// Handles client-side validation, sanitization, localStorage persistence,
// duplicate-submission prevention, and success / error feedback.
// No design changes are made — all existing markup is left intact.

(function () {
  'use strict';

  // ── Storage key for submitted contact messages ────────────────────────────
  const STORAGE_KEY = 'clerks_contact_submissions';

  // ── Sanitize a string to prevent XSS: strips HTML tags & trims whitespace ─
  function sanitize(str) {
    if (typeof str !== 'string') return '';
    // Remove HTML tags, then trim surrounding whitespace
    return str.replace(/<[^>]*>/g, '').trim();
  }

  // ── Validate an email address format ──────────────────────────────────────
  function isValidEmail(email) {
    // Standard RFC-5322-inspired regex sufficient for UI validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ── Load all stored submissions from localStorage ─────────────────────────
  function loadSubmissions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // ── Persist a new submission entry to localStorage ────────────────────────
  function saveSubmission(entry) {
    const list = loadSubmissions();
    list.push(entry);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // localStorage quota exceeded — non-fatal; submission still shown as OK
      console.warn('Clerks Contact: could not persist submission.', e);
    }
  }

  // ── Show an inline error message next to a field ──────────────────────────
  function showFieldError(input, message) {
    // Re-use an existing error element or create one
    let errEl = input.parentElement.querySelector('.f-field-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'f-field-error';
      // Insert after the input element
      input.insertAdjacentElement('afterend', errEl);
    }
    errEl.textContent = message;
    errEl.style.display = 'block';
    input.style.borderColor = '#C0392B';
  }

  // ── Clear an inline error message ─────────────────────────────────────────
  function clearFieldError(input) {
    const errEl = input.parentElement.querySelector('.f-field-error');
    if (errEl) {
      errEl.textContent = '';
      errEl.style.display = 'none';
    }
    input.style.borderColor = '';
  }

  // ── Show a global form feedback banner ────────────────────────────────────
  function showFormBanner(form, type, message) {
    let banner = form.querySelector('.f-form-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'f-form-banner';
      // Insert before the button row
      const btnRow = form.querySelector('.f-contact-buttons');
      form.insertBefore(banner, btnRow);
    }
    banner.className = 'f-form-banner f-form-banner--' + type;
    banner.textContent = message;
    banner.style.display = 'block';
    // Auto-hide success banner after 6 seconds
    if (type === 'success') {
      setTimeout(() => { banner.style.display = 'none'; }, 6000);
    }
  }

  // ── Validate all fields; returns true if valid ────────────────────────────
  function validateForm(fields) {
    let valid = true;

    // First name
    if (!fields.fname || fields.fname.length < 2) {
      showFieldError(fields.fnameEl, 'Please enter a first name (min 2 characters).');
      valid = false;
    } else { clearFieldError(fields.fnameEl); }

    // Last name
    if (!fields.lname || fields.lname.length < 2) {
      showFieldError(fields.lnameEl, 'Please enter a last name (min 2 characters).');
      valid = false;
    } else { clearFieldError(fields.lnameEl); }

    // Email
    if (!fields.email || !isValidEmail(fields.email)) {
      showFieldError(fields.emailEl, 'Please enter a valid email address.');
      valid = false;
    } else { clearFieldError(fields.emailEl); }

    // Message
    if (!fields.message || fields.message.length < 10) {
      showFieldError(fields.messageEl, 'Please enter a message (min 10 characters).');
      valid = false;
    } else { clearFieldError(fields.messageEl); }

    return valid;
  }

  // ── Wire up the contact form ───────────────────────────────────────────────
  function initContactForm() {
    const form = document.querySelector('.f-contact-form');
    if (!form) return; // Not on the contact page

    const submitBtn = form.querySelector('.f-contact-submit');

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // Always prevent native submit

      // Collect raw values
      const fnameEl   = document.getElementById('fc-fname');
      const lnameEl   = document.getElementById('fc-lname');
      const emailEl   = document.getElementById('fc-email');
      const subjectEl = document.getElementById('fc-subject');
      const messageEl = document.getElementById('fc-message');

      // Sanitize inputs to neutralise XSS payloads before any processing
      const fields = {
        fname:     sanitize(fnameEl.value),
        lname:     sanitize(lnameEl.value),
        email:     sanitize(emailEl.value),
        subject:   subjectEl ? sanitize(subjectEl.value) : '',
        message:   sanitize(messageEl.value),
        fnameEl,
        lnameEl,
        emailEl,
        messageEl,
      };

      // Validate — abort if any field is invalid
      if (!validateForm(fields)) return;

      // Prevent duplicate submission: disable the button immediately
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      // Simulate async storage (replace with a real fetch() to your backend)
      setTimeout(function () {
        try {
          // Build the submission record
          const entry = {
            id:          Date.now(), // unique identifier
            firstName:   fields.fname,
            lastName:    fields.lname,
            email:       fields.email,
            subject:     fields.subject,
            message:     fields.message,
            submittedAt: new Date().toISOString(),
          };

          // Persist to localStorage (swap this for a POST to your API)
          saveSubmission(entry);

          // Show success feedback
          showFormBanner(form, 'success', '✓ Message received! We\'ll get back to you within 1–2 business days.');

          // Reset the form fields
          form.reset();

        } catch (err) {
          // Handle unexpected errors gracefully
          showFormBanner(form, 'error', '✗ Something went wrong. Please try again or email us directly.');
          console.error('Clerks Contact: submission error', err);
        } finally {
          // Re-enable button so user can resubmit if needed
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      }, 600); // 600ms simulates a network round-trip
    });

    // Clear field errors on user input (live feedback)
    ['fc-fname', 'fc-lname', 'fc-email', 'fc-subject', 'fc-message'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () { clearFieldError(this); });
      }
    });
  }

  // Initialise when the DOM is ready
  document.addEventListener('DOMContentLoaded', initContactForm);
})();
