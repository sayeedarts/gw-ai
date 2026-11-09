/**
 * Green Wardrobe — final-results.js (FINAL-C Before/After Slider Carousel)
 */
(function() {
  window.GW = window.GW || {};

  window.GW.finalResults = {
    init: function() {
      var section = document.querySelector('#final');
      if (!section) return;

      var words = section.querySelectorAll('.final__word');
      var slidesContainer = section.querySelector('.final__slides');
      var slides = section.querySelectorAll('.final__slide');
      var prevBtn = section.querySelector('.final__nav-btn--prev');
      var nextBtn = section.querySelector('.final__nav-btn--next');
      var dots = section.querySelectorAll('.final__dot');

      var currentIndex = 0;
      var totalSlides = slides.length;
      var sliders = [];

      // Initialize compare sliders for each slide
      slides.forEach(function(slide) {
        var compare = slide.querySelector('.final__compare');
        var handle = slide.querySelector('.scan__handle');
        if (window.GW.utils && compare) {
          var s = window.GW.utils.initCompareSlider({
            container: compare,
            handle: handle,
            initialSplit: 50
          });
          sliders.push(s);
        }
      });

      function goToSlide(index) {
        currentIndex = (index + totalSlides) % totalSlides;
        if (slidesContainer) {
          slidesContainer.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
        }
        dots.forEach(function(d, i) {
          d.classList.toggle('is-active', i === currentIndex);
        });

        // Auto demo for newly active slide
        if (sliders[currentIndex]) {
          sliders[currentIndex].playAutoDemo();
        }
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function() { goToSlide(currentIndex - 1); });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function() { goToSlide(currentIndex + 1); });
      }

      dots.forEach(function(d, i) {
        d.addEventListener('click', function() { goToSlide(i); });
      });

      // Word lighting sequence on entrance
      if (window.ScrollTrigger) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 60%',
          once: true,
          onEnter: function() {
            words.forEach(function(w, i) {
              setTimeout(function() {
                w.classList.add('is-lit');
              }, i * 350);
            });
            if (sliders[0]) {
              sliders[0].playAutoDemo();
            }
          }
        });
      }
    }
  };
})();
