const ready = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};

ready(() => {
  document.querySelectorAll("[data-player]").forEach((root) => {
    createPlayer(root);
  });
});

function createPlayer(root) {
  const video = root.querySelector("video");
  const button = root.querySelector("[data-play]");
  const stream = video?.dataset.stream || root.dataset.stream || "";
  let hls = null;
  let initialized = false;

  if (!video || !button || !stream) {
    return;
  }

  const start = async () => {
    root.classList.add("is-playing");
    video.setAttribute("controls", "controls");

    if (!initialized) {
      initialized = true;

      const Hls = window.Hls;

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    try {
      await video.play();
    } catch (error) {
      root.classList.remove("is-playing");
      button.querySelector("em").textContent = "点击重试";
    }
  };

  button.addEventListener("click", start);

  video.addEventListener("click", () => {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
