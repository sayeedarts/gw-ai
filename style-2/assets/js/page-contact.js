/**
 * page-contact.js — Client-side validation, Formspree/Web3Forms endpoint submit, and mailto fallback
 */
(function() {
  'use strict';
  window.GW = window.GW || {};

  function init() {
    var root = document.querySelector('[data-page="contact"]');
    if (!root) return;

    var form = document.querySelector('.js-booking-form');
    if (!form) return;

    var statusEl = form.querySelector('.js-form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    var fallbackEmail = form.getAttribute('data-fallback-email') || 'saidarts@gmail.com';

    function setFieldError(field, message) {
      var group = field.closest('.form__group');
      var errEl = group ? group.querySelector('.form__error') : null;
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        if (group) group.classList.add('has-error');
        if (errEl) errEl.textContent = message;
      } else {
        field.removeAttribute('aria-invalid');
        if (group) group.classList.remove('has-error');
        if (errEl) errEl.textContent = '';
      }
    }

    function validateField(field) {
      var val = (field.value || '').trim();
      var required = field.hasAttribute('required');
      if (required && !val) {
        setFieldError(field, 'This field is required.');
        return false;
      }
      if (field.type === 'email' && val) {
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(val)) {
          setFieldError(field, 'Please enter a valid email address.');
          return false;
        }
      }
      setFieldError(field, '');
      return true;
    }

    var inputs = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
    inputs.forEach(function(input) {
      input.addEventListener('blur', function() {
        validateField(input);
      });
      input.addEventListener('input', function() {
        if (input.getAttribute('aria-invalid') === 'true') {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var isValid = true;
      var firstInvalid = null;
      inputs.forEach(function(input) {
        if (!validateField(input)) {
          isValid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!isValid) {
        if (statusEl) {
          statusEl.className = 'form__status is-error js-form-status';
          statusEl.textContent = 'Please check the highlighted fields before submitting.';
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = {};
      inputs.forEach(function(input) {
        if (input.name) {
          data[input.name] = (input.value || '').trim();
        }
      });

      if (endpoint) {
        if (submitBtn) submitBtn.disabled = true;
        if (statusEl) {
          statusEl.className = 'form__status is-info js-form-status';
          statusEl.textContent = 'Sending your request...';
        }

        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        }).then(function(res) {
          if (!res.ok) throw new Error('Network response was not ok');
          form.reset();
          if (statusEl) {
            statusEl.className = 'form__status is-success js-form-status';
            statusEl.textContent = 'Thank you. Your appointment request has been sent. Appointment subject to confirmation.';
          }
        }).catch(function() {
          triggerMailtoFallback(data);
        }).finally(function() {
          if (submitBtn) submitBtn.disabled = false;
        });
      } else {
        triggerMailtoFallback(data);
      }
    });

    function triggerMailtoFallback(data) {
      var subject = 'Green Wardrobe Experience Request — ' + (data.interest || 'Consultation');
      var lines = [
        'Name: ' + (data.name || ''),
        'Email: ' + (data.email || ''),
        'Phone: ' + (data.phone || 'Not provided'),
        'Focus / Interest: ' + (data.interest || ''),
        'Occasion / Look Direction: ' + (data.occasion || 'Not provided'),
        'Preferred Date: ' + (data.date || 'Flexible'),
        '',
        'Notes:',
        data.notes || ''
      ];
      var mailtoHref = 'mailto:' + encodeURIComponent(fallbackEmail) +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      if (statusEl) {
        statusEl.className = 'form__status is-success js-form-status';
        statusEl.innerHTML = 'Opening your email application to send your request to <strong>' + fallbackEmail + '</strong>. Appointment subject to confirmation.';
      }
      window.location.href = mailtoHref;
    }
  }

  window.GW.pageContact = {
    init: init
  };
})();
