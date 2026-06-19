(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            var open = mobileMenu.classList.toggle("is-open");
            mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("image-hidden");
        });
    });

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function showSlide(nextIndex) {
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

        function startHero() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        function restartHero() {
            window.clearInterval(timer);
            startHero();
        }

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(index - 1);
                restartHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                restartHero();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restartHero();
            });
        });

        showSlide(0);
        startHero();
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-tags") || "",
            card.textContent || ""
        ].join(" ").toLowerCase();
    }

    function applyFilter(form) {
        var grid = document.querySelector("[data-card-grid]");
        var empty = document.querySelector("[data-empty-state]");

        if (!grid) {
            return;
        }

        var input = form.querySelector("input[type='search']");
        var select = form.querySelector("select");
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var year = select ? select.value : "";
        var visible = 0;

        Array.prototype.slice.call(grid.querySelectorAll(".movie-card")).forEach(function (card) {
            var matchesKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
            var matchesYear = !year || (card.getAttribute("data-year") === year);
            var shouldShow = matchesKeyword && matchesYear;

            card.style.display = shouldShow ? "" : "none";

            if (shouldShow) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    document.querySelectorAll("[data-local-filter], [data-global-filter]").forEach(function (form) {
        var input = form.querySelector("input[type='search']");
        var select = form.querySelector("select");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var year = params.get("year") || "";

        if (input && q) {
            input.value = q;
        }

        if (select && year) {
            select.value = year;
        }

        [input, select].forEach(function (control) {
            if (control) {
                control.addEventListener("input", function () {
                    applyFilter(form);
                });

                control.addEventListener("change", function () {
                    applyFilter(form);
                });
            }
        });

        form.addEventListener("submit", function (event) {
            if (form.hasAttribute("data-global-filter") || form.hasAttribute("data-local-filter")) {
                event.preventDefault();
                applyFilter(form);
            }
        });

        applyFilter(form);
    });
})();
