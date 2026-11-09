/**
 * scanner.js — Digital Scanner top-to-bottom scan wipe, interactive hotspots, and side list sync
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var frame = null;
  var wireframe = null;
  var booth = null;
  var scanLine = null;
  var inTitle = null;
  var hotspots = [];
  var listRows = [];
  var sideList = null;
  var hint = null;
  var cutaways = [];
  var hasInteracted = false;
  var demoTimer = null;

  var measurements = {
    height: 170,
    neck: 38,
    shoulder: 46,
    chest: 98,
    sleeve: 62,
    waist: 86,
    hip: 98,
    inseam: 78
  };

  function init() {
    section = document.querySelector('section#scanner');
    if (!section) return;

    frame = section.querySelector('.scan__frame');
    wireframe = section.querySelector('.scan__layer-wireframe');
    booth = section.querySelector('.scan__layer-booth');
    scanLine = section.querySelector('.scan__line');
    inTitle = section.querySelector('.scan__in-title');
    hotspots = Array.prototype.slice.call(section.querySelectorAll('.scan__hotspot'));
    sideList = section.querySelector('.scan__list');
    listRows = Array.prototype.slice.call(section.querySelectorAll('.scan__row'));
    hint = section.querySelector('.scan__hint');
    cutaways = Array.prototype.slice.call(section.querySelectorAll('.scan__cutaway'));

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      if (wireframe) wireframe.style.clipPath = 'none';
      if (scanLine) scanLine.style.display = 'none';
      if (inTitle) inTitle.style.opacity = '1';
      hotspots.forEach(function(h) { h.style.opacity = '1'; });
      setupHotspotsInteraction();
      return;
    }

    setupPhase1Wipe();
    setupHotspotsInteraction();
  }

  function setupPhase1Wipe() {
    var isMobile = window.innerWidth < 768;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: isMobile ? '+=100%' : '+=120%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onLeave: function() {
          showHotspots();
        }
      }
    });

    // Wipe down
    tl.fromTo(wireframe, {
      clipPath: 'inset(0% 0% 100% 0%)'
    }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'none',
      duration: 1
    }, 0)
    .fromTo(scanLine, {
      top: '0%'
    }, {
      top: '100%',
      ease: 'none',
      duration: 1
    }, 0)
    .to(booth, {
      filter: 'saturate(0.4)',
      ease: 'none',
      duration: 0.8
    }, 0)
    .to(inTitle, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, 0.4)
    .to(hotspots, {
      opacity: 1,
      scale: 1,
      stagger: 0.04,
      duration: 0.3,
      ease: 'back.out(2)'
    }, 0.65);

    // Cutaways parallax
    if (cutaways[0]) {
      gsap.to(cutaways[0], {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }
    if (cutaways[1]) {
      gsap.to(cutaways[1], {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  function showHotspots() {
    if (hotspots[0] && hotspots[0].style.opacity === '1') return;

    if (window.gsap) {
      gsap.fromTo(hotspots, {
        scale: 0,
        opacity: 0
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(2)'
      });
    } else {
      hotspots.forEach(function(h) { h.style.opacity = '1'; });
    }

    // Idle demo after 2s if no interaction
    demoTimer = setTimeout(function() {
      if (!hasInteracted) {
        runIdleDemo();
      }
    }, 2000);
  }

  function runIdleDemo() {
    var sequence = ['neck', 'chest', 'waist'];
    var i = 0;
    function next() {
      if (hasInteracted || i >= sequence.length) {
        clearActive();
        return;
      }
      activateHotspotById(sequence[i]);
      i++;
      setTimeout(next, 1200);
    }
    next();
  }

  function setupHotspotsInteraction() {
    hotspots.forEach(function(spot) {
      var id = spot.getAttribute('data-point');
      spot.setAttribute('tabindex', '0');

      spot.addEventListener('mouseenter', function() {
        onUserInteract();
        activateHotspotById(id);
      });

      spot.addEventListener('click', function(e) {
        e.stopPropagation();
        onUserInteract();
        activateHotspotById(id);
      });

      spot.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onUserInteract();
          activateHotspotById(id);
        }
      });
    });

    listRows.forEach(function(row) {
      var id = row.getAttribute('data-point');
      row.addEventListener('click', function() {
        onUserInteract();
        activateHotspotById(id);
      });
    });
  }

  function onUserInteract() {
    hasInteracted = true;
    if (demoTimer) clearTimeout(demoTimer);
    if (hint) {
      hint.style.opacity = '0';
    }
  }

  function activateHotspotById(id) {
    clearActive();

    var activeSpot = section.querySelector('.scan__hotspot[data-point="' + id + '"]');
    var activeRow = section.querySelector('.scan__row[data-point="' + id + '"]');

    if (activeSpot) {
      activeSpot.classList.add('is-active');
      var tip = activeSpot.querySelector('.scan__tip');
      if (tip) {
        var val = measurements[id] || 0;
        tip.textContent = id.toUpperCase() + ' ' + val + ' cm';
      }
    }

    if (activeRow) {
      activeRow.classList.add('is-active');
      if (sideList) sideList.classList.add('has-active');
    }
  }

  function clearActive() {
    hotspots.forEach(function(h) { h.classList.remove('is-active'); });
    listRows.forEach(function(r) { r.classList.remove('is-active'); });
    if (sideList) sideList.classList.remove('has-active');
  }

  window.GW.scanner = {
    init: init
  };
})();
