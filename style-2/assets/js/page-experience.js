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


  function initStepsPin() {
  var steps  = document.querySelector('.steps');
  if (!steps || !window.gsap || !window.ScrollTrigger) return;

  var visual = steps.querySelector('.steps__visual');
  var list   = steps.querySelector('.steps__list');
  var HEADER = 100; // px gap under your fixed header (header ~76px + breathing room)

  var mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', function () {
    ScrollTrigger.create({
      trigger: visual,
      start: 'top top+=' + HEADER,
      endTrigger: list,
      // release when the list's bottom edge meets the visual's bottom edge
      end: function () { return 'bottom ' + (HEADER + visual.offsetHeight) + 'px'; },
      pin: visual,
      pinSpacing: false,        // the list already supplies the height
      anticipatePin: 1,
      invalidateOnRefresh: true
    });
  });
  // below 992px nothing is pinned, matchMedia cleans up automatically on resize
}

// call it after GSAP + ScrollTrigger are registered, e.g. in your init:
initStepsPin();

  window.GW.pageExperience = {
    init: init
  };
})();
