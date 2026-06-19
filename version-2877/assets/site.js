(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('.main-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = qs('[data-hero-slider]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    restart();
  }

  function initFilters() {
    var root = qs('[data-filter-root]');
    var list = qs('[data-filter-list]');
    if (!root || !list) {
      return;
    }
    var input = qs('[data-filter-input]', root);
    var year = qs('[data-filter-year]', root);
    var cards = qsa('.movie-card', list);

    function apply() {
      var keyword = (input && input.value || '').trim().toLowerCase();
      var yearValue = year && year.value || '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var hitKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var hitYear = !yearValue || card.getAttribute('data-year') === yearValue;
        card.classList.toggle('is-hidden', !(hitKeyword && hitYear));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
  }

  function initPlayers() {
    qsa('[data-player-box]').forEach(function (box) {
      var video = qs('video[data-hls-src]', box);
      var start = qs('[data-player-start]', box);
      if (!video) {
        return;
      }
      var src = video.getAttribute('data-hls-src');
      if (src && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (src && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
      function playVideo() {
        box.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            box.classList.remove('is-playing');
          });
        }
      }
      if (start) {
        start.addEventListener('click', playVideo);
      }
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
      });
    });
  }

  function initSearchPage() {
    var page = qs('[data-search-page]');
    if (!page || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var input = qs('[data-search-input]', page);
    var status = qs('[data-search-status]', page);
    var results = qs('[data-search-results]', page);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render(query) {
      var keyword = (query || '').trim().toLowerCase();
      if (!keyword) {
        status.textContent = '请输入关键词开始搜索。';
        results.innerHTML = '';
        return;
      }
      var matched = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        var haystack = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.category,
          item.desc
        ].join(' ').toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);
      status.textContent = '找到 ' + matched.length + ' 条匹配结果。';
      results.innerHTML = matched.map(function (item) {
        return '<article class="search-result-item">'
          + '<a href="' + escapeHtml(item.url) + '"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '"></a>'
          + '<div><h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>'
          + '<p>' + escapeHtml(item.desc) + '</p>'
          + '<div class="meta-line"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>'
          + '</div></article>';
      }).join('');
    }

    if (input) {
      input.value = initial;
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(initial);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
