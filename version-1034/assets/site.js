(function () {
    var mobileButton = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var url = './search.html';
            if (value) {
                url += '?q=' + encodeURIComponent(value);
            }
            window.location.href = url;
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;
        var showSlide = function (next) {
            if (!slides.length) return;
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };
        var restart = function () {
            if (timer) window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        };
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (prev) prev.addEventListener('click', function () { showSlide(index - 1); restart(); });
        if (next) next.addEventListener('click', function () { showSlide(index + 1); restart(); });
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () { showSlide(i); restart(); });
        });
        restart();
    }

    var searchInput = document.querySelector('[data-page-search]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
    }
    var applyFilters = function () {
        var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var c = categoryFilter ? categoryFilter.value : '';
        var y = yearFilter ? yearFilter.value : '';
        cards.forEach(function (card) {
            var haystack = [card.dataset.title, card.dataset.tags, card.dataset.category, card.dataset.year].join(' ').toLowerCase();
            var matchQuery = !q || haystack.indexOf(q) !== -1;
            var matchCategory = !c || card.dataset.category === c;
            var matchYear = !y || card.dataset.year === y;
            card.classList.toggle('is-hidden', !(matchQuery && matchCategory && matchYear));
        });
    };
    if (searchInput || categoryFilter || yearFilter) {
        ['input', 'change'].forEach(function (eventName) {
            if (searchInput) searchInput.addEventListener(eventName, applyFilters);
            if (categoryFilter) categoryFilter.addEventListener(eventName, applyFilters);
            if (yearFilter) yearFilter.addEventListener(eventName, applyFilters);
        });
        applyFilters();
    }

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video[data-src]');
        var start = player.querySelector('[data-player-start]');
        var source = video ? video.getAttribute('data-src') : '';
        var prepared = false;
        var prepareVideo = function () {
            if (!video || !source || prepared) return;
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        };
        var startPlayback = function () {
            prepareVideo();
            player.classList.add('is-started');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    player.classList.add('is-started');
                });
            }
        };
        if (start && video) {
            start.addEventListener('click', startPlayback);
        }
        if (video) {
            video.addEventListener('click', prepareVideo, { once: true });
            video.addEventListener('play', function () {
                player.classList.add('is-started');
            });
        }
    }
})();
