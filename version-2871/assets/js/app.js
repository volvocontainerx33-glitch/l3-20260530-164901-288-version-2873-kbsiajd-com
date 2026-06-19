(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
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
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                restart();
            });
        });

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

        restart();
    });

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            var scope = input.closest('main') || document;
            var items = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .ranking-card'));
            items.forEach(function (item) {
                var haystack = [
                    item.getAttribute('data-title'),
                    item.getAttribute('data-tags'),
                    item.getAttribute('data-year'),
                    item.getAttribute('data-region'),
                    item.getAttribute('data-category'),
                    item.textContent
                ].join(' ').toLowerCase();
                item.classList.toggle('is-filtered-out', value && haystack.indexOf(value) === -1);
            });
        });
    });

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    document.querySelectorAll('.player-box').forEach(function (box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('.play-overlay');
        var stream = box.getAttribute('data-video');
        var prepared = false;

        function begin() {
            if (!video || !stream) {
                return;
            }
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (prepared) {
                video.play().catch(function () {});
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.play().catch(function () {});
                return;
            }
            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function (event) {
                event.preventDefault();
                begin();
            });
        }

        box.addEventListener('click', function () {
            if (!prepared) {
                begin();
            }
        });
    });
})();
