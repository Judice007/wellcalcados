const crypto = require('crypto');

const FIRST_PURCHASE_CODES = new Set(['LUNA10', 'JUDICE10']);

function normalizePhone(phone) { return String(phone || '').replace(/\D/g, ''); }
function phoneHash(phone, secret) { return crypto.createHmac('sha256', secret).update(phone).digest('hex'); }

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const code = String(req.body?.code || '').toUpperCase().trim();
  const phone = normalizePhone(req.body?.phone);
  if (!FIRST_PURCHASE_CODES.has(code)) {
    res.status(400).json({ error: 'Cupom inválido.' });
    return;
  }
  if (phone.length < 10) {
    res.status(400).json({ error: 'Informe um WhatsApp válido com DDD.' });
    return;
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    res.status(500).json({ error: 'Validação de primeira compra indisponível no momento.' });
    return;
  }

  try {
    const customerKey = `coupon:first-purchase:${phoneHash(phone, process.env.COUPON_HASH_SECRET || kvToken)}`;
    const kvRes = await fetch(kvUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['GET', customerKey]),
    });
    if (!kvRes.ok) throw new Error(`KV respondeu ${kvRes.status}`);
    const data = await kvRes.json();
    if (data?.result) {
      res.status(409).json({ error: 'Este WhatsApp já utilizou um cupom de primeira compra.' });
      return;
    }
    res.status(200).json({ ok: true, code, discountPercent: 10 });
  } catch (err) {
    res.status(500).json({ error: 'Não foi possível validar o cupom agora.', detail: String(err) });
  }
};
