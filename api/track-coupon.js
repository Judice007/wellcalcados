// Registra cada uso do cupom no banco (Vercel KV / Upstash Redis, via REST API).
// Chamado pelo carrinho (cart.js) toda vez que um pedido com cupom aplicado é fechado pelo WhatsApp.
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
    if (!code) {
      res.status(400).json({ error: 'Código do cupom é obrigatório.' });
      return;
    }

    const entry = JSON.stringify({
      code,
      description: String(body.description || '').slice(0, 300),
      savings: Number(body.savings) || 0,
      total: Number(body.total) || 0,
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
