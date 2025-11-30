import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { usePlaylist } from "./usePlaylist";
import { X } from "lucide-react";

// Detect iOS/Safari
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const VideoPlayerPopup = () => {
    const { playlist, setPlaylist } = usePlaylist();
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const blobUrlRef = useRef(null);
    const containerRef = useRef(null);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef(null);
    const isIOSDevice = isIOS();

    useEffect(() => {
        if (!playlist || !videoRef.current) return;

        // For iOS, use native video element (no video.js)
        if (isIOSDevice) {
            // Determine the URL to use for iOS
            let finalUrl = null;

            if (playlist.startsWith('http://') || playlist.startsWith('https://')) {
                finalUrl = playlist;
            } else {
                // For iOS, create HTTP URL with playlist content as query parameter
                // This works in both dev and production
                try {
                    // Encode playlist content as base64 for URL
                    const base64Playlist = btoa(unescape(encodeURIComponent(playlist)));
                    const playlistId = `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                    // Create URL with content as query parameter
                    // This works in serverless functions (Vercel)
                    finalUrl = `/api/playlist-modified/${playlistId}.m3u8?content=${encodeURIComponent(base64Playlist)}`;

                    if (videoRef.current) {
                        videoRef.current.src = finalUrl;
                        videoRef.current.load();
                    }
                } catch (e) {
                    console.error('Error creating playlist URL for iOS:', e);
                    // Fallback to data URL if encoding fails
                    try {
                        const base64Playlist = btoa(unescape(encodeURIComponent(playlist)));
                        finalUrl = `data:application/vnd.apple.mpegurl;base64,${base64Playlist}`;
                        if (videoRef.current) {
                            videoRef.current.src = finalUrl;
                            videoRef.current.load();
                        }
                    } catch (e2) {
                        console.error('Error creating fallback data URL for iOS:', e2);
                    }
                }
            }

            if (finalUrl && !finalUrl.startsWith('/api/playlist-modified')) {
                videoRef.current.src = finalUrl;
                videoRef.current.load();
            }

            return () => {
                if (videoRef.current) {
                    videoRef.current.src = '';
                    videoRef.current.load();
                }
            };
        }

        // For non-iOS devices, use video.js
        // Determine the URL to use
        let finalUrl = null;

        // If playlist is already a URL, use it directly
        if (playlist.startsWith('http://') || playlist.startsWith('https://')) {
            finalUrl = playlist;
        } else {
            // Create blob URL for other browsers
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

            // Listen to fullscreen changes
            playerRef.current.on('fullscreenchange', () => {
                if (playerRef.current.isFullscreen()) {
                    // In fullscreen, start hiding controls on inactivity
                    resetControlsTimeout();
                } else {
                    // Not in fullscreen, show controls
                    setShowControls(true);
                    if (controlsTimeoutRef.current) {
                        clearTimeout(controlsTimeoutRef.current);
                    }
                }
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
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [playlist, isIOSDevice]);

    // Auto-hide controls on mouse inactivity (only in fullscreen)
    const resetControlsTimeout = () => {
        // Clear existing timeout
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        // Show controls
        setShowControls(true);

        // Only hide controls if we're in fullscreen
        if (playerRef.current && playerRef.current.isFullscreen()) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000); // Hide after 3 seconds of inactivity
        }
    };

    // Handle mouse movement
    const handleMouseMove = () => {
        resetControlsTimeout();
    };

    // Handle mouse enter (when cursor enters video area)
    const handleMouseEnter = () => {
        resetControlsTimeout();
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-full h-full z-[99999000000000000000000000000000000000000000000000000000000000] bg-black"
            data-vjs-player
        >
            <button
                className={`absolute z-100 right-4 top-4 cursor-pointer text-white hover:text-gray-300 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setPlaylist(null)}
            >
                <X className="w-8 h-8" />
            </button>
            <video
                ref={videoRef}
                poster="https://imgcdn.kim/pv/341/0JT3KJGOROW81TECJ1GGQZQTB4.jpg"
                className={isIOSDevice ? "fixed z-50000000 pt-0 h-full w-full object-contain" : "video-js vjs-big-play-centered fixed! z-50000000! pt-0! h-full! w-full!"}
                playsInline
                webkit-playsinline="true"
                x-webkit-airplay="allow"
                controls={isIOSDevice}
                autoPlay={isIOSDevice}
            />
        </div>
    );
};

export default VideoPlayerPopup;