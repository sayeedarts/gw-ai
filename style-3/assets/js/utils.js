/**
 * Green Wardrobe — utils.js
 */
(function() {
  window.GW = window.GW || {};

  window.GW.utils = {
    // Splits text content into animated lines
    splitLines: function(element) {
      if (!element || element.dataset.splitDone) return;
      var raw = element.innerHTML.replace(/<br\s*[\/]?>/gi, '\n');
      var parts = raw.split(/\n|\//);
      element.innerHTML = '';
      parts.forEach(function(partText) {
        var clean = partText.trim();
        if (!clean) return;
        var lineWrap = document.createElement('span');
        lineWrap.className = 'line-reveal';
        var inner = document.createElement('span');
        inner.className = 'line-reveal__inner';
        inner.textContent = clean;
        lineWrap.appendChild(inner);
        element.appendChild(lineWrap);
      });
      element.dataset.splitDone = 'true';
    },

    // Animate a number count up
    countUp: function(element, target, duration, onComplete) {
      var start = 0;
      var startTime = performance.now();
      var dur = (duration || 1.8) * 1000;

      function update(now) {
        var progress = Math.min((now - startTime) / dur, 1);
        // easeOutQuad
        var ease = 1 - (1 - progress) * (1 - progress);
        var current = Math.round(start + (target - start) * ease);
        element.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          if (onComplete) onComplete();
        }
      }
      requestAnimationFrame(update);
    },

    // Typewriter effect for text
    typeText: function(targetEl, text, speed, onComplete) {
      if (!targetEl) return { cancel: function() {} };
      targetEl.textContent = '';
      var idx = 0;
      var cancelled = false;
      var interval = speed || 45;

      var timer = setInterval(function() {
        if (cancelled) {
          clearInterval(timer);
          return;
        }
        if (idx < text.length) {
          targetEl.textContent += text.charAt(idx);
          idx++;
        } else {
          clearInterval(timer);
          if (onComplete) onComplete();
        }
      }, interval);

      return {
        cancel: function() {
          cancelled = true;
          clearInterval(timer);
        }
      };
    },

    // Reusable compare slider
    initCompareSlider: function(options) {
      var container = options.container;
      var handle = options.handle;
      var initialSplit = options.initialSplit || 50;
      var onUpdate = options.onUpdate;

      if (!container) return;

      var currentSplit = initialSplit;
      container.style.setProperty('--split', currentSplit + '%');
      if (handle) {
        handle.setAttribute('role', 'slider');
        handle.setAttribute('aria-valuemin', '0');
        handle.setAttribute('aria-valuemax', '100');
        handle.setAttribute('aria-valuenow', Math.round(currentSplit));
      }

      function setSplit(val) {
        currentSplit = Math.max(0, Math.min(100, val));
        container.style.setProperty('--split', currentSplit + '%');
        if (handle) {
          handle.setAttribute('aria-valuenow', Math.round(currentSplit));
        }
        if (onUpdate) onUpdate(currentSplit);
      }

      var isDragging = false;

      function onPointerMove(e) {
        if (!isDragging) return;
        var rect = container.getBoundingClientRect();
        if (rect.width <= 0) return;
        var x = e.clientX - rect.left;
        var pct = (x / rect.width) * 100;
        setSplit(pct);
      }

      function onPointerUp(e) {
        if (isDragging) {
          isDragging = false;
          try {
            container.releasePointerCapture(e.pointerId);
          } catch (err) {}
        }
      }

      function onPointerDown(e) {
        isDragging = true;
        try {
          container.setPointerCapture(e.pointerId);
        } catch (err) {}
        onPointerMove(e);
      }

      container.addEventListener('pointerdown', onPointerDown);
      container.addEventListener('pointermove', onPointerMove);
      container.addEventListener('pointerup', onPointerUp);
      container.addEventListener('pointercancel', onPointerUp);

      // Keyboard support
      if (handle) {
        handle.setAttribute('tabindex', '0');
        handle.addEventListener('keydown', function(e) {
          var step = e.shiftKey ? 10 : 2;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            setSplit(currentSplit - step);
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            setSplit(currentSplit + step);
          } else if (e.key === 'Home') {
            e.preventDefault();
            setSplit(0);
          } else if (e.key === 'End') {
            e.preventDefault();
            setSplit(100);
          }
        });
      }

      return {
        setSplit: setSplit,
        getSplit: function() { return currentSplit; },
        playAutoDemo: function(callback) {
          var obj = { val: 50 };
          if (window.gsap) {
            gsap.timeline({ onComplete: callback })
              .to(obj, {
                val: 15,
                duration: 0.8,
                ease: 'power2.inOut',
                onUpdate: function() { setSplit(obj.val); }
              })
              .to(obj, {
                val: 85,
                duration: 1.0,
                ease: 'power2.inOut',
                onUpdate: function() { setSplit(obj.val); }
              })
              .to(obj, {
                val: 50,
                duration: 0.6,
                ease: 'power2.out',
                onUpdate: function() { setSplit(obj.val); }
              });
          }
        }
      };
    }
  };
})();
