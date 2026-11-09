/**
 * Green Wardrobe — hero.js (HERO-C Scroll-Reactive Marquee, Expansion & Before/After Wipe)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.hero = {
    init: function() {
      var hero = document.querySelector('.hero');
      if (!hero) return;

      var content = hero.querySelector('.hero__content');
      var media = hero.querySelector('.hero__media');
      var marquee = hero.querySelector('.hero__marquee');
      var marqueeTrack = hero.querySelector('.hero__marquee-track');
      var video = hero.querySelector('.hero__video');
      var afterLayer = hero.querySelector('.hero__after');
      var seam = hero.querySelector('.hero__seam');
      var playRing = hero.querySelector('.hero__play-ring');
      var label = hero.querySelector('.hero__label-text');
      var progressFill = hero.querySelector('.hero__progress-fill');
      var scrollCue = hero.querySelector('.hero__scroll-cue');

      var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) {
        document.body.classList.remove('hero-active');
        if (marquee) marquee.style.opacity = '1';
        if (media) {
          media.style.transform = 'none';
          media.style.width = '100%';
          media.style.borderRadius = '0';
        }
        if (afterLayer) afterLayer.style.clipPath = 'inset(0)';
        return;
      }

      document.body.classList.add('hero-active');

      // Marquee animation
      var marqueeTween = null;
      if (window.gsap && marqueeTrack) {
        marqueeTween = gsap.to(marqueeTrack, {
          xPercent: -50,
          duration: 40,
          ease: 'none',
          repeat: -1
        });
      }

      // Marquee speed response to scroll velocity
      var speedEaseTween = null;
      var lastDirection = 1;

      // Split lines on H1
      var h1 = hero.querySelector('.hero__h1');
      if (window.GW.utils && h1) {
        window.GW.utils.splitLines(h1);
      }

      function playIntro() {
        if (window.gsap) {
          var introTl = gsap.timeline();
          introTl.to(marquee, { opacity: 1, duration: 0.6, ease: 'power2.out' })
            .fromTo(hero.querySelectorAll('.hero__h1 .line-reveal__inner'), 
              { y: '110%' },
              {
                y: '0%',
                duration: 1.1,
                stagger: 0.12,
                ease: 'power3.out'
              }, '-=0.3')
            .fromTo('.hero__brand', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.7')
            .fromTo('.hero__cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.6')
            .fromTo(media, { y: '100svh' }, { y: '72svh', duration: 1.2, ease: 'power3.out' }, '-=1.0');
        } else {
          if (marquee) marquee.style.opacity = '1';
        }
      }

      document.addEventListener('gw:ready', playIntro);
      if (!document.documentElement.classList.contains('is-loading')) {
        playIntro();
      }

      if (!window.gsap || !window.ScrollTrigger) return;

      var isMobile = window.innerWidth < 768;

      // Master Pinned Hero Timeline
      var heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: isMobile ? '+=200%' : '+=250%',
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function(self) {
            // Marquee velocity response
            if (marqueeTween) {
              var vel = self.getVelocity();
              var dir = self.direction || 1;
              if (dir !== lastDirection) {
                marqueeTween.timeScale(dir * Math.abs(marqueeTween.timeScale()));
                lastDirection = dir;
              }
              var boost = Math.min(Math.abs(vel) / 600, 4);
              marqueeTween.timeScale(dir * (1 + boost));

              if (speedEaseTween) speedEaseTween.kill();
              speedEaseTween = gsap.to(marqueeTween, {
                timeScale: dir * 1,
                duration: 0.6,
                ease: 'power2.out'
              });
            }

            // Video play check
            if (self.progress >= 0.25) {
              if (video && video.paused) {
                video.play().catch(function() {});
              }
              if (playRing) playRing.style.opacity = '0';
            } else {
              if (video && !video.paused) {
                video.pause();
              }
              if (playRing) playRing.style.opacity = '1';
            }

            // Before / After Label Swap & Progress
            if (self.progress > 0.4) {
              var wipeProgress = Math.max(0, Math.min(1, (self.progress - 0.4) / 0.5));
              if (progressFill) progressFill.style.width = (wipeProgress * 100) + '%';
              if (label) {
                label.textContent = wipeProgress >= 0.5 ? 'AFTER' : 'BEFORE';
              }
            }

            // Pause blocks past hero expansion
            if (window.GW.heroBlocks) {
              if (self.progress >= 0.4) {
                window.GW.heroBlocks.pause();
              } else {
                window.GW.heroBlocks.resume();
              }
            }

            if (self.progress >= 0.85) {
              if (scrollCue) scrollCue.style.opacity = '1';
            } else {
              if (scrollCue) scrollCue.style.opacity = '0';
            }

            if (self.progress >= 0.95) {
              document.body.classList.remove('hero-active');
            } else {
              document.body.classList.add('hero-active');
            }
          }
        }
      });

      // Phase A: Card rises and expands to full screen (0 -> 40%)
      heroTl.to(content, { opacity: 0, y: -80, scale: 0.96, duration: 0.4, ease: 'none' }, 0);
      heroTl.to(marquee, { opacity: 0, y: -20, duration: 0.35, ease: 'none' }, 0);
      heroTl.to(media, {
        y: '0svh',
        width: '100vw',
        borderRadius: 0,
        duration: 0.4,
        ease: 'none'
      }, 0);
      heroTl.to(video, { scale: 1, duration: 0.4, ease: 'none' }, 0);

      // Phase B: Before -> After Transformation (40% -> 90%)
      heroTl.fromTo(afterLayer, 
        { clipPath: 'inset(0 100% 0 0)' }, 
        { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'none' }, 
        0.4
      );
      heroTl.fromTo(seam,
        { left: '0%' },
        { left: '100%', duration: 0.5, ease: 'none' },
        0.4
      );

      // Connect blocks background
      if (window.GW.heroBlocks) {
        window.GW.heroBlocks.attachToTimeline(heroTl);
      }
    }
  };
})();
