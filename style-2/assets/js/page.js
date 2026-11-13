/**
 * page.js — Shared motion engine, progress bar, scroll-spy TOC, accordions, counters & magnetic CTAs for internal pages
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  function init() {
    var pageHero = document.querySelector('.page-hero');
    var hasInternalLayout = pageHero || document.querySelector('.page-section');
    if (!hasInternalLayout) return;

    setupPageProgressBar();
    setupHeroIntro(pageHero);
    setupScrollReveals();
    setupParallaxImages();
    setupCounters();
    setupDrawLines();
    setupAccordions();
    setupTocScrollSpy();
    setupMagneticCtas();
  }

  function setupPageProgressBar() {
    var bar = document.querySelector('.page-progress__bar');
    if (!bar || !window.gsap || !window.ScrollTrigger || window.GW.isReducedMotion) return;

    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });
  }

  function setupHeroIntro(pageHero) {
    if (!pageHero) return;

    var playIntro = function() {
      var crumb = pageHero.querySelector('.breadcrumb');
      var eyebrow = pageHero.querySelector('.page-hero__eyebrow');
      var title = pageHero.querySelector('.page-hero__title');
      var lead = pageHero.querySelector('.page-hero__lead');
      var ctas = pageHero.querySelector('.page-hero__actions');
      var chips = pageHero.querySelectorAll('.page-hero__chip');
      var media = pageHero.querySelector('.page-hero__media');
      var mediaImg = media ? media.querySelector('img') : null;

      if (window.GW.restoreY > 0 || window.GW.isReducedMotion || !window.gsap) {
        pageHero.classList.add('is-revealed');
        return;
      }

      var tl = gsap.timeline();
      if (crumb || eyebrow) {
        tl.fromTo([crumb, eyebrow].filter(Boolean), {
          opacity: 0,
          y: 16
        }, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out'
        }, 0);
      }

      if (title) {
        var lines = window.GW.utils && window.GW.utils.splitLines
          ? window.GW.utils.splitLines(title)
          : [title];
        tl.fromTo(lines, {
          yPercent: 110,
          opacity: 0
        }, {
          yPercent: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.1,
          ease: 'power3.out'
        }, 0.1);
      }

      var followUps = [lead, ctas].filter(Boolean);
      if (followUps.length) {
        tl.fromTo(followUps, {
          opacity: 0,
          y: 24
        }, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out'
        }, 0.35);
      }

      if (chips.length) {
        tl.fromTo(chips, {
          opacity: 0,
          y: 16
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power3.out'
        }, 0.55);
      }

      if (media) {
        tl.fromTo(media, {
          clipPath: 'inset(100% 0% 0% 0%)'
        }, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.1,
          ease: 'expo.inOut'
        }, 0.15);
      }
      if (mediaImg) {
        tl.fromTo(mediaImg, {
          scale: 1.2
        }, {
          scale: 1,
          duration: 1.4,
          ease: 'power3.out'
        }, 0.15);
      }
    };

    if (window.GW.restoreY > 0 || window.GW.skipPreload) {
      playIntro();
    } else {
      window.addEventListener('gw:ready', playIntro, { once: true });
    }
  }

  function setupScrollReveals() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      Array.prototype.forEach.call(els, function(el) {
        el.classList.add('is-revealed');
      });
      return;
    }

    Array.prototype.forEach.call(els, function(el) {
      var type = el.getAttribute('data-reveal');
      if (type === 'count' || type === 'draw') return;

      var staggerAttr = parseFloat(el.getAttribute('data-stagger'));
      var targets = el;

      if (!isNaN(staggerAttr) && staggerAttr > 0) {
        var items = el.querySelectorAll('[data-reveal-item]');
        targets = items.length ? items : el.children;
      }

      if (type === 'lines') {
        var lineInners = window.GW.utils && window.GW.utils.splitLines
          ? window.GW.utils.splitLines(el)
          : [el];
        gsap.fromTo(lineInners, {
          yPercent: 110,
          opacity: 0
        }, {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          }
        });
        return;
      }

      if (type === 'clip') {
        var img = el.querySelector('img');
        var clipTL = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          }
        });
        clipTL.fromTo(el, {
          clipPath: 'inset(100% 0% 0% 0%)'
        }, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.2,
          ease: 'expo.inOut'
        }, 0);
        if (img) {
          clipTL.fromTo(img, {
            scale: 1.2
          }, {
            scale: 1,
            duration: 1.5,
            ease: 'power3.out'
          }, 0);
        }
        return;
      }

      var fromVars = { opacity: 0 };
      var toVars = {
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: !isNaN(staggerAttr) ? staggerAttr : 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      };

      if (type === 'up') {
        fromVars.y = 40;
        toVars.y = 0;
      } else if (type === 'scale') {
        fromVars.scale = 0.94;
        toVars.scale = 1;
      }

      gsap.fromTo(targets, fromVars, toVars);
    });
  }

  function setupParallaxImages() {
    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) return;
    var els = document.querySelectorAll('[data-parallax]');
    Array.prototype.forEach.call(els, function(el) {
      var val = parseFloat(el.getAttribute('data-parallax')) || 0.08;
      var pct = val * 100;
      gsap.fromTo(el, {
        yPercent: -pct
      }, {
        yPercent: pct,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  function setupCounters() {
    var counters = document.querySelectorAll('[data-reveal="count"]');
    if (!counters.length) return;

    Array.prototype.forEach.call(counters, function(el) {
      var target = parseFloat(el.getAttribute('data-count-to')) || 0;
      var suffix = el.getAttribute('data-count-suffix') || '';

      if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) {
        el.textContent = target + suffix;
        return;
      }

      var obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        },
        onUpdate: function() {
          el.textContent = Math.round(obj.val) + suffix;
        }
      });
    });
  }

  function setupDrawLines() {
    if (window.GW.isReducedMotion || !window.gsap || !window.ScrollTrigger) return;
    var lines = document.querySelectorAll('[data-reveal="draw"]');
    Array.prototype.forEach.call(lines, function(line) {
      var axis = line.getAttribute('data-draw-axis') === 'x' ? 'scaleX' : 'scaleY';
      var fromObj = {};
      var toObj = {
        ease: 'none',
        scrollTrigger: {
          trigger: line.parentElement || line,
          start: 'top 75%',
          end: 'bottom 45%',
          scrub: true
        }
      };
      fromObj[axis] = 0;
      toObj[axis] = 1;
      gsap.fromTo(line, fromObj, toObj);
    });
  }

  function setupAccordions() {
    var accordions = document.querySelectorAll('.faq');
    Array.prototype.forEach.call(accordions, function(acc) {
      var buttons = Array.prototype.slice.call(acc.querySelectorAll('.faq__btn'));
      buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var isExpanded = btn.getAttribute('aria-expanded') === 'true';
          // Collapse all first (one open at a time)
          buttons.forEach(function(otherBtn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            var otherItem = otherBtn.closest('.faq__item');
            if (otherItem) otherItem.classList.remove('is-open');
          });
          if (!isExpanded) {
            btn.setAttribute('aria-expanded', 'true');
            var item = btn.closest('.faq__item');
            if (item) item.classList.add('is-open');
          }
        });
      });
    });
  }

  function setupTocScrollSpy() {
    var toc = document.querySelector('.toc');
    if (!toc) return;

    var links = Array.prototype.slice.call(toc.querySelectorAll('.toc__link'));
    if (!links.length) return;

    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          if (window.GW.smoothScroll) {
            window.GW.smoothScroll.scrollTo(href);
          } else {
            var target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: window.GW.isReducedMotion ? 'auto' : 'smooth' });
          }
        }
      });
    });

    if (!window.ScrollTrigger) return;

    links.forEach(function(link) {
      var id = link.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      var targetSection = document.querySelector(id);
      if (!targetSection) return;

      ScrollTrigger.create({
        trigger: targetSection,
        start: 'top 40%',
        end: 'bottom 40%',
        onToggle: function(self) {
          if (self.isActive) {
            links.forEach(function(l) { l.classList.remove('is-active'); });
            link.classList.add('is-active');
          }
        }
      });
    });
  }

  function setupMagneticCtas() {
    if (window.GW.isReducedMotion || !window.gsap) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var btns = document.querySelectorAll('.cta-band .btn-cta');
    Array.prototype.forEach.call(btns, function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var relX = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
        var relY = ((e.clientY - rect.top) / rect.height - 0.5) * 24;
        var dx = Math.max(-12, Math.min(12, relX));
        var dy = Math.max(-12, Math.min(12, relY));
        gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
      });

      btn.addEventListener('mouseleave', function() {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  window.GW.page = {
    init: init
  };
})();
