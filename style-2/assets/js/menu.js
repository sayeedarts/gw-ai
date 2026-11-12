/**
 * menu.js — Header morphing pill on scroll, circular morph menu with focus trap, and hover previews
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var header = null;
  var hamburger = null;
  var closeBtn = null;
  var menu = null;
  var menuList = null;
  var menuLinks = [];
  var previewImgs = [];
  var isMenuOpen = false;
  var openTimeline = null;
  var ticking = false;

  function init() {
    header = document.querySelector('.site-header');
    hamburger = document.querySelector('.hamburger');
    menu = document.querySelector('#site-menu');
    if (!header || !hamburger || !menu) return;

    closeBtn = menu.querySelector('.js-menu-close');
    menuList = menu.querySelector('.site-menu__list');
    menuLinks = Array.prototype.slice.call(menu.querySelectorAll('.site-menu__link'));
    previewImgs = Array.prototype.slice.call(menu.querySelectorAll('.site-menu__preview-img'));

    hamburger.addEventListener('click', toggleMenu);
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        closeMenu();
      });
    }

    // Keyboard navigation & accessibility
    window.addEventListener('keydown', handleKeydown);

    // In-page navigation and preview triggers
    menuLinks.forEach(function(link) {
      var targetPreview = link.getAttribute('data-preview');

      link.addEventListener('mouseenter', function() {
        setPreview(targetPreview);
      });

      link.addEventListener('focus', function() {
        setPreview(targetPreview);
      });

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
    });

    if (menuList) {
      menuList.addEventListener('mouseleave', function() {
        menuLinks.forEach(function(l) {
          l.classList.remove('is-dimmed', 'is-hovered');
        });
      });
    }

    // Header scroll behavior with hysteresis (never hidden; morphs to centered pill)
    window.addEventListener('scroll', onScroll, { passive: true });
    updateHeaderScroll();

    // Recompute clipPath on resize if open
    window.addEventListener('resize', onResize);

    // Entrance intro on gw:ready
    window.addEventListener('gw:ready', function() {
      updateHeaderScroll();
      if (!window.GW.isReducedMotion && window.gsap) {
        var logo = header.querySelector('.site-header__logo');
        var lines = header.querySelectorAll('.hamburger__line');

        if (logo) {
          gsap.fromTo(logo, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
        }
        if (lines.length) {
          gsap.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' });
        }
      }
    });
  }

  function updateHeaderScroll() {
    if (!header) return;
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollY > 80) {
      header.classList.add('is-scrolled');
    } else if (scrollY < 40) {
      header.classList.remove('is-scrolled');
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateHeaderScroll);
      ticking = true;
    }
  }

  function setPreview(id) {
    if (!id) return;
    previewImgs.forEach(function(img) {
      if (img.getAttribute('data-preview-id') === id) {
        img.classList.add('is-active');
      } else {
        img.classList.remove('is-active');
      }
    });

    menuLinks.forEach(function(l) {
      if (l.getAttribute('data-preview') === id) {
        l.classList.add('is-hovered');
        l.classList.remove('is-dimmed');
      } else {
        l.classList.remove('is-hovered');
        l.classList.add('is-dimmed');
      }
    });
  }

  function getFocusableElements() {
    if (!menu) return [];
    return Array.prototype.slice.call(
      menu.querySelectorAll('button:not([disabled]), [href]:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
  }

  function handleKeydown(e) {
    if (!isMenuOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key === 'Tab') {
      var focusables = getFocusableElements();
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  function setInertState(enable) {
    var main = document.querySelector('#main');
    var skipLink = document.querySelector('.skip-link');
    [main, header, skipLink].forEach(function(el) {
      if (!el) return;
      if (enable) {
        el.setAttribute('inert', '');
      } else {
        el.removeAttribute('inert');
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
    if (isMenuOpen) return;
    isMenuOpen = true;
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    document.body.classList.add('is-locked');
    setInertState(true);

    // Reset default preview to 01 Experience
    setPreview('exp');
    menuLinks.forEach(function(l) {
      l.classList.remove('is-dimmed', 'is-hovered');
    });

    if (window.GW.smoothScroll) {
      window.GW.smoothScroll.stop();
    }

    var rect = hamburger.getBoundingClientRect();
    var cx = Math.round(rect.left + rect.width / 2);
    var cy = Math.round(rect.top + rect.height / 2);
    var maxDistX = Math.max(cx, window.innerWidth - cx);
    var maxDistY = Math.max(cy, window.innerHeight - cy);
    var r = Math.ceil(Math.hypot(maxDistX, maxDistY));

    if (!window.GW.isReducedMotion && window.gsap) {
      openTimeline = gsap.timeline({
        onComplete: function() {
          if (closeBtn) closeBtn.focus();
        }
      });

      openTimeline.fromTo(menu, {
        clipPath: 'circle(0px at ' + cx + 'px ' + cy + 'px)'
      }, {
        clipPath: 'circle(' + r + 'px at ' + cx + 'px ' + cy + 'px)',
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

      if (closeBtn) {
        openTimeline.fromTo(closeBtn, {
          opacity: 0,
          scale: 0.8
        }, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power3.out'
        }, 0.5);
      }
    } else {
      if (closeBtn) closeBtn.focus();
    }
  }

  function closeMenu(onComplete) {
    if (!isMenuOpen) return;
    isMenuOpen = false;
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    setInertState(false);

    if (window.GW.smoothScroll) {
      window.GW.smoothScroll.start();
    }

    if (!window.GW.isReducedMotion && window.gsap) {
      var rect = hamburger.getBoundingClientRect();
      var cx = Math.round(rect.left + rect.width / 2);
      var cy = Math.round(rect.top + rect.height / 2);

      var closeTL = gsap.timeline({
        onComplete: function() {
          menu.classList.remove('is-open');
          hamburger.focus();
          if (onComplete) onComplete();
        }
      });

      if (closeBtn) {
        closeTL.to(closeBtn, {
          opacity: 0,
          scale: 0.8,
          duration: 0.25,
          ease: 'power2.in'
        }, 0);
      }

      closeTL.to(menu, {
        clipPath: 'circle(0px at ' + cx + 'px ' + cy + 'px)',
        duration: 0.7,
        ease: 'expo.inOut'
      }, 0.1);
    } else {
      menu.classList.remove('is-open');
      hamburger.focus();
      if (onComplete) onComplete();
    }
  }

  function onResize() {
    if (isMenuOpen && !window.GW.isReducedMotion && window.gsap) {
      var rect = hamburger.getBoundingClientRect();
      var cx = Math.round(rect.left + rect.width / 2);
      var cy = Math.round(rect.top + rect.height / 2);
      var maxDistX = Math.max(cx, window.innerWidth - cx);
      var maxDistY = Math.max(cy, window.innerHeight - cy);
      var r = Math.ceil(Math.hypot(maxDistX, maxDistY));
      gsap.set(menu, { clipPath: 'circle(' + r + 'px at ' + cx + 'px ' + cy + 'px)' });
    }
  }

  window.GW.menu = {
    init: init,
    open: openMenu,
    close: closeMenu,
    setPreview: setPreview
  };
})();
