/**
 * footer.js — Footer entrance reveal, giant typography mask rise, and gold gradient sweep
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var footer = null;
  var giantText = null;
  var links = [];

  function init() {
    footer = document.querySelector('footer#footer');
    if (!footer) return;

    giantText = footer.querySelector('.footer__giant-text');
    links = Array.prototype.slice.call(footer.querySelectorAll('.footer__link'));

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      if (giantText) giantText.style.opacity = '1';
      links.forEach(function(l) { l.style.opacity = '1'; });
      return;
    }

    setupFooterTimeline();
  }

  function setupFooterTimeline() {
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: 'top 90%',
        end: 'bottom bottom',
        scrub: true
      }
    });

    if (giantText) {
      tl.fromTo(giantText, {
        yPercent: 80,
        backgroundPosition: '200% 0%'
      }, {
        yPercent: 0,
        backgroundPosition: '0% 0%',
        ease: 'none',
        duration: 1
      }, 0);
    }

    if (links.length) {
      tl.fromTo(links, {
        opacity: 0,
        y: 15
      }, {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out'
      }, 0.2);
    }
  }

  window.GW.footer = {
    init: init
  };
})();
