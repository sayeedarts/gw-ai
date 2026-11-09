/**
 * machines.js — Cut to stitch horizontal wipe, opposite drift, and label/counter swaps
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var stitchLayer = null;
  var seam = null;
  var cutImg = null;
  var stitchImg = null;
  var labelEl = null;
  var counterEl = null;

  function init() {
    section = document.querySelector('section#machines');
    if (!section) return;

    stitchLayer = section.querySelector('.machines__layer--stitch');
    seam = section.querySelector('.machines__seam');
    cutImg = section.querySelector('.machines__layer--cut img');
    stitchImg = section.querySelector('.machines__layer--stitch img');
    labelEl = section.querySelector('.machines__label-text');
    counterEl = section.querySelector('.machines__counter');

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      if (stitchLayer) stitchLayer.style.clipPath = 'none';
      if (seam) seam.style.display = 'none';
      return;
    }

    setupMachinesTimeline();
  }

  function setupMachinesTimeline() {
    var isMobile = window.innerWidth < 768;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: isMobile ? '+=200%' : '+=250%',
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        onUpdate: function(self) {
          var prog = self.progress;

          // Swap CUT -> STITCH and 01/02 -> 02/02 at 50%
          if (prog >= 0.5) {
            if (labelEl) labelEl.textContent = 'STITCH';
            if (counterEl) counterEl.textContent = '02 / 02';
          } else {
            if (labelEl) labelEl.textContent = 'CUT';
            if (counterEl) counterEl.textContent = '01 / 02';
          }
        }
      }
    });

    // 10% to 90%: Wipe stitch layer and drift
    tl.fromTo(stitchLayer, {
      clipPath: 'inset(0% 100% 0% 0%)'
    }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.8,
      ease: 'none'
    }, 0.1)
    .fromTo(seam, {
      left: '0%'
    }, {
      left: '100%',
      duration: 0.8,
      ease: 'none'
    }, 0.1)
    .to(cutImg, {
      xPercent: -3,
      duration: 0.8,
      ease: 'none'
    }, 0.1)
    .to(stitchImg, {
      xPercent: 3,
      duration: 0.8,
      ease: 'none'
    }, 0.1);
  }

  window.GW.machines = {
    init: init
  };
})();
