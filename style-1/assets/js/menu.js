/**
 * Green Wardrobe — menu.js (Header & Fullscreen Menu Overlay)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.menu = {
    init: function() {
      var header = document.querySelector('.site-header');
      var hamburger = document.querySelector('.site-header__hamburger');
      var menu = document.querySelector('#site-menu');
      var links = document.querySelectorAll('.site-menu__link');
      var previewImgs = document.querySelectorAll('.site-menu__preview-img');
      var logo = document.querySelector('.site-header__logo');
      var lines = document.querySelectorAll('.hamburger-line');

      var isOpen = false;
      var lastScrollY = window.scrollY;

      // Header scroll behavior (hide on scroll down, show with blur on scroll up)
      window.addEventListener('scroll', function() {
        var currentY = window.scrollY;
        if (currentY > 80) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }

        // Check if inside hero
        var heroEl = document.querySelector('.hero');
        var inHero = heroEl && currentY < (heroEl.offsetTop + heroEl.offsetHeight);

        if (inHero) {
          header.classList.remove('is-hidden');
        } else if (currentY > lastScrollY && currentY > 200) {
          header.classList.add('is-hidden');
        } else {
          header.classList.remove('is-hidden');
        }
        lastScrollY = currentY;
      }, { passive: true });

      function toggleMenu(forceState) {
        isOpen = typeof forceState === 'boolean' ? forceState : !isOpen;
        hamburger.classList.toggle('is-active', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        menu.classList.toggle('is-open', isOpen);
        document.body.classList.toggle('is-locked', isOpen);

        if (isOpen) {
          if (window.GW.smoothScroll) window.GW.smoothScroll.stop();
          // Animate menu links
          if (window.gsap) {
            gsap.fromTo('.site-menu__link', 
              { y: 60, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, delay: 0.25, ease: 'power3.out' }
            );
          }
        } else {
          if (window.GW.smoothScroll) window.GW.smoothScroll.start();
          hamburger.focus();
        }
      }

      if (hamburger) {
        hamburger.addEventListener('click', function() {
          toggleMenu();
        });
      }

      // Close on ESC
      window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
          toggleMenu(false);
        }
      });

      // Link clicks
      links.forEach(function(link) {
        link.addEventListener('click', function(e) {
          var href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            toggleMenu(false);
            setTimeout(function() {
              if (window.GW.smoothScroll) {
                window.GW.smoothScroll.scrollTo(href);
              } else {
                var target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              }
            }, 400);
          }
        });

        // Hover preview swap
        link.addEventListener('mouseenter', function() {
          var targetIndex = link.dataset.preview;
          previewImgs.forEach(function(img) {
            if (img.dataset.index === targetIndex) {
              img.classList.add('is-active');
            } else {
              img.classList.remove('is-active');
            }
          });
        });
      });

      // Intro on gw:ready
      document.addEventListener('gw:ready', function() {
        if (window.gsap) {
          gsap.fromTo(logo, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
          gsap.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.2 });
        }
      });
    }
  };
})();
