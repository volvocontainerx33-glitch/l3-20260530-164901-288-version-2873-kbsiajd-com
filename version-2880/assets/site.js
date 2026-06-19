(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const backToTop = document.querySelector(".back-to-top");

  if (backToTop) {
    window.addEventListener("scroll", function () {
      backToTop.classList.toggle("is-visible", window.scrollY > 420);
    });

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const next = carousel.querySelector("[data-hero-next]");
    const prev = carousel.querySelector("[data-hero-prev]");
    let current = 0;
    let timer = null;

    const activate = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        if (dotIndex === current) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        activate(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        activate(current - 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  const panels = Array.from(document.querySelectorAll(".filter-panel"));

  panels.forEach(function (panel) {
    const scope = panel.parentElement || document;
    const items = Array.from(scope.querySelectorAll(".search-item"));
    const searchInput = panel.querySelector("[data-filter-search]");
    const regionSelect = panel.querySelector("[data-filter-region]");
    const genreSelect = panel.querySelector("[data-filter-genre]");
    const yearSelect = panel.querySelector("[data-filter-year]");
    const typeSelect = panel.querySelector("[data-filter-type]");
    const counter = panel.querySelector("[data-filter-count]");

    const read = function (element) {
      return element ? element.value.trim().toLowerCase() : "";
    };

    const apply = function () {
      const keyword = read(searchInput);
      const region = read(regionSelect);
      const genre = read(genreSelect);
      const year = read(yearSelect);
      const type = read(typeSelect);
      let visible = 0;

      items.forEach(function (item) {
        const haystack = [
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-type"),
          item.getAttribute("data-genre"),
          item.getAttribute("data-year"),
          item.textContent
        ].join(" ").toLowerCase();

        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesRegion = !region || (item.getAttribute("data-region") || "").toLowerCase().includes(region);
        const matchesGenre = !genre || (item.getAttribute("data-genre") || "").toLowerCase().includes(genre);
        const matchesYear = !year || (item.getAttribute("data-year") || "").toLowerCase().includes(year);
        const matchesType = !type || (item.getAttribute("data-type") || "").toLowerCase().includes(type);
        const show = matchesKeyword && matchesRegion && matchesGenre && matchesYear && matchesType;

        item.classList.toggle("is-hidden-by-filter", !show);
        if (show) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = "当前显示 " + visible + " 部";
      }
    };

    [searchInput, regionSelect, genreSelect, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
})();
