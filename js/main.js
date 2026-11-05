// DEMO CONFIG: replace with your real Meta Pixel ID before publishing.
const META_PIXEL_ID = 'YOUR_META_PIXEL_ID';
const PRODUCT_PRICE = 699;
let quantity = 1;

// dataLayer-compatible event helper for GTM / GA4.
window.dataLayer = window.dataLayer || [];
function trackEvent(eventName, params = {}) {
  const payload = { event: eventName, ...params };
  window.dataLayer.push(payload);
  console.info('[demo analytics]', payload);
}

// Meta Pixel events are prepared here. Add the official Meta Pixel base code
// with your real Pixel ID before enabling real tracking in production.
function trackMeta(eventName, params = {}) {
  if (typeof window.fbq === 'function' && META_PIXEL_ID !== 'YOUR_META_PIXEL_ID') {
    window.fbq('track', eventName, params);
  } else {
    console.info('[demo Meta Pixel]', eventName, params, '(Pixel ID not configured)');
  }
}

trackEvent('page_view', { page_type: 'product_landing', product_name: 'BlendGo Portable Blender' });
trackMeta('PageView');

const quantityOutput = document.getElementById('quantity');
const totalOutput = document.getElementById('total');
function updateTotal() {
  quantityOutput.textContent = String(quantity);
  totalOutput.textContent = (PRODUCT_PRICE * quantity).toLocaleString('uk-UA') + ' ₴';
}
document.getElementById('minus').addEventListener('click', () => { quantity = Math.max(1, quantity - 1); updateTotal(); });
document.getElementById('plus').addEventListener('click', () => { quantity = Math.min(10, quantity + 1); updateTotal(); });

const phoneInput = document.getElementById('customerPhone');
phoneInput.addEventListener('input', () => {
  phoneInput.value = phoneInput.value.replace(/[^\d+\s()-]/g, '').slice(0, 19);
  phoneInput.classList.remove('invalid');
  document.getElementById('phoneError').textContent = '';
});

// Track CTA clicks as a separate funnel step.
document.querySelectorAll('a[href="#order"]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('cta_click', { cta_text: link.textContent.trim() });
    trackMeta('InitiateCheckout', { content_name: 'BlendGo Portable Blender', value: PRODUCT_PRICE, currency: 'UAH' });
  });
});

const form = document.getElementById('orderForm');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('customerName');
  const phone = phoneInput;
  const nameError = document.getElementById('nameError');
  const phoneError = document.getElementById('phoneError');
  const success = document.getElementById('successMessage');
  nameError.textContent = '';
  phoneError.textContent = '';
  name.classList.remove('invalid');
  phone.classList.remove('invalid');
  let valid = true;
  if (name.value.trim().length < 2) {
    nameError.textContent = 'Вкажи ім’я (не менше 2 символів).';
    name.classList.add('invalid');
    valid = false;
  }
  const digits = phone.value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) {
    phoneError.textContent = 'Перевір номер телефону.';
    phone.classList.add('invalid');
    valid = false;
  }
  if (!valid) return;

  const order = {
    name: name.value.trim(),
    phone: phone.value.trim(),
    city: document.getElementById('city').value.trim(),
    delivery: document.getElementById('delivery').value,
    product: 'BlendGo Portable Blender',
    quantity,
    total: PRODUCT_PRICE * quantity,
    currency: 'UAH'
  };

  // DEMO ONLY: this simulates a CRM handoff. Connect your backend/API here
  // (for example, a secure server endpoint or CRM webhook). Never expose secrets in frontend code.
  console.info('[demo CRM handoff — not sent]', order);
  trackEvent('generate_lead', { value: order.total, currency: order.currency, product_name: order.product, quantity: order.quantity });
  trackMeta('Lead', { content_name: order.product, value: order.total, currency: order.currency });
  success.style.display = 'block';
  success.textContent = 'Дякуємо, ' + order.name + '! Демонстраційну заявку сформовано. Для реального приймання замовлень підключи CRM або серверний API.';
  form.querySelector('button[type="submit"]').textContent = 'Заявку сформовано ✓';
  form.querySelector('button[type="submit"]').disabled = true;
});
