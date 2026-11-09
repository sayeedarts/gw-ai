/**
 * experience.js — Pinned horizontal rail, progress track, and center-card tracking
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

  function init() {
    section = document.querySelector('section#experience');
    if (!section) return;

    stage = section.querySelector('.experience__stage');
    track = section.querySelector('.experience__track');
    cards = Array.prototype.slice.call(section.querySelectorAll('.exp-card'));
    lineFill = section.querySelector('.experience__line-fill');
    nodes = Array.prototype.slice.call(section.querySelectorAll('.experience__node'));

    if (cards.length > 0) {
      cards[0].classList.add('is-current');
    }

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      cards.forEach(function(c) {
        c.classList.add('is-current');
      });
      return;
    }

    setupHorizontalScroll();
  }

  function setupHorizontalScroll() {
    var isMobile = window.innerWidth < 768;

    function getScrollDistance() {
      return track.scrollWidth - window.innerWidth + 80;
    }

    var scrollDistance = getScrollDistance();

    var st = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: isMobile ? '+=520%' : '+=700%',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: gsap.to(track, {
        x: function() { return -getScrollDistance(); },
        ease: 'none'
      }),
      onUpdate: function(self) {
        var prog = self.progress;

        // Progress line fill
        if (lineFill) {
          lineFill.style.transform = 'scaleX(' + prog + ')';
        }

        // Active node
        var activeIdx = Math.min(cards.length - 1, Math.floor(prog * cards.length));
        nodes.forEach(function(node, idx) {
          if (idx === activeIdx) node.classList.add('is-active');
          else node.classList.remove('is-active');
        });

        // Center card detection
        var centerX = window.innerWidth / 2;
        var closestCard = null;
        var minDiff = Infinity;

        cards.forEach(function(card) {
          var rect = card.getBoundingClientRect();
          var cardCenter = rect.left + rect.width / 2;
          var diff = Math.abs(centerX - cardCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestCard = card;
          }
        });

        cards.forEach(function(card) {
          if (card === closestCard) {
            card.classList.add('is-current');
          } else {
            card.classList.remove('is-current');
          }
        });
      }
    });

    // Node clicking to jump
    nodes.forEach(function(node, idx) {
      node.addEventListener('click', function() {
        var targetProgress = idx / (cards.length - 1);
        var targetScroll = st.start + (st.end - st.start) * targetProgress;
        if (window.GW.smoothScroll) {
          window.GW.smoothScroll.scrollTo(targetScroll);
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      });
    });

    // Card clicking to jump or navigate
    cards.forEach(function(card, idx) {
      card.addEventListener('click', function(e) {
        var link = card.querySelector('.exp-card__link');
        if (e.target === link || link.contains(e.target)) {
          var href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            if (window.GW.smoothScroll) {
              window.GW.smoothScroll.scrollTo(href);
            }
          }
        } else {
          var targetProgress = idx / (cards.length - 1);
          var targetScroll = st.start + (st.end - st.start) * targetProgress;
          if (window.GW.smoothScroll) {
            window.GW.smoothScroll.scrollTo(targetScroll);
          }
        }
      });
    });
  }

  window.GW.experience = {
    init: init
  };
})();
