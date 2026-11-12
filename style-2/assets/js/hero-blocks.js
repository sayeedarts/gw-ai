/**
 * hero-blocks.js — Interactive architectural square-blocks grid, continuous odd/even motion, and spotlight
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var container = null;
  var spotlight = null;
  var dustContainer = null;
  var cells = [];
  var oddTimeline = null;
  var evenTimeline = null;
  var driftTimeline = null;
  var goldAccentInterval = null;
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
    setupViewportTrigger();

    window.addEventListener('resize', window.GW.utils ? window.GW.utils.debounce(rebuild, 250) : debounce(rebuild, 250));

    window.addEventListener('gw:ready', function() {
      start();
    });
  }

  function debounce(fn, ms) {
    var timer;
    return function() {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, ms);
    };
  }

  function readCellSize() {
    if (!container) return 80;
    var computed = window.getComputedStyle(container);
    var size = parseFloat(computed.gridAutoRows);
    if (!size || isNaN(size)) {
      size = window.innerWidth < 768 ? 64 : 100;
    }
    return size;
  }

  function buildGrid() {
    if (!container) return;
    container.innerHTML = '';
    cells = [];

    cellSize = readCellSize();
    var w = window.innerWidth;
    var h = window.innerHeight;

    cols = Math.ceil(w / cellSize) + 4;
    rows = Math.ceil(h / cellSize) + 1;
    var isMobile = w < 768;
    var maxCells = isMobile ? 160 : 520;

    if (cols * rows > maxCells) {
      cols = Math.max(1, Math.floor(maxCells / rows));
    }

    var fragment = document.createDocumentFragment();
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var span = document.createElement('span');
        var isOdd = ((r + c) % 2) !== 0;
        span.className = 'hero__block ' + (isOdd ? 'hero__block--odd' : 'hero__block--even');
        span._row = r;
        span._col = c;
        span._isOdd = isOdd;
        cells.push(span);
        fragment.appendChild(span);
      }
    }
    container.appendChild(fragment);

    setupContinuousAnimation();
  }

  function setupContinuousAnimation() {
    if (!window.gsap) return;

    if (window.GW.isReducedMotion) {
      cells.forEach(function(c) {
        gsap.set(c, { opacity: c._isOdd ? 0.18 : 0.05 });
      });
      return;
    }

    var oddCells = cells.filter(function(c) { return c._isOdd; });
    var evenCells = cells.filter(function(c) { return !c._isOdd; });

    // Odd cells timeline: opacity 0.04 -> 0.26 over 3.2s sine.inOut, diagonal offset
    oddTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    oddCells.forEach(function(c) {
      var offset = (c._row + c._col) * 0.12;
      oddTimeline.to(c, {
        opacity: 0.26,
        duration: 3.2,
        ease: 'sine.inOut'
      }, offset);
    });

    // Even cells timeline: identical tween in antiphase (started one half-cycle later at 3.2s)
    evenTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    evenCells.forEach(function(c) {
      var offset = (c._row + c._col) * 0.12;
      evenTimeline.to(c, {
        opacity: 0.26,
        duration: 3.2,
        ease: 'sine.inOut'
      }, offset);
    });
    evenTimeline.time(3.2);

    // Lateral drift across 2 columns over 14s, repeat -1 (desktop only)
    var isMobile = window.innerWidth < 768;
    if (!isMobile) {
      driftTimeline = gsap.to(container, {
        x: -2 * cellSize,
        duration: 14,
        ease: 'none',
        repeat: -1
      });
    }

    // Keep timelines paused until start()
    oddTimeline.pause();
    evenTimeline.pause();
    if (driftTimeline) driftTimeline.pause();
  }

  function buildDust() {
    if (!dustContainer || window.GW.isReducedMotion) return;
    dustContainer.innerHTML = '';
    var count = window.innerWidth < 768 ? 10 : 24;

    for (var i = 0; i < count; i++) {
      var dot = document.createElement('div');
      dot.className = 'hero__dust-dot';
      dot.style.left = (Math.random() * 100) + '%';
      dot.style.top = (Math.random() * 100) + '%';
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
    if (!spotlight || window.matchMedia('(pointer: coarse)').matches || window.GW.isReducedMotion) return;

    if (window.gsap) {
      quickX = gsap.quickTo(spotlight, 'x', { duration: 0.6, ease: 'power3.out' });
      quickY = gsap.quickTo(spotlight, 'y', { duration: 0.6, ease: 'power3.out' });

      var heroEl = document.querySelector('.hero');
      if (!heroEl) return;

      heroEl.addEventListener('mouseenter', function() {
        if (!isPaused) spotlight.classList.add('is-visible');
      });

      heroEl.addEventListener('mouseleave', function() {
        spotlight.classList.remove('is-visible');
      });

      heroEl.addEventListener('mousemove', function(e) {
        if (isPaused) return;
        spotlight.classList.add('is-visible');
        quickX(e.clientX);
        quickY(e.clientY);
      });
    }
  }

  function setupViewportTrigger() {
    if (!window.ScrollTrigger) return;
    var heroEl = document.querySelector('.hero');
    if (!heroEl) return;

    ScrollTrigger.create({
      trigger: heroEl,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: function(self) {
        if (self.isActive) {
          resume();
        } else {
          pause();
        }
      }
    });
  }

  function runGoldFlashes() {
    if (isPaused || !cells.length || window.GW.isReducedMotion || !window.gsap) return;
    var count = Math.floor(2 + Math.random() * 2); // 2 or 3 cells
    var available = cells.filter(function(c) {
      return !c.classList.contains('is-gold');
    });
    if (available.length < count) return;

    for (var i = 0; i < count; i++) {
      var randIndex = Math.floor(Math.random() * available.length);
      var cell = available.splice(randIndex, 1)[0];
      if (cell) {
        cell.classList.add('is-gold');
        gsap.fromTo(cell, { opacity: 0.1 }, {
          opacity: 0.5,
          duration: 0.6,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut',
          onComplete: (function(targetCell) {
            return function() {
              targetCell.classList.remove('is-gold');
            };
          })(cell)
        });
      }
    }
  }

  function startGoldAccents() {
    stopGoldAccents();
    if (window.GW.isReducedMotion) return;
    goldAccentInterval = setInterval(runGoldFlashes, 1600);
  }

  function stopGoldAccents() {
    if (goldAccentInterval) {
      clearInterval(goldAccentInterval);
      goldAccentInterval = null;
    }
  }

  function start() {
    if (window.GW.isReducedMotion || !window.gsap) {
      cells.forEach(function(c) {
        gsap.set(c, { opacity: c._isOdd ? 0.18 : 0.05 });
      });
      return;
    }

    gsap.from(cells, {
      opacity: 0,
      scale: 0.6,
      duration: 0.9,
      ease: 'power3.out',
      stagger: {
        each: 0.004,
        from: 'center',
        grid: [rows, cols]
      },
      onComplete: function() {
        if (!isPaused) {
          if (oddTimeline) oddTimeline.play();
          if (evenTimeline) evenTimeline.play();
          if (driftTimeline) driftTimeline.play();
          startGoldAccents();
        }
      }
    });
  }

  function pause() {
    if (isPaused) return;
    isPaused = true;
    if (container) container.classList.add('is-paused');
    if (oddTimeline) oddTimeline.pause();
    if (evenTimeline) evenTimeline.pause();
    if (driftTimeline) driftTimeline.pause();
    stopGoldAccents();
    if (spotlight) spotlight.classList.remove('is-visible');
  }

  function resume() {
    if (!isPaused) return;
    isPaused = false;
    if (container) container.classList.remove('is-paused');
    if (oddTimeline) oddTimeline.play();
    if (evenTimeline) evenTimeline.play();
    if (driftTimeline) driftTimeline.play();
    startGoldAccents();
  }

  function rebuild() {
    stopGoldAccents();
    if (oddTimeline) { oddTimeline.kill(); oddTimeline = null; }
    if (evenTimeline) { evenTimeline.kill(); evenTimeline = null; }
    if (driftTimeline) { driftTimeline.kill(); driftTimeline = null; }
    if (window.gsap) gsap.killTweensOf(cells);
    buildGrid();
    buildDust();
    if (!isPaused) {
      if (oddTimeline) oddTimeline.play();
      if (evenTimeline) evenTimeline.play();
      if (driftTimeline) driftTimeline.play();
      startGoldAccents();
    }
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
