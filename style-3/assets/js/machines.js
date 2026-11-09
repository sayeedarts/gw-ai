/**
 * Green Wardrobe — machines.js (MACH-B Parallax Diptych & 2x Magnifier Lens)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.machines = {
    init: function() {
      var section = document.querySelector('#machines');
      if (!section) return;

      var cutCol = section.querySelector('.machines__col--cut');
      var stitchCol = section.querySelector('.machines__col--stitch');
      var cutImg = cutCol ? cutCol.querySelector('.machines__img') : null;
      var stitchImg = stitchCol ? stitchCol.querySelector('.machines__img') : null;
      var lens = section.querySelector('.machines__lens');

      var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Parallax opposing motion
      if (window.gsap && window.ScrollTrigger && !isReduced) {
        if (cutImg) {
          gsap.fromTo(cutImg, 
            { yPercent: 8 }, 
            {
              yPercent: -8,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6
              }
            }
          );
        }

        if (stitchImg) {
          gsap.fromTo(stitchImg, 
            { yPercent: -8 }, 
            {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6
              }
            }
          );
        }
      }

      // Magnifier lens mechanics
      if (lens && window.gsap) {
        var quickX = gsap.quickTo(lens, 'x', { duration: 0.35, ease: 'power2.out' });
        var quickY = gsap.quickTo(lens, 'y', { duration: 0.35, ease: 'power2.out' });

        function setupCol(col, type) {
          if (!col) return;

          col.addEventListener('pointerenter', function() {
            lens.className = 'machines__lens machines__lens--' + type;
            gsap.to(lens, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
          });

          col.addEventListener('pointerleave', function() {
            gsap.to(lens, { scale: 0.6, opacity: 0, duration: 0.2, ease: 'power2.in' });
          });

          col.addEventListener('pointermove', function(e) {
            quickX(e.clientX);
            quickY(e.clientY);

            var rect = col.getBoundingClientRect();
            var xPct = ((e.clientX - rect.left) / rect.width) * 100;
            var yPct = ((e.clientY - rect.top) / rect.height) * 100;

            lens.style.backgroundPosition = xPct + '% ' + yPct + '%';
          });
        }

        setupCol(cutCol, 'cut');
        setupCol(stitchCol, 'stitch');
      }
    }
  };
})();
