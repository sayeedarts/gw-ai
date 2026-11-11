/**
 * machines.js — Parallax diptych with interactive magnifier lens (Task G)
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var colCut = null;
  var colStitch = null;
  var imgCut = null;
  var imgStitch = null;
  var lens = null;
  var quickX = null;
  var quickY = null;
  var isLensVisible = false;
  var touchTimer = null;

  function init() {
    section = document.querySelector('section#machines');
    if (!section) return;

    colCut = section.querySelector('.machines__col--cut');
    colStitch = section.querySelector('.machines__col--stitch');
    imgCut = section.querySelector('.machines__col--cut .machines__img');
    imgStitch = section.querySelector('.machines__col--stitch .machines__img');
    lens = section.querySelector('.machines__lens');

    if (!colCut || !colStitch) return;

    if (!window.GW.isReducedMotion && window.gsap && window.ScrollTrigger) {
      setupEntranceAndParallax();
    }

    setupMagnifierLens();
  }

  function setupEntranceAndParallax() {
    var isMobile = window.innerWidth < 768;

    // Entry reveal at top 80%
    var cols = [colCut, colStitch];
    gsap.fromTo(cols, {
      clipPath: 'inset(100% 0% 0% 0%)'
    }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.2,
      stagger: 0.2,
      ease: 'expo.inOut',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true
      }
    });

    var labels = section.querySelectorAll('.machines__col-label');
    if (labels.length) {
      gsap.fromTo(labels, {
        y: 30,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        delay: 0.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true
        }
      });
    }

    // Parallax across entire section
    var driftPct = isMobile ? 6 : 8;

    if (imgCut) {
      gsap.fromTo(imgCut, {
        yPercent: driftPct
      }, {
        yPercent: -driftPct,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }

    if (imgStitch) {
      gsap.fromTo(imgStitch, {
        yPercent: -driftPct
      }, {
        yPercent: driftPct,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }
  }

  function setupMagnifierLens() {
    if (!lens || !window.gsap) return;

    quickX = gsap.quickTo(lens, 'x', { duration: 0.35, ease: 'power3.out' });
    quickY = gsap.quickTo(lens, 'y', { duration: 0.35, ease: 'power3.out' });

    var bindCol = function(col, typeClass) {
      col.addEventListener('pointerenter', function(e) {
        if (e.pointerType === 'touch') return;
        lens.classList.remove('machines__lens--cut', 'machines__lens--stitch');
        lens.classList.add(typeClass);
        showLens(e.clientX, e.clientY);
      });

      col.addEventListener('pointermove', function(e) {
        if (e.pointerType === 'touch') return;
        updateLens(col, e.clientX, e.clientY);
      });

      col.addEventListener('pointerleave', function(e) {
        if (e.pointerType === 'touch') return;
        hideLens();
      });

      // Touch long press support
      col.addEventListener('touchstart', function(e) {
        if (!e.touches || !e.touches[0]) return;
        var t = e.touches[0];
        touchTimer = setTimeout(function() {
          lens.classList.remove('machines__lens--cut', 'machines__lens--stitch');
          lens.classList.add(typeClass);
          showLens(t.clientX, t.clientY);
          updateLens(col, t.clientX, t.clientY);
        }, 300);
      }, { passive: true });

      col.addEventListener('touchmove', function(e) {
        if (!e.touches || !e.touches[0]) return;
        var t = e.touches[0];
        if (isLensVisible) {
          updateLens(col, t.clientX, t.clientY);
        } else {
          clearTimeout(touchTimer);
        }
      }, { passive: true });

      var endTouch = function() {
        clearTimeout(touchTimer);
        if (isLensVisible) {
          hideLens();
        }
      };

      col.addEventListener('touchend', endTouch);
      col.addEventListener('touchcancel', endTouch);
    };

    bindCol(colCut, 'machines__lens--cut');
    bindCol(colStitch, 'machines__lens--stitch');
  }

  function showLens(clientX, clientY) {
    isLensVisible = true;
    if (quickX && quickY) {
      quickX(clientX);
      quickY(clientY);
    }
    gsap.fromTo(lens, {
      scale: 0.6,
      opacity: 0
    }, {
      scale: 1,
      opacity: 1,
      duration: 0.3,
      ease: 'back.out(1.5)'
    });
  }

  function updateLens(col, clientX, clientY) {
    if (!isLensVisible) return;
    if (quickX && quickY) {
      quickX(clientX);
      quickY(clientY);
    }

    var rect = col.getBoundingClientRect();
    var relX = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    var relY = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));

    lens.style.setProperty('--lens-x', relX + '%');
    lens.style.setProperty('--lens-y', relY + '%');
  }

  function hideLens() {
    isLensVisible = false;
    gsap.to(lens, {
      scale: 0.6,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in'
    });
  }

  window.GW.machines = {
    init: init
  };
})();
