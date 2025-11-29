import { useRef, useEffect, useState } from "react";
import Hls from "hls.js";
import { usePlaylist } from "./usePlaylist";
import { addRecent, loadRecp } from "../utils/recentPlays";
import { Play, Pause, ChevronDown, ChevronLeft, Loader2, SkipForward, MinimizeIcon, Settings2, CheckIcon, X } from "lucide-react";
import { BackwardIcon, ForwardIcon, LanguageIcon, MaximizeIcon, SettingsIcon, SpeedometerIcon, VolumeOffIcon, VolumeOnIcon } from "../assets/icons";
import { useLocation } from "react-router-dom";

const VideoPlayerPopup = ({ movieData }) => {
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const hlsRef = useRef(null);
    const containerRef = useRef(null);
    const progressBarRef = useRef(null);
    const volumeBarRef = useRef(null);
    const settingsMenuRef = useRef(null);
    const bottomToolsRef = useRef(null);
    const nextEpButtonRef = useRef(null)
    const closeButtonRef = useRef(null);
    const isInitializedRef = useRef(false);
    const isChangingAudioRef = useRef(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedQuality, setSelectedQuality] = useState(null);
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [settingsView, setSettingsView] = useState('main');
    const [isLoading, setIsLoading] = useState(false);
    const [showVolumeBar, setShowVolumeBar] = useState(false);
    const [hoverTime, setHoverTime] = useState(null);
    const [hoverPosition, setHoverPosition] = useState(null);
    const [audioTracks, setAudioTracks] = useState([]);
    const [videoTracks, setVideoTracks] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selecedQuality, setSelecedQuality] = useState(null);
    const [selecedAudio, setSelecedAudio] = useState(null);
    const [selecedSpeed, setSelecedSpeed] = useState(1);
    const [previousVolume, setPreviousVolume] = useState(1);
    const { playlist, setPlaylist, error, fetchPlaylist, currentMovieId } = usePlaylist();
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    };
    const query = useQuery();
    const movieId = query.get("movieId")

    // Parse HLS playlist
    function parseHlsPlaylist() {
        if (!playlist) return { audioTracks: [], videoTracks: [] };

        const lines = playlist.split("\n").map(l => l.trim());
        const audioTracks = [];
        const videoTracks = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // AUDIO TRACKS
            if (line.startsWith("#EXT-X-MEDIA:TYPE=AUDIO")) {
                const langMatch = line.match(/LANGUAGE="([^"]+)"/);
                const nameMatch = line.match(/NAME="([^"]+)"/);
                const uriMatch = line.match(/URI="([^"]+)"/);
                const defaultMatch = line.match(/DEFAULT=([^,]+)/);

                if (uriMatch) {
                    const url = uriMatch[1].replace(/https:\/\/s\d+\.nm-cdn\d+\.top\/files\//g, '/api/media/files/');
                    audioTracks.push({
                        lang: langMatch?.[1] || "unk",
                        name: nameMatch?.[1] || "Unknown",
                        url: url,
                        default: defaultMatch?.[1] === 'YES'
                    });
                }
            }

            // VIDEO STREAMS
            if (line.startsWith("#EXT-X-STREAM-INF")) {
                const resolutionMatch = line.match(/RESOLUTION=([^,]+)/);
                const bandwidthMatch = line.match(/BANDWIDTH=([^,]+)/);
                const defaultMatch = line.match(/DEFAULT=([^,]+)/);

                const nextLine = lines[i + 1];
                if (nextLine && (nextLine.startsWith("http") || nextLine.startsWith("/api"))) {
                    const url = nextLine.replace(/https:\/\/s\d+\.nm-cdn\d+\.top\/files\//g, '/api/media/files/');
                    const resolution = resolutionMatch?.[1] || "Unknown";
                    const [width, height] = resolution.split('x').map(Number);

                    videoTracks.push({
                        resolution: resolution,
                        width: width,
                        height: height,
                        bandwidth: Number(bandwidthMatch?.[1] || 0),
                        url: url,
                        default: defaultMatch?.[1] === 'YES'
                    });
                }
            }
        }

        return { audioTracks, videoTracks };
    }

    // Format time in hours:minutes:seconds format
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00:00";
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        } else {
            return `${mins}:${secs.toString().padStart(2, "0")}`;
        }
    };

    // Initialize HLS player
    useEffect(() => {
        if (!playlist) return;

        const video = videoRef.current;
        if (!video) return;

        // Show loader when initializing
        setIsLoading(true);

        // Reset initialization flag when playlist changes (new episode)
        // This allows new episodes to load properly
        // Cleanup previous HLS instance if exists
        if (hlsRef.current) {
            try {
                hlsRef.current.destroy();
            } catch (e) {
                console.error("Error destroying previous HLS:", e);
            }
            hlsRef.current = null;
        }
        isInitializedRef.current = false;

        // Parse playlist
        const parsed = parseHlsPlaylist();
        const { audioTracks: parsedAudioTracks, videoTracks: parsedVideoTracks } = parsed;

        // Store in state for use in render
        setAudioTracks(parsedAudioTracks);
        setVideoTracks(parsedVideoTracks);

        if (parsedVideoTracks.length === 0) {
            console.error("No video tracks found");
            return;
        }

        isInitializedRef.current = true;

        // Get default video track
        const defaultVideoTrack = parsedVideoTracks.find(t => t?.default) || parsedVideoTracks[0];
        const defaultAudioTrack = parsedAudioTracks.find(t => t?.default) || parsedAudioTracks.find(t => t?.lang === 'eng') || parsedAudioTracks[0];
        if (defaultVideoTrack) {
            setSelecedQuality(defaultVideoTrack?.height);
        } else {
            setSelecedQuality(null);
        }
        if (defaultAudioTrack) {
            setSelecedAudio(defaultAudioTrack?.name || defaultAudioTrack?.lang);
        } else {
            setSelecedAudio(null);
        }
        setSelecedSpeed(1);
        // Cleanup previous HLS instance
        if (hlsRef.current) {
            try {
                hlsRef.current.destroy();
            } catch (e) {
                console.error("Error destroying previous HLS:", e);
            }
            hlsRef.current = null;
        }

        // Initialize HLS
        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 0.5,
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 1,
                levelLoadingTimeOut: 10000,
                levelLoadingMaxRetry: 1,
            });

            hlsRef.current = hls;

            // Load source only once
            try {
                hls.loadSource(defaultVideoTrack.url);
                hls.attachMedia(video);
            } catch (e) {
                console.error("Error loading HLS source:", e);
            }

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("HLS manifest parsed");
                if (video.duration) {
                    setDuration(video.duration);
                }
                setSelectedQuality(defaultVideoTrack);

                // Check for saved currentTime from recent plays and resume
                try {
                    const recp = loadRecp();
                    let savedTime = 0;
                    if (movieData?.episodes && movieData?.episodes[0] !== null) {
                        const seriesList = recp.S?.[movieData?.title] || [];
                        if (seriesList && seriesList.length) {
                            const ep = seriesList.find(e => String(e.episodeId) === String(currentMovieId));
                            if (ep && ep.currentTime) {
                                savedTime = ep.currentTime;
                            }
                        }
                    } else {
                        const movieEntry = (recp.M || []).find(m => String(m.id) === String(movieId));
                        if (movieEntry && movieEntry.currentTime) {
                            savedTime = movieEntry.currentTime;
                        }
                    }
                    if (savedTime > 0) {
                        video.currentTime = savedTime;
                        if (audioRef.current && parsedAudioTracks.length > 0) {
                            audioRef.current.currentTime = savedTime;
                        }
                    }
                } catch (e) {
                    console.error('Resume from recent play error', e);
                }

                // Hide loader when manifest is parsed and video can play
                const checkCanPlay = () => {
                    if (video.readyState >= 3) { // HAVE_FUTURE_DATA
                        setIsLoading(false);
                    } else {
                        setTimeout(checkCanPlay, 100);
                    }
                };
                checkCanPlay();

                // If no separate audio tracks, use video's embedded audio
                if (parsedAudioTracks.length === 0) {
                    // Unmute video and use its embedded audio
                    video.muted = false;
                    video.volume = volume;
                    console.log("No separate audio tracks, using video's embedded audio");
                } else {
                    // Keep video muted, we'll use separate audio element
                    video.muted = true;
                    video.volume = 0;

                    // Load default audio track if available
                    if (defaultAudioTrack && audioRef.current) {
                        setSelectedAudio(defaultAudioTrack);
                        // Audio tracks are also HLS, so we need to use HLS.js for them too
                        if (Hls.isSupported() && defaultAudioTrack.url.endsWith('.m3u8')) {
                            const audioHls = new Hls({
                                enableWorker: true,
                                lowLatencyMode: false,
                            });
                            audioHls.loadSource(defaultAudioTrack.url);
                            audioHls.attachMedia(audioRef.current);
                            audioRef.current._hls = audioHls; // Store reference for cleanup
                        } else {
                            audioRef.current.src = defaultAudioTrack.url;
                        }
                    }
                }

                // Check for saved currentTime from recent plays
                try {
                    const savedCurrentTime = loadRecp(movieId);
                    if (savedCurrentTime !== null && !isNaN(savedCurrentTime)) {
                        video.currentTime = savedCurrentTime;
                        setCurrentTime(savedCurrentTime);
                        console.log("Restored saved currentTime:", savedCurrentTime);
                    }
                } catch (e) {
                    console.error("Error loading saved currentTime:", e);
                }
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error("HLS Error:", data.type, data.details, data.fatal);

                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log("Network error, trying to recover...");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log("Media error, trying to recover...");
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error("Fatal error, destroying HLS");
                            hls.destroy();
                            break;
                    }
                }
            });

            // Store tracks for later use
            hls.parsedAudioTracks = audioTracks;
            hls.parsedVideoTracks = videoTracks;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Native HLS support (Safari)
            video.src = defaultVideoTrack.url;
        }

        // Only mute video if we have separate audio tracks
        if (parsedAudioTracks.length > 0) {
            video.muted = true;
            video.volume = 0;
        } else {
            // Use video's embedded audio
            video.muted = false;
            video.volume = volume;
        }

        // Video event listeners
        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            // Sync audio with video time
            if (audioRef.current && !isChangingAudioRef.current && parsedAudioTracks.length > 0) {
                const diff = Math.abs(audioRef.current.currentTime - video.currentTime);
                if (diff > 0.1) {
                    audioRef.current.currentTime = video.currentTime;
                }
            }
        };
        const handleDurationChange = () => setDuration(video.duration);
        const handlePlay = () => {
            setIsPlaying(true);
            // Play separate audio when video plays (only if audio tracks exist)
            if (audioRef.current && parsedAudioTracks.length > 0) {
                audioRef.current.play().catch(e => console.log("Audio play error:", e));
            }

            // Record initial recent-play entry for resume
            try {
                const video = videoRef.current;
                const poster = `https://imgcdn.kim/pv/c/${movieId}.jpg`;
                if (movieData?.episodes && movieData?.episodes[0] !== null) {
                    const ep = (movieData.episodes || []).find(ep => String(ep.id) === String(currentMovieId)) || {};
                    addRecent({ seriesTitle: movieData?.title || '', episodeId: currentMovieId, title: ep?.t || ep?.title || '', season: ep?.s, episodeIndex: ep?.ep, duration: (video?.duration || duration) || 0, currentTime: video?.currentTime || 0, id: movieId });
                } else {
                    addRecent({ id: movieId, title: movieData?.title || '', duration: (video?.duration || duration) || 0, currentTime: video?.currentTime || 0, poster });
                }
            } catch (e) {
                console.error('addRecent error', e);
            }
        };
        const handlePause = () => {
            setIsPlaying(false);
            // Pause separate audio when video pauses (only if audio tracks exist)
            if (audioRef.current && parsedAudioTracks.length > 0) {
                audioRef.current.pause();
            }
        };
        const handleVolumeChange = () => {
            // Don't sync from video since video is muted
            // Volume is controlled separately
        };

        const handleWaiting = () => {
            setIsLoading(true);
        };

        const handleCanPlay = () => {
            setIsLoading(false);
        };

        const handleSeeking = () => {
            setIsLoading(true);
        };

        const handleSeeked = () => {
            setIsLoading(false);
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("durationchange", handleDurationChange);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("volumechange", handleVolumeChange);
        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("seeking", handleSeeking);
        video.addEventListener("seeked", handleSeeked);

        // Sync audio playback rate with video
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }

        // Auto-hide controls after 2 seconds of no mouse movement
        let controlsTimeout;
        const resetControlsTimeout = () => {
            clearTimeout(controlsTimeout);
            setShowControls(true);
            controlsTimeout = setTimeout(() => {
                // Don't hide if cursor is on bottom_tools
                const bottomTools = document.querySelector('.bottom_tools');
                if (!bottomTools || !bottomTools.matches(':hover')) {
                    setShowControls(false);
                }
            }, 2000);
        };

        const handleMouseMove = () => {
            resetControlsTimeout();
        };

        const handleMouseEnter = () => {
            setShowControls(true);
            resetControlsTimeout();
        };

        const handleMouseLeave = () => {
            // Don't hide if leaving to bottom_tools
            const bottomTools = document.querySelector('.bottom_tools');
            if (!bottomTools || !bottomTools.matches(':hover')) {
                setShowControls(false);
                clearTimeout(controlsTimeout);
            }
        };

        // Prevent hiding when mouse is on bottom_tools
        const handleBottomToolsMouseEnter = () => {
            setShowControls(true);
            clearTimeout(controlsTimeout);
        };

        const handleBottomToolsMouseLeave = () => {
            resetControlsTimeout();
        };

        containerRef.current?.addEventListener("mousemove", handleMouseMove);
        containerRef.current?.addEventListener("mouseenter", handleMouseEnter);
        containerRef.current?.addEventListener("mouseleave", handleMouseLeave);

        // Add listeners to bottom_tools when it's available
        const addBottomToolsListeners = () => {
            if (bottomToolsRef.current) {
                bottomToolsRef.current.addEventListener("mouseenter", handleBottomToolsMouseEnter);
                bottomToolsRef.current.addEventListener("mouseleave", handleBottomToolsMouseLeave);
            }
            if (closeButtonRef.current) {
                closeButtonRef.current.addEventListener("mouseenter", handleBottomToolsMouseEnter);
                closeButtonRef.current.addEventListener("mouseleave", handleBottomToolsMouseLeave);
            }
            if (nextEpButtonRef.current) {
                nextEpButtonRef.current.addEventListener("mouseenter", handleBottomToolsMouseEnter);
                nextEpButtonRef.current.addEventListener("mouseleave", handleBottomToolsMouseLeave);
            }
        };

        // Try to add listeners immediately and also after a delay
        addBottomToolsListeners();
        const bottomToolsTimeout = setTimeout(addBottomToolsListeners, 100);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("durationchange", handleDurationChange);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("volumechange", handleVolumeChange);
            video.removeEventListener("waiting", handleWaiting);
            video.removeEventListener("canplay", handleCanPlay);
            video.removeEventListener("seeking", handleSeeking);
            video.removeEventListener("seeked", handleSeeked);
            if (containerRef.current) {
                containerRef.current.removeEventListener("mousemove", handleMouseMove);
                containerRef.current.removeEventListener("mouseenter", handleMouseEnter);
                containerRef.current.removeEventListener("mouseleave", handleMouseLeave);
            }
            if (bottomToolsRef.current) {
                bottomToolsRef.current.removeEventListener("mouseenter", handleBottomToolsMouseEnter);
                bottomToolsRef.current.removeEventListener("mouseleave", handleBottomToolsMouseLeave);
            }
            if (closeButtonRef.current) {
                closeButtonRef.current.removeEventListener("mouseenter", handleBottomToolsMouseEnter);
                closeButtonRef.current.removeEventListener("mouseleave", handleBottomToolsMouseLeave);
                console.log("first")
            }
            if (nextEpButtonRef.current) {
                nextEpButtonRef.current.removeEventListener("mouseenter", handleBottomToolsMouseEnter);
                nextEpButtonRef.current.removeEventListener("mouseleave", handleBottomToolsMouseLeave);
            }
            clearTimeout(controlsTimeout);
            clearTimeout(bottomToolsTimeout);

            // Cleanup HLS
            if (hlsRef.current) {
                try {
                    hlsRef.current.destroy();
                } catch (e) {
                    console.error("Error destroying HLS:", e);
                }
                hlsRef.current = null;
            }

            // Cleanup audio HLS
            if (audioRef.current?._hls) {
                try {
                    audioRef.current._hls.destroy();
                } catch (e) {
                    console.error("Error destroying audio HLS:", e);
                }
                audioRef.current._hls = null;
            }

            isInitializedRef.current = false;
            clearTimeout(controlsTimeout);
        };
    }, [playlist]);

    // Toggle play/pause
    const togglePlay = () => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (isPlaying) {
            video.pause();
            if (audio && audioTracks.length > 0) {
                audio.pause();
            }
        } else if (!isLoading) {
            video.play();
            if (audio && audioTracks.length > 0) {
                audio.play().catch(e => console.log("Audio play error:", e));
            }
        }
    };

    // Handle progress bar click
    const handleProgressClick = (e) => {
        const video = videoRef.current;
        const audio = audioRef.current;
        const progressBar = progressBarRef.current;
        if (!progressBar) return;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * video.duration;

        // Show loader when seeking
        setIsLoading(true);

        video.currentTime = newTime;
        if (audio && audioTracks.length > 0) {
            audio.pause();               // ⛔ stop audio immediately
            audio.currentTime = newTime; // ✅ only set time
        }

        // Loader will be hidden by seeked event
    };
    useEffect(() => {
        const audio = audioRef.current;
        const video = videoRef.current;
        if (audio) {
            if (isLoading) {
                audio.pause();
            } else {
                audio.play()
                video.play()
            }
        }
    }, [isLoading])

    // Handle progress bar hover
    const handleProgressHover = (e) => {
        const progressBar = progressBarRef.current;
        if (!progressBar || !duration) return;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const hoverTime = percent * duration;
        setHoverTime(hoverTime);
        setHoverPosition(e.clientX - rect.left);
    };

    // Handle progress bar mouse leave
    const handleProgressLeave = () => {
        setHoverTime(null);
        setHoverPosition(null);
    };

    // Handle volume bar click
    const handleVolumeClick = (e) => {
        const video = videoRef.current;
        const audio = audioRef.current;
        const volumeBar = volumeBarRef.current;
        if (!volumeBar) return;
        const rect = volumeBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newVolume = Math.max(0, Math.min(1, percent));
        setVolume(newVolume);
        setIsMuted(newVolume === 0);

        if (audioTracks.length > 0) {
            // Use separate audio element
            if (audio) {
                audio.volume = newVolume;
                audio.muted = newVolume === 0;
            }
        } else {
            // Use video's embedded audio
            video.volume = newVolume;
            video.muted = newVolume === 0;
        }
    };

    // Back 10 seconds
    const skipBackward = (backfor) => {

        const video = videoRef.current;
        const audio = audioRef.current;
        let newTime;
        if (backfor === "backward10") {
            newTime = Math.max(0, video.currentTime - 10);
        } else if (backfor === "forward10") {
            newTime = Math.min(video.duration, video.currentTime + 10);
        }

        // Show loader when seeking
        setIsLoading(true);

        video.currentTime = newTime;
        if (audio && audioTracks.length > 0) {
            audio.currentTime = newTime;
        }

        // Loader will be hidden by seeked event
    };

    // Get current episode index and next episode
    const getCurrentEpisodeInfo = () => {
        if (!movieData?.episodes || !Array.isArray(movieData.episodes) || movieData.episodes.length === 0) {
            return { currentIndex: -1, nextEp: null, isLast: true };
        }

        // Filter out null episodes
        const validEpisodes = movieData.episodes.filter(ep => ep !== null && ep?.id);

        if (validEpisodes.length === 0) {
            return { currentIndex: -1, nextEp: null, isLast: true };
        }

        // Find current episode index
        const currentIndex = validEpisodes.findIndex(ep => ep.id === currentMovieId);

        if (currentIndex === -1) {
            return { currentIndex: -1, nextEp: null, isLast: true };
        }

        // Check if there's a next episode
        const nextEp = currentIndex < validEpisodes.length - 1 ? validEpisodes[currentIndex + 1] : null;
        const isLast = currentIndex === validEpisodes.length - 1;

        return { currentIndex, nextEp, isLast };
    };

    // Next episode function
    const handleNextEpisode = async () => {
        const { nextEp } = getCurrentEpisodeInfo();

        if (!nextEp || !nextEp.id) {
            console.log("No next episode available");
            return;
        }

        // Show loader
        setIsLoading(true);

        // Reset initialization flag to allow new episode to load
        isInitializedRef.current = false
        togglePlay()
        // Fetch and play next episode
        await fetchPlaylist(nextEp.id);
    };

    const { isLast } = getCurrentEpisodeInfo();

    // Check if episodes array is null or contains only null values
    const hasValidEpisodes = movieData?.episodes &&
        Array.isArray(movieData.episodes) &&
        movieData.episodes.length > 0 &&
        movieData.episodes.some(ep => ep !== null && ep?.id);

    // Calculate remaining time
    const remainingTime = duration - currentTime;
    const timeRemaining5Min = remainingTime <= 300; // 5 minutes = 300 seconds
    // Hide next button until 5 minutes remaining or if no next episode
    const isNextDisabled = isLast || !hasValidEpisodes || !timeRemaining5Min;
    const isNextArrowDisabled = isLast || !hasValidEpisodes;
    // Toggle mute
    // Toggle mute
    const toggleMute = () => {
        const video = videoRef.current;
        const audio = audioRef.current;
        const newMuted = !isMuted;
        setIsMuted(newMuted);

        if (newMuted) {
            // Save current volume before muting
            setPreviousVolume(volume);
            if (audioTracks.length > 0) {
                if (audio) {
                    audio.muted = true;
                }
            } else {
                video.muted = true;
            }
        } else {
            // Restore previous volume when unmuting
            const restoreVolume = previousVolume > 0 ? previousVolume : 0.5;
            setVolume(restoreVolume);
            if (audioTracks.length > 0) {
                if (audio) {
                    audio.muted = false;
                    audio.volume = restoreVolume;
                }
            } else {
                video.muted = false;
                video.volume = restoreVolume;
            }
        }
    };

    // Change quality
    const changeQuality = (track) => {
        if (!hlsRef.current || !videoRef.current) return;
        if (selecedQuality === track.height) return;
        else {
            setSelecedQuality(track.height);
            setSettingsView('main');
            setShowSettings(false);
        }
        setIsLoading(true);
        const video = videoRef.current;
        const audio = audioRef.current;
        const currentTime = video.currentTime;
        const wasPlaying = !video.paused;

        // Pause video and audio immediately to prevent playback from start
        video.pause();
        if (audio) audio.pause();

        // Destroy current HLS instance
        try {
            hlsRef.current.destroy();
        } catch (e) {
            console.error("Error destroying HLS:", e);
        }

        // Create new HLS instance with new quality
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
        });

        hlsRef.current = hls;

        hls.loadSource(track.url);
        hls.attachMedia(video);

        // Set current time immediately when source is loaded, before playing
        hls.once(Hls.Events.MANIFEST_PARSED, () => {
            // Set time before any playback can start
            video.currentTime = currentTime;
            if (audio) {
                audio.currentTime = currentTime;
            }

            // Small delay to ensure time is set before play
            setTimeout(() => {
                if (wasPlaying) {
                    video.play().catch(e => console.log("Play error:", e));
                    if (audio && audioTracks.length > 0) {
                        audio.play().catch(e => console.log("Audio play error:", e));
                    }
                }
                setIsLoading(false);
            }, 100);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        hls.recoverMediaError();
                        break;
                    default:
                        hls.destroy();
                        setIsLoading(false);
                        break;
                }
            }
        });

        setSelectedQuality(track);
        setSettingsView('main');
        setShowSettings(false);
    };

    // Change audio track
    const changeAudio = async (track) => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!audio || !video) return;

        setIsLoading(true);
        isChangingAudioRef.current = true;

        // Pause video
        const wasPlaying = !video.paused;
        const currentTime = video.currentTime;
        video.pause();
        if (audio) audio.pause();

        // Cleanup previous audio HLS if exists
        if (audio._hls) {
            try {
                audio._hls.destroy();
            } catch (e) {
                console.error("Error destroying audio HLS:", e);
            }
            audio._hls = null;
        }

        setSelectedAudio(track);
        setSettingsView('main');
        setShowSettings(false);

        // Load new audio track
        if (Hls.isSupported() && track.url.endsWith('.m3u8')) {
            // Use HLS.js for audio
            const audioHls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
            });
            audioHls.loadSource(track.url);
            audioHls.attachMedia(audio);
            audio._hls = audioHls;

            // Wait for audio to load
            await new Promise((resolve) => {
                audioHls.once(Hls.Events.MANIFEST_PARSED, () => {
                    resolve();
                });
            });
        } else {
            // Direct audio file
            audio.src = track.url;
            await new Promise((resolve) => {
                const handleCanPlay = () => {
                    audio.removeEventListener("canplay", handleCanPlay);
                    resolve();
                };
                audio.addEventListener("canplay", handleCanPlay);
                audio.load();
            });
        }

        // Sync audio time with video
        audio.currentTime = currentTime;
        audio.volume = isMuted ? 0 : volume;
        audio.playbackRate = playbackRate;

        isChangingAudioRef.current = false;
        setIsLoading(false);

        // Resume video if it was playing
        if (wasPlaying) {
            video.currentTime = currentTime;
            video.play();
            audio.play().catch(e => console.log("Audio play error:", e));
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
                setShowSettings(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Change playback speed
    const changeSpeed = (speed) => {
        const video = videoRef.current;
        const audio = audioRef.current;
        video.playbackRate = speed;
        if (audio && audioTracks.length > 0) {
            audio.playbackRate = speed;
        }
        setPlaybackRate(speed);
        setSettingsView('main');
        setShowSettings(false);
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            setIsFullscreen(true);
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Get quality label
    const getQualityLabel = (track) => {
        if (!track || !track.height) return "Auto";
        if (track.height >= 2160) return "4K";
        if (track.height >= 1440) return "1440p";
        if (track.height >= 1080) return "1080p";
        if (track.height >= 720) return "720p";
        if (track.height >= 480) return "480p";
        if (track.height >= 360) return "360p";
        return `${track.height}p`;
    };

    useEffect(() => {
        let t;
        if (isPlaying) {
            t = setInterval(() => {
                try {
                    const video = videoRef.current;
                    if (!video) return;
                    const poster = `https://imgcdn.kim/pv/c/${movieId}.jpg`;
                    if (movieData?.episodes && movieData?.episodes[0] !== null) {
                        const ep = (movieData.episodes || []).find(ep => String(ep.id) === String(currentMovieId)) || {};
                        addRecent({ seriesTitle: movieData?.title || '', episodeId: currentMovieId, title: ep?.t || ep?.title || '', season: ep?.s, episodeIndex: ep?.ep, duration: (video.duration || duration) || 0, currentTime: video.currentTime || 0, id: movieId });
                    } else {
                        addRecent({ id: movieId, title: movieData?.title || '', duration: (video.duration || duration) || 0, currentTime: video.currentTime || 0, poster });
                    }
                } catch (e) {
                    console.error('periodic addRecent err', e);
                }
            }, 3000);
        }
        return () => { if (t) clearInterval(t); };
    }, [isPlaying, currentMovieId, movieId, movieData, duration]);
    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const video = videoRef.current;
            const audio = audioRef.current;

            switch (e.key.toLowerCase()) {
                case 'arrowleft':
                    e.preventDefault();
                    skipBackward("backward10");
                    break;

                case 'arrowright':
                    e.preventDefault();
                    skipBackward("forward10");
                    break;

                case 'arrowup':
                    e.preventDefault();
                    // Increase volume by 10%
                    const newVolumeUp = Math.min(1, volume + 0.1);
                    setVolume(newVolumeUp);
                    setIsMuted(false);
                    if (audioTracks.length > 0) {
                        if (audio) {
                            audio.volume = newVolumeUp;
                            audio.muted = false;
                        }
                    } else {
                        video.volume = newVolumeUp;
                        video.muted = false;
                    }
                    break;

                case 'arrowdown':
                    e.preventDefault();
                    // Decrease volume by 10%
                    const newVolumeDown = Math.max(0, volume - 0.1);
                    setVolume(newVolumeDown);
                    setIsMuted(newVolumeDown === 0);
                    if (audioTracks.length > 0) {
                        if (audio) {
                            audio.volume = newVolumeDown;
                            audio.muted = newVolumeDown === 0;
                        }
                    } else {
                        video.volume = newVolumeDown;
                        video.muted = newVolumeDown === 0;
                    }
                    break;

                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;

                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;

                case ' ':
                case 'spacebar':
                    e.preventDefault();
                    togglePlay();
                    break;

                case 'escape':
                    e.preventDefault();
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                        setIsFullscreen(false);
                    }
                    break;

                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying, volume, isMuted, audioTracks, previousVolume]);

    if (error) return <p className="text-red-500">Error loading playlist</p>;

    return (
        <div
            ref={containerRef}
            className="w-full fixed h-dvh z-[1000000000000000000000000000000] bg-black group"
        >
            <button ref={closeButtonRef} className={`cursor-pointer outline-0 p-2 z-10 absolute top-3 right-2 ${showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setPlaylist(null)}><X className="w-9 lg:w-11 h-9 lg:h-11 stroke-3 fill-white stroke-white" /></button>
            <div
                className="relative w-full h-full items-center justify-center flex cursor-pointer"
            >
                <video
                    ref={videoRef}
                    className="w-full h-full aspect-auto max-h-screen"
                    poster={`/img/c/${movieId}.jpg` || ""}
                    playsInline
                    autoPlay
                    muted={audioTracks.length > 0}
                />
            </div>

            {/* Hidden audio element for separate audio tracks */}
            {audioTracks.length > 0 && (
                <audio
                    ref={audioRef}
                    className="hidden"
                    preload="auto"
                />
            )}

            {/* Center Controls */}
            <div
                className={`absolute inset-0 flex items-center justify-center gap-14 transition-opacity duration-300 ${showControls || isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute top-0 left-0 w-full h-full cursor-pointer" onClick={togglePlay}></div>
                {/* Back 10 seconds */}
                {isLoading ? (
                    <Loader2 className="w-15 lg:w-20 h-15 lg:h-20 animate-spin stroke-3 relative z-10" />) :
                    (<>
                        <button
                            onClick={() => skipBackward("backward10")}
                            className="cursor-pointer outline-0 relative z-10"
                        >
                            <BackwardIcon className="w-11 lg:w-15 h-11 lg:h-15" />
                        </button>

                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="cursor-pointer outline-0 relative z-10"
                        >
                            {isPlaying ? (
                                <Pause className="w-15 lg:w-20 h-15 lg:h-20 fill-white" />
                            ) : (
                                <Play className="w-15 lg:w-20 h-15 lg:h-20" />
                            )}
                        </button>

                        { /* Forward 10 seconds */}
                        <button
                            onClick={() => skipBackward("forward10")}
                            className="cursor-pointer outline-0 relative z-10"
                        >
                            <ForwardIcon className="w-11 lg:w-15 h-11 lg:h-15" />
                        </button>
                    </>
                    )}
            </div>
            {/* Next episode button */}
            {!isNextDisabled && <button ref={nextEpButtonRef} onClick={handleNextEpisode} className={`bg-gray-300 hover:bg-white absolute bottom-17 lg:bottom-19 xl:bottom-30 right-3 xl:right-15 font-medium py-2 px-4 rounded-sm md:rounded-lg text-black z-50 cursor-pointer transition-opacity duration-300 max-md:text-sm ${showControls ? 'opacity-100' : 'opacity-0'}`}>Next Episode</button>}
            {/* Custom Controls */}
            <div
                ref={bottomToolsRef}
                className={`absolute bottom-0 left-0 right-0 bottom_tools bg-linear-to-t px-3 xl:px-15 from-black/80 to-transparent transition-opacity duration-300 controls-container ${showControls ? 'opacity-100' : 'opacity-0'
                    }`}>
                {/* Progress Bar with expanded hover area */}
                <div
                    className="relative h-5 -mt-7 cursor-pointer progress_bar_container"
                    onMouseMove={handleProgressHover}
                    onMouseLeave={handleProgressLeave}
                    onClick={handleProgressClick}
                >
                    {/* Expanded hover area */}
                    <div className="absolute inset-0" />

                    {/* Actual progress bar */}
                    <div style={{ width: `${(hoverTime / duration) * 100}%` }} className="absolute bottom-0 left-0 h-1.5 md:h-2 bg-white/50 z-10">
                    </div>
                    <div
                        ref={progressBarRef}
                        className="absolute bottom-0 left-0 right-0 h-1.5 progress_bar bg-sky-500 transition-all"
                    >
                        <div
                            className={`h-full ${currentTime > 0 ? 'bg-white' : 'bg-sky-500'}`}
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                    </div>

                    {/* Hover tooltip */}
                    {hoverTime !== null && hoverPosition !== null && (
                        <div
                            className="absolute bottom-8 font-bold bg-black/90 text-white text-sm px-2 py-1 rounded pointer-events-none"
                            style={{ left: `${hoverPosition}px`, transform: 'translateX(-50%)' }}
                        >
                            {formatTime(hoverTime)}
                        </div>
                    )}
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between py-3 xl:py-8 px-1">
                    <div className="flex items-center gap-4 xs:gap-8">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-gray-300 transition-colors cursor-pointer"
                        >
                            {isPlaying ? (
                                <Pause className="w-7 lg:w-8 h-7 lg:h-8 fill-white" />
                            ) : (
                                <Play className="w-7 lg:w-7 h-7 lg:h-7" />
                            )}
                        </button>

                        {/* Back 10 seconds */}
                        <button
                            onClick={() => skipBackward("backward10")}
                            className="max-xs:hidden text-white hover:text-gray-300 transition-colors cursor-pointer"
                        >
                            <BackwardIcon className="w-6 lg:w-7 h-6 lg:h-7" />
                        </button>
                        <button
                            onClick={() => skipBackward("forward10")}
                            className="max-xs:hidden text-white hover:text-gray-300 transition-colors cursor-pointer"
                        >
                            <ForwardIcon className="w-6 lg:w-7 h-6 lg:h-7" />
                        </button>

                        {/* Next Episode */}
                        <button
                            onClick={handleNextEpisode}
                            disabled={isNextArrowDisabled}
                            className={`transition-colors ${isNextArrowDisabled ? 'max-md:hidden md:opacity-50 cursor-default text-gray-500' : 'text-white hover:text-gray-300 cursor-pointer'}`}
                        >
                            <SkipForward className="w-6 lg:w-7 h-6 lg:h-7" />
                        </button>

                        {/* Volume */}
                        <div
                            className="flex items-center gap-2"
                            onMouseEnter={() => setShowVolumeBar(true)}
                            onMouseLeave={() => setShowVolumeBar(false)}
                        >
                            <button
                                onClick={toggleMute}
                                className="text-white hover:text-gray-300 transition-colors cursor-pointer"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeOffIcon className="w-7 lg:w-8 h-7 lg:h-8" />
                                ) : (
                                    <VolumeOnIcon className="w-7 lg:w-8 h-7 lg:h-8" />
                                )}
                            </button>
                            <div
                                ref={volumeBarRef}
                                className={`h-1 max-xs:hidden bg-white/30 cursor-pointer hover:h-1.5 transition-all relative overflow-hidden ${showVolumeBar ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}
                                onClick={handleVolumeClick}
                            >
                                <div
                                    className="h-full bg-white transition-all"
                                    style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Time */}
                        <div className="text-white flex items-center gap-1 md:gap-3 max-md:text-sm">
                            <span>{formatTime(currentTime)}</span> <span className="text-sm"> / </span> <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 xs:gap-5 md:gap-10">
                        {/* Settings Menu */}
                        <div className="relative" ref={settingsMenuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSettings(showSettings ? false : true);
                                    if (!showSettings) {
                                        setSettingsView('main');
                                    }
                                }}
                                className="cursor-pointer">
                                <SettingsIcon className="w-6 lg:w-8 h-6 lg:h-8" />
                            </button>

                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-2 bg-[#000000] rounded-lg shadow-2xl min-w-[230px] overflow-hidden border border-white/30">
                                    {settingsView === 'main' ? (
                                        <>
                                            {/* Quality */}
                                            <button
                                                onClick={() => setSettingsView('quality')}
                                                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center justify-between cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Settings2 className="w-5 h-5" />
                                                    <div className="flex items-center gap-2">
                                                        <span>Quality</span>
                                                        <span className="text-xs text-gray-300"> ({selecedQuality ? `${selecedQuality}p` : 'Auto'})</span>
                                                    </div>
                                                </div>
                                                <ChevronDown className="w-4 h-4 -rotate-90" />
                                            </button>
                                            {/* Audio/Language */}
                                            {audioTracks.length > 0 && (
                                                <button
                                                    onClick={() => setSettingsView('language')}
                                                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center justify-between border-t border-white/10 cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <LanguageIcon className="w-5 h-5" />
                                                        <div className="flex items-center gap-2">
                                                            <span>Language</span>
                                                            <span className="text-xs text-gray-300"> ({selecedAudio ? `${selecedAudio}` : 'Auto'})</span>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 -rotate-90" />
                                                </button>
                                            )}
                                            {/* Playback Speed */}
                                            <button
                                                onClick={() => setSettingsView('speed')}
                                                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center justify-between border-t border-white/10 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <SpeedometerIcon className="w-5 h-5" />
                                                    <div className="flex items-center gap-2">
                                                        <span>Speed</span>
                                                        <span className="text-xs text-gray-300"> ({selecedSpeed ? `${selecedSpeed}x` : 'Auto'})</span>
                                                    </div>
                                                </div>
                                                <ChevronDown className="w-4 h-4 -rotate-90" />
                                            </button>
                                        </>
                                    ) : settingsView === 'quality' ? (
                                        <>
                                            <button
                                                onClick={() => setSettingsView('main')}
                                                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer border-b border-white/20"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                                <span className="text-sm text-gray-100">Quality </span>
                                            </button>
                                            {videoTracks.map((track, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        changeQuality(track)
                                                        setSelecedQuality(track.height)
                                                        setSettingsView('main')
                                                        setShowSettings(false)
                                                    }}
                                                    className={`w-full px-4 py-2 text-left text-white hover:bg-white/10 cursor-pointer ${selectedQuality?.url === track.url ? 'text-red-500' : ''
                                                        }`}
                                                >
                                                    {selecedQuality === track.height ? <div className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />{getQualityLabel(track)}</div> : <span className="ps-6">{getQualityLabel(track)}</span>}
                                                </button>
                                            ))}
                                        </>
                                    ) : settingsView === 'language' ? (
                                        <>
                                            <button
                                                onClick={() => setSettingsView('main')}
                                                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer border-b border-white/20"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                                <span className="text-sm text-gray-100">Language </span>
                                            </button>
                                            <div className="max-h-[200px] overflow-y-auto serach_results">
                                                {audioTracks.map((track, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            changeAudio(track)
                                                            setSelecedAudio(track.name || track.lang)
                                                            setSettingsView('main')
                                                            setShowSettings(false)
                                                        }}
                                                        className={`w-full px-4 py-2 text-left text-white hover:bg-white/10 cursor-pointer ${selectedAudio?.url === track.url ? 'text-red-500' : ''
                                                            }`}
                                                    >
                                                        {selecedAudio === track.name ? <div className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />{track.name || track.lang}</div> : <span className="ps-6">{track.name || track.lang}</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : settingsView === 'speed' ? (
                                        <>
                                            <button
                                                onClick={() => { setSettingsView('main') }}
                                                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer border-b border-white/20" >
                                                <ChevronLeft className="w-5 h-5" />
                                                <span className="text-sm text-gray-100">Speed </span>
                                            </button>
                                            <div className="max-h-[200px] overflow-y-auto serach_results">
                                                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => {
                                                            changeSpeed(speed)
                                                            setSelecedSpeed(speed)
                                                            setSettingsView('main')
                                                            setShowSettings(false)
                                                        }}
                                                        className={`w-full px-4 py-2 text-left text-white hover:bg-white/10 cursor-pointer ${playbackRate === speed ? 'text-red-500' : ''
                                                            }`}
                                                    >
                                                        {selecedSpeed === speed ? <div className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />{speed}x</div> : <span className="ps-6">{speed}x</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-gray-300 transition-colors cursor-pointer"
                        >
                            {isFullscreen ? <MinimizeIcon className="w-6 lg:w-8 h-6 lg:h-8" /> : <MaximizeIcon className="w-6 lg:w-8 h-6 lg:h-8" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerPopup;
