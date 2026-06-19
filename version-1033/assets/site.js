const ready = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};

ready(() => {
  setupMobileMenu();
  setupHeroCarousel();
  setupLocalFiltering();
});

function setupMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
    toggle.textContent = panel.classList.contains("open") ? "×" : "☰";
  });
}

function setupHeroCarousel() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const dots = Array.from(hero.querySelectorAll("[data-slide-dot]"));
  const next = hero.querySelector("[data-slide-next]");
  const prev = hero.querySelector("[data-slide-prev]");
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  next?.addEventListener("click", () => {
    show(index + 1);
    start();
  });

  prev?.addEventListener("click", () => {
    show(index - 1);
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.slideDot || 0));
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function setupLocalFiltering() {
  const panels = Array.from(document.querySelectorAll(".filter-panel"));

  panels.forEach((panel) => {
    const input = panel.querySelector("[data-filter-input]");
    const grid = document.querySelector("[data-filter-grid]");
    const chips = Array.from(panel.querySelectorAll("[data-chip-filter]"));

    if (!grid) {
      return;
    }

    const items = Array.from(grid.children);

    const apply = (term) => {
      const query = normalize(term);
      items.forEach((item) => {
        const haystack = normalize(item.dataset.searchText || item.textContent || "");
        item.classList.toggle("is-hidden", Boolean(query) && !haystack.includes(query));
      });
    };

    input?.addEventListener("input", () => apply(input.value));

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const term = chip.dataset.chipFilter || "";
        chips.forEach((other) => other.classList.toggle("active", other === chip && term !== ""));
        if (input) {
          input.value = term;
        }
        apply(term);
      });
    });
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}
