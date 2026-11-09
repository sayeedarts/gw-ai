/**
 * smooth-scroll.js — Lenis + GSAP ticker synchronization
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var lenis = null;

  function init() {
    if (window.GW.isReducedMotion || typeof window.Lenis === 'undefined') {
      return;
    }

    try {
      lenis = new window.Lenis({
        duration: 1.2,
        easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        infinite: false
      });

      if (window.ScrollTrigger) {
        lenis.on('scroll', window.ScrollTrigger.update);

        if (window.gsap && window.gsap.ticker) {
          gsap.ticker.add(function(time) {
            lenis.raf(time * 1000);
          });
          gsap.ticker.lagSmoothing(0);
        }
      }
    } catch (err) {
      console.warn('Lenis init error:', err);
    }
  }

  window.GW.smoothScroll = {
    init: init,
    start: function() {
      if (lenis) lenis.start();
    },
    stop: function() {
      if (lenis) lenis.stop();
    },
    scrollTo: function(target, options) {
      if (lenis) {
        lenis.scrollTo(target, options || { duration: 1.4, ease: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
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
