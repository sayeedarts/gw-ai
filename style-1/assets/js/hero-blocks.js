/**
 * Green Wardrobe — hero-blocks.js (Procedural Square-Blocks Canvas & Ambient Field)
 */
(function() {
  window.GW = window.GW || {};

  var container = null;
  var spotlight = null;
  var dustContainer = null;
  var blocks = [];
  var pulseInterval = null;
  var isPaused = false;
  var rows = 0;
  var cols = 0;
  var activePulses = 0;

  function buildGrid() {
    if (!container) return;
    container.innerHTML = '';
    blocks = [];

    var w = container.offsetWidth || window.innerWidth;
    var h = container.offsetHeight || window.innerHeight;
    var isMobile = window.innerWidth < 768;
    var size = isMobile ? 56 : (window.innerWidth < 1024 ? 72 : 100);
    var cap = isMobile ? 90 : 420;

    cols = Math.ceil(w / size);
    rows = Math.ceil(h / size);
    var total = Math.min(cols * rows, cap);

    var fragment = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var span = document.createElement('span');
      span.className = 'hero__block';
      fragment.appendChild(span);
      blocks.push(span);
    }
    container.appendChild(fragment);

    // Build dust dots
    if (dustContainer) {
      dustContainer.innerHTML = '';
      var dotCount = isMobile ? 10 : 24;
      for (var d = 0; d < dotCount; d++) {
        var dot = document.createElement('div');
        dot.className = 'hero__dust-dot';
        dot.style.left = (Math.random() * 100) + '%';
        dot.style.top = (Math.random() * 100) + '%';
        dustContainer.appendChild(dot);

        if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          gsap.to(dot, {
            y: -(40 + Math.random() * 50),
            opacity: 0.1 + Math.random() * 0.7,
            duration: 8 + Math.random() * 6,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        }
      }
    }
  }

  function startPulse() {
    if (pulseInterval) clearInterval(pulseInterval);
    var isMobile = window.innerWidth < 768;
    var maxActive = isMobile ? 6 : 16;

    pulseInterval = setInterval(function() {
      if (isPaused || blocks.length === 0) return;
      if (activePulses >= maxActive) return;

      var batchCount = isMobile ? (3 + Math.floor(Math.random() * 3)) : (5 + Math.floor(Math.random() * 5));
      for (var i = 0; i < batchCount; i++) {
        var idx = Math.floor(Math.random() * blocks.length);
        var cell = blocks[idx];
        if (!cell || cell.classList.contains('is-lit-active')) continue;

        cell.classList.add('is-lit-active');
        activePulses++;
        var isGold = Math.random() < 0.3;
        cell.classList.add(isGold ? 'is-gold' : 'is-green');

        if (window.gsap) {
          (function(target) {
            gsap.fromTo(target, 
              { opacity: 0 }, 
              { 
                opacity: 0.35 + Math.random() * 0.55, 
                duration: 1.1 + Math.random() * 0.3, 
                ease: 'sine.inOut', 
                yoyo: true, 
                repeat: 1,
                onComplete: function() {
                  target.classList.remove('is-lit-active', 'is-gold', 'is-green');
                  activePulses = Math.max(0, activePulses - 1);
                }
              }
            );
          })(cell);
        } else {
          cell.classList.remove('is-lit-active', 'is-gold', 'is-green');
          activePulses = Math.max(0, activePulses - 1);
        }
      }
    }, 550);
  }

  window.GW.heroBlocks = {
    init: function() {
      container = document.querySelector('.js-hero-blocks');
      spotlight = document.querySelector('.js-hero-spotlight');
      dustContainer = document.querySelector('.js-hero-dust');
      if (!container) return;

      var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      buildGrid();

      if (isReduced) {
        // Light up static 8 cells
        for (var i = 0; i < 8 && i < blocks.length; i++) {
          blocks[i * 10 || i].classList.add(i % 2 === 0 ? 'is-gold' : 'is-green');
          blocks[i * 10 || i].style.opacity = '0.5';
        }
        return;
      }

      // Pointer fine spotlight
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && spotlight) {
        var quickX = window.gsap ? gsap.quickTo(spotlight, 'x', { duration: 0.6, ease: 'power2.out' }) : null;
        var quickY = window.gsap ? gsap.quickTo(spotlight, 'y', { duration: 0.6, ease: 'power2.out' }) : null;

        window.addEventListener('pointermove', function(e) {
          if (isPaused) return;
          spotlight.style.opacity = '1';
          if (quickX && quickY) {
            quickX(e.clientX);
            quickY(e.clientY);
          }
        });
      }

      // Resize listener
      var resizeTimer = null;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
          buildGrid();
        }, 250);
      });

      document.addEventListener('gw:ready', function() {
        if (window.gsap && !isReduced) {
          gsap.from(blocks, {
            opacity: 0,
            scale: 0.6,
            duration: 0.9,
            ease: 'power3.out',
            stagger: { each: 0.004, from: 'center', grid: [rows, cols] }
          });
          gsap.to('.hero__glow', { opacity: 0.7, duration: 1.4 });
        }
        startPulse();
      });
    },

    pause: function() {
      isPaused = true;
      if (container) container.style.visibility = 'hidden';
      if (spotlight) spotlight.style.opacity = '0';
    },

    resume: function() {
      isPaused = false;
      if (container) container.style.visibility = 'visible';
    },

    attachToTimeline: function(timeline) {
      if (!timeline || !window.gsap) return;
      timeline.to('.hero__bg', { opacity: 0, duration: 0.7, ease: 'none' }, 0);
      timeline.to(container, { yPercent: -12, scale: 1.08, duration: 1, ease: 'none' }, 0);
    }
  };
})();
