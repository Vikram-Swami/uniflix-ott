import { useState, useEffect, useRef } from "react";
import { getImageUrl, getMovieDetails, nextEpisode } from "../services/api";
import { useWatchlist } from "../hooks/useWatchlist";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, Plus, Share2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import MovieCard from "./MovieCard";
import { Virtual, Navigation } from "swiper/modules";
import { usePlaylist } from "./usePlaylist";
import { loadRecp } from "../utils/recentPlays";
import { ArrowIcon } from "../assets/icons";
import Cookies from "js-cookie";
import LazyImage from "./LazyImage";

// Continue Watching
export default function MovieDetailsPopup({ setMovieDetailsPopupScroll, setMovieData, movieData }) {
    const [activeTab, setActiveTab] = useState("episode");
    const [loading, setLoading] = useState(true);
    const [episodesLoading, setEpisodesLoading] = useState(false);
    const [seasonLoading, setSeasonLoading] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [reachStart, setReachStart] = useState(true);
    const [reachEnd, setReachEnd] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [seasonData, setSeasonData] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [selectedLang, setSelectedLang] = useState("")
    const [page, setPage] = useState(1);
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const scrollRef = useRef(null);
    const stickyRef = useRef(null);
    const [isSticky, setIsSticky] = useState(false);
    const navigate = useNavigate();
    const { addToWatchlist, removeFromWatchlist, isInWatchlist, } = useWatchlist();
    const { fetchPlaylist, setHolePageLoading } = usePlaylist();
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    };
    const query = useQuery();
    const movieId = query.get("movieId");
    useEffect(() => {
        if (movieData) {
            let language = Cookies.get("lg") || movieData?.lang.find((item) => item?.s === movieData?.d_lang)?.l
            if (language) {
                setSelectedLang(language)
            }
        }
        if (movieData?.episodes[0] === null) {
            setActiveTab("related");
        } else {
            setActiveTab("episode");
        }
    }, [movieData]);
    useEffect(() => {
        if (movieId) {
            const loadMovieDetails = async () => {
                try {
                    setHolePageLoading(true)
                    setLoading(true);
                    const data = await getMovieDetails(movieId);
                    setMovieData(data);
                    if (data?.seasons && data?.seasons?.length > 0) {
                        setSelectedSeason(data?.seasons?.length);
                    }
                    setSeasonData((prev) => [...prev, { id: data?.nextPageSeason, episodes: data?.episodes, nextPageShow: data?.nextPageShow, lang: data?.lang }]);
                } catch (error) {
                    console.error("Error loading movie details:", error);
                } finally {
                    setLoading(false);
                    setHolePageLoading(false)
                }
            };
            loadMovieDetails();
        }
    }, [movieId]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleShowMore = async () => {
        try {
            setEpisodesLoading(true);
            const data = await nextEpisode(movieData?.nextPageSeason, movieId, page + 1);
            if (data.episodes) {
                setMovieData((prev) => ({ ...prev, episodes: prev?.episodes?.concat(data?.episodes), nextPageShow: data?.nextPageShow }));
                setPage(page + 1);
            } else {
                setMovieData({ ...movieData, nextPageShow: false });
            }
        } catch (error) {
            console.error("Error loading episodes:", error);
        } finally {
            setEpisodesLoading(false);
        }
    };
    const handleChangeSeason = async (seasonId) => {
        try {
            setSeasonLoading(true);
            if (movieData?.season?.length > 1) {
                if (seasonData.some(info => info.id === seasonId)) {
                    const data = seasonData.find(info => info.id === seasonId);
                    setMovieData((prev) => ({ ...prev, episodes: data?.episodes, nextPageShow: data?.nextPageShow, lang: data?.lang }));
                } else {
                    const data = await nextEpisode(seasonId, movieId, 1);
                    setMovieData((prev) => ({ ...prev, episodes: data?.episodes, nextPageShow: data?.nextPageShow, lang: data?.lang }));
                    setSeasonData((prev) => [...prev, { id: seasonId, episodes: data?.episodes, nextPageShow: data?.nextPageShow, lang: data?.lang }]);
                }
            }
        } catch (error) {
            console.error("Error loading episodes:", error);
        } finally {
            setHolePageLoading(false);
            setSeasonLoading(false);
        }
    };

    useEffect(() => {
        const timer1 = setTimeout(() => {
            const el = stickyRef.current;
            if (!el) return;

            const handleScroll = () => {
                const top = el.getBoundingClientRect().top;
                setIsSticky(top <= 70);
            };
            scrollRef.current?.addEventListener("scroll", handleScroll);
            handleScroll();

            return () =>
                scrollRef.current?.removeEventListener("scroll", handleScroll);
        }, 1000);

        return () => clearTimeout(timer1);
    }, [movieId]);


    useEffect(() => {
        const timer = setTimeout(() => {
            const el = scrollRef.current;
            if (!el) return;

            const handleScroll = () => {
                const y = el.scrollTop;
                setMovieDetailsPopupScroll(y > 70);
            };

            el.addEventListener("scroll", handleScroll);

            return () => el.removeEventListener("scroll", handleScroll);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleWatchlistToggle = () => {
        if (isInWatchlist(movieId)) {
            removeFromWatchlist(movieId);
        } else {
            addToWatchlist(movieId);
        }
    };


    const langRefs = useRef([]);

    useEffect(() => {
        if (selectedLang && langRefs.current[selectedLang]) {
            langRefs.current[selectedLang].scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest"
            });
        }
    }, [selectedLang]);

    const bannerImage = `/api/img/c/${movieId}.jpg`;
    const title = movieData?.title || "Unknown Title";
    const description = movieData?.desc || "";
    const rating = movieData?.ua || "";
    const year = movieData?.year || "";
    const imdb = movieData?.match || "";
    const genres = movieData?.genre?.split(",") || ["Action", "Adventure", "Sci-Fi"];
    const episodes = movieData?.episodes || [];
    const seasons = movieData?.season || [];
    const related = movieData?.suggest || [];

    const recp = loadRecp();
    let recentEntry = null;
    let allrecentEntry = [];
    // if this is a series (episodes array not null), try to find last watched episode for this series
    if (movieData?.episodes && movieData?.episodes[0] !== null) {
        const seriesList = recp.S?.[movieData?.title] || [];
        recentEntry = seriesList && seriesList.length ? seriesList[0] : null;
        allrecentEntry = seriesList && seriesList.length ? seriesList : [];
    } else {
        recentEntry = (recp.M || []).find(m => String(m.id) === String(movieId)) || null;
    }
    const progressPct = recentEntry && recentEntry?.duration ? Math.min(100, (recentEntry.currentTime / recentEntry.duration) * 100) : 0;
    const resumeText = recentEntry && recentEntry?.episodeId ? `Resume Season ${recentEntry?.season?.split("S")[1]}, Episode ${recentEntry?.episodeIndex?.split("E")[1]}` : recentEntry && recentEntry.id ? ("Resume") : (movieData?.episodes[0] !== null ? `Play Season ${movieData?.episodes[0].s}, Episode ${movieData?.episodes[0].ep}` : 'Play');
    const didApplyRecentSeason = useRef(false);

    useEffect(() => {
        if (didApplyRecentSeason.current) return;

        const recentSession = recentEntry && recentEntry?.season
            ? "Season " + recentEntry.season.split("S")[1]
            : null;

        if (
            movieData?.season?.length > 0 &&
            recentEntry &&
            recentEntry?.season !== movieData?.episodes?.[0]?.s
        ) {
            didApplyRecentSeason.current = true;
            const target = movieData?.season?.find(
                s => s?.s === recentEntry?.season?.split("S")[1]
            );

            if (target?.id) {
                setHolePageLoading(true);
                handleChangeSeason(target.id);
                setSelectedSeason(recentSession);
            }
        } else if (movieData && movieData.episodes?.length > 0 && recentEntry && movieData?.episodes[0]?.s !== recentEntry?.season) {
            didApplyRecentSeason.current = true;
        }
    }, [movieData, recentEntry]);

    // Share function with title, image and URL
    const handleShare = async () => {
        const pageUrl = window.location.href;
        const movieTitle = movieData?.title || "Watch this video";
        const movieT = movieData?.episodes && movieData?.episodes[0] !== null ? "Series" : "Movie";
        const shareText = `🎬✨ *${movieTitle}* ✨🎬

🍿 Check Out this Amazing ${movieT}!

🔗 Watch Here:
${pageUrl}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    text: shareText,
                    title: movieTitle,
                });
            } else {
                throw new Error("Share not supported");
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("Share failed", err);
                try {
                    await navigator.clipboard.writeText(shareText);
                    alert("📋 Link copied to clipboard!");
                } catch (clipboardErr) {
                    console.error("Clipboard error:", clipboardErr);
                }
            }
        }
    };

    function languageHandle(lang) {
        Cookies.set("lang", lang.s, {
            expires: 90,
            sameSite: "Lax",
            path: "/",
        });
        Cookies.set("lg", lang.l, {
            expires: 90,
            sameSite: "Lax",
            path: "/",
        });
        setSelectedLang(lang.l)
    }



    if (!movieId) {
        return (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-l-2 border-sky-500"></div>
            </div>
        );
    }
    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" />
        );
    }

    if (!movieData) {
        return (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center h-dvh">
                <div className="text-white text-center">
                    <p className="text-red-500 mb-4">Failed to load movie details</p>
                    <button
                        onClick={() => navigate("/home")}
                        className="px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={scrollRef} className="fixed inset-0 z-500 bg-[#00050d] overflow-y-auto movie_details_popup_scroll h-screen overflow-x-hidden">
            {/* Hero Banner Section */}
            <section className="relative min-h-auto md:min-h-[75vh] 2xl:min-h-screen! w-full">
                <div className="relative overflow-hidden z-10 flex min-h-auto md:min-h-[75vh] 2xl:min-h-screen! w-full items-end max-xs:px-3 xs:px-6 sm2:px-8 md2:px-11 2xl:px-[72px]! pb-5 xs:pb-10 md:pb-20 text-white max-md:flex-col">
                    {/* Background Image */}
                    <div className="relative md:absolute left-0 top-0 z-0 h-full w-full">
                        <div className="max-md:hidden absolute w-full md:w-[50%] h-full bg-linear-to-r from-[#000000cf] via-black/20 to-transparent z-10"></div>
                        <div className="w-full max-xs:-mx-3 xs:-mx-6 sm2:-mx-8 md:mx-0! max-sm:min-w-[calc(100%+24px)] xs:min-w-[calc(100%+48px)] sm2:min-w-[calc(100%+64px)]! md:min-w-full h-10 xs:h-64 hero_bg_leaner absolute -bottom-px left-0 z-10"></div>
                        <div className="group relative transition-all duration-500 ease-in-out opacity-100 w-full h-full max-xs:-mx-3 xs:-mx-6 sm2:-mx-8 md:mx-0! max-sm:min-w-[calc(100%+24px)] xs:min-w-[calc(100%+48px)] sm2:min-w-[calc(100%+64px)]! md:min-w-full">
                            <LazyImage priority={true} src={bannerImage} alt={title} className={"transition-all duration-700 ease-in-out opacity-100 h-full w-full object-cover object-top-right"} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex max-w-full md2:max-w-[80%] lg:max-w-[60%]  xl:max-w-1/2! flex-col pt-3 xs:pt-5 md:pt-20">
                        <h1 className="text-2xl xs:text-[28px] md:text-[32px] md2:text-4xl xl:text-[50px]! font-bold mb-3 md2:mb-5">{title}</h1>
                        <p className="max-xs:hidden line-clamp-3 text-white/80 md:text-white text-[12px] xs:text-sm md:text-base 2xl:text-lg! md:font-semibold leading-6 mb-4">
                            {description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[11px] xs:text-sm 2xl:text-[16px] font-medium text-white/80 md:text-[#828282] mb-4">
                            {imdb && <span>{imdb}</span>}
                            {<span>{movieData?.runtime}</span>}
                            {year && <span>{year}</span>}
                            <span className="inline-block overflow-hidden xs:rounded-[4px] bg-[#fff3] px-1.5 xs:px-3 font-normal text-white text-[11px] xs:text-sm 2xl:text-[16px]">
                                {movieData?.hdsd}
                            </span>
                            {rating && (
                                <span className="inline-block overflow-hidden rounded-[2px] xs:rounded-[4px] bg-[#fff3] px-1.5 xs:px-3 font-normal text-white text-[11px] xs:text-sm 2xl:text-[16px]">
                                    {rating?.split("[")[1]?.split("]")[0] ? rating?.split("[")[1]?.split("]")[0] : rating}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-4 xs:hidden">
                            <button onClick={() => fetchPlaylist(recentEntry && recentEntry?.episodeId ? recentEntry?.episodeId : episodes[0] !== null ? episodes[0]?.id : movieId)} className="h-9 md:h-14 flex items-center justify-center rounded-sm bg-white text-black px-6 md:px-8 text-center transition-all duration-300 ease-in-out font-semibold hover:text-black cursor-pointer text-sm relative overflow-hidden w-full mb-2">
                                <svg
                                    stroke="currentColor"
                                    fill="currentColor"
                                    strokeWidth="0"
                                    viewBox="0 0 512 512"
                                    className="w-8 h-8 md:w-10 md:h-10 pe-2">
                                    <path d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440z"></path>
                                </svg>
                                {resumeText}
                                {progressPct > 0 && (
                                    <div className="w-full absolute bottom-0 left-0">
                                        <div className="h-1 bg-white/20 rounded overflow-hidden">
                                            <div style={{ width: `${progressPct}%` }} className="h-full bg-sky-500" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        </div>
                        {genres?.length > 0 && (
                            <div className="mb-1 xs:mb-10 xl:mb-14 flex flex-wrap">
                                {genres?.map((genre, index) => (
                                    <span key={index} className="flex items-center">
                                        <span className="text-white/80 md:text-white xs:font-bold text-[11px] xs:text-sm md:text-base">{genre}</span>
                                        {index < genres?.length - 1 && <span className="mx-3 font-bold text-white/80 md:text-white"> • </span>}
                                    </span>
                                ))}
                            </div>
                        )}
                        <p className="xs:hidden line-clamp-3 text-white/80 md:text-white text-[12px] xs:text-sm md:text-base 2xl:text-lg! md:font-semibold leading-6">
                            {description}
                        </p>
                        <div className="flex gap-4 max-xs:hidden">
                            <div>
                                <button onClick={() => fetchPlaylist(recentEntry && recentEntry?.episodeId ? recentEntry?.episodeId : episodes[0] !== null ? episodes[0]?.id : movieId)} className="h-11 md:h-14 flex items-center justify-center rounded-lg bg-white/30 hover:bg-white text-white px-6 md:px-8 text-center transition-all duration-300 ease-in-out font-semibold hover:text-black cursor-pointer text-base md:text-lg relative overflow-hidden">
                                    <svg
                                        stroke="currentColor"
                                        fill="currentColor"
                                        strokeWidth="0"
                                        viewBox="0 0 512 512"
                                        className="w-8 h-8 md:w-10 md:h-10 pe-2">
                                        <path d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440z"></path>
                                    </svg>
                                    {resumeText}
                                    {progressPct > 0 && (
                                        <div className="w-full absolute bottom-0 left-0">
                                            <div className="h-1 bg-white/20 rounded overflow-hidden">
                                                <div style={{ width: `${progressPct}%` }} className="h-full bg-sky-500" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            </div>
                            <div className="group relative inline-block cursor-pointer text-center">
                                <button onClick={handleWatchlistToggle} className="h-11 md:h-14 flex items-center justify-center w-11 md:w-14 rounded-full bg-white/30 cursor-pointer text-center transition-all duration-300 sm:hover:text-black ease-in-out sm:hover:bg-white">
                                    {isInWatchlist(movieId) ? <Check className="w-5 md:w-7 h-5 md:h-7" /> : <Plus className="w-5 md:w-7 h-5 md:h-7" />}
                                </button>
                                <div className="pointer-events-none absolute left-1/2 top-[calc(100%+20px)] z-10 -translate-x-1/2 rounded-xl bg-white px-3 py-2 text-center text-[#232323] opacity-0 transition-all ease-out group-hover:opacity-100 font-medium">
                                    Watchlist
                                    <svg
                                        className="absolute bottom-full left-1/2 h-2 w-full -translate-x-1/2 rotate-180 transform text-white"
                                        viewBox="0 0 255 255">
                                        <polygon className="fill-current" points="0,0 127.5,127.5 255,0"></polygon>
                                    </svg>
                                </div>
                            </div>
                            <div className="group relative inline-block cursor-pointer text-center">
                                <button onClick={handleShare} className="h-11 md:h-14 flex items-center justify-center w-11 md:w-14 rounded-full bg-white/30 cursor-pointer text-center transition-all duration-300 sm:hover:text-black ease-in-out sm:hover:bg-white">
                                    <Share2 className="w-5 md:w-7 h-5 md:h-7" />
                                </button>
                                <div className="pointer-events-none absolute left-1/2 top-[calc(100%+20px)] z-10 -translate-x-1/2 rounded-xl bg-white px-3 py-2 text-center text-[#232323] opacity-0 transition-all ease-out group-hover:opacity-100 font-medium">
                                    Share
                                    <svg
                                        className="absolute bottom-full left-1/2 h-2 w-full -translate-x-1/2 rotate-180 transform text-white"
                                        viewBox="0 0 255 255">
                                        <polygon className="fill-current" points="0,0 127.5,127.5 255,0"></polygon>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <p className="text-[11px] xs:text-sm md:text-base flex gap-2 xs:pb-3 items-center mt-4 font-medium">
                            <svg
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="0"
                                viewBox="0 0 512 512"
                                className="text-[#1a98ff] w-2.5 xs:w-4 h-2.5 xs:h-4 md:w-4 md:h-4">
                                <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path>
                            </svg>
                            Included with Prime
                        </p>
                    </div>
                </div>
            </section>
            {movieData?.lang && <div className="max-xs:px-3 xs:px-6 sm2:px-8 md2:px-11 2xl:px-[72px]! mb-2 xs:mb-5">
                <div className="max-w-[500px] overflow-x-scroll flex gap-2 xs:gap-4 pb-2 lang_slider">
                    {movieData?.lang.map((item, i) => {
                        return (
                            <button ref={(el) => (langRefs.current[item.l] = el)} key={i} onClick={() => languageHandle(item)} type="button" className={`py-1 text-xs xs:text-sm lg:text-base lg:py-2 px-2 rounded-sm cursor-pointer ${selectedLang === item.l || movieData?.lang?.length === 1 ? "text-black bg-white font-medium" : "max-xs:text-white/70"}`}>{item.l}</button>
                        )
                    })}
                </div>
            </div>}
            {/* Tabs Section */}
            <section className="w-full pb-10">
                <div className="sticky md:top-[60px] z-10">
                    <div className="border-none">
                        <ul ref={stickyRef}
                            className={`sticky-tab md:ms-[23px] 2xl:ms-[51px]! md:me-[18px] 2xl:me-[47px]! sticky mb-5 md:mb-7 lg::mb-10 flex items-center gap-4 md:gap-6 md:top-[60px] px-3 sm:px-6 md:px-2 md:rounded-b-xl md:backdrop-blur-lg ${isSticky && episodes?.length > 0 ? "md:bg-[#33373dcc]" : ""} transition-all duration-300 ease-in-out z-60 text-sm md:text-base 2xl:text-lg font-medium pt-2`}
                            role="tablist">
                            {movieData?.episodes[0] !== null && (
                                <li
                                    role="tab"
                                    onClick={() => setActiveTab("episode")}
                                    className={`cursor-pointer px-4 pt-2 pb-4 transition-colors outline-0 ${activeTab === "episode"
                                        ? "text-white border-b-2 border-white"
                                        : "text-gray-400 hover:text-white"
                                        }`}>
                                    Episode
                                </li>
                            )}
                            <li
                                role="tab"
                                onClick={() => setActiveTab("related")}
                                className={`cursor-pointer px-4 pt-2 pb-4 transition-colors ${activeTab === "related"
                                    ? "text-white border-b-2 border-white"
                                    : "text-gray-400 hover:text-white"
                                    }`}>
                                Related
                            </li>
                            <li
                                role="tab"
                                onClick={() => setActiveTab("details")}
                                className={`cursor-pointer px-4 pt-2 pb-4 transition-colors ${activeTab === "details"
                                    ? "text-white border-b-2 border-white"
                                    : "text-gray-400 hover:text-white"
                                    }`}>
                                Details
                            </li>
                        </ul>

                        {/* Episode Tab */}
                        {activeTab === "episode" && episodes?.length > 0 && (
                            <div className="max-xs:mx-3 xs:mx-6 sm2:mx-8 md2:mx-11 2xl:mx-[72px]! pb-8" >
                                {seasons?.length > 0 && (
                                    <div className="flex justify-end max-w-[1500px] mx-auto mb-10">
                                        <div className="relative" ref={dropdownRef}>
                                            <button onClick={() => setIsOpen((prev) => !prev)} className="text-sm md:text-base 2xl:text-lg font-medium text-white outline-0! flex items-center cursor-pointer bg-white/30 h-9 md:h-10 2xl:h-12 w-[120px] md:w-[130px] rounded-md justify-center">
                                                {selectedSeason ? selectedSeason : "Season " + movieData?.season?.length}
                                            </button>
                                            {isOpen && (
                                                <div className="flex flex-col items-start absolute z-50 bg-gray-dark mt-1.5 rounded-md overflow-hidden right-0 w-[190px] md:w-[215px] bg-[#4e475b] shadow-2xl">
                                                    {movieData?.season?.map((season, i) => {
                                                        return (
                                                            <button key={season?.id} onClick={() => {
                                                                setSelectedSeason("Season " + season?.s)
                                                                setIsOpen(false)
                                                                handleChangeSeason(season?.id)
                                                            }} className={`text-xs md:text-sm 2xl:text-base font-medium outline-0! flex items-center cursor-pointer just ify-center whitespace-nowrap w-full px-3 py-2 border-t border-[#7a6496] first:border-t-0 ${selectedSeason === "Season " + season?.s
                                                                ? "bg-white text-black"
                                                                : selectedSeason === null && i === seasons?.length - 1
                                                                    ? "bg-white text-black"
                                                                    : "text-white hover:bg-[#5e556b]"
                                                                }`}>
                                                                SEASON - {season?.s} {"EPISODES - " + season?.ep
                                                                }
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-col max-w-[1500px] mx-auto gap-6 md:gap-8">
                                    {seasonLoading ?
                                        <div className="flex justify-center items-center h-[200px]">
                                            <div className="w-10 md:w-14 h-10 md:h-14 border-5 border-t-black border-white rounded-full animate-spin"></div>
                                        </div>
                                        : episodes?.map((episode, index) => {
                                            const progressPct2 = allrecentEntry && allrecentEntry.length > 0 ? Math.min(100, (allrecentEntry.find(e => String(e.episodeId) === String(episode?.id))?.currentTime / allrecentEntry.find(e => String(e.episodeId) === String(episode?.id))?.duration) * 100) : 0;
                                            return (
                                                <div key={episode?.id || index} className={`cursor-pointer group relative ${!movieData?.nextPageShow && seasonLoading ? "last:mb-10" : ""}`}>
                                                    <div onClick={() => fetchPlaylist(episode?.id)} className="flex gap-3 xs:gap-4 xl:gap-7 group relative items-start">
                                                        <span className="max-sm:hidden opacity-0 group-hover:opacity-100 absolute bg-gray-900 -left-3 -right-3 -bottom-3 -top-3 lg:-left-6 lg:-right-6 lg:-bottom-6 lg:-top-6 rounded-sm xs:rounded-md lg:rounded-lg xl:rounded-2xl -z-1 transition-all duration-300 ease-in-out"></span>
                                                        <div className="min-w-[110px] xs:min-w-[130px] sm:min-w-[200px] lg:min-w-[250px] xl:min-w-[350px] max-w-[110px] xs:max-w-[130px] sm:max-w-[200px] md:max-w-[350px]">
                                                            <div className="cursor-pointer aspect-video flex-[0_0_300px] overflow-hidden rounded-sm xs:rounded-md lg:rounded-lg xl:rounded-2xl bg-gray-800 shadow-2xl transition-all ease-in-out lg:flex-[0_0_230px] relative">
                                                                <div className="group relative transition-all duration-500 ease-in-out opacity-100 w-full h-full">
                                                                    <img
                                                                        src={
                                                                            getImageUrl(episode?.id) ||
                                                                            "https://picsum.photos/220/330 "
                                                                        }
                                                                        alt={episode?.title}
                                                                        loading="lazy"
                                                                        className="transition-all duration-700 ease-in-out opacity-100 h-full w-full object-cover object-right"
                                                                        onError={(e) => {
                                                                            e.target.src = getImageUrl(episode?.id);
                                                                        }}
                                                                    />
                                                                </div>
                                                                {progressPct2 > 0 && (
                                                                    <div className="w-full absolute bottom-0 left-0">
                                                                        <div className="h-0.5 sm:h-1 bg-white/20 rounded overflow-hidden">
                                                                            <div style={{ width: `${progressPct2}%` }} className="h-full bg-sky-500" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-white relative pe-0 2xl:pe-16 grow">
                                                            <p className="text-xs sm:text-sm md:text-lg xl:text-xl pb-1 font-bold">
                                                                {episode?.s} {episode?.ep} -{episode?.t}
                                                            </p>
                                                            <p className="pb-2 text-[10px] xs:text-xs md:text-sm xl:text-base font-medium flex items-center">
                                                                {episode?.r_date || "Release date TBA"}
                                                                {episode?.time && (
                                                                    <>
                                                                        <span className="px-2 sm:px-3 text-[#1a98ff] font-bold">•</span>
                                                                        {episode?.time}
                                                                    </>
                                                                )}
                                                                {rating && (
                                                                    <>
                                                                        <span className="px-2 sm:px-3 text-[#1a98ff] font-bold">•</span>
                                                                        <span className="inline-block overflow-hidden rounded-[2px] bg-[#fff3] text-white text-[10px] md:text-xs lg:text-sm px-1.5 font-normal">
                                                                            {rating?.split("[")[1]?.split("]")[0] ? rating?.split("[")[1]?.split("]")[0] : rating}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </p>
                                                            {episode?.ep_desc && (
                                                                <p className="text-[#aaa] max-sm:hidden text-xs md:text-sm lg:text-base font-medium">
                                                                    {episode?.ep_desc}
                                                                </p>
                                                            )}
                                                            <p className="text-[10px] xs:text-xs lg:text-sm sm:pt-2 lg:pt-4 flex gap-2 items-center font-normal leading-none">
                                                                <svg
                                                                    stroke="currentColor"
                                                                    fill="currentColor"
                                                                    strokeWidth="0"
                                                                    viewBox="0 0 512 512"
                                                                    className="text-[#1a98ff] w-2 xs:w-3 h-2 xs:h-3 lg:w-4 lg:h-4">
                                                                    <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path>
                                                                </svg>
                                                                Included with Prime
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {episode?.ep_desc && (
                                                        <p className="text-[#aaa] sm:hidden text-[11px] mt-2">
                                                            {episode?.ep_desc}
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                {movieData?.nextPageShow && !seasonLoading ? <div className="flex justify-center mt-5 sm:mt-10">
                                    {episodesLoading ? <div className="w-5 xs:w-7 md:w-9 h-5 xs:h-7 md:h-9 border-4 border-t-black border-white rounded-full animate-spin"></div> : <button onClick={handleShowMore} className={`h-6 xs:h-7 md:h-9 lg:h-11 w-[80px] xs:w-[100px] md:w-[125px] text-black bg-white rounded-sm md:rounded-md text-xs xs:text-sm md:text-base lg:text-lg font-medium hover:bg-gray-200 transition-all duration-300 ease-in-out flex items-center justify-center opacity-100 cursor-pointer hover:w-[135px]`}>
                                        Show more
                                    </button>}
                                </div> : ""}
                            </div>
                        )}

                        {/* Related Tab */}
                        {activeTab === "related" && (
                            <div className="relative cards_slider max-xs:ps-3 xs:ps-6 sm2:ps-8 md2:ps-11 2xl:ps-[72px]! pe-6 z-1000000 max-xs:pb-6">
                                <button
                                    onClick={() => setReachEnd(false)}
                                    ref={prevRef}
                                    className={`arrow group absolute max-sm2:hidden left-0 top-1/2 -translate-y-1/2 
                                            rounded-r-lg w-10 2xl:w-12 h-[calc(100%+2px)] bg-black/60 z-20 hidden items-center justify-center
                                            transition-opacity duration-500 cursor-pointer
                                            ${reachStart || activeIndex === hoveredIndex
                                            ? "opacity-0 pointer-events-none"
                                            : "opacity-100"
                                        }`}>
                                    <span className="rotate-180 scale-120 group-hover:scale-150 transition-all duration-300">
                                        <ArrowIcon className="" />
                                    </span>
                                </button>
                                {/* Movie Cards Container */}
                                <Swiper
                                    modules={[Navigation, Virtual]}
                                    virtual
                                    grabCursor={true}
                                    speed={600}
                                    onSlideChange={(swiper) => {
                                        setActiveIndex(swiper.activeIndex);

                                        const slidesPerView =
                                            swiper.params.slidesPerView || swiper.currentBreakpoint?.slidesPerView || 1;

                                        if (swiper.activeIndex + slidesPerView >= related?.length) {
                                            setReachEnd(true);
                                        } else {
                                            setReachEnd(false);
                                        }

                                        if (swiper.activeIndex === 0) {
                                            setReachStart(true);
                                        } else {
                                            setReachStart(false);
                                        }
                                    }}
                                    navigation={false}
                                    onSwiper={(swiper) => {
                                        setTimeout(() => {
                                            swiper.params.navigation.prevEl = prevRef?.current;
                                            swiper.params.navigation.nextEl = nextRef?.current;
                                            swiper.navigation.init();
                                            swiper.navigation.update();
                                        }, 100);
                                    }}
                                    breakpoints={{
                                        0: {
                                            slidesPerView: 2.1,
                                            slidesPerGroup: 1,
                                        },
                                        450: {
                                            slidesPerView: 2.3,
                                            slidesPerGroup: 1,
                                        },
                                        480: {
                                            slidesPerView: 2.5,
                                            slidesPerGroup: 2,
                                        },
                                        680: {
                                            slidesPerView: 3,
                                            slidesPerGroup: 2,
                                        },
                                        1150: {
                                            slidesPerView: 4.05,
                                            slidesPerGroup: 3,
                                        },
                                        1400: {
                                            slidesPerView: 5.1,
                                            slidesPerGroup: 4,
                                        },
                                        1800: {
                                            slidesPerGroup: 5,
                                            slidesPerView: 6.1,
                                        },
                                    }}>
                                    {related?.map((item, i) => (
                                        <SwiperSlide className="hover:z-10" key={item.id + i} virtualIndex={i}>
                                            <MovieCard
                                                id={item.id}
                                                index={i}
                                                ids={related?.map((item) => item.id)}
                                                activeIndex={activeIndex}
                                                isHovering={isHovering}
                                                setIsHovering={setIsHovering}
                                                onHoverStart={(idx) => setHoveredIndex(idx)}
                                                onHoverEnd={() => setHoveredIndex(null)}
                                                hoveredIndex={hoveredIndex}
                                                reachEnd={reachEnd}
                                                buttonName="Watch Now"
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                {/* Right Arrow */}
                                <button
                                    ref={nextRef}
                                    className={`arrow group max-sm2:hidden absolute right-0 top-1/2 -translate-y-1/2 
                                    rounded-l-md w-10 2xl:w-14 5xl:w-14 h-[calc(100%+2px)] bg-black/60 hidden items-center z-20 justify-center
                                    transition-opacity duration-200 cursor-pointer
                                    ${reachEnd ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                                    <span className="scale-120 group-hover:scale-150 transition-all duration-300">
                                        <ArrowIcon />
                                    </span>
                                </button>
                            </div>
                        )}

                        {/* Details Tab */}
                        {activeTab === "details" && (
                            <div className="text-white max-xs:px-3 xs:px-6 sm2:px-8 md2:px-11 2xl:px-[72px]! max-md:pb-9">
                                <h3 className="md:text-lg xl:text-xl">More info</h3>
                                <div>
                                    <div className="mt-3 md2:mt-6 2xl:mt-9 text-[18px] sm:text-2xl md2:text-[28px] xl:text-[32px] font-700 text-white">Content advisory</div>
                                    <div className="mt-2 md2:mt-3 2xl:mt-4 font-400 md:text-lg xl:text-xl text-[#aaaaaa]">
                                        {movieData?.m_reason}
                                    </div>
                                </div>
                                <div>
                                    <div className="mt-3 md2:mt-6 2xl:mt-9 text-[18px] sm:text-2xl md2:text-[28px] xl:text-[32px] font-700 text-white">Age Rating</div>
                                    <div className="mt-2 md2:mt-3 2xl:mt-4 font-400 md:text-lg xl:text-xl text-[#aaaaaa]">
                                        {movieData?.m_desc}
                                    </div>
                                </div>
                                <div>
                                    <div className="mt-3 md2:mt-6 2xl:mt-9 text-[18px] sm:text-2xl md2:text-[28px] xl:text-[32px] font-700 text-white">Audio languages</div>
                                    <div className="mt-2 md2:mt-3 2xl:mt-4 font-400 md:text-lg xl:text-xl text-[#aaaaaa]">{movieData?.lang?.map((lang) => lang.l).join(", ")}</div>
                                </div>
                                <div>
                                    <div className="mt-3 md2:mt-6 2xl:mt-9 text-[18px] sm:text-2xl md2:text-[28px] xl:text-[32px] font-700 text-white">Directors</div>
                                    <a className="mt-2 md2:mt-3 2xl:mt-4 font-400 md:text-lg xl:text-xl text-[#aaaaaa]">{movieData?.director}</a>
                                </div>
                                <div>
                                    <div className="mt-3 md2:mt-6 2xl:mt-9 text-[18px] sm:text-2xl md2:text-[28px] xl:text-[32px] font-700 text-white">Cast</div>
                                    <div className="mt-2 md2:mt-3 2xl:mt-4 font-400">
                                        <span className="md:text-lg xl:text-xl text-[#aaaaaa]">
                                            <span>{movieData?.cast}</span>
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="mt-3 md2:mt-6 2xl:mt-9 text-[18px] sm:text-2xl md2:text-[28px] xl:text-[32px] font-700 text-white">Producers</div>
                                    <div className="mt-2 md2:mt-3 2xl:mt-4 font-400">
                                        <span className="md:text-lg xl:text-xl text-[#aaaaaa]">
                                            <span>{movieData?.producers}</span>
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="mt-3 md2:mt-6 2xl:mt-9 text-[18px] sm:text-2xl md2:text-[28px] xl:text-[32px] font-700 text-white">Studio</div>
                                    <div className="mt-2 md2:mt-3 2xl:mt-4 font-400 md:text-lg xl:text-xl text-[#aaaaaa]">{movieData?.studio}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
