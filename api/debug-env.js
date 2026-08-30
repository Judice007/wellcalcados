// Endpoint temporário só pra descobrir os NOMES das variáveis de ambiente do banco
// (nunca expõe valores). Remover depois de usar.
module.exports = async function handler(req, res) {
  const keys = Object.keys(process.env).filter(k =>
    /KV|REDIS|UPSTASH|STORAGE/i.test(k)
  );
  res.status(200).json({ keys });
};
