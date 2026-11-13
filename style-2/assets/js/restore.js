/**
 * restore.js — Save and restore scroll position on reload / back_forward navigation
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var STORAGE_KEY = 'gw:scroll:' + window.location.pathname;
  var ticking = false;
  var lastHeight = 0;

  function getCurrentScrollY() {
    if (window.GW.smoothScroll && typeof window.GW.smoothScroll.getLenis === 'function') {
      var lenis = window.GW.smoothScroll.getLenis();
      if (lenis && typeof lenis.scroll === 'number') {
        return lenis.scroll;
      }
    }
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function saveScrollPosition() {
    if (document.documentElement.classList.contains('is-loading')) return;
    var y = Math.round(getCurrentScrollY());
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ y: y, t: Date.now() }));
    } catch (e) {}
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function() {
        saveScrollPosition();
        ticking = false;
      });
    }
  }

  function init() {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', saveScrollPosition);
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        saveScrollPosition();
      }
    });

    if (window.GW.smoothScroll && typeof window.GW.smoothScroll.getLenis === 'function') {
      var lenis = window.GW.smoothScroll.getLenis();
      if (lenis && typeof lenis.on === 'function') {
        lenis.on('scroll', onScroll);
      }
    }
  }

  function jumpToSaved(y) {
    var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var targetY = Math.min(Math.max(0, y), maxScroll);
    var lenis = window.GW.smoothScroll && typeof window.GW.smoothScroll.getLenis === 'function'
      ? window.GW.smoothScroll.getLenis()
      : null;

    if (lenis) {
      lenis.scrollTo(targetY, { immediate: true, force: true });
    } else {
      window.scrollTo(0, targetY);
    }

    if (window.ScrollTrigger) {
      window.ScrollTrigger.update();
    }
  }

  function applyRestore(doneCallback) {
    var y = window.GW.restoreY || 0;
    if (y <= 0) {
      if (typeof doneCallback === 'function') doneCallback();
      return;
    }

    window.requestAnimationFrame(function() {
      window.requestAnimationFrame(function() {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh(true);
        }
        lastHeight = document.documentElement.scrollHeight;
        jumpToSaved(y);

        // Re-apply once after window load + 300ms if late images alter document height
        var reapply = function() {
          setTimeout(function() {
            if (document.documentElement.scrollHeight !== lastHeight) {
              if (window.ScrollTrigger) {
                window.ScrollTrigger.refresh(true);
              }
              lastHeight = document.documentElement.scrollHeight;
              jumpToSaved(y);
            }
          }, 300);
        };

        if (document.readyState === 'complete') {
          reapply();
        } else {
          window.addEventListener('load', reapply, { once: true });
        }

        if (typeof doneCallback === 'function') doneCallback();
      });
    });
  }

  window.GW.restore = {
    init: init,
    applyRestore: applyRestore,
    save: saveScrollPosition
  };
})();
