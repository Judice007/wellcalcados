// Carrinho simples (sem checkout online ainda): guarda itens no localStorage,
// aplica as regras de promoção do mês (combo Air Force + cupom Importados) e
// fecha o pedido consolidado pelo WhatsApp. window.WellCart é a API pública.
(function () {
  const STORAGE_KEY = 'well_cart_v1';
  const WHATSAPP_NUMBER = '5524999485839';

  const COMBOS = [
    { id: 'af1-2x400', label: 'Combo 2 pares Air Force', match: item => /air force|\baf1\b/i.test(item.name) && !item.orderOnly && item.price === 250, size: 2, bundlePrice: 400 }
  ];
  const COUPONS = {
    WELLO9SET: { label: 'WELLO9SET', discount: 50, appliesTo: item => item.category === 'Importados' }
  };

  function readCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (_) { return []; }
  }
  function writeCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    notify();
  }

  const listeners = [];
  function notify() { listeners.forEach(fn => { try { fn(readCart()); } catch (_) {} }); }
  window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) notify(); });

  function keyFor(name, size) { return `${name}__${size || 'unico'}`; }

  function addItem({ name, brand, size, price, image, category, orderOnly }) {
    const items = readCart();
    const key = keyFor(name, size);
    const existing = items.find(item => item.key === key);
    if (existing) existing.qty += 1;
    else items.push({ key, name, brand, size: size || '', price: price ?? null, image, category: category || '', orderOnly: Boolean(orderOnly), qty: 1 });
    writeCart(items);
  }
  function removeItem(key) { writeCart(readCart().filter(item => item.key !== key)); }
  function setQty(key, qty) {
    const items = readCart();
    const item = items.find(entry => entry.key === key);
    if (!item) return;
    if (qty <= 0) return removeItem(key);
    item.qty = qty;
    writeCart(items);
  }
  function clear() { writeCart([]); }
  function getItems() { return readCart(); }
  function getCount() { return readCart().reduce((sum, item) => sum + item.qty, 0); }

  function computeTotals(couponCode) {
    const items = readCart();
    const coupon = couponCode && COUPONS[couponCode.trim().toUpperCase()];
    let subtotal = 0;
    let comboSavings = 0;
    let couponSavings = 0;
    const notes = [];

    COMBOS.forEach(combo => {
      const eligible = [];
      items.forEach(item => { if (combo.match(item)) for (let i = 0; i < item.qty; i++) eligible.push(item.price); });
      eligible.forEach(price => { subtotal += price; });
      const bundles = Math.floor(eligible.length / combo.size);
      if (bundles > 0) {
        const fullPrice = combo.size * eligible[0];
        const savingsPerBundle = fullPrice - combo.bundlePrice;
        comboSavings += bundles * savingsPerBundle;
        notes.push(`${combo.label}: ${bundles}x (economia de R$${bundles * savingsPerBundle})`);
      }
    });

    items.forEach(item => {
      const inCombo = COMBOS.some(combo => combo.match(item));
      if (inCombo) return;
      if (item.price != null) subtotal += item.price * item.qty;
    });

    if (coupon) {
      items.forEach(item => { if (coupon.appliesTo(item)) couponSavings += coupon.discount * item.qty; });
      if (couponSavings > 0) notes.push(`Cupom ${coupon.label}: -R$${couponSavings}`);
    }

    const hasConsult = items.some(item => item.price == null);
    const total = Math.max(0, subtotal - comboSavings - couponSavings);
    return { subtotal, comboSavings, couponSavings, total, notes, hasConsult, couponValid: Boolean(coupon), couponApplied: Boolean(coupon) && couponSavings > 0 };
  }

  function buildWhatsAppMessage(couponCode) {
    const items = readCart();
    const totals = computeTotals(couponCode);
    const lines = items.map((item, index) => {
      const sizeText = item.size ? `tam. ${item.size}` : 'consultar numeração';
      const priceText = item.price != null ? `R$${item.price} un.` : 'sob encomenda, consultar valor';
      return `${index + 1}. ${item.name} — ${sizeText} — x${item.qty} — ${priceText}`;
    });
    let msg = `Olá! Fechei este carrinho no site da WellCalçados:\n\n${lines.join('\n')}`;
    if (totals.notes.length) msg += `\n\n${totals.notes.join('\n')}`;
    if (!totals.hasConsult || totals.subtotal > 0) msg += `\n\nTotal estimado: R$${totals.total}`;
    msg += '\n\nPode confirmar disponibilidade e forma de pagamento?';
    return msg;
  }

  function checkout(couponCode) {
    const message = buildWhatsAppMessage(couponCode);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    if (window.wellTrack) window.wellTrack('InitiateCheckout', { content_name: 'carrinho', value: computeTotals(couponCode).total, currency: 'BRL' });
    clear();
  }

  window.WellCart = { addItem, removeItem, setQty, clear, getItems, getCount, computeTotals, checkout, onChange: fn => listeners.push(fn) };

  // ---- UI: botão flutuante + gaveta ----
  function injectUI() {
    const style = document.createElement('style');
    style.textContent = `
      .well-cart-btn{position:fixed;left:24px;bottom:24px;z-index:30;width:52px;height:52px;border:0;border-radius:50%;background:#5B2E93;color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 14px 34px rgba(91,46,147,.32)}
      .well-cart-btn svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8}
      .well-cart-badge{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:#FF6F61;color:#fff;font:700 11px Inter,sans-serif;display:grid;place-items:center}
      .well-cart-overlay{position:fixed;inset:0;z-index:39;background:rgba(8,20,41,.5);backdrop-filter:blur(3px)}
      .well-cart-drawer{position:fixed;top:0;right:0;bottom:0;z-index:40;width:min(400px,100%);background:#fff;box-shadow:-20px 0 60px rgba(8,20,41,.25);display:flex;flex-direction:column;font-family:Inter,sans-serif;color:#081429}
      .well-cart-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid rgba(8,20,41,.1)}
      .well-cart-head h2{font-size:16px;font-weight:800}
      .well-cart-close{width:34px;height:34px;border:0;border-radius:50%;background:#F3F0FA;font-size:18px;cursor:pointer}
      .well-cart-items{flex:1;overflow-y:auto;padding:12px 20px}
      .well-cart-empty{padding:40px 0;text-align:center;color:#667085;font-size:13px}
      .well-cart-item{display:grid;grid-template-columns:52px 1fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(8,20,41,.08)}
      .well-cart-item img{width:52px;height:52px;object-fit:cover;border-radius:10px;background:#F3F0FA}
      .well-cart-item-name{font-size:12.5px;font-weight:700;line-height:1.3}
      .well-cart-item-meta{font-size:11px;color:#667085;margin-top:2px}
      .well-cart-qty{display:flex;align-items:center;gap:6px}
      .well-cart-qty button{width:22px;height:22px;border:1px solid rgba(8,20,41,.15);border-radius:50%;background:#fff;cursor:pointer;font-size:13px;line-height:1}
      .well-cart-remove{grid-column:1/-1;text-align:right;background:none;border:0;color:#A32D2D;font-size:11px;cursor:pointer;padding-top:4px}
      .well-cart-coupon{display:flex;gap:8px;padding:12px 20px 0}
      .well-cart-coupon input{flex:1;height:38px;border:1px solid rgba(8,20,41,.15);border-radius:10px;padding:0 12px;font-size:12px}
      .well-cart-coupon button{height:38px;padding:0 14px;border:0;border-radius:10px;background:#081429;color:#fff;font-size:12px;font-weight:700;cursor:pointer}
      .well-cart-coupon-msg{padding:6px 20px 0;font-size:11px}
      .well-cart-summary{padding:14px 20px;font-size:12px;color:#667085}
      .well-cart-summary .row{display:flex;justify-content:space-between;margin-bottom:4px}
      .well-cart-summary .total{font-size:16px;font-weight:800;color:#081429;margin-top:6px}
      .well-cart-pay{margin:0 20px 8px;height:46px;border:1px solid #5B2E93;border-radius:999px;background:#fff;color:#5B2E93;font-weight:800;font-size:12.5px;cursor:pointer}
      .well-cart-checkout{margin:0 20px 20px;height:50px;border:0;border-radius:999px;background:#5B2E93;color:#fff;font-weight:800;font-size:13px;cursor:pointer}
      .well-cart-checkout:disabled,.well-cart-pay:disabled{opacity:.5;cursor:not-allowed}
      @media(max-width:480px){.well-cart-drawer{width:100%}}
      .well-cart-drawer[hidden],.well-cart-overlay[hidden]{display:none}
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.className = 'well-cart-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Ver carrinho');
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 6h2l2.4 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L22 9H7"/><circle cx="10" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/></svg><span class="well-cart-badge" hidden></span>';
    document.body.appendChild(btn);

    const overlay = document.createElement('div');
    overlay.className = 'well-cart-overlay';
    overlay.hidden = true;
    document.body.appendChild(overlay);

    const drawer = document.createElement('aside');
    drawer.className = 'well-cart-drawer';
    drawer.hidden = true;
    drawer.innerHTML = `
      <div class="well-cart-head"><h2>Seu carrinho</h2><button class="well-cart-close" type="button" aria-label="Fechar carrinho">×</button></div>
      <div class="well-cart-items"></div>
      <div class="well-cart-coupon"><input type="text" placeholder="Cupom de desconto" maxlength="20"><button type="button">Aplicar</button></div>
      <div class="well-cart-coupon-msg"></div>
      <div class="well-cart-summary"></div>
      <button class="well-cart-pay" type="button" hidden>Pagar agora online</button>
      <button class="well-cart-checkout" type="button">Finalizar pelo WhatsApp</button>
    `;
    document.body.appendChild(drawer);

    const badge = btn.querySelector('.well-cart-badge');
    const itemsRoot = drawer.querySelector('.well-cart-items');
    const summaryRoot = drawer.querySelector('.well-cart-summary');
    const couponInput = drawer.querySelector('.well-cart-coupon input');
    const couponBtn = drawer.querySelector('.well-cart-coupon button');
    const couponMsg = drawer.querySelector('.well-cart-coupon-msg');
    const checkoutBtn = drawer.querySelector('.well-cart-checkout');
    const payBtn = drawer.querySelector('.well-cart-pay');
    let appliedCoupon = '';

    function mpReady() { return Boolean(window.MP_PUBLIC_KEY) && window.MP_PUBLIC_KEY !== 'COLE_SUA_PUBLIC_KEY_AQUI'; }
    payBtn.addEventListener('click', () => { window.location.href = 'pagamento.html?cart=1'; });

    function open() { render(); overlay.hidden = false; drawer.hidden = false; }
    function close() { overlay.hidden = true; drawer.hidden = true; }
    btn.addEventListener('click', open);
    overlay.addEventListener('click', close);
    drawer.querySelector('.well-cart-close').addEventListener('click', close);

    couponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      const totals = computeTotals(code);
      if (!code) { couponMsg.textContent = ''; appliedCoupon = ''; }
      else if (!totals.couponValid) { couponMsg.textContent = 'Cupom inválido.'; couponMsg.style.color = '#A32D2D'; appliedCoupon = ''; }
      else if (!totals.couponApplied) { couponMsg.textContent = 'Cupom válido, mas nenhum item do carrinho é elegível.'; couponMsg.style.color = '#A32D2D'; appliedCoupon = code; }
      else { couponMsg.textContent = `Cupom aplicado! Economia de R$${totals.couponSavings}.`; couponMsg.style.color = '#3B6D11'; appliedCoupon = code; }
      renderSummary();
    });

    function render() {
      const items = getItems();
      badge.textContent = String(getCount());
      badge.hidden = getCount() === 0;
      const hasPayable = items.some(item => item.price != null && !item.orderOnly);
      payBtn.hidden = !mpReady() || !hasPayable;
      if (!items.length) {
        itemsRoot.innerHTML = '<p class="well-cart-empty">Seu carrinho está vazio.<br>Escolha um tênis na vitrine e adicione o tamanho.</p>';
        checkoutBtn.disabled = true;
      } else {
        checkoutBtn.disabled = false;
        itemsRoot.innerHTML = items.map(item => `
          <div class="well-cart-item" data-key="${item.key}">
            <img src="${item.image || ''}" alt="">
            <div>
              <div class="well-cart-item-name">${item.name}</div>
              <div class="well-cart-item-meta">${item.size ? 'Tam. ' + item.size : 'Consulte numeração'} · ${item.price != null ? 'R$' + item.price : 'Consultar'}</div>
              <div class="well-cart-qty">
                <button type="button" data-action="dec">−</button>
                <span>${item.qty}</span>
                <button type="button" data-action="inc">+</button>
              </div>
            </div>
            <button class="well-cart-remove" type="button" data-action="remove">remover</button>
          </div>
        `).join('');
      }
      renderSummary();
    }

    function renderSummary() {
      const totals = computeTotals(appliedCoupon);
      const items = getItems();
      let html = '';
      if (totals.subtotal > 0) html += `<div class="row"><span>Subtotal</span><span>R$${totals.subtotal}</span></div>`;
      if (totals.comboSavings > 0) html += `<div class="row"><span>Desconto combo</span><span>-R$${totals.comboSavings}</span></div>`;
      if (totals.couponSavings > 0) html += `<div class="row"><span>Cupom</span><span>-R$${totals.couponSavings}</span></div>`;
      if (totals.hasConsult) html += `<div class="row"><span>Itens sob encomenda</span><span>a combinar</span></div>`;
      if (totals.subtotal > 0) html += `<div class="row total"><span>Total</span><span>R$${totals.total}</span></div>`;
      summaryRoot.innerHTML = items.length ? html : '';
    }

    itemsRoot.addEventListener('click', event => {
      const actionBtn = event.target.closest('button[data-action]');
      if (!actionBtn) return;
      const key = actionBtn.closest('.well-cart-item').dataset.key;
      const item = getItems().find(entry => entry.key === key);
      if (!item) return;
      if (actionBtn.dataset.action === 'inc') setQty(key, item.qty + 1);
      else if (actionBtn.dataset.action === 'dec') setQty(key, item.qty - 1);
      else if (actionBtn.dataset.action === 'remove') removeItem(key);
    });

    checkoutBtn.addEventListener('click', () => { checkout(appliedCoupon); close(); });

    listeners.push(render);
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectUI);
  else injectUI();
})();
