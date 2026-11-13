/**
 * page-experience.js — Sticky visual cross-fade synced with 8-step vertical timeline
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  function init() {
    var root = document.querySelector('[data-page="experience"]');
    if (!root) return;

    var steps = Array.prototype.slice.call(document.querySelectorAll('.step-item'));
    var visuals = Array.prototype.slice.call(document.querySelectorAll('.steps__visual-img'));
    var counter = document.querySelector('.steps__visual-step');
    if (!steps.length || !visuals.length) return;

    function setActiveStep(idx) {
      steps.forEach(function(step, i) {
        if (i === idx) {
          step.classList.add('is-active');
        } else {
          step.classList.remove('is-active');
        }
      });

      visuals.forEach(function(img, i) {
        if (i === idx) {
          img.classList.add('is-active');
        } else {
          img.classList.remove('is-active');
        }
      });

      if (counter) {
        counter.textContent = (idx < 9 ? '0' : '') + (idx + 1) + ' / 0' + steps.length;
      }
    }

    setActiveStep(0);

    if (window.ScrollTrigger && !window.GW.isReducedMotion) {
      steps.forEach(function(step, idx) {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: function() { setActiveStep(idx); },
          onEnterBack: function() { setActiveStep(idx); }
        });
      });
    }

    steps.forEach(function(step, idx) {
      step.addEventListener('click', function() {
        setActiveStep(idx);
      });
    });
  }

  window.GW.pageExperience = {
    init: init
  };
})();
