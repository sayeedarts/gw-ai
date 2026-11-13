/**
 * page-ai-styling.js — Interactive 5-stage AI Style Studio preview on AI Styling page
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  function init() {
    var root = document.querySelector('[data-page="ai-styling"]');
    if (!root) return;

    var tabs = Array.prototype.slice.call(document.querySelectorAll('.ai-stage__tab'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.ai-stage__img'));
    var badge = document.querySelector('.ai-stage__badge');
    var caption = document.querySelector('.ai-stage__caption');
    var promptBtns = Array.prototype.slice.call(document.querySelectorAll('.ai-prompt__chip'));
    var promptDisplay = document.querySelector('.ai-prompt__text');

    if (tabs.length && panels.length) {
      tabs.forEach(function(tab, idx) {
        tab.addEventListener('click', function() {
          activateTab(idx);
        });
        tab.addEventListener('keydown', function(e) {
          var nextIdx = -1;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            nextIdx = (idx + 1) % tabs.length;
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            nextIdx = (idx - 1 + tabs.length) % tabs.length;
          }
          if (nextIdx !== -1) {
            e.preventDefault();
            tabs[nextIdx].focus();
            activateTab(nextIdx);
          }
        });
      });
    }

    function activateTab(idx) {
      tabs.forEach(function(t, i) {
        var active = i === idx;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      panels.forEach(function(p, i) {
        var active = i === idx;
        p.classList.toggle('is-active', active);
        p.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      var activeTab = tabs[idx];
      if (activeTab) {
        if (badge) badge.textContent = activeTab.getAttribute('data-badge') || '';
        if (caption) caption.textContent = activeTab.getAttribute('data-caption') || '';
      }
    }

    if (promptBtns.length && promptDisplay) {
      promptBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          promptBtns.forEach(function(b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          var text = btn.getAttribute('data-prompt') || btn.textContent;
          promptDisplay.textContent = text;
        });
      });
    }
  }

  window.GW.pageAiStyling = {
    init: init
  };
})();
