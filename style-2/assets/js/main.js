/**
 * main.js — Orchestration entry point
 * Initializes present modules safely on both the home page and all 11 internal pages
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  function initApp() {
    if (window.GW.utils && window.GW.utils.splitLines) {
      var splitTargets = document.querySelectorAll('.js-split-lines');
      Array.prototype.forEach.call(splitTargets, function(el) {
        window.GW.utils.splitLines(el);
      });
    }

    if (window.GW.smoothScroll) window.GW.smoothScroll.init();

    // Home page modules (run only if present)
    if (window.GW.heroBlocks && document.querySelector('.js-hero-blocks')) window.GW.heroBlocks.init();
    if (window.GW.preloader && document.querySelector('.js-preloader')) window.GW.preloader.init();

    // Internal page transition & shared UI
    if (window.GW.pageTransition && document.querySelector('.page-curtain')) window.GW.pageTransition.init();
    if (window.GW.menu && document.querySelector('#site-menu')) window.GW.menu.init();

    // Home section modules
    if (window.GW.hero && document.querySelector('section.hero')) window.GW.hero.init();
    if (window.GW.begins && document.querySelector('section#begins')) window.GW.begins.init();
    if (window.GW.technologies && document.querySelector('section#technology')) window.GW.technologies.init();
    if (window.GW.experience && document.querySelector('section#experience')) window.GW.experience.init();
    if (window.GW.scanner && document.querySelector('section#scanner')) window.GW.scanner.init();
    if (window.GW.imagine && document.querySelector('section#imagine')) window.GW.imagine.init();
    if (window.GW.machines && document.querySelector('section#machines')) window.GW.machines.init();
    if (window.GW.finalResults && document.querySelector('section#final')) window.GW.finalResults.init();
    if (window.GW.footer && document.querySelector('footer#footer')) window.GW.footer.init();

    // Internal page shared & per-page modules
    if (window.GW.page && (document.querySelector('.page-hero') || document.querySelector('.page-section'))) window.GW.page.init();
    if (window.GW.pageExperience && document.querySelector('[data-page="experience"]')) window.GW.pageExperience.init();
    if (window.GW.pageTechnology && document.querySelector('[data-page="technology"]')) window.GW.pageTechnology.init();
    if (window.GW.pageAiStyling && document.querySelector('[data-page="ai-styling"]')) window.GW.pageAiStyling.init();
    if (window.GW.pageFinalLooks && document.querySelector('[data-page="final-looks"]')) window.GW.pageFinalLooks.init();
    if (window.GW.pageContact && document.querySelector('[data-page="contact"]')) window.GW.pageContact.init();
    if (window.GW.pageTechDetail) window.GW.pageTechDetail.init();

    // Shared utilities across all 12 pages
    if (window.GW.scrollTop && document.querySelector('.js-scroll-top')) window.GW.scrollTop.init();
    if (window.GW.restore) window.GW.restore.init();

    // Debounced resize handler to refresh ScrollTrigger
    if (window.GW.utils && window.GW.utils.debounce) {
      window.addEventListener('resize', window.GW.utils.debounce(function() {
        if (window.ScrollTrigger) {
          ScrollTrigger.refresh();
        }
      }, 200));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
