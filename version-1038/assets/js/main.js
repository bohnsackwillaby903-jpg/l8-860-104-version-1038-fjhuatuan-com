(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        const button = document.querySelector("[data-menu-toggle]");
        const nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
        const next = document.querySelector("[data-hero-next]");
        const prev = document.querySelector("[data-hero-prev]");
        if (!slides.length) {
            return;
        }
        let current = 0;
        let timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                start();
            });
        });
        start();
    }

    function createResultCard(item) {
        const card = document.createElement("article");
        card.className = "movie-card compact-card";
        const tags = (item.genres || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        card.innerHTML = "<a class=\"poster-link\" href=\"" + item.url + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
            "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-glow\"></span></a>" +
            "<div class=\"card-body\"><div class=\"card-meta\"><span>" + item.year + "</span><span>" + escapeHtml(item.region) + "</span><span>★ " + item.rating + "</span></div>" +
            "<h3><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h3>" +
            "<p>" + escapeHtml(item.line) + "</p><div class=\"tag-row\">" + tags + "</div></div>";
        return card;
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function setupSearch() {
        const input = document.getElementById("globalSearch");
        const results = document.querySelector("[data-search-results]");
        const state = document.querySelector("[data-search-state]");
        const clear = document.querySelector("[data-search-clear]");
        const index = window.siteSearchIndex || [];
        if (!input || !results || !state || !index.length) {
            return;
        }
        function render() {
            const query = input.value.trim().toLowerCase();
            results.innerHTML = "";
            if (!query) {
                state.textContent = "";
                return;
            }
            const found = index.filter(function (item) {
                return item.searchText.indexOf(query) !== -1;
            }).slice(0, 24);
            if (!found.length) {
                state.textContent = "没有找到匹配内容";
                return;
            }
            state.textContent = "为你筛选出相关内容";
            found.forEach(function (item) {
                results.appendChild(createResultCard(item));
            });
        }
        input.addEventListener("input", render);
        if (clear) {
            clear.addEventListener("click", function () {
                input.value = "";
                render();
                input.focus();
            });
        }
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-root]").forEach(function (root) {
            const keyword = root.querySelector("[data-filter-keyword]");
            const year = root.querySelector("[data-filter-year]");
            const genre = root.querySelector("[data-filter-genre]");
            const sort = root.querySelector("[data-filter-sort]");
            const state = root.querySelector("[data-filter-state]");
            const container = root.querySelector("[data-card-container]");
            if (!container) {
                return;
            }
            const cards = Array.from(container.querySelectorAll("[data-card]"));
            function apply() {
                const keywordValue = keyword ? keyword.value.trim().toLowerCase() : "";
                const yearValue = year ? year.value : "";
                const genreValue = genre ? genre.value : "";
                let visible = 0;
                cards.forEach(function (card) {
                    const title = card.getAttribute("data-title") || "";
                    const cardYear = card.getAttribute("data-year") || "";
                    const cardGenre = card.getAttribute("data-genre") || "";
                    const matched = (!keywordValue || title.indexOf(keywordValue) !== -1 || cardGenre.toLowerCase().indexOf(keywordValue) !== -1) &&
                        (!yearValue || cardYear === yearValue) &&
                        (!genreValue || cardGenre.indexOf(genreValue) !== -1);
                    card.classList.toggle("is-filtered-out", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (sort && sort.value !== "default") {
                    const sorted = cards.slice().sort(function (a, b) {
                        if (sort.value === "year") {
                            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                        }
                        if (sort.value === "rating") {
                            const aRating = ratingFromCard(a);
                            const bRating = ratingFromCard(b);
                            return bRating - aRating;
                        }
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
                    });
                    sorted.forEach(function (card) {
                        container.appendChild(card);
                    });
                }
                if (state) {
                    state.textContent = visible ? "筛选结果已更新" : "没有找到匹配内容";
                }
            }
            [keyword, year, genre, sort].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function ratingFromCard(card) {
        const text = card.textContent || "";
        const match = text.match(/★\s*([0-9.]+)/);
        return match ? Number(match[1]) : 0;
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupFilters();
    });
})();
