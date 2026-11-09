/**
 * Green Wardrobe — rewardrobe.js (Count-up & Pinned Before/After Wardrobe Renewal)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.rewardrobe = {
    init: function() {
      var section = document.querySelector('#rewardrobe');
      if (!section) return;

      var statNum = section.querySelector('.rewardrobe__stat-val');
      var statLine = section.querySelector('.rewardrobe__stat-line');
      var band = section.querySelector('.rewardrobe__band');
      var afterImg = section.querySelector('.rewardrobe__img-after');
      var caption = section.querySelector('.rewardrobe__caption');

      var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) {
        if (statNum) statNum.textContent = '25';
        if (statLine) statLine.style.transform = 'scaleX(1)';
        if (afterImg) afterImg.style.clipPath = 'inset(0)';
        return;
      }

      // Count-up on scroll
      if (window.ScrollTrigger && window.GW.utils && statNum) {
        ScrollTrigger.create({
          trigger: statNum,
          start: 'top 65%',
          once: true,
          onEnter: function() {
            window.GW.utils.countUp(statNum, 25, 1.8);
            if (window.gsap && statLine) {
              gsap.to(statLine, { scaleX: 1, duration: 1.4, ease: 'power2.out' });
            }
          }
        });
      }

      // Pinned before/after scrub
      if (window.gsap && window.ScrollTrigger && band && afterImg) {
        var isMobile = window.innerWidth < 768;
        gsap.timeline({
          scrollTrigger: {
            trigger: band,
            start: 'top 30%',
            end: isMobile ? '+=90%' : '+=120%',
            pin: true,
            scrub: 0.6,
            onUpdate: function(self) {
              var p = self.progress;
              if (caption) {
                if (p < 0.33) {
                  caption.textContent = 'RETURN.';
                } else if (p < 0.66) {
                  caption.textContent = 'REWARD.';
                } else {
                  caption.textContent = 'RENEW.';
                }
              }
            }
          }
        }).fromTo(afterImg, 
          { clipPath: 'inset(0 100% 0 0)' }, 
          { clipPath: 'inset(0 0% 0 0)', ease: 'none' }
        );
      }
    }
  };
})();
