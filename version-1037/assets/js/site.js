(function() {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function(character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function goSearch(form) {
        var input = form.querySelector('input[name="q"], input[type="search"]');
        var value = input ? input.value.trim() : '';
        if (!value) {
            return;
        }
        window.location.href = './search.html?q=' + encodeURIComponent(value);
    }

    function setupMenus() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function() {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function(form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                goSearch(form);
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function activate(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function next() {
            activate(current + 1);
        }

        function previous() {
            activate(current - 1);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(next, 5000);
        }

        var nextButton = hero.querySelector('[data-hero-next]');
        var previousButton = hero.querySelector('[data-hero-prev]');
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                next();
                restart();
            });
        }
        if (previousButton) {
            previousButton.addEventListener('click', function() {
                previous();
                restart();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                activate(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        activate(0);
        restart();
    }

    function setupCardFilters() {
        document.querySelectorAll('[data-filter-panel]').forEach(function(panel) {
            var container = panel.parentElement ? panel.parentElement.querySelector('[data-card-list]') : null;
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
            var searchInput = panel.querySelector('[data-card-search]');
            var yearSelect = panel.querySelector('[data-card-year]');
            var typeSelect = panel.querySelector('[data-card-type]');

            function filter() {
                var query = normalize(searchInput && searchInput.value);
                var year = normalize(yearSelect && yearSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                cards.forEach(function(card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    card.classList.toggle('is-filtered', !matched);
                });
            }

            [searchInput, yearSelect, typeSelect].forEach(function(control) {
                if (control) {
                    control.addEventListener('input', filter);
                    control.addEventListener('change', filter);
                }
            });
        });
    }

    function renderSearchResults() {
        var target = document.getElementById('search-results');
        if (!target || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = normalize(params.get('q'));
        var input = document.querySelector('.search-page-form input[name="q"]');
        if (input && query) {
            input.value = params.get('q');
        }
        var list = window.MOVIE_SEARCH_DATA;
        if (query) {
            list = list.filter(function(item) {
                return normalize([item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ')).indexOf(query) !== -1;
            });
        } else {
            list = list.slice(0, 80);
        }
        if (!list.length) {
            target.innerHTML = '<div class="empty-results">没有找到匹配内容</div>';
            return;
        }
        target.innerHTML = list.slice(0, 240).map(function(item) {
            return '<article class="movie-card">' +
                '<a class="poster-link" href="' + escapeHtml(item.url) + '">' +
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="poster-shade"></span><span class="play-chip">播放</span></a>' +
                '<div class="card-body"><div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.rating) + '</span></div>' +
                '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="card-tags"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div></div></article>';
        }).join('');
    }

    ready(function() {
        setupMenus();
        setupSearchForms();
        setupHero();
        setupCardFilters();
        renderSearchResults();
    });
}());
