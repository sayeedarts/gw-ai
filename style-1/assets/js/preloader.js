/**
 * Green Wardrobe — preloader.js
 */
(function() {
  window.GW = window.GW || {};

  window.GW.preloader = {
    init: function() {
      var preloaderEl = document.querySelector('.js-preloader');
      if (!preloaderEl) return;

      var mainEl = document.querySelector('main');
      var headerEl = document.querySelector('header');
      var counterEl = document.querySelector('.preloader__count');
      var barEl = document.querySelector('.preloader__bar');
      var announceEl = document.querySelector('.js-preloader-announce');
      var badgeEl = document.querySelector('.preloader__badge');
      var textEl = document.querySelector('.preloader__text');

      window.scrollTo(0, 0);
      if (window.GW.smoothScroll) {
        window.GW.smoothScroll.stop();
      }
      if (mainEl) mainEl.setAttribute('inert', '');
      if (headerEl) headerEl.setAttribute('inert', '');

      var isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var hasPreloaded = false;
      try {
        hasPreloaded = sessionStorage.getItem('gw-preloaded') === 'true';
      } catch (e) {}

      var forceFull = window.location.search.indexOf('preloader=1') !== -1;
      var autoStart = window.location.search.indexOf('autostart=1') !== -1;

      var currentProgress = { val: 0 };
      var targetProgress = 0;
      var isFinished = false;

      function updateUI(val) {
        var rounded = Math.round(val);
        if (counterEl) counterEl.textContent = rounded + '%';
        if (barEl) barEl.style.transform = 'scaleX(' + (val / 100) + ')';

        if (announceEl && (rounded === 25 || rounded === 50 || rounded === 75 || rounded === 100)) {
          announceEl.textContent = 'Loading ' + rounded + ' percent';
        }
      }

      function finishPreloader() {
        if (isFinished) return;
        isFinished = true;

        try {
          sessionStorage.setItem('gw-preloaded', 'true');
        } catch (e) {}

        if (isReducedMotion) {
          preloaderEl.style.transition = 'opacity 0.4s ease';
          preloaderEl.style.opacity = '0';
          setTimeout(completeExit, 400);
          return;
        }

        if (window.gsap) {
          var tl = gsap.timeline({ onComplete: completeExit, delay: 0.35 });
          tl.to([counterEl, textEl], { y: -30, opacity: 0, duration: 0.5, ease: 'power3.in' })
            .to(badgeEl, { scale: 0.6, opacity: 0, duration: 0.6, ease: 'power2.in' }, '<')
            .to(barEl, { transformOrigin: 'right', scaleX: 0, duration: 0.7, ease: 'expo.inOut' }, '<0.1')
            .to(preloaderEl, { clipPath: 'inset(0 0 100% 0)', duration: 1.0, ease: 'expo.inOut' }, '-=0.3')
            .fromTo('body', { scale: 1.04 }, { scale: 1, duration: 1.2, ease: 'power3.out' }, '<');
        } else {
          preloaderEl.style.display = 'none';
          completeExit();
        }
      }

      function completeExit() {
        document.documentElement.classList.remove('is-loading');
        if (mainEl) mainEl.removeAttribute('inert');
        if (headerEl) headerEl.removeAttribute('inert');
        if (window.GW.smoothScroll) {
          window.GW.smoothScroll.start();
        }
        if (window.ScrollTrigger) {
          ScrollTrigger.refresh();
        }
        if (preloaderEl && preloaderEl.parentNode) {
          preloaderEl.parentNode.removeChild(preloaderEl);
        }
        setTimeout(function() {
          document.dispatchEvent(new CustomEvent('gw:ready'));
        }, 50);

        var skipTarget = document.querySelector('#main-content');
        if (skipTarget) {
          skipTarget.setAttribute('tabindex', '-1');
          skipTarget.focus();
        }
      }

      function advanceProgress(add) {
        targetProgress = Math.min(100, targetProgress + add);
        if (window.gsap) {
          gsap.to(currentProgress, {
            val: targetProgress,
            duration: 0.6,
            ease: 'power2.out',
            onUpdate: function() {
              updateUI(currentProgress.val);
            },
            onComplete: function() {
              if (targetProgress >= 100) {
                finishPreloader();
              }
            }
          });
        } else {
          currentProgress.val = targetProgress;
          updateUI(targetProgress);
          if (targetProgress >= 100) {
            finishPreloader();
          }
        }
      }

      // Fast path for returning visitors or autostart
      if (autoStart || (hasPreloaded && !forceFull)) {
        if (preloaderEl) preloaderEl.style.display = 'none';
        completeExit();
        return;
      }

      // Intro animations
      if (window.gsap && !isReducedMotion) {
        gsap.fromTo(badgeEl, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out' });
        gsap.fromTo(counterEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.4, ease: 'power3.out' });
      }

      // Weighted loader
      advanceProgress(20); // fonts / immediate start

      // Poster check
      var posterImg = new Image();
      posterImg.onload = posterImg.onerror = function() { advanceProgress(20); };
      posterImg.src = 'https://peru-jackal-882954.hostingersite.com/gw/assets/img/hero.jpg';

      // Above-fold images
      var aboveFold = [
        '/assets/img/gw-logo.svg',
        '/assets/img/scanner-booth.png',
        '/assets/img/measurement.png'
      ];
      var loadedCount = 0;
      aboveFold.forEach(function(src) {
        var img = new Image();
        img.onload = img.onerror = function() {
          loadedCount++;
          if (loadedCount === aboveFold.length) {
            advanceProgress(20);
          }
        };
        img.src = src;
      });

      // Video metadata check with 1.2s fallback timeout
      var videoMetadaAdvanced = false;
      function onVideoReady() {
        if (!videoMetadaAdvanced) {
          videoMetadaAdvanced = true;
          advanceProgress(20);
        }
      }

      var heroVideo = document.querySelector('.hero__video');
      if (heroVideo) {
        if (heroVideo.readyState >= 1) {
          onVideoReady();
        } else {
          heroVideo.addEventListener('loadedmetadata', onVideoReady, { once: true });
          heroVideo.addEventListener('error', onVideoReady, { once: true });
          setTimeout(onVideoReady, 1200);
        }
      } else {
        onVideoReady();
      }

      // Window load with 1.5s fallback
      if (document.readyState === 'complete') {
        advanceProgress(20);
      } else {
        window.addEventListener('load', function() { advanceProgress(20); }, { once: true });
        setTimeout(function() { advanceProgress(20); }, 1500);
      }

      // Hard timeout safety: 3s
      setTimeout(function() {
        if (!isFinished) {
          advanceProgress(100);
        }
      }, 3000);
    }
  };
})();
