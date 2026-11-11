/**
 * begins.js — Pinned statement fill and continuous dual-stream flying thumbnails
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var titleEl = null;
  var leadEl = null;
  var leftStream = null;
  var rightStream = null;
  var leftThumbs = [];
  var rightThumbs = [];

  function init() {
    section = document.querySelector('section#begins');
    if (!section) return;

    titleEl = section.querySelector('.begins__title');
    leadEl = section.querySelector('.begins__lead');
    leftStream = section.querySelector('.begins__stream--left');
    rightStream = section.querySelector('.begins__stream--right');
    leftThumbs = Array.prototype.slice.call(section.querySelectorAll('.begins__stream--left .begins__thumb'));
    rightThumbs = Array.prototype.slice.call(section.querySelectorAll('.begins__stream--right .begins__thumb'));

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      if (leftStream) leftStream.classList.add('is-static');
      if (rightStream) rightStream.classList.add('is-static');
      return;
    }

    setupBeginsTimeline();
  }

  function setupBeginsTimeline() {
    var isMobile = window.innerWidth < 768;

    // Split words with clean reusable helper
    var titleWords = window.GW.utils && window.GW.utils.splitWords ? window.GW.utils.splitWords(titleEl) : [];
    var leadWords = window.GW.utils && window.GW.utils.splitWords ? window.GW.utils.splitWords(leadEl) : [];
    var allWords = titleWords.concat(leadWords);

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: isMobile ? '+=160%' : '+=180%',
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // B3. Continuous split-text fill: 0 -> 0.80
    // Title words turn to gold, paragraph words stay ivory
    if (allWords.length > 0) {
      tl.to(titleWords, {
        opacity: 1,
        color: '#F6C214',
        duration: 0.08,
        stagger: {
          amount: (titleWords.length / allWords.length) * 0.72
        },
        ease: 'none'
      }, 0);

      if (leadWords.length > 0) {
        tl.to(leadWords, {
          opacity: 1,
          duration: 0.08,
          stagger: {
            amount: (leadWords.length / allWords.length) * 0.72
          },
          ease: 'none'
        }, (titleWords.length / allWords.length) * 0.72);
      }
    }

    // B4. Flying thumbnails across left and right streams
    var animateStream = function(thumbs, isRight) {
      thumbs.forEach(function(thumb, i) {
        var speed = parseFloat(thumb.getAttribute('data-speed')) || 1;
        var rot = parseFloat(thumb.getAttribute('data-rot')) || 0;

        tl.fromTo(thumb, {
          y: function() {
            var vh = window.innerHeight;
            return vh * (1.0 + 0.6 * i + (isRight ? 0.3 : 0));
          },
          rotation: rot
        }, {
          y: function() {
            var vh = window.innerHeight;
            var startY = vh * (1.0 + 0.6 * i + (isRight ? 0.3 : 0));
            return startY - vh * 4.2 * speed;
          },
          rotation: rot * -0.5,
          duration: 1,
          ease: 'none'
        }, 0);
      });
    };

    animateStream(leftThumbs, false);
    animateStream(rightThumbs, true);
  }

  window.GW.begins = {
    init: init
  };
})();
