/**
 * page-technology.js — Technology hub interactive pointer glow and ecosystem highlight
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  function init() {
    var root = document.querySelector('[data-page="technology"]');
    if (!root) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll('.card-feature, .tech-card'));
    if (!cards.length) return;

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      cards.forEach(function(card) {
        card.addEventListener('pointermove', function(e) {
          var rect = card.getBoundingClientRect();
          var x = ((e.clientX - rect.left) / rect.width) * 100;
          var y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--mx', x.toFixed(1) + '%');
          card.style.setProperty('--my', y.toFixed(1) + '%');
        });
      });
    }
  }

  window.GW.pageTechnology = {
    init: init
  };
})();
