(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = $('.menu-toggle');
    var panel = $('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
  }

  function setupSearchForms() {
    $all('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  function setupHeroSlider() {
    var slider = $('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = $all('.hero-slide', slider);
    var dots = $all('.hero-dot', slider);
    var previous = $('.hero-control.prev', slider);
    var next = $('.hero-control.next', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var grid = $('[data-filterable="true"]');
    var panel = $('.filter-panel');
    if (!grid || !panel) {
      return;
    }
    var cards = $all('.movie-card', grid);
    var input = $('.local-filter-input', panel);
    var yearSelect = $('.year-filter', panel);
    var typeSelect = $('.type-filter', panel);
    var sortSelect = $('.sort-filter', panel);
    var years = [];
    var types = [];

    cards.forEach(function (card) {
      var year = card.getAttribute('data-year') || '';
      var type = card.getAttribute('data-type') || '';
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
    });

    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });
    types.sort();

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    types.forEach(function (type) {
      var option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });

    if (grid.getAttribute('data-read-query') === 'true') {
      var query = new URLSearchParams(window.location.search).get('q') || '';
      if (input && query) {
        input.value = query;
      }
    }

    function apply() {
      var keyword = normalizeText(input && input.value);
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visibleCards = [];

      cards.forEach(function (card) {
        var haystack = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        var visible = matchKeyword && matchYear && matchType;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCards.push(card);
        }
      });

      if (sortSelect && sortSelect.value !== 'default') {
        visibleCards.sort(function (a, b) {
          if (sortSelect.value === 'year-desc') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }
          return normalizeText(a.getAttribute('data-title')).localeCompare(normalizeText(b.getAttribute('data-title')), 'zh-CN');
        });
        visibleCards.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    [input, yearSelect, typeSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    var button = document.getElementById(options.buttonId);
    var source = options.source;
    var hlsInstance = null;
    var started = false;

    if (!video || !source) {
      return;
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    function attachSource() {
      if (started) {
        hideCover();
        playVideo();
        return;
      }
      started = true;
      hideCover();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            video.src = source;
            playVideo();
          }
        });
        return;
      }

      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      playVideo();
    }

    if (cover) {
      cover.addEventListener('click', attachSource);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        attachSource();
      });
    }
    video.addEventListener('play', hideCover);
    video.addEventListener('click', function () {
      if (!started) {
        attachSource();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupSearchForms();
    setupHeroSlider();
    setupFilters();
  });
})();
