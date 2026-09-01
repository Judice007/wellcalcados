// Registra cada uso do cupom no banco (Vercel KV / Upstash Redis, via REST API).
// Chamado pelo carrinho (cart.js) toda vez que um pedido com cupom aplicado é fechado pelo WhatsApp.
const crypto = require('crypto');
const ALLOWED_CODES = new Set(['WELLO9SET', 'LUNA10', 'JUDICE10']);
const FIRST_PURCHASE_CODES = new Set(['LUNA10', 'JUDICE10']);

function normalizePhone(phone) { return String(phone || '').replace(/\D/g, ''); }
function phoneHash(phone, secret) { return crypto.createHmac('sha256', secret).update(phone).digest('hex'); }

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    res.status(500).json({ error: 'Banco não configurado no servidor.' });
    return;
  }

  try {
    const body = req.body || {};
    const code = String(body.code || '').toUpperCase().trim();
    if (!ALLOWED_CODES.has(code)) {
      res.status(400).json({ error: 'Cupom inválido.' });
      return;
    }

    const phone = normalizePhone(body.phone);
    if (FIRST_PURCHASE_CODES.has(code)) {
      if (phone.length < 10) {
        res.status(400).json({ error: 'Informe um WhatsApp válido com DDD.' });
        return;
      }
      const customerKey = `coupon:first-purchase:${phoneHash(phone, process.env.COUPON_HASH_SECRET || kvToken)}`;
      const reserveRes = await fetch(kvUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['SET', customerKey, code, 'NX']),
      });
      if (!reserveRes.ok) throw new Error(`KV respondeu ${reserveRes.status}`);
      const reserveData = await reserveRes.json();
      if (reserveData?.result !== 'OK') {
        res.status(409).json({ error: 'Este WhatsApp já utilizou um cupom de primeira compra.' });
        return;
      }
    }

    const entry = JSON.stringify({
      code,
      description: String(body.description || '').slice(0, 300),
      savings: Number(body.savings) || 0,
      total: Number(body.total) || 0,
      firstPurchase: FIRST_PURCHASE_CODES.has(code),
      phoneLast4: phone ? phone.slice(-4) : '',
      at: new Date().toISOString(),
    });

    const pipeline = [
      ['INCR', `coupon:${code}:count`],
      ['LPUSH', `coupon:${code}:log`, entry],
      ['LTRIM', `coupon:${code}:log`, '0', '499'],
    ];

    const kvRes = await fetch(`${kvUrl}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(pipeline),
    });
    if (!kvRes.ok) throw new Error(`KV respondeu ${kvRes.status}`);
    const data = await kvRes.json();
    res.status(200).json({ ok: true, count: data?.[0]?.result });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao registrar uso do cupom.', detail: String(err) });
  }
};
