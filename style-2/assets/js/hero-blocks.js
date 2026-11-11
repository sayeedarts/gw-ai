/**
 * hero-blocks.js — Interactive architectural square-blocks grid, ambient pulse, and spotlight
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var container = null;
  var spotlight = null;
  var dustContainer = null;
  var cells = [];
  var pulseTimer = null;
  var isPaused = false;
  var quickX = null;
  var quickY = null;
  var rows = 0;
  var cols = 0;
  var cellSize = 80;

  function init() {
    container = document.querySelector('.js-hero-blocks');
    spotlight = document.querySelector('.js-hero-spotlight');
    dustContainer = document.querySelector('.js-hero-dust');
    if (!container) return;

    buildGrid();
    buildDust();
    setupPointer();

    window.addEventListener('resize', window.GW.utils.debounce(rebuild, 250));

    window.addEventListener('gw:ready', function() {
      start();
    });
  }

  function getCellSize() {
    var w = window.innerWidth;
    if (w < 768) return 56;
    if (w < 1024) return 72;
    return 100;
  }

  function buildGrid() {
    if (!container) return;
    container.innerHTML = '';
    cells = [];

    cellSize = getCellSize();
    var w = window.innerWidth;
    var h = window.innerHeight;

    cols = Math.ceil(w / cellSize);
    rows = Math.ceil(h / cellSize);
    var maxCells = w < 768 ? 90 : 420;
    var total = Math.min(rows * cols, maxCells);

    var fragment = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var span = document.createElement('span');
      span.className = 'hero__block';
      cells.push(span);
      fragment.appendChild(span);
    }
    container.appendChild(fragment);
  }

  function buildDust() {
    if (!dustContainer || window.GW.isReducedMotion) return;
    dustContainer.innerHTML = '';
    var count = window.innerWidth < 768 ? 10 : 24;

    for (var i = 0; i < count; i++) {
      var dot = document.createElement('div');
      dot.className = 'hero__dust-dot';
      dot.style.left = Math.random() * 100 + '%';
      dot.style.top = Math.random() * 100 + '%';
      dustContainer.appendChild(dot);

      if (window.gsap) {
        var driftY = -(40 + Math.random() * 50);
        var dur = 8 + Math.random() * 6;
        gsap.to(dot, {
          y: driftY,
          duration: dur,
          repeat: -1,
          ease: 'none',
          delay: Math.random() * 4
        });
        gsap.to(dot, {
          opacity: 0.1,
          duration: 1.6 + Math.random() * 1.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    }
  }

  function setupPointer() {
    if (!spotlight || window.matchMedia('(pointer: coarse)').matches) return;

    if (window.gsap) {
      quickX = gsap.quickTo(spotlight, 'x', { duration: 0.6, ease: 'power3.out' });
      quickY = gsap.quickTo(spotlight, 'y', { duration: 0.6, ease: 'power3.out' });

      window.addEventListener('mousemove', function(e) {
        if (isPaused) return;
        spotlight.style.opacity = '1';
        quickX(e.clientX);
        quickY(e.clientY);

        // Highlight arithmetic cell under pointer
        var col = Math.floor(e.clientX / cellSize);
        var row = Math.floor(e.clientY / cellSize);
        var idx = row * cols + col;
        if (cells[idx]) {
          var c = cells[idx];
          c.classList.add('is-gold');
          gsap.fromTo(c, { opacity: 0.8 }, {
            opacity: 0.15,
            duration: 1.2,
            ease: 'power2.out',
            onComplete: function() {
              c.classList.remove('is-gold');
            }
          });
        }
      });
    }
  }

  function start() {
    if (window.GW.isReducedMotion || !window.gsap) {
      // Static pattern
      for (var k = 0; k < Math.min(8, cells.length); k++) {
        var randCell = cells[Math.floor(Math.random() * cells.length)];
        if (randCell) {
          randCell.classList.add('is-gold');
          randCell.style.opacity = '0.5';
        }
      }
      return;
    }

    // Grid entrance
    gsap.from(cells, {
      opacity: 0,
      scale: 0.6,
      duration: 0.9,
      ease: 'power3.out',
      stagger: {
        each: 0.004,
        from: 'center',
        grid: [rows, cols]
      }
    });

    schedulePulse();
  }

  function schedulePulse() {
    if (isPaused) return;
    var delay = 400 + Math.random() * 300;
    pulseTimer = setTimeout(function() {
      triggerPulse();
      schedulePulse();
    }, delay);
  }

  function triggerPulse() {
    if (isPaused || !cells.length) return;
    var isMobile = window.innerWidth < 768;
    var batchSize = isMobile ? Math.floor(3 + Math.random() * 3) : Math.floor(5 + Math.random() * 5);

    for (var b = 0; b < batchSize; b++) {
      var randIdx = Math.floor(Math.random() * cells.length);
      var cell = cells[randIdx];
      if (cell && !cell.classList.contains('is-active-pulse')) {
        var isGold = Math.random() < 0.3;
        var variant = isGold ? 'is-gold' : 'is-green';
        cell.classList.add('is-active-pulse', variant);

        var peakOpacity = isGold ? 0.4 + Math.random() * 0.3 : 0.6 + Math.random() * 0.3;
        var pulseDur = 1.1 + Math.random() * 0.4;

        gsap.fromTo(cell, { opacity: 0.1 }, {
          opacity: peakOpacity,
          duration: pulseDur,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut',
          onComplete: (function(c, v) {
            return function() {
              c.classList.remove('is-active-pulse', v);
              c.style.opacity = '';
            };
          })(cell, variant)
        });
      }
    }
  }

  function pause() {
    isPaused = true;
    clearTimeout(pulseTimer);
    if (container) container.style.visibility = 'hidden';
  }

  function resume() {
    if (!isPaused) return;
    isPaused = false;
    if (container) container.style.visibility = 'visible';
    schedulePulse();
  }

  function rebuild() {
    if (window.gsap) gsap.killTweensOf(cells);
    buildGrid();
    buildDust();
  }

  function attachToTimeline(phaseATL) {
    if (!phaseATL || !window.gsap) return;
    var bg = document.querySelector('.hero__bg');
    var glow = document.querySelector('.hero__glow');

    if (container) {
      phaseATL.to(container, {
        yPercent: -12,
        scale: 1.08,
        ease: 'none'
      }, 0);
    }
    if (bg) {
      phaseATL.to(bg, {
        opacity: 0,
        ease: 'none',
        duration: 0.7
      }, 0);
    }
    if (glow) {
      phaseATL.to(glow, {
        scale: 1.4,
        opacity: 1,
        duration: 0.2,
        ease: 'none'
      }, 0);
    }
  }

  window.GW.heroBlocks = {
    init: init,
    start: start,
    pause: pause,
    resume: resume,
    rebuild: rebuild,
    attachToTimeline: attachToTimeline
  };
})();
