import { useEffect, useRef, useState } from "react";

export default function VideoPlayer() {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [currentQuality, setCurrentQuality] = useState("1080p");
    const [currentAudio, setCurrentAudio] = useState("Hindi");

    // Video quality URLs
    const videoQualities = {
        "1080p": "https://s01.freecdn200.top/files/81599029/1080p/1080p.m3u8?in=in=76e967a991b05eb57f9c018629fe7146::b60148c7aa9d84029c113d76adf270c2::1766490178::ni",
        "720p": "https://s01.freecdn200.top/files/81599029/720p/720p.m3u8?in=in=76e967a991b05eb57f9c018629fe7146::b60148c7aa9d84029c113d76adf270c2::1766490178::ni"
    };

    // Audio tracks with URLs
    const audioTracks = {
        "Hindi": "https://s01.freecdn200.top/files/81599029/a/8/8.m3u8",
        "English": "https://s01.freecdn200.top/files/81599029/a/2/2.m3u8",
        "Spanish": "https://s01.freecdn200.top/files/81599029/a/3/3.m3u8",
        "French": "https://s01.freecdn200.top/files/81599029/a/6/6.m3u8",
        "German": "https://s01.freecdn200.top/files/81599029/a/1/1.m3u8",
        "Japanese": "https://s01.freecdn200.top/files/81599029/a/12/12.m3u8",
        "Italian": "https://s01.freecdn200.top/files/81599029/a/11/11.m3u8",
        "Russian": "https://s01.freecdn200.top/files/81599029/a/15/15.m3u8",
        "Portuguese": "https://s01.freecdn200.top/files/81599029/a/14/14.m3u8",
        "Polish": "https://s01.freecdn200.top/files/81599029/a/13/13.m3u8",
        "Turkish": "https://s01.freecdn200.top/files/81599029/a/19/19.m3u8",
        "Ukrainian": "https://s01.freecdn200.top/files/81599029/a/20/20.m3u8",
        "Indonesian": "https://s01.freecdn200.top/files/81599029/a/10/10.m3u8",
        "Thai": "https://s01.freecdn200.top/files/81599029/a/18/18.m3u8",
        "Vietnamese": "https://s01.freecdn200.top/files/81599029/a/21/21.m3u8",
        "Tamil": "https://s01.freecdn200.top/files/81599029/a/16/16.m3u8",
        "Telugu": "https://s01.freecdn200.top/files/81599029/a/17/17.m3u8",
        "Filipino": "https://s01.freecdn200.top/files/81599029/a/5/5.m3u8",
        "Hungarian": "https://s01.freecdn200.top/files/81599029/a/9/9.m3u8",
        "Czech": "https://s01.freecdn200.top/files/81599029/a/0/0.m3u8"
    };

    const initializePlayer = (videoUrl) => {
        if (!window.Playerjs || !containerRef.current) return;

        containerRef.current.innerHTML = '<div id="player"></div>';

        try {
            playerRef.current = new window.Playerjs({
                id: "player",
                file: videoUrl,
                autoplay: 0
            });

            console.log("✅ PlayerJS initialized");
            setIsReady(true);
        } catch (error) {
            console.error("❌ PlayerJS error:", error);
        }
    };

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "../../public/playerjs/playerjs.js";

        script.onload = () => {
            initializePlayer("[480p]///localhost:5173/api/media7/files/81599029/1080p/1080p.m3u8?in=in=76e967a991b05eb57f9c018629fe7146::b60148c7aa9d84029c113d76adf270c2::1766490178::ni,[720p]///localhost:5173/api/media7/files/81599029/720p/720p.m3u8?in=in=76e967a991b05eb57f9c018629fe7146::b60148c7aa9d84029c113d76adf270c2::1766490178::ni");
        };

        script.onerror = () => {
            console.error("❌ Failed to load PlayerJS");
        };

        document.body.appendChild(script);

        return () => {
            if (playerRef.current) {
                try {
                    if (typeof playerRef.current.api === 'function') {
                        playerRef.current.api("destroy");
                    }
                } catch (e) { }
            }

            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const changeQuality = (quality) => {
        setCurrentQuality(quality);
        if (playerRef.current) {
            try {
                playerRef.current.api("destroy");
            } catch (e) { }
        }
        initializePlayer(videoQualities[quality]);
    };

    const changeAudio = (audioName) => {
        setCurrentAudio(audioName);
        // Audio track change ke liye alag se player reinitialize karna padega
        // Kyunki PlayerJS mein direct audio track switching limited hai
        alert(`Audio: ${audioName} selected. Note: Full audio switching requires advanced PlayerJS configuration.`);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                        🎬
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">PlayerJS Multi-Quality Player</h2>
                        <p className="text-purple-200 text-sm">Manual Quality & Audio Control</p>
                    </div>
                </div>

                {!isReady && (
                    <div className="bg-black/30 backdrop-blur rounded-xl p-8 mb-6 text-center">
                        <div className="animate-spin h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-white text-lg">Loading Player...</p>
                    </div>
                )}

                <div
                    ref={containerRef}
                    className="bg-black rounded-xl overflow-hidden shadow-2xl mb-6"
                    style={{ aspectRatio: "16/9" }}
                >
                    <div id="player"></div>
                </div>

                {/* Quality Controls */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-4">
                    <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                        <span>🎥</span> Video Quality
                    </h3>
                    <div className="flex gap-3">
                        <button
                            onClick={() => changeQuality("1080p")}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${currentQuality === "1080p"
                                ? "bg-blue-500 text-white shadow-lg scale-105"
                                : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                        >
                            1080p Full HD
                        </button>
                        <button
                            onClick={() => changeQuality("720p")}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${currentQuality === "720p"
                                ? "bg-green-500 text-white shadow-lg scale-105"
                                : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                        >
                            720p HD
                        </button>
                    </div>
                </div>

                {/* Audio Language Selector */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                        <span>🎵</span> Audio Language
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-2">
                        {Object.keys(audioTracks).map((audioName) => (
                            <button
                                key={audioName}
                                onClick={() => changeAudio(audioName)}
                                className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${currentAudio === audioName
                                    ? "bg-orange-500 text-white shadow-lg scale-105"
                                    : "bg-white/20 text-white hover:bg-white/30"
                                    }`}
                            >
                                {audioName}
                            </button>
                        ))}
                    </div>
                </div>

                {isReady && (
                    <div className="mt-4 bg-green-500/20 backdrop-blur border border-green-400/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-300">
                            <span className="text-xl">✅</span>
                            <span className="font-semibold">
                                Player Ready! Currently: {currentQuality} • {currentAudio}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-5">
                <div className="flex gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h4 className="font-bold text-yellow-900 mb-1">Important Note:</h4>
                        <p className="text-yellow-800 text-sm">
                            PlayerJS has limited support for dynamic audio track switching in HLS master playlists.
                            For full audio track switching, consider using Video.js or HLS.js which have better HLS support.
                            Currently, quality switching works perfectly, but audio track switching requires player reinitialization.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}