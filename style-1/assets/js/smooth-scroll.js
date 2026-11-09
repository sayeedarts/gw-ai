/**
 * Green Wardrobe — smooth-scroll.js (Lenis + GSAP Ticker)
 */
(function() {
  window.GW = window.GW || {};

  var lenis = null;

  window.GW.smoothScroll = {
    init: function() {
      // Check prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      if (typeof window.Lenis !== 'undefined') {
        lenis = new Lenis({
          duration: 1.2,
          easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          touchMultiplier: 1.5,
        });

        if (window.ScrollTrigger) {
          lenis.on('scroll', ScrollTrigger.update);
        }

        if (window.gsap) {
          gsap.ticker.add(function(time) {
            lenis.raf(time * 1000);
          });
          gsap.ticker.lagSmoothing(0);
        }
      }
    },

    stop: function() {
      if (lenis) lenis.stop();
    },

    start: function() {
      if (lenis) lenis.start();
    },

    scrollTo: function(target, options) {
      if (lenis) {
        lenis.scrollTo(target, options || { duration: 1.4 });
      } else {
        var el = typeof target === 'string' ? document.querySelector(target) : target;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },

    getLenis: function() {
      return lenis;
    }
  };
})();
