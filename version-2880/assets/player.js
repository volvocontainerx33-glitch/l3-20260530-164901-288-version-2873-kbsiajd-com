(function () {
  const players = Array.from(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    const video = player.querySelector("video");
    const overlay = player.querySelector(".player-overlay");
    const status = player.querySelector(".player-status");

    if (!video || !overlay) {
      return;
    }

    const src = video.getAttribute("src");
    let hlsInstance = null;
    let isReady = false;

    const setStatus = function (message) {
      if (status) {
        status.textContent = message || "";
      }
    };

    const markReady = function () {
      isReady = true;
      setStatus("");
    };

    const showError = function () {
      setStatus("播放暂时不可用");
    };

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, markReady);
      hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          showError();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.addEventListener("loadedmetadata", markReady, { once: true });
    } else {
      showError();
    }

    const startPlayback = function () {
      overlay.classList.add("is-hidden");
      video.controls = true;

      if (!isReady) {
        setStatus("加载中…");
      }

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          overlay.classList.remove("is-hidden");
          setStatus("点击画面继续播放");
        });
      }
    };

    overlay.addEventListener("click", startPlayback);

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
      setStatus("");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
