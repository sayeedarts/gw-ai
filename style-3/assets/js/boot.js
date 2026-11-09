/**
 * Green Wardrobe — boot.js (Synchronous in <head>)
 */
(function() {
  document.documentElement.classList.add('js', 'is-loading');
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.GW = window.GW || {};
})();
