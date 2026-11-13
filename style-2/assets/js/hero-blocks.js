/**
 * hero-blocks.js — Pure-CSS infinite odd/even square grid, diagonal wave, drift, spotlight & dust
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var bg = null;
  var container = null;
  var track = null;
  var spotlight = null;
  var dustContainer = null;
  var quickX = null;
  var quickY = null;
  var observer = null;
  var rows = 0;
  var cols = 0;
  var cellSize = 120;

  function init() {
    bg = document.querySelector('.hero__bg');
    container = document.querySelector('.js-hero-blocks');
    track = document.querySelector('.js-hero-blocks-track');
    spotlight = document.querySelector('.js-hero-spotlight');
    dustContainer = document.querySelector('.js-hero-dust');
    if (!container || !track) return;

    buildGrid();
    buildDust();
    setupPointer();
    setupVisibilityObserver();

    window.addEventListener('resize', window.GW.utils ? window.GW.utils.debounce(rebuild, 250) : debounce(rebuild, 250));

    if (window.GW.restoreY > 0 || window.GW.skipPreload) {
      container.classList.add('is-ready');
    } else {
      window.addEventListener('gw:ready', function() {
        container.classList.add('is-ready');
      });
    }
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
    var computed = window.getComputedStyle(track);
    var size = parseFloat(computed.gridAutoRows);
    if (!size || isNaN(size)) {
      size = window.innerWidth < 768 ? 124 : 140;
    }
    return size;
  }

  function buildGrid() {
    if (!track) return;
    track.innerHTML = '';

    cellSize = readCellSize();
    var w = window.innerWidth;
    var h = window.innerHeight;
    var isMobile = w < 768;

    cols = Math.ceil(w / cellSize) + 4;
    rows = Math.ceil(h / cellSize) + 1;
    var maxCells = isMobile ? 160 : 520;

    if (cols * rows > maxCells) {
      cols = Math.max(4, Math.floor(maxCells / rows));
    }

    track.style.setProperty('--grid-cols', String(cols));

    var fragment = document.createDocumentFragment();
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var span = document.createElement('span');
        var isOdd = ((r + c) % 2) !== 0;
        var cls = 'hero__block ' + (isOdd ? 'hero__block--odd' : 'hero__block--even');

        // ~6% of cells receive independent spark flash
        if (Math.random() < 0.06) {
          cls += ' hero__block--spark';
          var sparkCycle = (7 + Math.random() * 4).toFixed(2) + 's';
          span.style.setProperty('--spark-cycle', sparkCycle);
        }

        span.className = cls;
        span.style.setProperty('--block-d', ((r + c) * 0.12).toFixed(2));
        fragment.appendChild(span);
      }
    }
    track.appendChild(fragment);
  }

  function buildDust() {
    if (!dustContainer || window.GW.isReducedMotion) return;
    dustContainer.innerHTML = '';
    var count = window.innerWidth < 768 ? 10 : 24;

    for (var i = 0; i < count; i++) {
      var dot = document.createElement('div');
      dot.className = 'hero__dust-dot';
      dot.style.setProperty('--dust-x', (Math.random() * 100).toFixed(2) + '%');
      dot.style.setProperty('--dust-y', (Math.random() * 100).toFixed(2) + '%');
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
        if (bg && !bg.classList.contains('is-paused')) {
          spotlight.classList.add('is-visible');
        }
      });

      heroEl.addEventListener('mouseleave', function() {
        spotlight.classList.remove('is-visible');
      });

      heroEl.addEventListener('mousemove', function(e) {
        if (bg && bg.classList.contains('is-paused')) return;
        spotlight.classList.add('is-visible');
        quickX(e.clientX);
        quickY(e.clientY);
      });
    }
  }

  function setupVisibilityObserver() {
    if (!bg || typeof IntersectionObserver === 'undefined') return;
    var heroEl = document.querySelector('.hero');
    if (!heroEl) return;

    observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          bg.classList.remove('is-paused');
        } else {
          bg.classList.add('is-paused');
          if (spotlight) spotlight.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.01 });

    observer.observe(heroEl);
  }

  function rebuild() {
    buildGrid();
    buildDust();
  }

  function attachToTimeline(phaseATL) {
    if (!phaseATL || !window.gsap) return;
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
    rebuild: rebuild,
    attachToTimeline: attachToTimeline
  };
})();
