module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado no servidor.' });
    return;
  }

  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Parâmetro id é obrigatório.' });
    return;
  }

  try {
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await mpResponse.json();
    res.status(mpResponse.status).json({ status: data.status, status_detail: data.status_detail });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao consultar pagamento.', detail: String(err) });
  }
};
