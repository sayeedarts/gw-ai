/**
 * scroll-top.js — Floating glass scroll-to-top button with SVG progress ring
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var btn = null;
  var ticking = false;
  var heroEl = null;

  function init() {
    btn = document.querySelector('.js-scroll-top');
    if (!btn) return;

    heroEl = document.querySelector('section.hero');

    btn.addEventListener('click', function() {
      if (window.GW.smoothScroll) {
        window.GW.smoothScroll.scrollTo(0, {
          duration: window.GW.isReducedMotion ? 0 : 1.4
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: window.GW.isReducedMotion ? 'auto' : 'smooth'
        });
      }

      var skipTarget = document.querySelector('#main') || document.querySelector('#top');
      if (skipTarget) {
        var hadTabindex = skipTarget.hasAttribute('tabindex');
        if (!hadTabindex) skipTarget.setAttribute('tabindex', '-1');
        skipTarget.focus({ preventScroll: true });
      }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('gw:ready', update);
    update();
  }

  function getScrollY() {
    if (window.GW.smoothScroll && typeof window.GW.smoothScroll.getLenis === 'function') {
      var lenis = window.GW.smoothScroll.getLenis();
      if (lenis && typeof lenis.scroll === 'number') {
        return lenis.scroll;
      }
    }
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function() {
        update();
        ticking = false;
      });
    }
  }

  function update() {
    if (!btn) return;
    var scrollY = getScrollY();
    var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var progress = Math.min(1, Math.max(0, scrollY / maxScroll));

    btn.style.setProperty('--scroll-progress', progress.toFixed(4));

    var isLocked = document.body.classList.contains('is-locked') || document.documentElement.classList.contains('is-loading');
    var threshold = Math.max(window.innerHeight, 600);

    // On home page, do not appear while hero pin is still active
    if (heroEl) {
      var heroRect = heroEl.getBoundingClientRect();
      var heroPinWrapper = heroEl.parentNode && heroEl.parentNode.classList && heroEl.parentNode.classList.contains('pin-spacer')
        ? heroEl.parentNode
        : heroEl;
      var spacerRect = heroPinWrapper.getBoundingClientRect();
      var heroBottom = scrollY + spacerRect.bottom;
      threshold = Math.max(threshold, heroBottom - window.innerHeight * 0.25);
    }

    if (!isLocked && scrollY > threshold) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }

  window.GW.scrollTop = {
    init: init,
    update: update
  };
})();
