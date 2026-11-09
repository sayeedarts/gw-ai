/**
 * imagine.js — Pinned AI Style Board, typewriter prompt, flying dock cards, and circle iris reveal
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var briefInput = null;
  var cards = [];
  var links = [];
  var frameImg = null;
  var frameEl = null;
  var subLine = null;
  var footerEl = null;
  var hasTyped = false;

  function init() {
    section = document.querySelector('section#imagine');
    if (!section) return;

    briefInput = section.querySelector('.brief__text');
    cards = Array.prototype.slice.call(section.querySelectorAll('.board__card'));
    links = Array.prototype.slice.call(section.querySelectorAll('.board__link'));
    frameImg = section.querySelector('.board__frame-img');
    frameEl = section.querySelector('.board__frame');
    subLine = section.querySelector('.imagine__sub');
    footerEl = section.querySelector('.imagine__footer');

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      if (briefInput) briefInput.textContent = 'I want a complete look for my investor meeting.';
      if (frameImg) frameImg.style.clipPath = 'none';
      if (footerEl) footerEl.style.opacity = '1';
      cards.forEach(function(c) {
        c.style.transform = 'none';
        c.style.opacity = '1';
      });
      return;
    }

    setupTypewriterTrigger();
    setupBoardTimeline();
  }

  function setupTypewriterTrigger() {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      once: true,
      onEnter: function() {
        if (!hasTyped && briefInput && window.GW.utils) {
          hasTyped = true;
          window.GW.utils.typeText(briefInput, 'I want a complete look for my investor meeting.', 40);
        }
      }
    });
  }

  function setupBoardTimeline() {
    var isMobile = window.innerWidth < 1024;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: isMobile ? '+=260%' : '+=320%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1
      }
    });

    if (!isMobile) {
      // 4 cards fly in from corners
      // Card 1: Top-Left (-60vw, -40vh)
      tl.fromTo(cards[0], {
        x: '-60vw',
        y: '-40vh',
        rotate: -12,
        opacity: 0
      }, {
        x: 0,
        y: 0,
        rotate: -3,
        opacity: 1,
        duration: 0.175,
        ease: 'power3.out'
      }, 0);

      // Card 2: Top-Right (60vw, -40vh)
      tl.fromTo(cards[1], {
        x: '60vw',
        y: '-40vh',
        rotate: 12,
        opacity: 0
      }, {
        x: 0,
        y: 0,
        rotate: 3,
        opacity: 1,
        duration: 0.175,
        ease: 'power3.out'
      }, 0.175);

      // Card 3: Bottom-Left (-60vw, 40vh)
      tl.fromTo(cards[2], {
        x: '-60vw',
        y: '40vh',
        rotate: -8,
        opacity: 0
      }, {
        x: 0,
        y: 0,
        rotate: -2,
        opacity: 1,
        duration: 0.175,
        ease: 'power3.out'
      }, 0.35);

      // Card 4: Bottom-Right (60vw, 40vh)
      tl.fromTo(cards[3], {
        x: '60vw',
        y: '40vh',
        rotate: 10,
        opacity: 0
      }, {
        x: 0,
        y: 0,
        rotate: 2,
        opacity: 1,
        duration: 0.175,
        ease: 'power3.out'
      }, 0.525);

      // Draw SVG connectors
      links.forEach(function(link, idx) {
        tl.fromTo(link, {
          strokeDashoffset: 1
        }, {
          strokeDashoffset: 0,
          duration: 0.15,
          ease: 'power2.out'
        }, idx * 0.175);
      });
    } else {
      // Mobile: 2x2 slide up
      tl.fromTo(cards, {
        y: 80,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power3.out'
      }, 0);
    }

    // 70–90%: Circle Iris Reveal into final look
    tl.fromTo(frameImg, {
      clipPath: 'circle(0% at 50% 55%)'
    }, {
      clipPath: 'circle(75% at 50% 55%)',
      duration: 0.2,
      ease: 'power2.inOut'
    }, 0.7)
    .to(frameEl, {
      borderColor: '#F6C214',
      duration: 0.1
    }, 0.7);

    // 90–100%: Pulse text and fade up CTA
    tl.to(subLine, {
      scale: 1.03,
      yoyo: true,
      repeat: 1,
      duration: 0.05,
      ease: 'sine.inOut'
    }, 0.9)
    .to(footerEl, {
      opacity: 1,
      y: 0,
      duration: 0.1,
      ease: 'power2.out'
    }, 0.9);
  }

  window.GW.imagine = {
    init: init
  };
})();
