/**
 * Green Wardrobe — technologies.js (TECH-C Giant Outlined Type Stack & Interactive Peek Card)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.technologies = {
    init: function() {
      var section = document.querySelector('#technology');
      if (!section) return;

      var stack = section.querySelector('.technology__stack');
      var rows = section.querySelectorAll('.tech-word');
      var peekCard = section.querySelector('.tech-peek');
      var peekImg = section.querySelector('.tech-peek__img');

      var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) {
        rows.forEach(function(row) {
          var fill = row.querySelector('.tech-word__fill');
          if (fill) fill.style.clipPath = 'inset(0)';
        });
        if (peekCard) peekCard.style.display = 'none';
        return;
      }

      if (!window.gsap || !window.ScrollTrigger) return;

      // Scroll fill & dim per row
      rows.forEach(function(row) {
        var fill = row.querySelector('.tech-word__fill');
        if (fill) {
          gsap.fromTo(fill, 
            { clipPath: 'inset(0 100% 0 0)' },
            {
              clipPath: 'inset(0 0% 0 0)',
              ease: 'none',
              scrollTrigger: {
                trigger: row,
                start: 'top 70%',
                end: 'bottom 30%',
                scrub: 0.5,
                onEnter: function() { row.style.opacity = '1'; },
                onLeave: function() { row.style.opacity = '0.35'; },
                onEnterBack: function() { row.style.opacity = '1'; },
                onLeaveBack: function() { row.style.opacity = '0.35'; }
              }
            }
          );
        }
      });

      // Velocity skew on scroll
      var skewTween = null;
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: function(self) {
          var vel = self.getVelocity();
          var deg = Math.max(-5, Math.min(5, vel / -250));
          if (skewTween) skewTween.kill();
          skewTween = gsap.to(stack, {
            skewY: deg,
            duration: 0.1,
            ease: 'none',
            onComplete: function() {
              gsap.to(stack, { skewY: 0, duration: 0.5, ease: 'power2.out' });
            }
          });
        }
      });

      // Pointer Fine Peek Card
      var isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (isPointerFine && peekCard) {
        var quickX = gsap.quickTo(peekCard, 'x', { duration: 0.35, ease: 'power2.out' });
        var quickY = gsap.quickTo(peekCard, 'y', { duration: 0.35, ease: 'power2.out' });
        var quickRot = gsap.quickTo(peekCard, 'rotation', { duration: 0.35, ease: 'power2.out' });

        var lastX = 0;

        window.addEventListener('pointermove', function(e) {
          quickX(e.clientX + 30);
          quickY(e.clientY);
          var rot = Math.max(-6, Math.min(6, (e.clientX - lastX) * 0.4));
          quickRot(rot);
          lastX = e.clientX;
        });

        rows.forEach(function(row) {
          row.addEventListener('mouseenter', function() {
            var imgSrc = row.dataset.image;
            if (imgSrc && peekImg) {
              peekImg.src = imgSrc;
            }
            gsap.to(peekCard, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
          });

          row.addEventListener('mouseleave', function() {
            gsap.to(peekCard, { scale: 0.8, opacity: 0, duration: 0.2, ease: 'power2.in' });
          });

          // Focus support
          row.addEventListener('focus', function() {
            var imgSrc = row.dataset.image;
            if (imgSrc && peekImg) peekImg.src = imgSrc;
            var fill = row.querySelector('.tech-word__fill');
            if (fill) fill.style.clipPath = 'inset(0)';
          });
        });
      }
    }
  };
})();
