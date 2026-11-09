/**
 * technologies.js — Bento grid entrance, hover/tap expansion, and parallax drift
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var section = null;
  var grid = null;
  var tiles = [];

  function init() {
    section = document.querySelector('section#technology');
    if (!section) return;

    grid = section.querySelector('.tech__grid');
    tiles = Array.prototype.slice.call(section.querySelectorAll('.tech-tile'));

    if (window.GW.isReducedMotion || !window.gsap) {
      tiles.forEach(function(t) {
        t.style.clipPath = 'none';
        var img = t.querySelector('.tech-tile__bg');
        if (img) img.style.transform = 'none';
      });
      return;
    }

    // Scroll reveal
    gsap.fromTo(tiles, {
      clipPath: 'inset(100% 0% 0% 0%)'
    }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.2,
      stagger: 0.1,
      ease: 'expo.inOut',
      scrollTrigger: {
        trigger: grid,
        start: 'top 80%',
        once: true
      }
    });

    // Parallax on images
    tiles.forEach(function(tile) {
      var img = tile.querySelector('.tech-tile__bg');
      if (img && window.ScrollTrigger) {
        gsap.to(img, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: tile,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    });

    // Interactive focus / tap toggling
    tiles.forEach(function(tile) {
      tile.setAttribute('tabindex', '0');

      tile.addEventListener('click', function(e) {
        toggleTile(tile);
      });

      tile.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTile(tile);
        }
      });
    });

    document.addEventListener('click', function(e) {
      if (!grid.contains(e.target)) {
        clearActiveTiles();
      }
    });

    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        clearActiveTiles();
      }
    });
  }

  function toggleTile(targetTile) {
    var wasActive = targetTile.classList.contains('is-active');
    clearActiveTiles();
    if (!wasActive) {
      targetTile.classList.add('is-active');
      grid.classList.add('has-active');
    }
  }

  function clearActiveTiles() {
    tiles.forEach(function(t) {
      t.classList.remove('is-active');
    });
    if (grid) grid.classList.remove('has-active');
  }

  window.GW.technologies = {
    init: init
  };
})();
