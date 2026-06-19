(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initPageSearch();
    initGlobalSearch();
    initPlayers();
  });

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function initPageSearch() {
    var input = document.querySelector("[data-page-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var result = document.querySelector("[data-result-count]");
    if (!input || !cards.length) {
      return;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function run() {
      var query = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.tags
        ].join(" "));
        var matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (result) {
        result.textContent = "当前显示 " + visible + " 部";
      }
    }

    input.addEventListener("input", run);
    run();
  }

  function initGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var results = document.querySelector("[data-global-results]");
    if (!input || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#39;"
        }[char];
      });
    }

    function getRootPrefix() {
      return document.body.dataset.level === "1" ? "../" : "";
    }

    function render(items) {
      var prefix = getRootPrefix();
      results.innerHTML = items.map(function (item) {
        var tags = (item.tags || []).join(" ");
        return "<a class=\"search-result\" href=\"" + prefix + escapeHtml(item.url) + "\">" +
          "<img src=\"" + prefix + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" onerror=\"this.classList.add('image-missing');\">" +
          "<div>" +
            "<h3>" + escapeHtml(item.title) + "</h3>" +
            "<p>" + escapeHtml(item.year + " · " + item.region + " · " + item.type + " · " + item.genre) + "</p>" +
            "<p>" + escapeHtml(item.oneLine) + "</p>" +
            "<p>" + escapeHtml(tags) + "</p>" +
          "</div>" +
        "</a>";
      }).join("");
    }

    function search() {
      var query = input.value.toLowerCase().trim();
      if (!query) {
        render(window.MOVIE_SEARCH_INDEX.slice(0, 40));
        return;
      }
      var matched = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        var text = [
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" ").toLowerCase();
        return text.indexOf(query) !== -1;
      }).slice(0, 80);
      render(matched);
    }

    input.addEventListener("input", search);
    search();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    if (!players.length) {
      return;
    }

    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-player-start]");
      var source = shell.dataset.src;
      if (!video || !source) {
        return;
      }

      function start() {
        shell.classList.add("is-playing");
        loadVideo(video, source);
        video.play().catch(function () {
          video.controls = true;
        });
      }

      if (button) {
        button.addEventListener("click", start);
      }
    });
  }

  function loadVideo(video, source) {
    if (video.dataset.loaded === "1") {
      return;
    }
    video.dataset.loaded = "1";
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }
})();
