(function () {
  function select(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function closestCard(element) {
    while (element && element !== document) {
      if (element.matches && element.matches('[data-card]')) {
        return element;
      }
      element = element.parentNode;
    }
    return null;
  }

  function setupHeader() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', mobileNav.classList.contains('open') ? 'true' : 'false');
      });
    }

    select('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[type="search"]');
        var value = input ? input.value.trim() : '';
        var target = form.getAttribute('data-search-target') || 'search.html';
        if (value) {
          window.location.href = target + '?q=' + encodeURIComponent(value);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = select('[data-hero-slide]', hero);
    var dots = select('[data-hero-dot]', hero);
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
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = select('[data-filter-panel]');
    panels.forEach(function (panel) {
      var cards = select('[data-card]');
      var noResults = document.querySelector('[data-no-results]');
      var keyword = panel.querySelector('[data-filter-keyword]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var reset = panel.querySelector('[data-filter-reset]');

      function apply() {
        var word = keyword ? keyword.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var matchWord = !word || haystack.indexOf(word) !== -1;
          var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
          var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
          var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var shouldShow = matchWord && matchRegion && matchType && matchYear;
          card.style.display = shouldShow ? '' : 'none';
          if (shouldShow) {
            visible += 1;
          }
        });

        if (noResults) {
          noResults.classList.toggle('show', visible === 0);
        }
      }

      [keyword, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (keyword) {
            keyword.value = '';
          }
          if (region) {
            region.value = '';
          }
          if (type) {
            type.value = '';
          }
          if (year) {
            year.value = '';
          }
          apply();
        });
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && keyword) {
        keyword.value = q;
      }
      apply();
    });
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (window.__movieSiteHlsPromise) {
      return window.__movieSiteHlsPromise;
    }
    window.__movieSiteHlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      var finished = false;
      var timer = window.setTimeout(function () {
        if (!finished) {
          finished = true;
          reject(new Error('timeout'));
        }
      }, 8000);
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        if (!finished) {
          finished = true;
          window.clearTimeout(timer);
          resolve(window.Hls);
        }
      };
      script.onerror = function () {
        if (!finished) {
          finished = true;
          window.clearTimeout(timer);
          reject(new Error('network'));
        }
      };
      document.head.appendChild(script);
    });
    return window.__movieSiteHlsPromise;
  }

  function setupPlayers() {
    select('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var status = player.querySelector('[data-player-status]');
      var source = player.getAttribute('data-source');
      var attached = false;
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function attachNative() {
        video.src = source;
        attached = true;
        return Promise.resolve();
      }

      function attachWithHls(Hls) {
        if (!Hls || !Hls.isSupported()) {
          return Promise.reject(new Error('unsupported'));
        }
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('视频加载失败，请刷新页面后再播放');
          }
        });
        attached = true;
        return Promise.resolve();
      }

      function prepare() {
        if (attached) {
          return Promise.resolve();
        }
        if (!source) {
          setStatus('当前播放源暂不可用');
          return Promise.reject(new Error('missing source'));
        }
        setStatus('播放器正在准备');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          return attachNative();
        }
        return loadHlsLibrary().then(attachWithHls).catch(function () {
          setStatus('当前浏览器需要 HLS 支持后播放');
          return Promise.reject(new Error('hls unavailable'));
        });
      }

      function play() {
        prepare().then(function () {
          video.controls = true;
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
              setStatus('点击播放按钮开始观看');
            });
          }
        }).catch(function () {});
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });
        video.addEventListener('play', function () {
          player.classList.add('playing');
          setStatus('');
        });
        video.addEventListener('pause', function () {
          player.classList.remove('playing');
        });
        window.addEventListener('beforeunload', function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHeader();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
