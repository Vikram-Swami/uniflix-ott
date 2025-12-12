import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { usePlaylist } from "./usePlaylist";
import { ArrowLeft, MoveLeft, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { addRecent, loadRecp } from "../utils/recentPlays";
import { LeftIcon } from "../assets/icons";
// Detect iOS/Safari
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Detect mobile device
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Lock screen orientation
const lockOrientation = (orientation = 'landscape') => {
    try {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock(orientation).catch(err => {
                // Silently fail - orientation lock may not be supported or allowed
            });
        } else if (screen.lockOrientation) {
            screen.lockOrientation(orientation);
        } else if (screen.mozLockOrientation) {
            screen.mozLockOrientation(orientation);
        } else if (screen.msLockOrientation) {
            screen.msLockOrientation(orientation);
        }
    } catch (e) {
        // Silently fail - orientation lock may not be supported
    }
};

// Unlock screen orientation
const unlockOrientation = () => {
    if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
    } else if (screen.unlockOrientation) {
        screen.unlockOrientation();
    } else if (screen.mozUnlockOrientation) {
        screen.mozUnlockOrientation();
    } else if (screen.msUnlockOrientation) {
        screen.msUnlockOrientation();
    }
};

const VideoPlayerPopup = ({ movieData }) => {
    const { playlist, setPlaylist, currentMovieId } = usePlaylist();
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const blobUrlRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const [showControls, setShowControls] = useState(true);
    const isIOSDevice = isIOS();
    const isMobileDevice = isMobile();
    const orientationLockedRef = useRef(false);
    const videoPlayStateRef = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const resumeTimeRef = useRef(null);
    const hasResumedRef = useRef(false);
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    };
    const query = useQuery();
    const movieId = query.get("movieId")
    const navigate = useNavigate()

    const resetControlsTimeout = () => {
        // Clear existing timeout
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        // Show controls
        setShowControls(true);

        // Hide after 2 seconds
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 2000);
    };

    // Handle mouse movement
    const handleMouseMove = () => {
        resetControlsTimeout();
    };

    // Handle mouse enter
    const handleMouseEnter = () => {
        resetControlsTimeout();
    };

    // Setup mouse event listeners
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseenter', handleMouseEnter);

        // Start the initial timeout
        resetControlsTimeout();

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseenter', handleMouseEnter);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    // Handle fullscreen and orientation lock
    useEffect(() => {
        if (!isMobileDevice) return;

        const handleFullscreenChange = () => {
            const isFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement ||
                (videoRef.current && videoRef.current.webkitDisplayingFullscreen)
            );

            if (isFullscreen) {
                // Entering fullscreen - lock to landscape
                if (!orientationLockedRef.current) {
                    // Preserve video play state
                    const wasPlaying = videoPlayStateRef.current;

                    // Use setTimeout to avoid blocking video playback
                    setTimeout(() => {
                        lockOrientation('landscape');
                        orientationLockedRef.current = true;

                        // Resume playback if it was playing
                        if (wasPlaying && videoRef.current) {
                            const playPromise = videoRef.current.play();
                            if (playPromise !== undefined) {
                                playPromise.catch(() => { });
                            }
                        }
                    }, 150);
                }
            } else {
                // Exiting fullscreen - unlock orientation
                if (orientationLockedRef.current) {
                    // Preserve video play state
                    const wasPlaying = videoPlayStateRef.current;

                    unlockOrientation();
                    orientationLockedRef.current = false;

                    // Resume playback if it was playing
                    if (wasPlaying && videoRef.current) {
                        setTimeout(() => {
                            const playPromise = videoRef.current.play();
                            if (playPromise !== undefined) {
                                playPromise.catch(() => { });
                            }
                        }, 150);
                    }
                }
            }
        };


        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        // Handle orientation change to prevent video pause
        const handleOrientationChange = () => {
            // Preserve video play state during orientation change
            const wasPlaying = videoPlayStateRef.current;

            // Resume playback after orientation change if it was playing
            setTimeout(() => {
                if (wasPlaying && videoRef.current && videoRef.current.paused) {
                    const playPromise = videoRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => { });
                    }
                }

                // For video.js player
                if (wasPlaying && playerRef.current && playerRef.current.paused()) {
                    const playPromise = playerRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => { });
                    }
                }
            }, 300);
        };

        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);

        // For iOS native video fullscreen - setup listeners
        // We'll add these in a separate effect that tracks videoRef.current

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('resize', handleOrientationChange);

            // Unlock orientation on cleanup
            if (orientationLockedRef.current) {
                unlockOrientation();
                orientationLockedRef.current = false;
            }
        };
    }, [isMobileDevice]);

    // Track video play state
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const handlePlay = () => {
            videoPlayStateRef.current = true;
            setIsPlaying(true);
        };

        const handlePause = () => {
            videoPlayStateRef.current = false;
            setIsPlaying(false);
        };

        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('playing', handlePlay);
        videoElement.addEventListener('pause', handlePause);

        return () => {
            videoElement.removeEventListener('play', handlePlay);
            videoElement.removeEventListener('playing', handlePlay);
            videoElement.removeEventListener('pause', handlePause);
        };
    }, [playlist]);

    // Setup iOS native fullscreen event listeners
    useEffect(() => {
        if (!isMobileDevice || !isIOSDevice || !videoRef.current) return;

        const handleWebkitBeginFullscreen = () => {
            // Preserve video play state
            const wasPlaying = videoPlayStateRef.current;

            setTimeout(() => {
                lockOrientation('landscape');
                orientationLockedRef.current = true;

                // Resume playback if it was playing
                if (wasPlaying && videoRef.current) {
                    const playPromise = videoRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => { });
                    }
                }
            }, 150);
        };

        const handleWebkitEndFullscreen = () => {
            // Preserve video play state
            const wasPlaying = videoPlayStateRef.current;

            unlockOrientation();
            orientationLockedRef.current = false;

            // Resume playback if it was playing
            if (wasPlaying && videoRef.current) {
                setTimeout(() => {
                    const playPromise = videoRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => { });
                    }
                }, 150);
            }
        };

        const videoElement = videoRef.current;
        videoElement.addEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen);
        videoElement.addEventListener('webkitendfullscreen', handleWebkitEndFullscreen);

        return () => {
            videoElement.removeEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen);
            videoElement.removeEventListener('webkitendfullscreen', handleWebkitEndFullscreen);
        };
    }, [isMobileDevice, isIOSDevice, playlist]);

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

            // Track play state for video.js player
            playerRef.current.on('play', () => {
                videoPlayStateRef.current = true;
                setIsPlaying(true);
            });

            playerRef.current.on('playing', () => {
                videoPlayStateRef.current = true;
                setIsPlaying(true);
            });

            playerRef.current.on('pause', () => {
                videoPlayStateRef.current = false;
                setIsPlaying(false);
            });

            // Handle fullscreen events for video.js player
            if (isMobileDevice) {
                playerRef.current.on('fullscreenchange', () => {
                    const isFullscreen = playerRef.current.isFullscreen();
                    if (isFullscreen) {
                        // Entering fullscreen - lock to landscape
                        if (!orientationLockedRef.current) {
                            // Preserve video play state
                            const wasPlaying = videoPlayStateRef.current;

                            // Use setTimeout to avoid blocking video playback
                            setTimeout(() => {
                                lockOrientation('landscape');
                                orientationLockedRef.current = true;

                                // Resume playback if it was playing
                                if (wasPlaying && playerRef.current.paused()) {
                                    const playPromise = playerRef.current.play();
                                    if (playPromise !== undefined) {
                                        playPromise.catch(() => { });
                                    }
                                }
                            }, 150);
                        }
                    } else {
                        // Exiting fullscreen - unlock orientation
                        if (orientationLockedRef.current) {
                            // Preserve video play state
                            const wasPlaying = videoPlayStateRef.current;

                            unlockOrientation();
                            orientationLockedRef.current = false;

                            // Resume playback if it was playing
                            if (wasPlaying && playerRef.current.paused()) {
                                setTimeout(() => {
                                    const playPromise = playerRef.current.play();
                                    if (playPromise !== undefined) {
                                        playPromise.catch(() => { });
                                    }
                                }, 150);
                            }
                        }
                    }
                });
            }
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
    }, [playlist, isIOSDevice]);

    // Get resume time from recent plays
    useEffect(() => {
        if (!movieId || !movieData) return;

        // Reset resume state when movie/episode changes
        hasResumedRef.current = false;
        resumeTimeRef.current = null;

        try {
            const recp = loadRecp();
            const allItems = [];

            // Get all movies
            (recp.M || []).forEach(m => allItems.push({ ...m, _type: 'M' }));

            // Get all series episodes
            Object.entries(recp.S || {}).forEach(([seriesTitle, episodes]) => {
                (episodes || []).forEach(ep => {
                    allItems.push({ ...ep, _type: 'S', seriesTitle });
                });
            });

            // Find matching item
            let matchedItem = null;

            if (movieData?.episodes && movieData?.episodes[0] !== null && currentMovieId) {
                // For series/episodes
                matchedItem = allItems.find(item =>
                    item._type === 'S' &&
                    item.seriesTitle === movieData?.title &&
                    String(item.episodeId) === String(currentMovieId)
                );
            } else {
                // For movies
                matchedItem = allItems.find(item =>
                    item._type === 'M' &&
                    String(item.id) === String(movieId)
                );
            }

            if (matchedItem && matchedItem.currentTime && matchedItem.currentTime > 5) {
                // Only resume if more than 5 seconds watched
                resumeTimeRef.current = matchedItem.currentTime;
            }
        } catch (e) {
            console.error('Error loading recent plays:', e);
        }
    }, [movieId, currentMovieId, movieData]);

    // Resume video from saved time
    useEffect(() => {
        if (!resumeTimeRef.current || hasResumedRef.current) return;

        const resumeVideo = () => {
            if (hasResumedRef.current) return;

            // For iOS native video
            if (isIOSDevice) {
                const video = videoRef.current;
                if (!video) return;

                // Wait for video to have duration
                if (video.readyState >= 2 && video.duration) {
                    const resumeTime = Math.min(resumeTimeRef.current, video.duration - 1);
                    if (resumeTime > 0 && resumeTime < video.duration) {
                        video.currentTime = resumeTime;
                        hasResumedRef.current = true;
                    }
                } else {
                    // Wait for loadedmetadata
                    const handleLoadedMetadata = () => {
                        if (hasResumedRef.current) return;
                        const resumeTime = Math.min(resumeTimeRef.current, video.duration - 1);
                        if (resumeTime > 0 && resumeTime < video.duration) {
                            video.currentTime = resumeTime;
                            hasResumedRef.current = true;
                        }
                        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                    };
                    video.addEventListener('loadedmetadata', handleLoadedMetadata);
                }
            } else {
                // For video.js player
                if (playerRef.current) {
                    const player = playerRef.current;
                    const handleReady = () => {
                        if (hasResumedRef.current) return;
                        const duration = player.duration();
                        if (duration && duration > 0) {
                            const resumeTime = Math.min(resumeTimeRef.current, duration - 1);
                            if (resumeTime > 0 && resumeTime < duration) {
                                player.currentTime(resumeTime);
                                hasResumedRef.current = true;
                            }
                        }
                    };

                    if (player.readyState() >= 2) {
                        handleReady();
                    } else {
                        player.ready(handleReady);
                        player.on('loadedmetadata', handleReady);
                    }
                } else {
                    // Fallback to native video element
                    const video = videoRef.current;
                    if (!video) return;

                    if (video.readyState >= 2 && video.duration) {
                        const resumeTime = Math.min(resumeTimeRef.current, video.duration - 1);
                        if (resumeTime > 0 && resumeTime < video.duration) {
                            video.currentTime = resumeTime;
                            hasResumedRef.current = true;
                        }
                    } else {
                        const handleLoadedMetadata = () => {
                            if (hasResumedRef.current) return;
                            const resumeTime = Math.min(resumeTimeRef.current, video.duration - 1);
                            if (resumeTime > 0 && resumeTime < video.duration) {
                                video.currentTime = resumeTime;
                                hasResumedRef.current = true;
                            }
                            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                        };
                        video.addEventListener('loadedmetadata', handleLoadedMetadata);
                    }
                }
            }
        };

        // Small delay to ensure video is loaded
        const timeout = setTimeout(() => {
            resumeVideo();
        }, 500);

        return () => clearTimeout(timeout);
    }, [playlist, isIOSDevice]);

    // Save recent play progress periodically
    useEffect(() => {
        if (!isPlaying || !movieId) return;

        const interval = setInterval(() => {
            try {
                const poster = `https://imgcdn.kim/pv/c/${movieId}.jpg`;
                let duration = 0;
                let currentTime = 0;

                // Get video data based on player type
                if (isIOSDevice) {
                    // For iOS native video
                    const video = videoRef.current;
                    if (!video) return;
                    duration = video.duration || 0;
                    currentTime = video.currentTime || 0;
                } else {
                    // For video.js player
                    if (playerRef.current) {
                        duration = playerRef.current.duration() || 0;
                        currentTime = playerRef.current.currentTime() || 0;
                    } else {
                        const video = videoRef.current;
                        if (!video) return;
                        duration = video.duration || 0;
                        currentTime = video.currentTime || 0;
                    }
                }

                if (movieData?.episodes && movieData?.episodes[0] !== null && currentMovieId) {
                    // For series/episodes
                    const ep = (movieData?.episodes || []).find(
                        ep => String(ep?.id) === String(currentMovieId)
                    ) || {};

                    addRecent({
                        seriesTitle: movieData?.title || '',
                        episodeId: currentMovieId,
                        title: ep?.t || ep?.title || '',
                        season: ep?.s,
                        episodeIndex: ep?.ep,
                        duration: duration,
                        currentTime: currentTime,
                        id: movieId
                    });
                } else {
                    // For movies
                    addRecent({
                        id: movieId,
                        title: movieData?.title || '',
                        duration: duration,
                        currentTime: currentTime,
                        poster
                    });
                }
            } catch (e) {
                console.error('Error saving recent play:', e);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isPlaying, currentMovieId, movieId, movieData, isIOSDevice]);

    return (
        <div ref={containerRef}
            className="fixed inset-0 max-h-screen h-full w-full z-[99999000000000000000000000000000000000000000000000000000000000] bg-black"
            data-vjs-player
        >
            <div className="flex items-center gap-5 absolute z-100 left-4! top-4! vjs-control-bar bg-transparent!">
                <button
                    className={`cursor-pointer text-white hover:text-gray-300 transition-transform transform duration-1000  hover:scale-125`}
                    onClick={() => {
                        setPlaylist(null);
                        navigate(`/home?movieId=${movieId}`);
                    }}
                >
                    <LeftIcon className="w-8 h-8" />
                </button>
                <p className="text-xl">A Minecraft Movie</p>
            </div>
            {/* {!isIOSDevice && <button
                className={`absolute z-100 right-4 top-4 cursor-pointer text-white hover:text-gray-300 transition-opacity duration-300 bg-black/40! rounded-full p-1 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => {
                    setPlaylist(null);
                    navigate(`/home?movieId=${movieId}`);
                }}
            >
                <X className="w-10 h-10" />
            </button>} */}
            <video
                ref={videoRef}
                poster={`https://imgcdn.kim/pv/c/${movieId}.jpg`}
                className={isIOSDevice ? "fixed z-50000000 pt-0 h-full w-full object-contain" : "video-js pt-0! z-50000000! absolute h-dvh! w-full"}
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