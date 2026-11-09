/**
 * cta.js — Final CTA entrance reveals, arch portrait parallax, and magnetic button physics
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var portraitFrame = null;
  var portraitImg = null;
  var headline = null;
  var btn = null;

  function init() {
    section = document.querySelector('section#book');
    if (!section) return;

    portraitFrame = section.querySelector('.final-cta__portrait-frame');
    portraitImg = section.querySelector('.final-cta__portrait-img');
    headline = section.querySelector('.final-cta__title');
    btn = section.querySelector('.btn-cta--solid');

    if (window.GW.isReducedMotion || !window.gsap) {
      if (portraitFrame) portraitFrame.style.clipPath = 'none';
      if (btn) btn.style.opacity = '1';
      return;
    }

    setupEntrance();
    setupMagneticButton();
  }

  function setupEntrance() {
    // Frame reveal
    gsap.fromTo(portraitFrame, {
      clipPath: 'inset(100% 0% 0% 0%)'
    }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.2,
      ease: 'expo.inOut',
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        once: true
      }
    });

    // Image Parallax
    if (portraitImg && window.ScrollTrigger) {
      gsap.fromTo(portraitImg, {
        yPercent: -10
      }, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    // Headline reveal & button fade
    var lines = headline ? headline.querySelectorAll('.line__inner') : [];
    if (lines.length && window.ScrollTrigger) {
      gsap.fromTo(lines, {
        yPercent: 110
      }, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.14,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: headline,
          start: 'top 80%',
          once: true
        }
      });
    }

    if (btn && window.ScrollTrigger) {
      gsap.fromTo(btn, {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.3,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headline,
          start: 'top 80%',
          once: true
        }
      });
    }
  }

  function setupMagneticButton() {
    if (!btn || window.matchMedia('(pointer: coarse)').matches) return;

    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var btnCenterX = rect.left + rect.width / 2;
      var btnCenterY = rect.top + rect.height / 2;

      var deltaX = (e.clientX - btnCenterX) * 0.35;
      var deltaY = (e.clientY - btnCenterY) * 0.35;

      // Cap at 12px
      var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (dist > 12) {
        var angle = Math.atan2(deltaY, deltaX);
        deltaX = Math.cos(angle) * 12;
        deltaY = Math.sin(angle) * 12;
      }

      gsap.to(btn, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', function() {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  }

  window.GW.cta = {
    init: init
  };
})();
