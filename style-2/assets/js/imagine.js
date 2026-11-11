/**
 * imagine.js — Style Studio thumbnail gallery, scroll segments, slide transitions,
 * and typewriter prompt trigger
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var briefInput = null;
  var slides = [];
  var thumbs = [];
  var badgeEl = null;
  var numEl = null;
  var captionEl = null;
  var counterEl = null;
  var progressBar = null;
  var progressLabel = null;
  var yourLookBtn = null;
  var scrollTriggerInst = null;

  var currentIndex = 0;
  var hasTyped = false;
  var seenCategories = { 0: true };
  var hasPulsed = false;

  var categories = [
    { num: '01', name: 'OUTFIT', caption: 'Curated Blazer & Trouser Silhouettes' },
    { num: '02', name: 'FABRIC & COLOURS', caption: 'High-Twist Wool & Bespoke Palette' },
    { num: '03', name: 'ACCESSORIES', caption: 'Handcrafted Timepiece & Pocket Accent' },
    { num: '04', name: 'HAIR & GROOMING', caption: 'AI Facial Feature & Styling Analysis' },
    { num: '05', name: 'YOUR LOOK', caption: 'The Complete Bespoke Presentation' }
  ];

  function init() {
    section = document.querySelector('section#imagine');
    if (!section) return;

    briefInput = section.querySelector('.brief__text');
    slides = Array.prototype.slice.call(section.querySelectorAll('.studio__slide'));
    thumbs = Array.prototype.slice.call(section.querySelectorAll('.studio__thumb'));
    badgeEl = section.querySelector('.studio__badge');
    numEl = section.querySelector('.studio__num');
    captionEl = section.querySelector('.studio__caption');
    counterEl = section.querySelector('.studio__counter');
    progressBar = section.querySelector('.studio__progress-fill');
    progressLabel = section.querySelector('.studio__progress-count');
    yourLookBtn = section.querySelector('.studio__thumb--final');

    if (slides.length === 0) return;

    setupInitialState();
    setupTypewriterTrigger();

    if (window.GW.isReducedMotion || !window.gsap) {
      setupThumbClicks(false);
      return;
    }

    setupStudioTimeline();
    setupThumbClicks(true);
    setupKeyboardNav();
    setupTouchSwipe();
  }

  function setupInitialState() {
    slides.forEach(function(slide, idx) {
      if (idx === 0) {
        slide.classList.add('is-active');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.classList.remove('is-active');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    thumbs.forEach(function(thumb, idx) {
      if (idx === 0) {
        thumb.classList.add('is-active', 'is-seen');
        thumb.setAttribute('aria-selected', 'true');
      } else {
        thumb.classList.remove('is-active');
        thumb.setAttribute('aria-selected', 'false');
      }
    });

    updateOverlays(0);
  }

  function updateOverlays(idx) {
    var cat = categories[idx] || categories[0];
    if (badgeEl) badgeEl.textContent = cat.num + ' · ' + cat.name;
    if (numEl) numEl.textContent = cat.num;
    if (captionEl) captionEl.textContent = cat.caption;
    if (counterEl) {
      counterEl.textContent = idx === 4 ? 'FINAL LOOK' : (idx + 1) + ' / 4';
    }

    // Update seen count (categories 0 to 3)
    seenCategories[idx] = true;
    var seenCount = 0;
    for (var k = 0; k < 4; k++) {
      if (seenCategories[k]) seenCount++;
    }

    if (progressBar && window.gsap) {
      var pct = Math.round((seenCount / 4) * 100);
      gsap.set(progressBar, { scaleX: pct / 100 });
    }
    if (progressLabel) {
      progressLabel.textContent = seenCount + ' / 4 Explored';
    }

    if (seenCount === 4 && !hasPulsed && yourLookBtn && window.gsap) {
      hasPulsed = true;
      gsap.fromTo(yourLookBtn, {
        boxShadow: '0 0 0 0 rgba(246, 194, 20, 0.7)'
      }, {
        boxShadow: '0 0 0 16px rgba(246, 194, 20, 0)',
        duration: 0.8,
        ease: 'power2.out'
      });
    }
  }

  function setActive(newIndex, direction) {
    if (newIndex === currentIndex) return;
    var oldIndex = currentIndex;
    currentIndex = newIndex;

    // Update thumb state
    thumbs.forEach(function(thumb, idx) {
      if (idx === newIndex) {
        thumb.classList.add('is-active', 'is-seen');
        thumb.setAttribute('aria-selected', 'true');
      } else {
        thumb.classList.remove('is-active');
        thumb.setAttribute('aria-selected', 'false');
      }
    });

    updateOverlays(newIndex);

    var prevSlide = slides[oldIndex];
    var nextSlide = slides[newIndex];
    if (!prevSlide || !nextSlide) return;

    if (window.GW.isReducedMotion || !window.gsap) {
      prevSlide.classList.remove('is-active');
      prevSlide.setAttribute('aria-hidden', 'true');
      nextSlide.classList.add('is-active');
      nextSlide.setAttribute('aria-hidden', 'false');
      return;
    }

    var nextImg = nextSlide.querySelector('img');
    var prevImg = prevSlide.querySelector('img');

    // Make nextSlide visible above
    nextSlide.classList.add('is-active');
    nextSlide.setAttribute('aria-hidden', 'false');

    if (newIndex === 4) {
      // Index 4: circle iris reveal
      gsap.fromTo(nextSlide, {
        clipPath: 'circle(0% at 50% 55%)'
      }, {
        clipPath: 'circle(85% at 50% 55%)',
        duration: 1.1,
        ease: 'power2.inOut',
        onComplete: function() {
          prevSlide.classList.remove('is-active');
          prevSlide.setAttribute('aria-hidden', 'true');
        }
      });
    } else {
      var isForward = direction !== undefined ? direction > 0 : newIndex > oldIndex;
      var startClip = isForward ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)';

      gsap.fromTo(nextSlide, {
        clipPath: startClip
      }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.9,
        ease: 'expo.inOut',
        onComplete: function() {
          prevSlide.classList.remove('is-active');
          prevSlide.setAttribute('aria-hidden', 'true');
        }
      });

      if (nextImg) {
        gsap.fromTo(nextImg, { scale: 1.15 }, { scale: 1, duration: 1.1, ease: 'power3.out' });
      }
      if (prevImg) {
        gsap.to(prevImg, { scale: 1.06, duration: 0.8, ease: 'power2.out' });
      }
    }
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

  function setupStudioTimeline() {
    var isDesktop = window.innerWidth >= 1024;
    if (!isDesktop) return;

    scrollTriggerInst = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=260%',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: function(self) {
        var prog = self.progress;
        var newIdx = Math.min(4, Math.floor(prog * 5));
        if (newIdx !== currentIndex) {
          setActive(newIdx, newIdx - currentIndex);
        }
      }
    });
  }

  function setupThumbClicks(isAnimated) {
    thumbs.forEach(function(thumb, idx) {
      thumb.addEventListener('click', function(e) {
        e.preventDefault();
        if (scrollTriggerInst && window.innerWidth >= 1024) {
          // Segment midpoints: 0.1, 0.3, 0.5, 0.7, 0.9
          var targetProgress = (idx + 0.5) / 5;
          var targetScroll = scrollTriggerInst.start + (scrollTriggerInst.end - scrollTriggerInst.start) * targetProgress;
          if (window.GW.smoothScroll) {
            window.GW.smoothScroll.scrollTo(targetScroll);
          } else {
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          }
        } else {
          setActive(idx, idx - currentIndex);
        }
      });
    });
  }

  function setupKeyboardNav() {
    thumbs.forEach(function(thumb, idx) {
      thumb.addEventListener('keydown', function(e) {
        var nextIdx = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIdx = (idx + 1) % thumbs.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIdx = (idx - 1 + thumbs.length) % thumbs.length;
        } else if (e.key === 'Home') {
          nextIdx = 0;
        } else if (e.key === 'End') {
          nextIdx = thumbs.length - 1;
        }

        if (nextIdx !== -1) {
          e.preventDefault();
          thumbs[nextIdx].focus();
          thumbs[nextIdx].click();
        }
      });
    });
  }

  function setupTouchSwipe() {
    var stageEl = section.querySelector('.studio__stage');
    if (!stageEl) return;

    var startX = 0;
    stageEl.addEventListener('touchstart', function(e) {
      if (e.touches && e.touches[0]) {
        startX = e.touches[0].clientX;
      }
    }, { passive: true });

    stageEl.addEventListener('touchend', function(e) {
      if (window.innerWidth >= 1024) return;
      if (e.changedTouches && e.changedTouches[0]) {
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) {
          if (dx < 0 && currentIndex < slides.length - 1) {
            setActive(currentIndex + 1, 1);
          } else if (dx > 0 && currentIndex > 0) {
            setActive(currentIndex - 1, -1);
          }
        }
      }
    }, { passive: true });
  }

  window.GW.imagine = {
    init: init
  };
})();
