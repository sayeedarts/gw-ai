/**
 * hero.js — Scroll-scrubbed hero expansion and video playback trigger
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var content = null;
  var media = null;
  var video = null;
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
      // Fallback: static positioning via class toggle without direct element.style writes
      if (media) {
        media.classList.add('is-static');
      }
      return;
    }

    // Single source of truth in GSAP: media at yPercent: 70
    gsap.set(media, { y: 0, yPercent: 85 });

    setupIntro();
    setupScrollTrigger();
  }

  function setupIntro() {
    window.addEventListener('gw:ready', function() {
      var eyebrow = section.querySelector('.hero__eyebrow');
      var title = section.querySelector('.hero__title');
      var brand = section.querySelector('.hero__brand');
      var cta = section.querySelector('.hero__cta-wrap');

      var tl = gsap.timeline();
      tl.fromTo(media, {
        y: 0,
        yPercent: 100,
      }, {
        y: 0,
        yPercent: 75,
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

    // Master pinned timeline for hero card expansion (Task A2)
    var masterTL = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: isMobile ? '+=100%' : '+=120%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function(self) {
          var prog = self.progress;
          var rise = Math.min(prog / 0.85, 1);

          // Video playback hysteresis between 0.40 and 0.45
          if (rise >= 0.45 && !isVideoPlaying && video) {
            var playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.then(function() {
                isVideoPlaying = true;
                if (playRing) gsap.to(playRing, { opacity: 0, duration: 0.3 });
              }).catch(function() {
                // Keep poster/ring visible if autoplay blocked
                isVideoPlaying = false;
              });
            }
          } else if (rise < 0.40 && isVideoPlaying && video) {
            video.pause();
            isVideoPlaying = false;
            if (playRing) gsap.to(playRing, { opacity: 1, duration: 0.3 });
          }

          // Hero blocks link: pause at >= 0.7, resume below
          if (window.GW.heroBlocks) {
            if (prog >= 0.7) {
              window.GW.heroBlocks.pause();
            } else {
              window.GW.heroBlocks.resume();
            }
          }
        }
      }
    });

    // 0 -> 0.35: content fades and recedes
    masterTL.to(content, {
      opacity: 0,
      y: -80,
      scale: 0.96,
      duration: 0.35,
      ease: 'none'
    }, 0)
    // 0 -> 0.85: media lifts to yPercent 0, full width, zero radius; video scale 1.15 -> 1
    .fromTo(media,
      {
        width: 'calc(80% - (2 * var(--gutter)))',        
        borderRadius: '20px'
      },{
        yPercent: 0,
        y: 0,      
        borderRadius: '0px',
        duration: 0.85,
        ease: 'none',
        width: '100vw'
    }, 0)
    .to(video, {
      scale: 1,
      duration: 0.85,
      ease: 'none'
    }, 0)
    // 0.80 -> 0.90: tech pills fade in
    .to(techPills, {
      opacity: 1,
      duration: 0.1,
      ease: 'power2.out'
    }, 0.80)
    // 0.85 -> 1: hold at full screen; scroll cue fades in at 0.90
    .to(scrollCue, {
      opacity: 1,
      duration: 0.1,
      ease: 'power2.out'
    }, 0.90);

    // Attach hero blocks timeline link
    if (window.GW.heroBlocks) {
      window.GW.heroBlocks.attachToTimeline(masterTL);
    }
  }

  window.GW.hero = {
    init: init
  };
})();
