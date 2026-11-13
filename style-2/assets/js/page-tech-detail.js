/**
 * page-tech-detail.js — Shared interactive behaviour for the 6 technology detail pages
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  function init() {
    var body = document.body;
    var page = body ? body.getAttribute('data-page') || '' : '';
    if (!page.startsWith('technology-')) return;

    // Pointer-fine subtle gold highlight on feature/pipeline cards
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var cards = document.querySelectorAll('.card-feature, .related__card, .pipeline-step');
      Array.prototype.forEach.call(cards, function(card) {
        card.addEventListener('pointermove', function(e) {
          var rect = card.getBoundingClientRect();
          var x = ((e.clientX - rect.left) / rect.width) * 100;
          var y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--mx', x.toFixed(1) + '%');
          card.style.setProperty('--my', y.toFixed(1) + '%');
        });
      });
    }

    // Pipeline step interactive selection
    var pipelineSteps = Array.prototype.slice.call(document.querySelectorAll('.pipeline-step'));
    if (pipelineSteps.length) {
      pipelineSteps.forEach(function(step) {
        step.addEventListener('click', function() {
          pipelineSteps.forEach(function(s) { s.classList.remove('is-active'); });
          step.classList.add('is-active');
        });
      });
    }
  }

  window.GW.pageTechDetail = {
    init: init
  };
})();
