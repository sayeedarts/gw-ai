/**
 * Green Wardrobe — footer.js (Footer Stagger Reveals & Wordmark Curtain)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.footer = {
    init: function() {
      var footer = document.querySelector('#footer');
      if (!footer) return;

      var wordmarkInner = footer.querySelector('.site-footer__wordmark-inner');
      var links = footer.querySelectorAll('.site-footer__nav-link');

      var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) {
        if (wordmarkInner) wordmarkInner.style.transform = 'none';
        return;
      }

      if (window.gsap && window.ScrollTrigger && wordmarkInner) {
        gsap.fromTo(wordmarkInner, 
          { yPercent: 70 }, 
          {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: footer,
              start: 'top 90%',
              end: 'bottom bottom',
              scrub: 0.5
            }
          }
        );

        ScrollTrigger.create({
          trigger: footer,
          start: 'top 80%',
          once: true,
          onEnter: function() {
            gsap.fromTo(links, 
              { opacity: 0, y: 15 }, 
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
            );
          }
        });
      }
    }
  };
})();
