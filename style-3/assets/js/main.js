/**
 * Green Wardrobe — main.js (Orchestrator)
 */
(function() {
  window.GW = window.GW || {};

  function initApp() {
    // Register GSAP plugins
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Initialize all modules in specified order
    if (window.GW.smoothScroll) window.GW.smoothScroll.init();
    if (window.GW.menu) window.GW.menu.init();
    if (window.GW.heroBlocks) window.GW.heroBlocks.init();
    if (window.GW.hero) window.GW.hero.init();
    if (window.GW.begins) window.GW.begins.init();
    if (window.GW.technologies) window.GW.technologies.init();
    if (window.GW.experience) window.GW.experience.init();
    if (window.GW.scanner) window.GW.scanner.init();
    if (window.GW.imagine) window.GW.imagine.init();
    if (window.GW.machines) window.GW.machines.init();
    if (window.GW.finalResults) window.GW.finalResults.init();
    if (window.GW.rewardrobe) window.GW.rewardrobe.init();
    if (window.GW.cta) window.GW.cta.init();
    if (window.GW.footer) window.GW.footer.init();
    if (window.GW.preloader) window.GW.preloader.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
