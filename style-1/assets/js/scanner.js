/**
 * Green Wardrobe — scanner.js (SCAN-C Drag Comparison Slider & Interactive Measurement Thresholds)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.scanner = {
    init: function() {
      var section = document.querySelector('#scanner');
      if (!section) return;

      var compareWrap = section.querySelector('.scan__compare');
      var handle = section.querySelector('.scan__handle');
      var rows = section.querySelectorAll('.scan__row');
      var hint = section.querySelector('.scan__hint');

      var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function updateRows(splitVal) {
        rows.forEach(function(row) {
          var threshold = parseFloat(row.dataset.gwAt || '0');
          var isPassed = splitVal >= threshold;
          if (isPassed && !row.classList.contains('is-lit')) {
            row.classList.add('is-lit');
            var valEl = row.querySelector('.scan__val');
            var finalVal = parseInt(valEl.dataset.value || valEl.textContent, 10);
            if (!row.dataset.counted && window.GW.utils) {
              window.GW.utils.countUp(valEl, finalVal, 0.6);
              row.dataset.counted = 'true';
            }
          } else if (!isPassed && row.classList.contains('is-lit')) {
            row.classList.remove('is-lit');
          }
        });
      }

      if (isReduced) {
        if (compareWrap) compareWrap.style.setProperty('--split', '50%');
        rows.forEach(function(r) { r.classList.add('is-lit'); });
        return;
      }

      var slider = null;
      if (window.GW.utils && compareWrap) {
        slider = window.GW.utils.initCompareSlider({
          container: compareWrap,
          handle: handle,
          initialSplit: 50,
          onUpdate: function(val) {
            updateRows(val);
            if (hint) {
              hint.style.opacity = '0';
            }
          }
        });
      }

      // Auto demo trigger on entrance
      if (window.ScrollTrigger && slider) {
        ScrollTrigger.create({
          trigger: compareWrap,
          start: 'top 65%',
          once: true,
          onEnter: function() {
            slider.playAutoDemo();
          }
        });
      }
    }
  };
})();
