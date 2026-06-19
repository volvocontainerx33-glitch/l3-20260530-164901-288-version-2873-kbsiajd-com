(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilter(panel) {
    var textInput = panel.querySelector('[data-filter-text]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var countOutput = panel.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (textInput && initialQuery) {
      textInput.value = initialQuery;
    }

    function matches(card) {
      var query = normalize(textInput ? textInput.value : '');
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var searchText = normalize(card.getAttribute('data-search'));
      var cardType = card.getAttribute('data-type') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var cardYear = card.getAttribute('data-year') || '';

      if (query && searchText.indexOf(query) === -1) {
        return false;
      }
      if (type && cardType !== type) {
        return false;
      }
      if (region && cardRegion !== region) {
        return false;
      }
      if (year && cardYear !== year) {
        return false;
      }
      return true;
    }

    function applyFilter() {
      var visible = 0;
      cards.forEach(function (card) {
        var show = matches(card);
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (countOutput) {
        countOutput.value = '共 ' + visible + ' 部';
        countOutput.textContent = '共 ' + visible + ' 部';
      }

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [textInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(setupFilter);
})();
