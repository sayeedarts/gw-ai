/**
 * rewardrobe.js — ReWardrobe count-up, pinned before/after reveal band, and cycling lifecycle captions
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var countEl = null;
  var statLine = null;
  var bandStage = null;
  var afterImg = null;
  var seam = null;
  var badgeText = null;
  var hasCounted = false;

  function init() {
    section = document.querySelector('section#rewardrobe');
    if (!section) return;

    countEl = section.querySelector('.rewardrobe__number');
    statLine = section.querySelector('.rewardrobe__stat-line');
    bandStage = section.querySelector('.rewardrobe__band-stage');
    afterImg = section.querySelector('.rewardrobe__img--after');
    seam = section.querySelector('.rewardrobe__seam');
    badgeText = section.querySelector('.rewardrobe__badge-text');

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      if (countEl) countEl.textContent = '25';
      if (statLine) statLine.style.transform = 'scaleX(1)';
      if (afterImg) afterImg.style.clipPath = 'none';
      if (seam) seam.style.display = 'none';
      return;
    }

    setupCountUp();
    setupBandPin();
  }

  function setupCountUp() {
    ScrollTrigger.create({
      trigger: countEl,
      start: 'top 65%',
      once: true,
      onEnter: function() {
        if (!hasCounted && window.GW.utils) {
          hasCounted = true;
          window.GW.utils.countUp(countEl, 25, 1.8);
          gsap.to(statLine, {
            scaleX: 1,
            duration: 1.2,
            ease: 'expo.out',
            delay: 0.3
          });
        }
      }
    });
  }

  function setupBandPin() {
    var isMobile = window.innerWidth < 768;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: bandStage,
        start: 'top top',
        end: isMobile ? '+=90%' : '+=120%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: function(self) {
          var prog = self.progress;

          // Cycling captions: RETURN. -> REWARD. -> RENEW.
          if (badgeText) {
            if (prog < 0.33) {
              badgeText.textContent = 'RETURN.';
            } else if (prog < 0.66) {
              badgeText.textContent = 'REWARD.';
            } else {
              badgeText.textContent = 'RENEW.';
            }
          }
        }
      }
    });

    tl.fromTo(afterImg, {
      clipPath: 'inset(0% 100% 0% 0%)'
    }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1,
      ease: 'none'
    }, 0)
    .fromTo(seam, {
      left: '0%'
    }, {
      left: '100%',
      duration: 1,
      ease: 'none'
    }, 0);
  }

  window.GW.rewardrobe = {
    init: init
  };
})();
