/**
 * final-results.js — Final Looks iris wipe, headline lighting in thirds, and interactive toggle sync
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var indianLayer = null;
  var headlineWords = [];
  var lookLabel = null;
  var toggleBtns = [];
  var ctaWrap = null;
  var scrollTriggerInst = null;

  function init() {
    section = document.querySelector('section#final');
    if (!section) return;

    indianLayer = section.querySelector('.final__layer--indian');
    headlineWords = Array.prototype.slice.call(section.querySelectorAll('.final__word'));
    lookLabel = section.querySelector('.final__label');
    toggleBtns = Array.prototype.slice.call(section.querySelectorAll('.final__toggle-btn'));
    ctaWrap = section.querySelector('.final__cta-wrap');

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      if (indianLayer) indianLayer.style.clipPath = 'none';
      headlineWords.forEach(function(w) { w.style.color = '#F6C214'; });
      if (ctaWrap) ctaWrap.style.opacity = '1';
      return;
    }

    setupFinalTimeline();
    setupToggleClicks();
  }

  function setupFinalTimeline() {
    var isMobile = window.innerWidth < 768;
    var irisCenter = isMobile ? '50% 66%' : '50% 62%';

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: isMobile ? '+=200%' : '+=260%',
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        onUpdate: function(self) {
          scrollTriggerInst = self;
          var prog = self.progress;

          // Swap labels and toggle buttons at 50%
          if (prog >= 0.5) {
            if (lookLabel) lookLabel.textContent = 'TRADITIONAL INDIAN';
            if (toggleBtns[1]) toggleBtns[1].classList.add('is-active');
            if (toggleBtns[0]) toggleBtns[0].classList.remove('is-active');
          } else {
            if (lookLabel) lookLabel.textContent = 'WESTERN FORMAL';
            if (toggleBtns[0]) toggleBtns[0].classList.add('is-active');
            if (toggleBtns[1]) toggleBtns[1].classList.remove('is-active');
          }
        }
      }
    });

    // Iris wipe 0% to 100%
    tl.fromTo(indianLayer, {
      clipPath: 'circle(0% at ' + irisCenter + ')'
    }, {
      clipPath: 'circle(150% at ' + irisCenter + ')',
      duration: 1,
      ease: 'none'
    }, 0);

    // Three headline words light in thirds
    if (headlineWords[0]) {
      tl.to(headlineWords[0], { color: '#F6C214', duration: 0.33, ease: 'none' }, 0);
    }
    if (headlineWords[1]) {
      tl.to(headlineWords[1], { color: '#F6C214', duration: 0.33, ease: 'none' }, 0.33);
    }
    if (headlineWords[2]) {
      tl.to(headlineWords[2], { color: '#F6C214', duration: 0.34, ease: 'none' }, 0.66);
    }

    // CTA fades up at 95%
    tl.to(ctaWrap, {
      opacity: 1,
      y: 0,
      duration: 0.05,
      ease: 'power2.out'
    }, 0.95);
  }

  function setupToggleClicks() {
    toggleBtns.forEach(function(btn, idx) {
      btn.addEventListener('click', function() {
        if (!scrollTriggerInst) return;
        var targetProgress = idx === 0 ? 0.05 : 0.95;
        var targetScroll = scrollTriggerInst.start + (scrollTriggerInst.end - scrollTriggerInst.start) * targetProgress;

        if (window.GW.smoothScroll) {
          window.GW.smoothScroll.scrollTo(targetScroll);
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      });
    });
  }

  window.GW.finalResults = {
    init: init
  };
})();
