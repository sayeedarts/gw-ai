/**
 * Green Wardrobe — cta.js (Section 10 Final CTA & Magnetic Button)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.cta = {
    init: function() {
      var section = document.querySelector('#book');
      if (!section) return;

      var btn = section.querySelector('.btn-cta--magnetic');
      var portraitImg = section.querySelector('.final-cta__portrait-img');
      var h2 = section.querySelector('.final-cta__h2');

      var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Parallax on portrait
      if (window.gsap && window.ScrollTrigger && portraitImg && !isReduced) {
        gsap.fromTo(portraitImg, 
          { yPercent: -10 }, 
          {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6
            }
          }
        );

        ScrollTrigger.create({
          trigger: section,
          start: 'top 70%',
          once: true,
          onEnter: function() {
            gsap.fromTo(section.querySelectorAll('.final-cta__h2 .line-reveal__inner'),
              { y: '110%' },
              {
                y: '0%',
                duration: 1.1,
                stagger: 0.14,
                ease: 'power4.out'
              }
            );
            gsap.fromTo(btn, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' });
          }
        });
      }

      // Magnetic button behavior
      var isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (btn && isPointerFine && window.gsap && !isReduced) {
        btn.addEventListener('mousemove', function(e) {
          var rect = btn.getBoundingClientRect();
          var x = e.clientX - rect.left - rect.width / 2;
          var y = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, {
            x: x * 0.35,
            y: y * 0.35,
            duration: 0.3,
            ease: 'power2.out'
          });
        });

        btn.addEventListener('mouseleave', function() {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.4)'
          });
        });
      }
    }
  };
})();
