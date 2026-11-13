/**
 * technologies.js — Bento icon card reveal and pointer glow
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var grid = null;
  var cards = [];

  function init() {
    section = document.querySelector('section#technology');
    if (!section) return;

    grid = section.querySelector('.tech__grid');
    cards = Array.prototype.slice.call(section.querySelectorAll('.tech-card'));
    if (!cards.length) return;

    if (!window.GW.isReducedMotion && window.gsap && window.ScrollTrigger) {
      setupReveal();
    }

    setupPointerGlow();
  }

  function setupReveal() {
    var icons = section.querySelectorAll('.tech-card__icon');

    gsap.fromTo(cards, {
      opacity: 0,
      y: 36
    }, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: grid,
        start: 'top 82%',
        once: true
      }
    });

    if (icons.length) {
      gsap.fromTo(icons, {
        scale: 0.6,
        opacity: 0
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.15,
        ease: 'back.out(1.6)',
        scrollTrigger: {
          trigger: grid,
          start: 'top 82%',
          once: true
        }
      });
    }
  }

  function setupPointerGlow() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    cards.forEach(function(card) {
      card.addEventListener('pointermove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x.toFixed(1) + '%');
        card.style.setProperty('--my', y.toFixed(1) + '%');
      });
    });
  }

  window.GW.technologies = {
    init: init
  };
})();
