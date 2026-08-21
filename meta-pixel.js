// Carrega o Meta Pixel só se um ID de verdade estiver configurado em meta-pixel-config.js.
// window.wellTrack(evento, params) é seguro de chamar mesmo sem pixel configurado (não faz nada).
(function () {
  var id = window.META_PIXEL_ID;
  if (!id || id === 'COLE_SEU_PIXEL_ID_AQUI') {
    window.wellTrack = function () {};
    return;
  }

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', id);
  fbq('track', 'PageView');

  window.wellTrack = function (event, params) {
    try { fbq('track', event, params || {}); } catch (_) {}
  };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
      a.addEventListener('click', function () {
        window.wellTrack('Contact', { content_name: 'whatsapp_link' });
      });
    });
  });
})();
