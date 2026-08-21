// Aviso simples de cookies (LGPD). Não bloqueia nada, só informa e some ao clicar "Entendi".
(function () {
  if (localStorage.getItem('well_cookie_ok') === '1') return;

  var style = document.createElement('style');
  style.textContent = `
    .cookie-bar{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#10131a;color:#fff;
      padding:16px 20px;display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:center;
      font-family:"DM Sans",sans-serif;font-size:14px;line-height:1.5;box-shadow:0 -10px 30px rgba(0,0,0,.15)}
    .cookie-bar a{color:#d9b8ff;text-decoration:underline}
    .cookie-bar button{background:#6d36a7;color:#fff;border:none;border-radius:999px;padding:10px 22px;
      font-weight:600;cursor:pointer;white-space:nowrap}
    .cookie-bar button:hover{background:#4d207e}
    .cookie-bar p{margin:0;max-width:640px}
    @media (max-width:520px){.cookie-bar{padding:14px 16px;justify-content:flex-start}}
  `;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.className = 'cookie-bar';
  bar.innerHTML = `
    <p>Usamos cookies para melhorar sua experiência e personalizar anúncios. <a href="privacidade.html">Saiba mais</a>.</p>
    <button type="button">Entendi</button>
  `;
  document.body.appendChild(bar);

  bar.querySelector('button').addEventListener('click', function () {
    localStorage.setItem('well_cookie_ok', '1');
    bar.remove();
  });
})();
