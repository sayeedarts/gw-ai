/**
 * hero.js — Scroll-scrubbed hero expansion, video playback trigger, and before/after transformation
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var content = null;
  var media = null;
  var video = null;
  var afterLayer = null;
  var seam = null;
  var labelText = null;
  var playRing = null;
  var techPills = null;
  var scrollCue = null;
  var isVideoPlaying = false;

  function init() {
    section = document.querySelector('section.hero');
    if (!section) return;

    content = section.querySelector('.hero__content');
    media = section.querySelector('.hero__media');
    video = section.querySelector('.hero__video');
    afterLayer = section.querySelector('.hero__after');
    seam = section.querySelector('.hero__seam');
    labelText = section.querySelector('.hero__label-text');
    playRing = section.querySelector('.hero__play-ring');
    techPills = section.querySelector('.hero__tech');
    scrollCue = section.querySelector('.hero__scroll-cue');

    // CTA scroll to imagine
    var cta = section.querySelector('.btn-cta');
    if (cta) {
      cta.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.GW.smoothScroll) {
          window.GW.smoothScroll.scrollTo('#imagine');
        } else {
          var target = document.querySelector('#imagine');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      // Fallback: stacked, no pin
      if (media) {
        media.style.transform = 'none';
        media.style.position = 'relative';
        media.style.width = '100%';
        media.style.borderRadius = '0';
      }
      return;
    }

    // Reset any CSS transform so GSAP has exclusive control over translation
    gsap.set(media, { y: 0, yPercent: 50 });

    setupIntro();
    setupScrollTrigger();
  }

  function setupIntro() {
    window.addEventListener('gw:ready', function() {
      document.body.classList.add('hero-active');

      var eyebrow = section.querySelector('.hero__eyebrow');
      var title = section.querySelector('.hero__title');
      var brand = section.querySelector('.hero__brand');
      var cta = section.querySelector('.hero__cta-wrap');

      var tl = gsap.timeline();
      tl.fromTo(media, {
        y: 0,
        yPercent: 100
      }, {
        y: 0,
        yPercent: 50,
        duration: 1.4,
        ease: 'power3.out'
      }, 0)
      .fromTo([eyebrow, title, brand, cta], {
        opacity: 0,
        y: 30
      }, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out'
      }, 0.2);
    });
  }

  function setupScrollTrigger() {
    var isMobile = window.innerWidth < 768;

    // Master pinned timeline for Phase A (expansion) & Phase B (transformation)
    var masterTL = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: isMobile ? '+=200%' : '+=250%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function(self) {
          var prog = self.progress;

          // Video play/pause toggle at progress 0.25 (when card is expanding past center)
          if (prog >= 0.25 && !isVideoPlaying && video) {
            video.play().catch(function() {});
            isVideoPlaying = true;
            if (playRing) gsap.to(playRing, { opacity: 0, duration: 0.3 });
          } else if (prog < 0.25 && isVideoPlaying && video) {
            video.pause();
            isVideoPlaying = false;
            if (playRing) gsap.to(playRing, { opacity: 1, duration: 0.3 });
          }

          // Blocks pause when hero finishes
          if (window.GW.heroBlocks) {
            if (prog >= 0.7) {
              window.GW.heroBlocks.pause();
            } else {
              window.GW.heroBlocks.resume();
            }
          }

          // Before/After label roll at 50% of transformation phase (overall ~0.65)
          if (labelText) {
            if (prog >= 0.65) {
              labelText.textContent = 'AFTER';
            } else {
              labelText.textContent = 'BEFORE';
            }
          }

          // Remove hero-active class on body when hero is passed
          if (prog >= 0.95) {
            document.body.classList.remove('hero-active');
          } else {
            document.body.classList.add('hero-active');
          }
        }
      }
    });

    // Phase A: Card Expansion (0% to 40% of master timeline)
    masterTL.to(content, {
      opacity: 0,
      y: -80,
      scale: 0.96,
      duration: 0.4,
      ease: 'none'
    }, 0)
    .to(media, {
      yPercent: 0,
      y: 0,
      width: '100vw',
      borderRadius: '0px',
      duration: 0.4,
      ease: 'none'
    }, 0)
    .to('.hero__video', {
      scale: 1,
      duration: 0.4,
      ease: 'none'
    }, 0)
    .to(techPills, {
      opacity: 1,
      duration: 0.1,
      ease: 'power2.out'
    }, 0.35);

    // Attach hero blocks timeline link
    if (window.GW.heroBlocks) {
      window.GW.heroBlocks.attachToTimeline(masterTL);
    }

    // Phase B: Transformation Wipe (40% to 90% of master timeline)
    masterTL.fromTo(afterLayer, {
      clipPath: 'inset(0% 100% 0% 0%)'
    }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.5,
      ease: 'none'
    }, 0.4)
    .fromTo(seam, {
      left: '0%'
    }, {
      left: '100%',
      duration: 0.5,
      ease: 'none'
    }, 0.4)
    .to(scrollCue, {
      opacity: 1,
      duration: 0.1,
      ease: 'power2.out'
    }, 0.9);
  }

  window.GW.hero = {
    init: init
  };
})();
