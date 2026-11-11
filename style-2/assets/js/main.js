/**
 * main.js — Orchestration entry point
 * Initializes every module immediately, waits for gw:ready before playing entrance intros
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  function initApp() {
    // 1. Prepare line splits for titles and headlines
    if (window.GW.utils && window.GW.utils.splitLines) {
      var splitTargets = document.querySelectorAll('.js-split-lines');
      Array.prototype.forEach.call(splitTargets, function(el) {
        window.GW.utils.splitLines(el);
      });
    }

    // 2. Initialize modules in sequence
    if (window.GW.smoothScroll) window.GW.smoothScroll.init();
    if (window.GW.heroBlocks) window.GW.heroBlocks.init();
    if (window.GW.preloader) window.GW.preloader.init();
    if (window.GW.menu) window.GW.menu.init();
    if (window.GW.hero) window.GW.hero.init();
    if (window.GW.begins) window.GW.begins.init();
    if (window.GW.technologies) window.GW.technologies.init();
    if (window.GW.experience) window.GW.experience.init();
    if (window.GW.scanner) window.GW.scanner.init();
    if (window.GW.imagine) window.GW.imagine.init();
    if (window.GW.machines) window.GW.machines.init();
    if (window.GW.finalResults) window.GW.finalResults.init();
    if (window.GW.footer) window.GW.footer.init();

    // 3. Debounced resize handler to refresh ScrollTrigger
    window.addEventListener('resize', window.GW.utils.debounce(function() {
      if (window.ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    }, 200));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
