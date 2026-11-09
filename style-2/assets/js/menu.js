/**
 * menu.js — Header show/hide on scroll, circular morph menu, and hover previews
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var header = null;
  var hamburger = null;
  var menu = null;
  var menuLinks = [];
  var previewImgs = [];
  var lastScrollY = 0;
  var isMenuOpen = false;
  var openTimeline = null;

  function init() {
    header = document.querySelector('.site-header');
    hamburger = document.querySelector('.hamburger');
    menu = document.querySelector('#site-menu');
    if (!header || !hamburger || !menu) return;

    menuLinks = Array.prototype.slice.call(menu.querySelectorAll('.site-menu__link'));
    previewImgs = Array.prototype.slice.call(menu.querySelectorAll('.site-menu__preview-img'));

    hamburger.addEventListener('click', toggleMenu);

    // Keyboard support: Esc closes menu
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isMenuOpen) {
        toggleMenu();
      }
    });

    // In-page navigation: close menu then scroll smoothly
    menuLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          if (isMenuOpen) {
            closeMenu(function() {
              if (window.GW.smoothScroll) {
                window.GW.smoothScroll.scrollTo(href);
              } else {
                var el = document.querySelector(href);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            });
          }
        }
      });

      // Desktop hover preview swap
      var targetPreview = link.getAttribute('data-preview');
      link.addEventListener('mouseenter', function() {
        if (!targetPreview) return;
        menuLinks.forEach(function(l) {
          if (l !== link) l.style.opacity = '0.35';
          else {
            l.style.opacity = '1';
            l.style.transform = 'translateX(16px)';
          }
        });

        previewImgs.forEach(function(img) {
          if (img.getAttribute('data-preview-id') === targetPreview) {
            img.classList.add('is-active');
          } else {
            img.classList.remove('is-active');
          }
        });
      });

      link.addEventListener('mouseleave', function() {
        menuLinks.forEach(function(l) {
          l.style.opacity = '1';
          l.style.transform = 'translateX(0)';
        });
      });
    });

    // Header scroll behaviour (hide on scroll down, show on scroll up)
    window.addEventListener('scroll', function() {
      var currentY = window.pageYOffset || document.documentElement.scrollTop;
      if (currentY > 100) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      if (currentY > lastScrollY && currentY > 200 && !isMenuOpen) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastScrollY = currentY;
    }, { passive: true });

    // Entrance intro on gw:ready
    window.addEventListener('gw:ready', function() {
      if (!window.GW.isReducedMotion && window.gsap) {
        var logo = header.querySelector('.site-header__logo');
        var lines = header.querySelectorAll('.hamburger__line');

        gsap.fromTo(logo, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
        gsap.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' });
      }
    });
  }

  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    isMenuOpen = true;
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    document.body.classList.add('is-locked');

    if (window.GW.smoothScroll) {
      window.GW.smoothScroll.stop();
    }

    if (!window.GW.isReducedMotion && window.gsap) {
      openTimeline = gsap.timeline();
      openTimeline.fromTo(menu, {
        clipPath: 'circle(0% at calc(100% - 3rem) 2.75rem)'
      }, {
        clipPath: 'circle(150% at calc(100% - 3rem) 2.75rem)',
        duration: 0.9,
        ease: 'expo.inOut'
      })
      .fromTo(menuLinks, {
        y: 60,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out'
      }, '-=0.5');
    }
  }

  function closeMenu(onComplete) {
    isMenuOpen = false;
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');

    if (window.GW.smoothScroll) {
      window.GW.smoothScroll.start();
    }

    if (!window.GW.isReducedMotion && window.gsap) {
      gsap.to(menu, {
        clipPath: 'circle(0% at calc(100% - 3rem) 2.75rem)',
        duration: 0.7,
        ease: 'expo.inOut',
        onComplete: function() {
          menu.classList.remove('is-open');
          if (onComplete) onComplete();
        }
      });
    } else {
      menu.classList.remove('is-open');
      if (onComplete) onComplete();
    }

    hamburger.focus();
  }

  window.GW.menu = {
    init: init,
    open: openMenu,
    close: closeMenu
  };
})();
