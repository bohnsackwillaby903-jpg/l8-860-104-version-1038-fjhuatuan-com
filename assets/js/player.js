(function () {
    const scriptUrl = document.currentScript ? document.currentScript.src : "";
    const hlsUrl = scriptUrl ? new URL("hls.js", scriptUrl).href : "./assets/js/hls.js";

    window.initMoviePlayer = function (stream) {
        const shell = document.querySelector("[data-player-shell]");
        const video = document.querySelector("[data-player-video]");
        const button = document.querySelector("[data-player-button]");
        const status = document.querySelector("[data-player-status]");
        let attached = false;
        let hls = null;

        if (!shell || !video || !button || !stream) {
            return;
        }

        function setStatus(text) {
            if (status) {
                status.textContent = text || "";
            }
        }

        async function attach() {
            if (attached) {
                return;
            }
            attached = true;
            setStatus("正在加载影片");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }
            try {
                const module = await import(hlsUrl);
                const Hls = module.H || module.default || window.Hls;
                if (Hls && Hls.isSupported && Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    return;
                }
                video.src = stream;
            } catch (error) {
                video.src = stream;
            }
        }

        async function play() {
            button.classList.add("is-hidden");
            await attach();
            try {
                await video.play();
                setStatus("");
            } catch (error) {
                button.classList.remove("is-hidden");
                setStatus("点击播放按钮继续观看");
            }
        }

        button.addEventListener("click", play);
        shell.addEventListener("click", function (event) {
            if (event.target === video && video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
            setStatus("");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            button.classList.remove("is-hidden");
        });
        video.addEventListener("error", function () {
            setStatus("播放器暂时无法启动，请稍后再试");
        });
        window.addEventListener("beforeunload", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    };
})();
