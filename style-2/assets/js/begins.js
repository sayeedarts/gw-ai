/**
 * begins.js — Pinned word-by-word reveal and drifting background collage
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var eyebrow = null;
  var headlineWords = [];
  var leadWords = [];
  var cards = [];

  function init() {
    section = document.querySelector('section#begins');
    if (!section) return;

    eyebrow = section.querySelector('.begins__eyebrow');
    headlineWords = Array.prototype.slice.call(section.querySelectorAll('.begins__word'));
    leadWords = Array.prototype.slice.call(section.querySelectorAll('.begins__lead-word'));
    cards = Array.prototype.slice.call(section.querySelectorAll('.begins__card'));

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      if (eyebrow) eyebrow.style.opacity = '1';
      headlineWords.forEach(function(w) { w.style.opacity = '1'; });
      leadWords.forEach(function(w) { w.style.opacity = '1'; });
      cards.forEach(function(c) { c.style.opacity = '0.35'; });
      return;
    }

    // Eyebrow entrance before pin
    gsap.fromTo(eyebrow, { opacity: 0, y: 20 }, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true
      }
    });

    var isMobile = window.innerWidth < 768;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: isMobile ? '+=200%' : '+=240%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1
      }
    });

    // 0–60%: Headline words light from 0.15 to 1
    tl.fromTo(headlineWords, {
      opacity: 0.15,
      yPercent: 30
    }, {
      opacity: 1,
      yPercent: 0,
      color: '#F6C214',
      stagger: 0.1,
      duration: 0.6,
      ease: 'none'
    }, 0);

    // 45–90%: Paragraph words rise from 0.15 to 1
    tl.fromTo(leadWords, {
      opacity: 0.15,
      yPercent: 20
    }, {
      opacity: 1,
      yPercent: 0,
      stagger: 0.05,
      duration: 0.45,
      ease: 'none'
    }, 0.45);

    // Cards drift
    if (cards[0]) {
      tl.to(cards[0], { yPercent: -18, rotate: '-=2', duration: 1, ease: 'none' }, 0);
    }
    if (cards[1]) {
      tl.to(cards[1], { yPercent: 12, rotate: '+=2', duration: 1, ease: 'none' }, 0);
    }
    if (cards[2]) {
      tl.to(cards[2], { yPercent: -8, rotate: '-=2', duration: 1, ease: 'none' }, 0);
    }

    tl.to(cards, { opacity: 0.45, duration: 0.3, ease: 'none' }, 0.7);
  }

  window.GW.begins = {
    init: init
  };
})();
