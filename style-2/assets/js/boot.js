/**
 * boot.js — Synchronous initialization in <head>
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var docEl = document.documentElement;
  docEl.classList.remove('no-js');
  docEl.classList.add('js');

  // Check if session has preloaded or if forced
  var params = new URLSearchParams(window.location.search);
  var forcePreload = params.get('preloader') === '1';
  var autostart = params.get('autostart') === '1';
  var hasPreloaded = false;

  try {
    hasPreloaded = sessionStorage.getItem('gw-preloaded') === 'true';
  } catch (e) {
    hasPreloaded = false;
  }

  window.GW.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.GW.skipPreload = autostart;
  window.GW.isQuickPreload = (!forcePreload && hasPreloaded) || autostart;

  if (!window.GW.skipPreload) {
    docEl.classList.add('is-loading');
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
})();
