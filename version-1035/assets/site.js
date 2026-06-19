(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupSearchPage();
    setupFilterBars();
    setupPlayers();
  });

  function setupMobileNavigation() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var next = slider.querySelector('[data-hero-next]');
    var prev = slider.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var dotIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(dotIndex);
        start();
      });
    });
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }
    var input = page.querySelector('[data-search-input]');
    var form = page.querySelector('[data-search-form]');
    var cards = Array.prototype.slice.call(page.querySelectorAll('[data-movie-card]'));
    var empty = page.querySelector('[data-no-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (input) {
      input.value = initialQuery;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var match = !query || text.indexOf(query) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : '';
        var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        window.history.replaceState(null, '', nextUrl);
        apply();
      });
    }
    apply();
  }

  function setupFilterBars() {
    var bars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
    bars.forEach(function (bar) {
      var section = bar.closest('section');
      var grid = section ? section.querySelector('[data-filter-grid]') : null;
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]')) : [];
      var empty = section ? section.querySelector('[data-no-results]') : null;
      var buttons = Array.prototype.slice.call(bar.querySelectorAll('[data-filter-value]'));

      function apply(value) {
        var visible = 0;
        cards.forEach(function (card) {
          var cardType = card.getAttribute('data-type') || '';
          var match = value === 'all' || cardType === value;
          card.style.display = match ? '' : 'none';
          if (match) {
            visible += 1;
          }
        });
        buttons.forEach(function (button) {
          button.classList.toggle('is-active', button.getAttribute('data-filter-value') === value);
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          apply(button.getAttribute('data-filter-value') || 'all');
        });
      });
    });
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-src') || '';
      var hls = null;
      var attached = false;

      function attachSource() {
        if (attached || !source) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        attachSource();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          overlay.classList.add('is-hidden');
          playVideo();
        });
      }

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (overlay && !video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });

      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }
})();
