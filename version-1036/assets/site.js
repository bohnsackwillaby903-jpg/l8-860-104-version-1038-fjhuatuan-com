(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.hasAttribute("hidden");
      if (open) {
        mobileNav.removeAttribute("hidden");
      } else {
        mobileNav.setAttribute("hidden", "");
      }
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll(".search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        event.preventDefault();
        input.focus();
      }
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  var filterPanel = document.querySelector(".filter-panel");
  var filterList = document.querySelector("[data-filter-list]");
  if (filterPanel && filterList) {
    var keywordInput = filterPanel.querySelector(".filter-input");
    var yearInput = filterPanel.querySelector(".filter-year");
    var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));

    function filterCards() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var year = yearInput ? yearInput.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle("is-filtered-out", !(matchedKeyword && matchedYear));
      });
    }

    if (keywordInput) {
      keywordInput.addEventListener("input", filterCards);
    }
    if (yearInput) {
      yearInput.addEventListener("change", filterCards);
    }
  }

  var searchMain = document.querySelector('[data-page="search"]');
  var searchResults = document.getElementById("search-results");
  if (searchMain && searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var searchInput = document.querySelector('.page-search-form input[name="q"]');
    var title = document.getElementById("search-title");
    if (searchInput) {
      searchInput.value = query;
    }
    if (title && query) {
      title.textContent = "搜索结果：" + query;
    }

    function renderMovie(movie) {
      return [
        '<a class="movie-card movie-card-compact" href="' + movie.url + '">',
        '<div class="movie-poster">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="score">★ ' + movie.rating + '</span>',
        '</div>',
        '<div class="movie-card-body">',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="movie-meta">',
        '<span>' + escapeHtml(movie.region) + '</span>',
        '<span>' + escapeHtml(String(movie.year)) + '年</span>',
        '<span>' + escapeHtml(movie.type) + '</span>',
        '</div>',
        '<div class="movie-tags">' + movie.genres.slice(0, 3).map(function (genre) { return '<span>' + escapeHtml(genre) + '</span>'; }).join("") + '</div>',
        '</div>',
        '</a>'
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    var results = [];
    if (query) {
      var lower = query.toLowerCase();
      results = window.SEARCH_MOVIES.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genreText, movie.tagText, movie.oneLine]
          .join(" ")
          .toLowerCase()
          .indexOf(lower) !== -1;
      });
    } else {
      results = window.SEARCH_MOVIES.slice(0, 48);
    }

    searchResults.innerHTML = results.slice(0, 240).map(renderMovie).join("");
    if (!results.length) {
      searchResults.innerHTML = '<div class="detail-card"><h2>暂无匹配结果</h2><p>可尝试更换片名、年份、地区或题材关键词。</p></div>';
    }
  }
}());
