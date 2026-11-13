/**
 * preloader.js — Full-screen loader with asset tracking and entrance orchestration
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var preloaderEl = null;
  var countEl = null;
  var barEl = null;
  var announceEl = null;
  var currentPercent = 0;
  var targetPercent = 0;
  var startTime = Date.now();
  var isDone = false;
  var minDuration = 1800; // 1.8s minimum visible time

  function init() {
    preloaderEl = document.querySelector('.js-preloader');
    if (!preloaderEl) {
      finishPreload();
      return;
    }

    countEl = preloaderEl.querySelector('.preloader__count');
    barEl = preloaderEl.querySelector('.preloader__bar');
    announceEl = preloaderEl.querySelector('.js-preloader-announce');

    // Only jump to top when NOT restoring scroll on reload/back_forward
    if (!(window.GW.restoreY > 0)) {
      window.scrollTo(0, 0);
    }

    if (window.GW.smoothScroll) {
      window.GW.smoothScroll.stop();
    }

    var mainEl = document.querySelector('main');
    var headerEl = document.querySelector('.site-header');
    if (mainEl) mainEl.setAttribute('inert', '');
    if (headerEl) headerEl.setAttribute('inert', '');

    if (window.GW.skipPreload) {
      finishPreload();
      return;
    }

    if (window.GW.isQuickPreload) {
      minDuration = 600;
    }

    // Play intro animation
    if (!window.GW.isReducedMotion && window.gsap) {
      var badge = preloaderEl.querySelector('.preloader__badge');
      var text = preloaderEl.querySelector('.preloader__text');

      gsap.fromTo(badge, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out' });
      gsap.fromTo(text, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' });
      gsap.fromTo(countEl, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.5 });
      gsap.to(badge, { scale: 1.04, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
    }

    trackProgress();
  }

  function trackProgress() {
    var weights = {
      fonts: 0,
      logo: 0,
      video: 0,
      images: 0,
      load: 0
    };

    function updateWeighted() {
      var total = weights.fonts + weights.logo + weights.video + weights.images + weights.load;
      targetPercent = Math.min(100, Math.max(targetPercent, total));
    }

    // 1. Fonts 20%
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        weights.fonts = 20;
        updateWeighted();
      }).catch(function() {
        weights.fonts = 20;
        updateWeighted();
      });
    } else {
      weights.fonts = 20;
    }

    // 2. Logo / Poster 20%
    var heroPoster = new Image();
    heroPoster.onload = heroPoster.onerror = function() {
      weights.logo = 20;
      updateWeighted();
    };
    heroPoster.src = 'assets/img/hero.jpg';

    // 3. Hero Video Metadata 20%
    var video = document.querySelector('.hero__video');
    if (video) {
      if (video.readyState >= 1) {
        weights.video = 20;
        updateWeighted();
      } else {
        video.addEventListener('loadedmetadata', function() {
          weights.video = 20;
          updateWeighted();
        }, { once: true });
        setTimeout(function() {
          weights.video = 20;
          updateWeighted();
        }, 1500);
      }
    } else {
      weights.video = 20;
    }

    // 4. Above the fold images 20%
    weights.images = 20;
    updateWeighted();

    // 5. Window load 20%
    if (document.readyState === 'complete') {
      weights.load = 20;
      updateWeighted();
    } else {
      window.addEventListener('load', function() {
        weights.load = 20;
        updateWeighted();
      }, { once: true });
    }

    // Hard timeout 8s forces 100%
    setTimeout(function() {
      targetPercent = 100;
    }, 8000);

    // Continuous ticker for progress smoothing
    var progressInterval = setInterval(function() {
      var elapsed = Date.now() - startTime;
      var timeGate = Math.min(100, (elapsed / minDuration) * 100);
      var effectiveTarget = Math.min(targetPercent, timeGate);

      if (currentPercent < effectiveTarget) {
        currentPercent += (effectiveTarget - currentPercent) * 0.2 + 0.5;
        if (currentPercent > effectiveTarget) currentPercent = effectiveTarget;
      }

      var rounded = Math.round(currentPercent);
      if (countEl) countEl.textContent = rounded + '%';
      if (barEl) gsap.set(barEl, { scaleX: currentPercent / 100 });

      // Accessibility announce
      if (announceEl && (rounded === 25 || rounded === 50 || rounded === 75 || rounded === 100)) {
        announceEl.textContent = 'Loading ' + rounded + ' percent';
      }

      if (targetPercent >= 100 && currentPercent >= 99.5 && elapsed >= minDuration) {
        clearInterval(progressInterval);
        if (countEl) countEl.textContent = '100%';
        if (barEl && window.gsap) gsap.set(barEl, { scaleX: 1 });
        setTimeout(prepareExit, 350);
      }
    }, 30);
  }

  function prepareExit() {
    if (window.GW.restore && window.GW.restoreY > 0) {
      // Restore scroll silently behind preloader before lifting it
      document.documentElement.classList.remove('is-loading');
      if (window.GW.smoothScroll) {
        window.GW.smoothScroll.start();
      }
      window.GW.restore.applyRestore(playExit);
    } else {
      playExit();
    }
  }

  function playExit() {
    if (isDone) return;
    isDone = true;

    try {
      sessionStorage.setItem('gw-preloaded', 'true');
    } catch (e) {}

    if (window.GW.isReducedMotion || !window.gsap) {
      if (preloaderEl) {
        preloaderEl.classList.add('is-dismissed');
      }
      finishPreload();
      return;
    }

    var tl = gsap.timeline({
      onComplete: finishPreload
    });

    var badge = preloaderEl.querySelector('.preloader__badge');
    var text = preloaderEl.querySelector('.preloader__text');

    tl.to([countEl, text], {
      y: -30,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.in'
    })
    .to(barEl, {
      scaleX: 0,
      transformOrigin: 'right center',
      duration: 0.7,
      ease: 'expo.inOut'
    }, '-=0.2')
    .to(badge, {
      scale: 0.6,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.in'
    }, '-=0.6')
    .to(preloaderEl, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 1.0,
      ease: 'expo.inOut'
    }, '-=0.2');
  }

  function finishPreload() {
    document.documentElement.classList.remove('is-loading');

    var mainEl = document.querySelector('main');
    var headerEl = document.querySelector('.site-header');
    if (mainEl) mainEl.removeAttribute('inert');
    if (headerEl) headerEl.removeAttribute('inert');

    if (preloaderEl && preloaderEl.parentNode) {
      preloaderEl.parentNode.removeChild(preloaderEl);
    }

    if (window.GW.smoothScroll) {
      window.GW.smoothScroll.start();
    }

    if (window.GW.restore && window.GW.restoreY > 0 && window.GW.skipPreload) {
      window.GW.restore.applyRestore(function() {
        window.dispatchEvent(new CustomEvent('gw:ready'));
      });
      return;
    }

    requestAnimationFrame(function() {
      if (window.ScrollTrigger && !(window.GW.restoreY > 0)) {
        window.ScrollTrigger.refresh(true);
      }
      setTimeout(function() {
        if (window.ScrollTrigger && !(window.GW.restoreY > 0)) {
          window.ScrollTrigger.refresh(true);
        }
        window.dispatchEvent(new CustomEvent('gw:ready'));
      }, 150);
    });
  }

  window.GW.preloader = {
    init: init
  };
})();
