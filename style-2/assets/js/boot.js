/**
 * boot.js — Synchronous initialization in <head>
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var docEl = document.documentElement;
  docEl.classList.remove('no-js');
  docEl.classList.add('js');

  var params = new URLSearchParams(window.location.search);
  var forcePreload = params.get('preloader') === '1';
  var autostart = params.get('autostart') === '1';
  var forceMotion = params.get('motion') === '1';
  var hasPreloaded = false;

  try {
    hasPreloaded = sessionStorage.getItem('gw-preloaded') === 'true';
  } catch (e) {
    hasPreloaded = false;
  }

  // Navigation type & pending scroll restoration detection
  var navType = 'navigate';
  try {
    var entries = performance.getEntriesByType && performance.getEntriesByType('navigation');
    if (entries && entries.length && entries[0].type) {
      navType = entries[0].type;
    } else if (performance.navigation) {
      navType = performance.navigation.type === 1 ? 'reload' : (performance.navigation.type === 2 ? 'back_forward' : 'navigate');
    }
  } catch (e) {
    navType = 'navigate';
  }

  var restoreY = 0;
  if ((navType === 'reload' || navType === 'back_forward') && !window.location.hash) {
    try {
      var raw = sessionStorage.getItem('gw:scroll:' + window.location.pathname);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed.y === 'number' && parsed.y > 0) {
          restoreY = parsed.y;
        }
      }
    } catch (e) {
      restoreY = 0;
    }
  }

  if (forceMotion) {
    window.GW.isReducedMotion = false;
    docEl.classList.add('force-motion');
  } else {
    window.GW.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  window.GW.navType = navType;
  window.GW.restoreY = restoreY;
  window.GW.skipPreload = autostart;
  window.GW.isQuickPreload = (!forcePreload && (hasPreloaded || restoreY > 0)) || autostart;

  if (!window.GW.skipPreload) {
    docEl.classList.add('is-loading');
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
})();
