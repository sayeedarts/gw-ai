/**
 * utils.js — Shared helper utilities
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  var utils = {
    // Splits text of an element into individual word spans (.begins__w)
    splitWords: function(element) {
      if (!element) return [];
      var originalText = element.getAttribute('data-original-text');
      if (!originalText) {
        originalText = element.textContent.trim();
        element.setAttribute('data-original-text', originalText);
      }
      var words = originalText.split(/\s+/);
      element.innerHTML = words.map(function(w) {
        return '<span class="begins__w">' + w + '</span>';
      }).join(' ');

      return Array.prototype.slice.call(element.querySelectorAll('.begins__w'));
    },

    // Splits text nodes of an element into lines with inner wrappers
    splitLines: function(element) {
      if (!element) return [];
      var originalHTML = element.getAttribute('data-original-html');
      if (!originalHTML) {
        element.setAttribute('data-original-html', element.innerHTML);
      } else {
        element.innerHTML = originalHTML;
      }

      var text = element.innerText.trim();
      var words = text.split(/\s+/);
      element.innerHTML = words.map(function(w) {
        return '<span class="gw-word">' + w + '</span>';
      }).join(' ');

      var wordEls = element.querySelectorAll('.gw-word');
      if (!wordEls.length) return [];

      var lines = [];
      var currentLine = [];
      var lastTop = null;

      Array.prototype.forEach.call(wordEls, function(el) {
        var top = el.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) < 4) {
          currentLine.push(el.innerText);
        } else {
          lines.push(currentLine.join(' '));
          currentLine = [el.innerText];
        }
        lastTop = top;
      });
      if (currentLine.length) {
        lines.push(currentLine.join(' '));
      }

      element.innerHTML = lines.map(function(lineStr) {
        return '<span class="line"><span class="line__inner">' + lineStr + '</span></span>';
      }).join('');

      return element.querySelectorAll('.line__inner');
    },

    // Debounce function
    debounce: function(fn, delay) {
      var timer = null;
      return function() {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() {
          fn.apply(context, args);
        }, delay);
      };
    },

    // Count up number from 0 to target
    countUp: function(targetEl, targetNum, duration, onComplete) {
      if (!targetEl) return;
      var obj = { val: 0 };
      if (window.gsap) {
        gsap.to(obj, {
          val: targetNum,
          duration: duration || 1.8,
          ease: 'power2.out',
          onUpdate: function() {
            targetEl.textContent = Math.round(obj.val);
          },
          onComplete: onComplete
        });
      } else {
        targetEl.textContent = targetNum;
        if (onComplete) onComplete();
      }
    },

    // Typewriter effect
    typeText: function(element, text, speed, onComplete) {
      if (!element) return;
      var i = 0;
      element.textContent = '';
      var interval = setInterval(function() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(interval);
          if (onComplete) onComplete();
        }
      }, speed || 40);
    }
  };

  window.GW.utils = utils;
})();
