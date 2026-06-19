const SiteShell = (() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  };

  const setupMenu = () => {
    const button = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  };

  const setupHero = () => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector(".hero-prev");
    const next = hero.querySelector(".hero-next");
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const play = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        show(dotIndex);
        play();
      });
    });
    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        play();
      });
    }
    show(0);
    play();
  };

  const setupFilter = () => {
    const input = document.querySelector("[data-filter-input]");
    const list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    const cards = Array.from(list.querySelectorAll(".movie-card"));
    input.addEventListener("input", () => {
      const value = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const text = (card.dataset.search || "").toLowerCase();
        card.classList.toggle("is-filter-hidden", Boolean(value) && !text.includes(value));
      });
    });
  };

  const setupSearch = () => {
    const input = document.querySelector("[data-search-page-input]");
    const form = document.querySelector("[data-search-page-form]");
    const list = document.querySelector("[data-search-list]");
    if (!input || !list) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    const cards = Array.from(list.querySelectorAll(".movie-card"));
    input.value = query;

    const apply = () => {
      const value = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const text = (card.dataset.search || "").toLowerCase();
        card.classList.toggle("is-filter-hidden", Boolean(value) && !text.includes(value));
      });
    };

    input.addEventListener("input", apply);
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = input.value.trim();
        const url = value ? `./search.html?q=${encodeURIComponent(value)}` : "./search.html";
        history.replaceState(null, "", url);
        apply();
      });
    }
    apply();
  };

  ready(() => {
    setupMenu();
    setupHero();
    setupFilter();
    setupSearch();
  });

  return { ready };
})();

const MoviePlayer = (() => {
  const mount = (streamUrl) => {
    SiteShell.ready(() => {
      const video = document.querySelector("[data-player-video]");
      const cover = document.querySelector("[data-player-cover]");
      if (!video || !cover || !streamUrl) {
        return;
      }
      let initialized = false;
      let hlsInstance = null;

      const prepare = () => {
        if (initialized) {
          return;
        }
        initialized = true;
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
                return;
              }
              if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
                return;
              }
              hlsInstance.destroy();
              hlsInstance = null;
            }
          });
          return;
        }
        video.src = streamUrl;
      };

      const start = () => {
        prepare();
        cover.classList.add("is-hidden");
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            cover.classList.remove("is-hidden");
          });
        }
      };

      cover.addEventListener("click", start);
      video.addEventListener("click", () => {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", () => cover.classList.add("is-hidden"));
      window.addEventListener("beforeunload", () => {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  return { mount };
})();
