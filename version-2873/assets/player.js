import { H as Hls } from "./hls.js";

var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

players.forEach(function (player) {
  var video = player.querySelector('video');
  var overlay = player.querySelector('.player-overlay');
  var source = player.getAttribute('data-src');
  var loaded = false;
  var hls = null;

  function attachSource() {
    if (loaded || !video || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    loaded = true;
  }

  function playVideo() {
    attachSource();

    if (overlay) {
      overlay.hidden = true;
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!loaded) {
        playVideo();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
});
