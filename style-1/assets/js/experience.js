/**
 * Green Wardrobe — experience.js (EXP-C Self-Drawing Gold Path, 8 Steps & Pulse Nodes)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.experience = {
    init: function() {
      var section = document.querySelector('#experience');
      if (!section) return;

      var svg = section.querySelector('.experience__svg');
      var trackPath = section.querySelector('.experience__track-path');
      var goldPath = section.querySelector('.experience__gold-path');
      var steps = section.querySelectorAll('.exp-step');
      var counter = section.querySelector('.experience__counter-val');

      var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) {
        if (goldPath) goldPath.style.strokeDashoffset = '0';
        steps.forEach(function(s) {
          var n = s.querySelector('.exp-node');
          var c = s.querySelector('.exp-card');
          if (n) n.classList.add('is-reached');
          if (c) { c.style.opacity = '1'; c.style.transform = 'none'; }
        });
        if (counter) counter.textContent = '08 / 08';
        return;
      }

      function buildPathD() {
        if (!svg || steps.length === 0) return;
        var w = svg.clientWidth || 1000;
        var h = svg.clientHeight || 4000;
        var isMobile = window.innerWidth < 768;

        var d = '';
        var stepCount = steps.length;

        for (var i = 0; i < stepCount; i++) {
          var stepEl = steps[i];
          var nodeEl = stepEl.querySelector('.exp-node');
          var cardEl = stepEl.querySelector('.exp-card');

          var topY = (i + 0.5) * (h / stepCount);
          stepEl.style.top = topY + 'px';

          var nodeX = isMobile ? (w * 0.12) : (i % 2 === 0 ? w * 0.32 : w * 0.68);
          if (nodeEl) {
            nodeEl.style.left = nodeX + 'px';
            nodeEl.style.top = '0px';
          }

          if (cardEl) {
            if (isMobile) {
              cardEl.style.left = (w * 0.12 + 28) + 'px';
              cardEl.style.width = 'calc(100% - ' + (w * 0.12 + 40) + 'px)';
            } else {
              if (i % 2 === 0) {
                cardEl.style.left = (nodeX + 40) + 'px';
              } else {
                cardEl.style.right = (w - nodeX + 40) + 'px';
              }
            }
          }

          if (i === 0) {
            d += 'M ' + nodeX + ' ' + topY;
          } else {
            var prevY = (i - 0.5) * (h / stepCount);
            var prevX = isMobile ? (w * 0.12) : ((i - 1) % 2 === 0 ? w * 0.32 : w * 0.68);
            var cpY1 = prevY + (topY - prevY) * 0.5;
            var cpY2 = prevY + (topY - prevY) * 0.5;
            d += ' C ' + prevX + ' ' + cpY1 + ', ' + nodeX + ' ' + cpY2 + ', ' + nodeX + ' ' + topY;
          }
        }

        if (trackPath) trackPath.setAttribute('d', d);
        if (goldPath) goldPath.setAttribute('d', d);
      }

      buildPathD();
      window.addEventListener('resize', buildPathD);

      if (!window.gsap || !window.ScrollTrigger) return;

      // Draw path with scroll
      ScrollTrigger.create({
        trigger: '.experience__path-wrap',
        start: 'top 65%',
        end: 'bottom 75%',
        scrub: 0.6,
        onUpdate: function(self) {
          var p = self.progress;
          if (goldPath) {
            goldPath.style.strokeDashoffset = (1 - p);
          }

          var currentStep = Math.min(8, Math.max(1, Math.ceil(p * 8)));
          if (counter) {
            counter.textContent = '0' + currentStep + ' / 08';
          }

          steps.forEach(function(s, idx) {
            var threshold = (idx + 0.3) / 8;
            var reached = p >= threshold;
            var n = s.querySelector('.exp-node');
            var c = s.querySelector('.exp-card');
            if (n) n.classList.toggle('is-reached', reached);
            if (c) {
              if (reached) {
                gsap.to(c, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
              } else {
                gsap.to(c, { opacity: 0, y: 30, duration: 0.4, ease: 'power2.in', overwrite: 'auto' });
              }
            }
          });
        }
      });

      // Node clicks scroll to step
      steps.forEach(function(s) {
        var node = s.querySelector('.exp-node');
        if (node) {
          node.addEventListener('click', function() {
            if (window.GW.smoothScroll) {
              window.GW.smoothScroll.scrollTo(s, { offset: -120 });
            }
          });
        }
      });
    }
  };
})();
