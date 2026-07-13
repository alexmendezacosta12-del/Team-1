// ─── Order Confirmation Email — Clerks UK Formal ─────────────────────────────
//
// RECOMMENDED SERVICE: EmailJS (https://www.emailjs.com)
//
// Why EmailJS?
//   • Works entirely from the browser — no Node.js / backend server needed.
//   • Free tier: 200 emails/month — ideal for a small e-commerce site.
//   • Supports Gmail, Outlook, SMTP — plug in your own sender address.
//   • Simple SDK: one <script> tag + one function call.
//   • No API key exposed in a meaningful way (public key only; send quota is
//     server-enforced by EmailJS, not the key itself).
//
// Setup steps (do once in the EmailJS dashboard):
//   1. Create a free account at https://www.emailjs.com
//   2. Add a service (e.g. Gmail).  Note the Service ID.
//   3. Create an email template.   Note the Template ID.
//   4. Copy your Public Key from Account → API Keys.
//   5. Fill in EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY below.
//
// Email template variables used (match these names in your EmailJS template):
//   {{to_email}}         — customer email address
//   {{customer_name}}    — customer full name
//   {{order_number}}     — generated order reference
//   {{order_items_html}} — plain-text list of purchased items
//   {{total_price}}      — formatted total (e.g. £149.00)
//   {{delivery_message}} — estimated delivery text
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // ── EmailJS configuration — replace with your own credentials ────────────
  const EMAILJS_PUBLIC_KEY   = 'YOUR_PUBLIC_KEY';      // from EmailJS dashboard
  const EMAILJS_SERVICE_ID   = 'YOUR_SERVICE_ID';      // e.g. 'service_abc123'
  const EMAILJS_TEMPLATE_ID  = 'YOUR_TEMPLATE_ID';     // e.g. 'template_xyz789'

  // ── Generate a human-readable order number ───────────────────────────────
  function generateOrderNumber() {
    const ts     = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return 'CK-' + ts + '-' + random;
  }

  // ── Format a list of cart items as a plain-text summary ──────────────────
  function formatOrderItems(items, isLoggedIn) {
    return items.map(function (item) {
      const unitPrice = isLoggedIn
        ? (typeof getDisplayTotal === 'function' ? getDisplayTotal(item.price) : item.price)
        : item.price;
      const lineTotal = (unitPrice * item.quantity).toFixed(2);
      return item.name +
             ' (UK ' + item.size + ')' +
             ' × ' + item.quantity +
             ' — £' + lineTotal;
    }).join('\n');
  }

  // ── Send the confirmation email via EmailJS ───────────────────────────────
  function sendConfirmationEmail(params) {
    // Guard: EmailJS SDK must be loaded
    if (typeof emailjs === 'undefined') {
      console.warn('Clerks Email: EmailJS SDK not loaded — skipping email send.');
      return;
    }

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY)
      .then(function () {
        console.info('Clerks Email: confirmation sent to', params.to_email);
      })
      .catch(function (err) {
        // Email sending failure is non-fatal — order is already placed
        console.error('Clerks Email: failed to send confirmation.', err);
      });
  }

  // ── Main entry-point: called after a successful order placement ───────────
  // Exported on window so formal-shop.js / formal-cart.html can call it.
  window.sendOrderConfirmationEmail = function (orderData) {
    /*
     * orderData shape:
     *   {
     *     firstName : string,
     *     lastName  : string,
     *     email     : string,
     *     items     : FormalCart.items[],
     *     total     : number,
     *     isLoggedIn: boolean,
     *   }
     */
    try {
      if (!orderData || !orderData.email) {
        console.warn('Clerks Email: no email address provided.');
        return;
      }

      const orderNumber      = generateOrderNumber();
      const customerName     = (orderData.firstName + ' ' + orderData.lastName).trim();
      const orderItemsText   = formatOrderItems(orderData.items, orderData.isLoggedIn);
      const totalFormatted   = '£' + Number(orderData.total).toFixed(2);
      const deliveryMessage  = 'Your order will be dispatched within 1–2 business days. ' +
                               'Estimated UK delivery: 3–5 working days.';

      // Persist the order number for the confirmation modal (optional UI use)
      window._lastOrderNumber = orderNumber;

      // Build template parameters matching the EmailJS template variables
      const templateParams = {
        to_email:          orderData.email,
        customer_name:     customerName,
        order_number:      orderNumber,
        order_items_html:  orderItemsText,
        total_price:       totalFormatted,
        delivery_message:  deliveryMessage,
      };

      sendConfirmationEmail(templateParams);

    } catch (err) {
      // Never let email logic crash the checkout flow
      console.error('Clerks Email: unexpected error.', err);
    }
  };

})();
