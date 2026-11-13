/**
 * page-transition.js — Internal page entry curtain lift & same-origin exit wipe
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var curtain = null;
  var isTransitioning = false;

  function init() {
    curtain = document.querySelector('.page-curtain');
    if (!curtain) return;

    if (window.GW.isReducedMotion || !window.gsap) {
      curtain.classList.add('is-dismissed');
      document.documentElement.classList.remove('is-loading');
      if (window.GW.restore && window.GW.restoreY > 0) {
        window.GW.restore.applyRestore(function() {
          window.dispatchEvent(new CustomEvent('gw:ready'));
        });
      } else {
        window.dispatchEvent(new CustomEvent('gw:ready'));
      }
      return;
    }

    // Handle browser back/forward cache restore
    window.addEventListener('pageshow', function(e) {
      if (e.persisted && curtain) {
        isTransitioning = false;
        gsap.set(curtain, { clipPath: 'inset(0 0 100% 0)' });
        curtain.classList.add('is-dismissed');
        document.documentElement.classList.remove('is-loading');
      }
    });

    // Lift curtain once fonts are ready (with fallback timeout)
    var lifted = false;
    var triggerLift = function() {
      if (lifted) return;
      lifted = true;
      if (window.GW.restore && window.GW.restoreY > 0) {
        document.documentElement.classList.remove('is-loading');
        window.GW.restore.applyRestore(liftCurtain);
      } else {
        liftCurtain();
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(triggerLift).catch(triggerLift);
    } else {
      triggerLift();
    }
    setTimeout(triggerLift, 1200);

    // Intercept same-origin page navigations
    document.addEventListener('click', onDocumentClick);
  }

  function liftCurtain() {
    if (!curtain || !window.gsap) return;
    document.documentElement.classList.remove('is-loading');

    if (window.GW.smoothScroll) {
      window.GW.smoothScroll.start();
    }

    gsap.fromTo(curtain, {
      clipPath: 'inset(0% 0% 0% 0%)'
    }, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.8,
      ease: 'expo.inOut',
      onComplete: function() {
        curtain.classList.add('is-dismissed');
        if (window.ScrollTrigger && !(window.GW.restoreY > 0)) {
          window.ScrollTrigger.refresh(true);
        }
        window.dispatchEvent(new CustomEvent('gw:ready'));
      }
    });
  }

  function onDocumentClick(e) {
    if (isTransitioning) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var anchor = e.target.closest('a');
    if (!anchor) return;

    var href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || anchor.hasAttribute('download')) {
      return;
    }

    var target = anchor.getAttribute('target');
    if (target && target !== '_self') return;

    var destUrl;
    try {
      destUrl = new URL(href, window.location.href);
    } catch (err) {
      return;
    }

    if (destUrl.origin !== window.location.origin) return;
    // Same-page hash navigation
    if (destUrl.pathname === window.location.pathname && destUrl.hash) return;

    e.preventDefault();
    isTransitioning = true;

    curtain.classList.remove('is-dismissed');
    gsap.fromTo(curtain, {
      clipPath: 'inset(100% 0% 0% 0%)'
    }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.6,
      ease: 'expo.inOut',
      onComplete: function() {
        window.location.href = destUrl.href;
      }
    });
  }

  window.GW.pageTransition = {
    init: init
  };
})();
