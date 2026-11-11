/**
 * final-results.js — Dual opposite-direction marquee rows of bespoke looks,
 * scroll velocity boost, hover slowdown, and headline illumination (Task H)
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var headlineWords = [];
  var row1 = null;
  var row2 = null;
  var tween1 = null;
  var tween2 = null;

  function init() {
    section = document.querySelector('section#final');
    if (!section) return;

    headlineWords = Array.prototype.slice.call(section.querySelectorAll('.final__word'));
    row1 = section.querySelector('.final__row--left');
    row2 = section.querySelector('.final__row--right');

    if (!row1 || !row2) return;

    if (window.GW.isReducedMotion || !window.gsap) {
      row1.classList.add('is-static');
      row2.classList.add('is-static');
      headlineWords.forEach(function(w) { w.classList.add('is-lit'); });
      return;
    }

    setupHeadlineReveal();
    setupMarquees();
    setupVelocityBoost();

    // Rebuild marquee on resize
    if (window.GW.utils && window.GW.utils.debounce) {
      window.addEventListener('resize', window.GW.utils.debounce(function() {
        setupMarquees();
      }, 200));
    }
  }

  function setupHeadlineReveal() {
    if (!headlineWords.length || !window.ScrollTrigger) return;

    gsap.fromTo(headlineWords, {
      opacity: 0.2,
      color: '#F5F3EC'
    }, {
      opacity: 1,
      color: '#F6C214',
      duration: 0.5,
      stagger: 0.35,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 65%',
        once: true
      }
    });
  }

  function prepareTrack(row) {
    var track = row.querySelector('.final__track');
    var originalSet = track.querySelector('.final__set');
    if (!track || !originalSet) return null;

    // Remove any previously cloned sets
    var oldClones = track.querySelectorAll('.final__set--clone');
    Array.prototype.forEach.call(oldClones, function(c) {
      c.parentNode.removeChild(c);
    });

    // Check width against viewport
    var vpWidth = window.innerWidth;
    var setWidth = originalSet.scrollWidth;
    if (setWidth < vpWidth * 1.2) {
      var items = Array.prototype.slice.call(originalSet.children);
      while (originalSet.scrollWidth < vpWidth * 1.2 && items.length) {
        items.forEach(function(it) {
          originalSet.appendChild(it.cloneNode(true));
        });
      }
    }

    // Clone whole set once for seamless loop
    var clonedSet = originalSet.cloneNode(true);
    clonedSet.classList.add('final__set--clone');
    clonedSet.setAttribute('aria-hidden', 'true');
    var focusables = clonedSet.querySelectorAll('a, button, input, [tabindex]');
    Array.prototype.forEach.call(focusables, function(f) {
      f.setAttribute('tabindex', '-1');
    });
    track.appendChild(clonedSet);

    return track;
  }

  function setupMarquees() {
    if (tween1) tween1.kill();
    if (tween2) tween2.kill();

    var track1 = prepareTrack(row1);
    var track2 = prepareTrack(row2);
    if (!track1 || !track2) return;

    // Row 1: Leftward marquee (xPercent: -50)
    gsap.set(track1, { xPercent: 0 });
    tween1 = gsap.to(track1, {
      xPercent: -50,
      duration: 50,
      ease: 'none',
      repeat: -1
    });

    // Row 2: Rightward marquee (offset start, animates -50 -> 0)
    gsap.set(track2, { xPercent: -25 });
    tween2 = gsap.fromTo(track2, {
      xPercent: -50
    }, {
      xPercent: 0,
      duration: 60,
      ease: 'none',
      repeat: -1
    });

    // Hover slowdown for fine pointer devices
    var bindHover = function(rowEl, tween) {
      if (window.matchMedia('(pointer: fine)').matches) {
        rowEl.addEventListener('mouseenter', function() {
          gsap.to(tween, { timeScale: 0.15, duration: 0.5, ease: 'power2.out' });
        });
        rowEl.addEventListener('mouseleave', function() {
          gsap.to(tween, { timeScale: 1, duration: 0.5, ease: 'power2.out' });
        });
        rowEl.addEventListener('focusin', function() {
          tween.pause();
        });
        rowEl.addEventListener('focusout', function() {
          tween.play();
        });
      }
    };

    bindHover(row1, tween1);
    bindHover(row2, tween2);

    // Pause when off-screen
    if (window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: function(self) {
          if (self.isActive) {
            tween1.play();
            tween2.play();
          } else {
            tween1.pause();
            tween2.pause();
          }
        }
      });
    }
  }

  function setupVelocityBoost() {
    if (!window.ScrollTrigger) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: function(self) {
        var velocity = self.getVelocity();
        var boost = 1 + Math.min(Math.abs(velocity) / 700, 3);

        if (tween1 && tween2) {
          gsap.to([tween1, tween2], {
            timeScale: boost,
            duration: 0.25,
            overwrite: 'auto'
          });
          gsap.to([tween1, tween2], {
            timeScale: 1,
            duration: 1,
            delay: 0.25,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      }
    });
  }

  window.GW.finalResults = {
    init: init
  };
})();
