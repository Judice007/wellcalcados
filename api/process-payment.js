const fs = require('fs');
const path = require('path');

function loadPrices() {
  const filePath = path.join(__dirname, 'prices.json');
  const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const map = new Map();
  list.forEach(item => map.set(item.name, item.price));
  return map;
}

// Mesma regra do "Mês do Cliente" aplicada no carrinho (cart.js), recalculada aqui
// com os preços oficiais do servidor — nunca confia em total vindo do navegador.
function isAirForceCombo(name, price) {
  return /air force|\baf1\b/i.test(name) && price === 250;
}

function computeCartTotal(items, prices) {
  const resolved = [];
  const unresolvedNames = [];
  items.forEach(({ name, qty }) => {
    const quantity = Math.max(1, Number(qty) || 1);
    if (!prices.has(name)) { unresolvedNames.push(name); return; }
    const price = prices.get(name);
    for (let i = 0; i < quantity; i++) resolved.push({ name, price });
  });

  const comboEligible = resolved.filter(item => isAirForceCombo(item.name, item.price));
  const rest = resolved.filter(item => !isAirForceCombo(item.name, item.price));

  let total = rest.reduce((sum, item) => sum + item.price, 0);
  const bundles = Math.floor(comboEligible.length / 2);
  const remainder = comboEligible.length % 2;
  total += bundles * 400 + remainder * 250;

  const description = items.map(item => `${item.name}${item.size ? ` (tam. ${item.size})` : ''} x${item.qty || 1}`).join(', ');
  return { total, description, unresolvedNames, resolvedCount: resolved.length };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado no servidor.' });
    return;
  }

  try {
    const body = req.body || {};
    const { productName, formData, items, deliveryAddress } = body;
    const prices = loadPrices();

    let officialAmount;
    let description;
    let metadataItems;

    if (Array.isArray(items) && items.length) {
      const cart = computeCartTotal(items, prices);
      if (cart.resolvedCount === 0) {
        res.status(400).json({ error: 'Nenhum item do carrinho está disponível para pagamento online.' });
        return;
      }
      officialAmount = cart.total;
      description = cart.description;
      metadataItems = items;
    } else {
      if (!productName || !prices.has(productName)) {
        res.status(400).json({ error: 'Produto não encontrado ou indisponível para pagamento direto.' });
        return;
      }
      officialAmount = prices.get(productName);
      description = productName;
      metadataItems = [{ name: productName, qty: 1 }];
    }

    // Nunca confia no valor mandado pelo navegador — usa sempre o preço oficial do catálogo.
    const payment = {
      ...formData,
      transaction_amount: officialAmount,
      description,
      metadata: { items: metadataItems, delivery_address: deliveryAddress || null },
    };

    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payment),
    });
    const data = await mpResponse.json();
    res.status(mpResponse.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Falha ao processar pagamento.', detail: String(err) });
  }
};
