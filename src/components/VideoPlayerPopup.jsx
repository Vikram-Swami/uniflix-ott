import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { usePlaylist } from "./usePlaylist";
import { X } from "lucide-react";

const VideoPlayerPopup = () => {
    const { playlist } = usePlaylist();
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const blobUrlRef = useRef(null);
    useEffect(() => {
        if (!playlist || !videoRef.current) return;

        // Determine the URL to use
        let finalUrl = null;

        // If playlist is already a URL, use it directly
        if (playlist.startsWith('http://') || playlist.startsWith('https://')) {
            finalUrl = playlist;
        } else {
            // Create blob URL from m3u8 text content
            // Clean up previous blob URL if exists
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
            }
            const blob = new Blob([playlist], { type: "application/vnd.apple.mpegurl" });
            finalUrl = URL.createObjectURL(blob);
            blobUrlRef.current = finalUrl;
        }

        if (!finalUrl) return;

        if (!playerRef.current) {
            playerRef.current = videojs(videoRef.current, {
                controls: true,
                autoplay: true,
                muted: false,
                preload: "auto",
                fluid: true,
                responsive: true,
                html5: {
                    vhs: {
                        overrideNative: true
                    }
                },
                sources: [
                    {
                        src: finalUrl,
                        type: "application/x-mpegURL",
                    },
                ],
            });

            // Add error handler
            playerRef.current.on('error', () => {
                const error = playerRef.current.error();
                console.error('Video.js error:', error);
            });
        } else {
            // Update source
            playerRef.current.src({
                src: finalUrl,
                type: "application/x-mpegURL",
            });
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
            // Cleanup blob URL if we created one
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [playlist]);

    return (
        <div className="fixed w-full h-full z-[99999000000000000000000000000000000000000000000000000000000000]" data-vjs-player>
            <button className="absolute z-50 right-0 top-0 cursor-pointer"><X /></button>
            <video
                ref={videoRef}
                poster="https://imgcdn.kim/pv/341/0JT3KJGOROW81TECJ1GGQZQTB4.jpg"
                className="video-js vjs-big-play-centered fixed! z-50000000! pt-0! h-full! w-full!"
                playsInline
            />
        </div>
    );
};

export default VideoPlayerPopup;
