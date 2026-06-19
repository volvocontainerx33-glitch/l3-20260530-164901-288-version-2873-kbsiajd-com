import { H as Hls } from './hls-dru42stk.js';

var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function (player) {
  var video = player.querySelector('video[data-hls-src]');
  var cover = player.querySelector('.player-cover');
  var hlsInstance = null;
  var ready = false;
  var wantsToPlay = false;

  function hideCover() {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  }

  function showCover() {
    if (cover) {
      cover.classList.remove('is-hidden');
    }
  }

  function safePlay() {
    if (!video) {
      return;
    }

    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        if (!ready) {
          return;
        }
        showCover();
      });
    }
  }

  function attachSource() {
    if (!video || ready) {
      return;
    }

    var src = video.getAttribute('data-hls-src');

    if (!src) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      ready = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        ready = true;
        if (wantsToPlay) {
          hideCover();
          safePlay();
        }
      });
      return;
    }

    ready = true;
  }

  function startPlayback() {
    wantsToPlay = true;
    hideCover();
    attachSource();
    safePlay();
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
