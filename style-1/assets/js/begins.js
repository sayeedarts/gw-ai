/**
 * Green Wardrobe — begins.js (BEGINS-C Wireframe-to-Suit Vertical Scan Morph)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.begins = {
    init: function() {
      var section = document.querySelector('#begins');
      if (!section) return;

      var suitLayer = section.querySelector('.begins__layer-suit');
      var wireframeLayer = section.querySelector('.begins__layer-wireframe');
      var scanLine = section.querySelector('.begins__scan-line');
      var chips = section.querySelectorAll('.begins__chip');
      var h2 = section.querySelector('.begins__h2');
      var lead = section.querySelector('.begins__lead');

      var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) {
        if (suitLayer) suitLayer.style.clipPath = 'inset(0)';
        if (scanLine) scanLine.style.display = 'none';
        chips.forEach(function(chip) { chip.classList.add('is-active'); });
        return;
      }

      if (!window.gsap || !window.ScrollTrigger) return;

      var isMobile = window.innerWidth < 768;

      var beginsTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: isMobile ? '+=220%' : '+=260%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function(self) {
            var p = self.progress;
            // Chips light in thirds: BODY 0-33%, STYLE 33-66%, MOMENTS 66-100%
            if (chips.length >= 3) {
              chips[0].classList.toggle('is-active', p >= 0.15);
              chips[1].classList.toggle('is-active', p >= 0.45);
              chips[2].classList.toggle('is-active', p >= 0.75);
            }
          }
        }
      });

      // Text reveal tied to scrub
      beginsTl.fromTo(section.querySelectorAll('.begins__h2 .line-reveal__inner'),
        { y: '110%' },
        {
          y: '0%',
          duration: 0.25,
          stagger: 0.05,
          ease: 'power2.out'
        }, 0);

      beginsTl.fromTo(lead, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.25);

      // Vertical Scan wipe from top to bottom (20% -> 90%)
      beginsTl.fromTo(suitLayer,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'none' },
        0.2
      );

      beginsTl.fromTo(scanLine,
        { top: '0%' },
        { top: '100%', duration: 0.7, ease: 'none' },
        0.2
      );

      beginsTl.to(wireframeLayer, {
        filter: 'brightness(0.5)',
        duration: 0.7,
        ease: 'none'
      }, 0.2);

      // Hold at end
      beginsTl.to(suitLayer, {
        filter: 'brightness(1.05)',
        duration: 0.1,
        ease: 'none'
      }, 0.9);
    }
  };
})();
