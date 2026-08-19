const fs = require('fs');
const path = require('path');

function loadPrices() {
  const filePath = path.join(__dirname, 'prices.json');
  const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const map = new Map();
  list.forEach(item => map.set(item.name, item.price));
  return map;
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
    const { productName, formData } = body;

    const prices = loadPrices();
    if (!productName || !prices.has(productName)) {
      res.status(400).json({ error: 'Produto não encontrado ou indisponível para pagamento direto.' });
      return;
    }
    const officialPrice = prices.get(productName);

    // Nunca confia no valor mandado pelo navegador — usa sempre o preço oficial do catálogo.
    const payment = {
      ...formData,
      transaction_amount: officialPrice,
      description: productName,
      metadata: { product_name: productName },
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
