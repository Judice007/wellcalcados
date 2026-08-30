// Le o historico de uso de um cupom. Protegido por uma chave simples na URL
// (nao e dado sensivel de pagamento, so contagem de uso — protecao leve e suficiente aqui).
const ADMIN_KEY = 'well2026admin';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (req.query.key !== ADMIN_KEY) {
    res.status(401).json({ error: 'Chave invalida.' });
    return;
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    res.status(500).json({ error: 'Banco nao configurado no servidor.' });
    return;
  }

  const code = String(req.query.code || 'WELLO9SET').toUpperCase().trim();

  try {
    const pipeline = [
      ['GET', `coupon:${code}:count`],
      ['LRANGE', `coupon:${code}:log`, '0', '199'],
    ];
    const kvRes = await fetch(`${kvUrl}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(pipeline),
    });
    if (!kvRes.ok) throw new Error(`KV respondeu ${kvRes.status}`);
    const data = await kvRes.json();
    const count = Number(data?.[0]?.result) || 0;
    const log = (data?.[1]?.result || []).map(item => { try { return JSON.parse(item); } catch (_) { return null; } }).filter(Boolean);
    res.status(200).json({ code, count, log });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao consultar o cupom.', detail: String(err) });
  }
};
