/**
 * Green Wardrobe — imagine.js (IMG-C Expanding Category Panels & Dynamic Brief Typing)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.imagine = {
    init: function() {
      var section = document.querySelector('#imagine');
      if (!section) return;

      var briefInput = section.querySelector('.brief__text');
      var chips = section.querySelectorAll('.brief-chip');
      var panels = section.querySelectorAll('.look-panel');

      var userHasInteracted = false;
      var currentTypingInstance = null;

      function setActiveBrief(chip) {
        if (!chip) return;
        chips.forEach(function(c) {
          c.classList.toggle('is-active', c === chip);
          c.setAttribute('aria-selected', c === chip ? 'true' : 'false');
        });

        var briefText = chip.dataset.gwBrief || '';
        var outfitText = chip.dataset.gwOutfit || '';
        var fabricText = chip.dataset.gwFabric || '';
        var accessoriesText = chip.dataset.gwAccessories || '';
        var groomingText = chip.dataset.gwGrooming || '';

        // Update card details in panels
        var outfitDetail = section.querySelector('[data-detail="outfit"]');
        var fabricDetail = section.querySelector('[data-detail="fabric"]');
        var accDetail = section.querySelector('[data-detail="accessories"]');
        var groomDetail = section.querySelector('[data-detail="grooming"]');

        if (outfitDetail) outfitDetail.textContent = outfitText;
        if (fabricDetail) fabricDetail.textContent = fabricText;
        if (accDetail) accDetail.textContent = accessoriesText;
        if (groomDetail) groomDetail.textContent = groomingText;

        if (currentTypingInstance) currentTypingInstance.cancel();
        if (window.GW.utils && briefInput) {
          currentTypingInstance = window.GW.utils.typeText(briefInput, briefText, 30);
        } else if (briefInput) {
          briefInput.textContent = briefText;
        }
      }

      function setActivePanel(index) {
        panels.forEach(function(p, idx) {
          p.classList.toggle('is-active', idx === index);
        });
      }

      // Initial chip
      if (chips.length > 0) {
        setActiveBrief(chips[0]);
      }
      setActivePanel(0);

      // Chip clicks
      chips.forEach(function(chip) {
        chip.addEventListener('click', function() {
          userHasInteracted = true;
          setActiveBrief(chip);
        });
      });

      // Panel interaction
      panels.forEach(function(panel, idx) {
        panel.addEventListener('mouseenter', function() {
          userHasInteracted = true;
          setActivePanel(idx);
        });
        panel.addEventListener('click', function() {
          userHasInteracted = true;
          setActivePanel(idx);
        });
        panel.addEventListener('focus', function() {
          userHasInteracted = true;
          setActivePanel(idx);
        });
      });

      // Scroll-linked activation before first interaction
      if (window.ScrollTrigger) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 40%',
          end: 'bottom 60%',
          onUpdate: function(self) {
            if (userHasInteracted) return;
            var seg = Math.min(3, Math.floor(self.progress * 4));
            setActivePanel(seg);
          }
        });
      }
    }
  };
})();
