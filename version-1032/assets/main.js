(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", carousel);
        var dots = selectAll("[data-hero-dot]", carousel);
        var index = 0;
        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupSearch() {
        var source = window.SEARCH_INDEX || [];
        selectAll(".search-box").forEach(function (box) {
            var input = box.querySelector(".site-search-input");
            var panel = box.querySelector(".search-results");
            if (!input || !panel) {
                return;
            }
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                if (!query) {
                    panel.classList.remove("is-open");
                    panel.innerHTML = "";
                    return;
                }
                var result = source.filter(function (item) {
                    return item.keywords.indexOf(query) !== -1;
                }).slice(0, 12);
                if (!result.length) {
                    panel.innerHTML = "<a><strong>暂无匹配内容</strong><span>换个关键词试试</span></a>";
                    panel.classList.add("is-open");
                    return;
                }
                panel.innerHTML = result.map(function (item) {
                    return "<a href=\"./" + encodeURI(item.href) + "\"><strong>" + escapeHtml(item.title) + "</strong><span>" + escapeHtml(item.meta) + "</span></a>";
                }).join("");
                panel.classList.add("is-open");
            });
            document.addEventListener("click", function (event) {
                if (!box.contains(event.target)) {
                    panel.classList.remove("is-open");
                }
            });
        });
    }

    function setupLocalFilters() {
        selectAll("[data-filter-panel]").forEach(function (panel) {
            var section = panel.closest("main") || document;
            var cards = selectAll("[data-movie-grid] .movie-card, [data-movie-grid] .rank-row", section);
            var input = panel.querySelector(".local-filter-input");
            var selects = selectAll(".local-filter-select", panel);
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute("data-field")] = select.value;
                });
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre")
                    ].join(" ").toLowerCase();
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedFilters = Object.keys(filters).every(function (key) {
                        return !filters[key] || card.getAttribute("data-" + key) === filters[key];
                    });
                    card.classList.toggle("is-filtered-out", !(matchedQuery && matchedFilters));
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupLocalFilters();
    });
})();
