(function () {
    function bindSource(video, src) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            return;
        }
        video.src = src;
    }

    window.initMoviePlayer = function (src) {
        var video = document.getElementById("movieVideo");
        var overlay = document.getElementById("playerOverlay");
        if (!video || !src) {
            return;
        }
        bindSource(video, src);
        function start() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("is-hidden");
            }
        });
    };
})();
