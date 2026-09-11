// Consulta os pagamentos recentes direto no Mercado Pago (usa o mesmo Access Token
// ja configurado no servidor). Protegido pela mesma chave simples do coupon-stats.js.
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

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: 'MP_ACCESS_TOKEN nao configurado no servidor.' });
    return;
  }

  try {
    const mpRes = await fetch('https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=50', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!mpRes.ok) throw new Error(`Mercado Pago respondeu ${mpRes.status}`);
    const data = await mpRes.json();
    const results = data.results || [];

    const summary = { approved: 0, pending: 0, rejected: 0, other: 0, approvedTotal: 0 };
    const list = results.map(p => {
      if (p.status === 'approved') { summary.approved++; summary.approvedTotal += p.transaction_amount || 0; }
      else if (p.status === 'pending' || p.status === 'in_process') summary.pending++;
      else if (p.status === 'rejected') summary.rejected++;
      else summary.other++;
      return {
        id: p.id,
        status: p.status,
        status_detail: p.status_detail,
        amount: p.transaction_amount,
        method: p.payment_method_id,
        description: p.description,
        date: p.date_created,
      };
    });

    res.status(200).json({ summary, count: results.length, payments: list });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao consultar pagamentos.', detail: String(err) });
  }
};
