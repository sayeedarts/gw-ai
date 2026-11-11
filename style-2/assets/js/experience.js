/**
 * experience.js — Pinned horizontal rail, single-source node/card synchronization,
 * snapping, and mouse/touch swipe physics
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var stage = null;
  var track = null;
  var cards = [];
  var lineFill = null;
  var nodes = [];
  var scrollTriggerInst = null;
  var currentIndex = 0;

  function init() {
    section = document.querySelector('section#experience');
    if (!section) return;

    stage = section.querySelector('.experience__stage');
    track = section.querySelector('.experience__track');
    cards = Array.prototype.slice.call(section.querySelectorAll('.exp-card'));
    lineFill = section.querySelector('.experience__line-fill');
    nodes = Array.prototype.slice.call(section.querySelectorAll('.experience__node'));

    if (cards.length === 0) return;

    // Single initial state: index 0
    setActiveStep(0);

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      if (track) track.classList.add('is-static');
      return;
    }

    setupHorizontalScroll();
    setupDragInteraction();
    setupKeyboardNav();
  }

  function setActiveStep(index) {
    currentIndex = index;
    var stepStr = String(index);

    cards.forEach(function(card) {
      if (card.getAttribute('data-step') === stepStr) {
        card.classList.add('is-current');
      } else {
        card.classList.remove('is-current');
      }
    });

    nodes.forEach(function(node) {
      if (node.getAttribute('data-step') === stepStr) {
        node.classList.add('is-active');
      } else {
        node.classList.remove('is-active');
      }
    });
  }

  function getCardCenterOffset(card) {
    return window.innerWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
  }

  function setupHorizontalScroll() {
    var isMobile = window.innerWidth < 768;
    var n = cards.length;
    if (n <= 1) return;

    // Set initial position centered on card 0
    gsap.set(track, { x: function() { return getCardCenterOffset(cards[0]); } });

    var tl = gsap.timeline();
    for (var i = 1; i < n; i++) {
      (function(targetCard) {
        tl.to(track, {
          x: function() { return getCardCenterOffset(targetCard); },
          duration: 1,
          ease: 'none'
        });
      })(cards[i]);
    }

    scrollTriggerInst = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: isMobile ? '+=520%' : '+=700%',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: tl,
      snap: {
        snapTo: 1 / (n - 1),
        duration: { min: 0.2, max: 0.6 },
        delay: 0.05,
        ease: 'power2.inOut'
      },
      onUpdate: function(self) {
        var prog = self.progress;

        // Progress line fill
        if (lineFill && window.gsap) {
          gsap.set(lineFill, { scaleX: prog });
        }

        // Single index source of truth
        var newIdx = Math.min(n - 1, Math.max(0, Math.round(prog * (n - 1))));
        if (newIdx !== currentIndex) {
          setActiveStep(newIdx);
        }
      }
    });

    // Node click
    nodes.forEach(function(node) {
      node.addEventListener('click', function() {
        var step = parseInt(node.getAttribute('data-step'), 10) || 0;
        scrollToStep(step);
      });
    });

    // Card click
    cards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        var link = card.querySelector('.exp-card__link');
        if (link && (e.target === link || link.contains(e.target))) {
          var href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            if (window.GW.smoothScroll) {
              window.GW.smoothScroll.scrollTo(href);
            }
          }
        } else {
          var step = parseInt(card.getAttribute('data-step'), 10) || 0;
          scrollToStep(step);
        }
      });
    });
  }

  function scrollToStep(step, duration) {
    if (!scrollTriggerInst) return;
    var n = cards.length;
    var targetProgress = Math.min(1, Math.max(0, step / (n - 1)));
    var targetScroll = scrollTriggerInst.start + (scrollTriggerInst.end - scrollTriggerInst.start) * targetProgress;

    if (window.GW.smoothScroll) {
      window.GW.smoothScroll.scrollTo(targetScroll, { duration: duration || 0.6 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }

  function setupDragInteraction() {
    if (!track) return;

    var isDragging = false;
    var startX = 0;
    var startProgress = 0;
    var lastX = 0;
    var lastTime = 0;
    var velocity = 0;
    var hasMoved = false;

    track.addEventListener('pointerdown', function(e) {
      // Don't drag if clicking link
      if (e.target.closest('a')) return;
      if (!scrollTriggerInst) return;

      isDragging = true;
      hasMoved = false;
      startX = e.clientX;
      lastX = e.clientX;
      lastTime = Date.now();
      velocity = 0;
      startProgress = scrollTriggerInst.progress;

      track.setPointerCapture(e.pointerId);
      track.classList.add('is-dragging');
    });

    track.addEventListener('pointermove', function(e) {
      if (!isDragging || !scrollTriggerInst) return;

      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) {
        hasMoved = true;
      }

      var now = Date.now();
      var dt = now - lastTime;
      if (dt > 0) {
        velocity = (e.clientX - lastX) / dt;
        lastX = e.clientX;
        lastTime = now;
      }

      var n = cards.length;
      var cardStep = 320;
      if (cards.length > 1) {
        cardStep = Math.abs(cards[1].offsetLeft - cards[0].offsetLeft) || 320;
      }

      var progressDelta = -dx / (cardStep * (n - 1));
      var newProgress = Math.min(1, Math.max(0, startProgress + progressDelta));
      var targetScroll = scrollTriggerInst.start + (scrollTriggerInst.end - scrollTriggerInst.start) * newProgress;

      var lenis = window.GW.smoothScroll && window.GW.smoothScroll.getLenis ? window.GW.smoothScroll.getLenis() : null;
      if (lenis) {
        lenis.scrollTo(targetScroll, { immediate: true });
      } else {
        window.scrollTo(0, targetScroll);
      }
    });

    var endDrag = function(e) {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('is-dragging');

      try {
        track.releasePointerCapture(e.pointerId);
      } catch (err) {}

      if (!scrollTriggerInst) return;
      var n = cards.length;
      var curProg = scrollTriggerInst.progress;
      var targetStep = Math.round(curProg * (n - 1));

      // Inertia flick support
      if (Math.abs(velocity) > 0.4) {
        if (velocity < -0.4 && targetStep < n - 1) {
          targetStep += 1;
        } else if (velocity > 0.4 && targetStep > 0) {
          targetStep -= 1;
        }
      }

      scrollToStep(targetStep, 0.6);
    };

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    // Suppress clicks if dragged
    track.addEventListener('click', function(e) {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  function setupKeyboardNav() {
    if (!stage) return;
    stage.setAttribute('tabindex', '0');
    stage.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < cards.length - 1) {
          scrollToStep(currentIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          scrollToStep(currentIndex - 1);
        }
      }
    });
  }

  window.GW.experience = {
    init: init
  };
})();
