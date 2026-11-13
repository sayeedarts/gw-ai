/**
 * page-final-looks.js — Look category filter and accessible lightbox modal
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  function init() {
    var root = document.querySelector('[data-page="final-looks"]');
    if (!root) return;

    var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.looks-filter__btn'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.look-card'));
    var lightbox = document.querySelector('.lightbox');
    var lbImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
    var lbTitle = lightbox ? lightbox.querySelector('.lightbox__title') : null;
    var lbTag = lightbox ? lightbox.querySelector('.lightbox__tag') : null;
    var lbDesc = lightbox ? lightbox.querySelector('.lightbox__desc') : null;
    var lbClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;
    var lbPrev = lightbox ? lightbox.querySelector('.lightbox__prev') : null;
    var lbNext = lightbox ? lightbox.querySelector('.lightbox__next') : null;
    var activeCardIndex = -1;
    var lastFocused = null;

    // Filter handling
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var cat = btn.getAttribute('data-filter') || 'all';
        filterBtns.forEach(function(b) {
          var isMatch = b === btn;
          b.classList.toggle('is-active', isMatch);
          b.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
        });

        cards.forEach(function(card) {
          var cardCat = card.getAttribute('data-category') || '';
          var visible = cat === 'all' || cardCat === cat;
          card.classList.toggle('is-hidden-card', !visible);
        });

        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      });
    });

    if (!lightbox) return;

    function getVisibleCards() {
      return cards.filter(function(c) {
        return !c.classList.contains('is-hidden-card');
      });
    }

    function openLightbox(card) {
      var visible = getVisibleCards();
      activeCardIndex = visible.indexOf(card);
      if (activeCardIndex < 0) activeCardIndex = 0;

      lastFocused = document.activeElement;
      populateLightbox(visible[activeCardIndex]);

      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      if (window.GW.smoothScroll) window.GW.smoothScroll.stop();
      if (window.GW.scrollTop) window.GW.scrollTop.update();

      var main = document.querySelector('#main');
      var header = document.querySelector('.site-header');
      if (main) main.setAttribute('inert', '');
      if (header) header.setAttribute('inert', '');

      if (lbClose) lbClose.focus();
    }

    function populateLightbox(card) {
      if (!card) return;
      var img = card.querySelector('.look-card__img');
      var title = card.querySelector('.look-card__title');
      var tag = card.querySelector('.look-card__tag');
      var desc = card.getAttribute('data-desc') || '';

      if (lbImg && img) {
        lbImg.setAttribute('src', img.getAttribute('src') || '');
        lbImg.setAttribute('alt', img.getAttribute('alt') || '');
      }
      if (lbTitle && title) lbTitle.textContent = title.textContent;
      if (lbTag && tag) lbTag.textContent = tag.textContent;
      if (lbDesc) lbDesc.textContent = desc;
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      if (window.GW.smoothScroll) window.GW.smoothScroll.start();
      if (window.GW.scrollTop) window.GW.scrollTop.update();

      var main = document.querySelector('#main');
      var header = document.querySelector('.site-header');
      if (main) main.removeAttribute('inert');
      if (header) header.removeAttribute('inert');

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function stepLightbox(dir) {
      var visible = getVisibleCards();
      if (!visible.length) return;
      activeCardIndex = (activeCardIndex + dir + visible.length) % visible.length;
      populateLightbox(visible[activeCardIndex]);
    }

    cards.forEach(function(card) {
      var trigger = card.querySelector('.look-card__btn');
      if (trigger) {
        trigger.addEventListener('click', function() {
          openLightbox(card);
        });
      }
    });

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbPrev) lbPrev.addEventListener('click', function() { stepLightbox(-1); });
    if (lbNext) lbNext.addEventListener('click', function() { stepLightbox(1); });

    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    window.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepLightbox(1);
      } else if (e.key === 'Tab') {
        var focusables = Array.prototype.slice.call(
          lightbox.querySelectorAll('button:not([disabled]), [href]:not([disabled])')
        );
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  window.GW.pageFinalLooks = {
    init: init
  };
})();
