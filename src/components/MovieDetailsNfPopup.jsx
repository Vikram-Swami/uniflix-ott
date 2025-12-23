import { useState, useEffect, useRef } from "react";
import { getImageUrl, getImageUrl2, getMovieDetails, getMovieDetails2, nextEpisode2 } from "../services/api";
import { useWatchlist } from "../hooks/useWatchlist";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronDown, Play, Plus, Share2, ThumbsUp, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import MovieCard from "./MovieCard";
import { Navigation, FreeMode } from "swiper/modules";
import { usePlaylist } from "./usePlaylist";
import { loadRecp } from "../utils/recentPlays";
import { ArrowIcon } from "../assets/icons";
import Cookies from "js-cookie";
import LazyImage from "./LazyImage";
import { toast } from "react-toastify";

// Continue Watching
export default function MovieDetailsNfPopup({ setMovieDetailsPopupScroll, setMovieData, movieData }) {
    const [activeTab, setActiveTab] = useState("");
    const [loading, setLoading] = useState(true);
    const [episodesLoading, setEpisodesLoading] = useState(false);
    const [seasonLoading, setSeasonLoading] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [allCard, setAllCard] = useState(false)
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
    const popupref = useRef(null);
    const navigate = useNavigate();
    const { addToWatchlist, removeFromWatchlist, isInWatchlist, } = useWatchlist();
    const { fetchPlaylist2, setHolePageLoading } = usePlaylist();
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    };
    const { pathname } = useLocation()
    const query = useQuery();
    const movieId = query.get("movieId");
    useEffect(() => {
        if (movieData) {
            let language = Cookies.get("lg") || movieData?.lang?.find((item) => item?.s === movieData?.d_lang)?.l
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
                    const data = await getMovieDetails2(movieId);
                    setAllCard(false)
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
            // if (popupref.current && !popupref.current.contains(event.target)) {
            //     navigate(pathname)
            // }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleShowMore = async () => {
        try {
            setEpisodesLoading(true);
            const data = await nextEpisode2(movieData?.nextPageSeason, movieId, page + 1);
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
                    setMovieData((prev) => ({ ...prev, episodes: data?.episodes, nextPageShow: data?.nextPageShow }));
                } else {
                    const data = await nextEpisode2(seasonId, movieId, 1);
                    setMovieData((prev) => ({ ...prev, episodes: data?.episodes, nextPageShow: data?.nextPageShow }));
                    setSeasonData((prev) => [...prev, { id: seasonId, episodes: data?.episodes, nextPageShow: data?.nextPageShow }]);
                }
            }
        } catch (error) {
            console.error("Error loading episodes:", error);
        } finally {
            setHolePageLoading(false);
            setSeasonLoading(false);
        }
    }


    const langRefs = useRef([]);

    useEffect(() => {
        const el = langRefs.current[selectedLang];
        const container = el?.parentElement;

        if (!el || !container) return;

        const elCenter =
            el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;

        container.scrollTo({
            left: elCenter,
            behavior: "smooth",
        });
    }, [selectedLang]);


    const bannerImage = `https://imgcdn.kim/poster/h/${movieId}.jpg`;
    const title = movieData?.title || "Unknown Title";
    const description = movieData?.desc || "";
    const episodes = movieData?.episodes || [];
    const seasons = movieData?.season || [];

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
    const resumeText = recentEntry && recentEntry?.episodeId ? 'Resume' : 'Play';
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
        <div className="fixed inset-0 z-5000000 bg-black/50 backdrop-blur-sm flex justify-center pt-8 overflow-y-auto movie_details_popup_scroll h-screen overflow-x-hidden">
            {/* Hero Banner Section */}
            <div ref={popupref} className="w-[877px] bg-[#181818] rounded-t-lg">
                <section className="relative min-h-[497px]! w-full bg-[#181818] rounded-t-lg overflow-x-hidden">
                    <button onClick={() => navigate(pathname)} className="absolute top-3 right-3 z-100 bg-[#181818] border border-white/30 cursor-pointer hover:border-white transition-all duration-150 rounded-full p-1"><X className="w-6 h-6" /></button>
                    <div className="relative overflow-hidden z-10 flex min-h-[497px]! w-full items-end px-11 pb-11 text-white max-md:flex-col">
                        {/* Background Image */}
                        <div className="relative md:absolute left-0 top-0 z-0 h-full w-full">
                            <div className="w-full h-10 xs:h-64 hero_bg_leaner3 absolute -bottom-px left-0 z-10"></div>
                            <div className="group relative transition-all duration-500 ease-in-out opacity-100 h-full w-full">
                                <LazyImage priority={true} src={bannerImage} alt={title} className={"transition-all duration-700 ease-in-out opacity-100 h-full w-full object-cover object-top-right aspect-video"} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex max-w-full md2:max-w-[80%] lg:max-w-[60%]  xl:max-w-1/2! flex-col pt-3 xs:pt-5 md:pt-20">
                            <div className="flex gap-4">
                                <div>
                                    <button onClick={() => fetchPlaylist2(recentEntry && recentEntry?.episodeId ? recentEntry?.episodeId : episodes[0] !== null ? episodes[0]?.id : movieId, title)} className="h-11 flex items-center justify-center rounded-sm bg-white hover:bg-white/80 text-black px-8 text-center transition-all duration-300 ease-in-out font-medium hover:text-black cursor-pointer text-xl relative overflow-hidden">
                                        <svg
                                            stroke="currentColor"
                                            fill="currentColor"
                                            strokeWidth="0"
                                            viewBox="0 0 512 512"
                                            className="w-12 h-11 pe-2">
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
                                <div className="group relative cursor-pointer text-center flex items-center gap-3">
                                    <button title="Share" className="min-w-11 h-11 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out border-2 border-white/40 hover:border-white text-white rounded-full bg-[#2a2a2a99]"><Share2 className="w-5 h-5" /></button>
                                    <button title="Like" className="min-w-11 h-11 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out border-2 border-white/40 hover:border-white text-white rounded-full bg-[#2a2a2a99]"><ThumbsUp className="w-6 h-6" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="px-11 flex justify-between">
                    <div className="w-[70%] pe-10">
                        <div className="flex items-center gap-3">
                            <span className="text-[#bcbcbc]">{movieData?.year || ""}</span>
                            <span className="text-[#bcbcbc]">{movieData?.runtime || "Series"}</span>
                            <span className="px-1.5 h-4 flex font-semibold items-center border border-white/50 text-[#bcbcbc] text-[11.2px]">
                                {movieData?.hdsd || "HD"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm mt-1">
                            <span className="px-1.5 h-5 flex items-center border border-white/50 text-white text-sm pt-0.5">
                                {movieData?.ua || "U/A"}
                            </span>
                            <span className="text-white">{movieData?.m_reason || ""}</span>
                        </div>
                        <p className="mt-4 text-2xl font-medium line-clamp-1">{title}</p>
                        <p className="mt-4 line-clamp-3">{description}</p>
                    </div>
                    <div className="w-[30%]">
                        <p className="line-clamp-2 text-sm"><span className="text-[#777777] font-medium">Cast:</span> {movieData.cast}</p>
                        <p className="line-clamp-2 text-sm my-2"><span className="text-[#777777] font-medium">Genres:</span> {movieData.genre}</p>
                        <p className="line-clamp-2 text-sm"><span className="text-[#777777] font-medium">This show is:</span> {movieData.thismovieis}</p>
                    </div>
                </div>
                {movieData?.lang && <div className="px-11 bg-[#181818] mt-6 ">
                    <div className="w-full overflow-x-auto flex gap-2 xs:gap-4 pb-2 lang_slider2 h-12">
                        {movieData?.lang.map((item, i) => {
                            return (
                                <button ref={(el) => (langRefs.current[item.l] = el)} key={i} onClick={() => languageHandle(item)} type="button" className={`text-xs xs:text-sm lg:text-base px-2 text-white/60 rounded-sm cursor-pointer whitespace-nowrap  hover:text-white! transition-all duration-200 text-shadow-2xs ${selectedLang === item.l || movieData?.lang?.length === 1 ? "text-white! bg-red-700 lang mb-1" : ""}`}>{item.l}</button>
                            )
                        })}
                    </div>
                </div>}
                {/* Tabs Section */}
                <section className="w-full pb-10 bg-[#181818] px-11">
                    {Array.isArray(episodes) && episodes[0] !== null && (
                        <div className="pt-10" >
                            {seasons?.length > 0 && (
                                <div className="flex justify-between items-center pb-3 border-b border-white/15">
                                    <p className="text-2xl">Episodes</p>
                                    <div className="relative" ref={dropdownRef}>
                                        <button onClick={() => setIsOpen((prev) => !prev)} className="text-sm md:text-base 2xl:text-lg font-medium text-white outline-0! flex items-center cursor-pointer bg-[#242424] border border-[#4d4d4d] h-9 md:h-10 2xl:h-12 w-[120px] md:w-[130px] rounded justify-center gap-2">
                                            {selectedSeason ? selectedSeason : "Season " + movieData?.season?.length} <ChevronDown />
                                        </button>
                                        {isOpen && (
                                            <div className="flex flex-col items-start absolute z-50 bg-gray-dark mt-1.5 rounded overflow-hidden right-0 w-[190px] md:w-[215px] bg-[#242424] border border-[#4d4d4d]">
                                                {movieData?.season?.map((season, i) => {
                                                    return (
                                                        <button key={season?.id} onClick={() => {
                                                            setSelectedSeason("Season " + season?.s)
                                                            setIsOpen(false)
                                                            handleChangeSeason(season?.id)
                                                        }} className={`text-xs md:text-sm 2xl:text-base font-medium outline-0! flex items-center cursor-pointer just ify-center whitespace-nowrap w-full px-3 py-2 border-t border-[#4d4d4d] first:border-t-0 ${selectedSeason === "Season " + season?.s
                                                            ? "bg-white text-black"
                                                            : selectedSeason === null && i === seasons?.length - 1
                                                                ? "bg-white text-black"
                                                                : "text-white hover:bg-[#4d4d4d]"
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
                            <div className="flex flex-col mx-auto">
                                {seasonLoading ?
                                    <div className="flex justify-center items-center h-[200px]">
                                        <div className="w-10 md:w-14 h-10 md:h-14 border-5 border-t-black border-white rounded-full animate-spin"></div>
                                    </div>
                                    : episodes?.map((episode, index) => {
                                        const progressPct2 = allrecentEntry && allrecentEntry.length > 0 ? Math.min(100, (allrecentEntry.find(e => String(e.episodeId) === String(episode?.id))?.currentTime / allrecentEntry.find(e => String(e.episodeId) === String(episode?.id))?.duration) * 100) : 0;
                                        return (
                                            <div key={episode?.id || index} className={`cursor-pointer group relative z-10 border-b border-white/15 ${!movieData?.nextPageShow && seasonLoading ? "last:mb-10" : ""}`}>
                                                <div onClick={() => fetchPlaylist2(episode?.id, title)} className="flex gap-5 group relative py-5 items-center">
                                                    <span className="max-sm:hidden opacity-0 group-hover:opacity-100 absolute bg-red-500/10 left-0 right-0 bottom-0 top-0 -z-1 transition-all duration-300 ease-in-out"></span>
                                                    <div className="flex items-center">
                                                        <div className="min-w-[70px] pe-5 flex justify-end">
                                                            <p className="text-2xl">{episode?.ep}</p>
                                                        </div>
                                                        <div className="min-w-40 max-w-40">
                                                            <div className="cursor-pointer aspect-video flex-[0_0_300px] overflow-hidden rounded bg-gray-800 shadow-2xl transition-all ease-in-out lg:flex-[0_0_230px] relative">
                                                                <div className="relative transition-all duration-500 ease-in-out w-full h-full">
                                                                    <img
                                                                        src={
                                                                            getImageUrl2(episode?.id, "341") ||
                                                                            "https://picsum.photos/220/330 "
                                                                        }
                                                                        alt={episode?.title}
                                                                        loading="lazy"
                                                                        className="transition-all duration-700 ease-in-out opacity-100 h-full w-full object-cover object-right"
                                                                        onError={(e) => {
                                                                            e.target.src = getImageUrl2(episode?.id, "341");
                                                                        }}
                                                                    />
                                                                    <button className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full border border-white w-10 h-10 flex items-center justify-center bg-black/30 scale-0 group-hover:scale-100 transition-all duration-300 ease-in-out cursor-pointer" type="button"><Play className="fill-white" /></button>
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
                                                    </div>
                                                    <div className="text-white relative grow pe-16">
                                                        <div className="flex items-center justify-between">
                                                            <p className="pb-1 font-medium">
                                                                {episode?.t}
                                                            </p>
                                                            <p className="pb-1 font-medium text-white/80">
                                                                {episode?.time}
                                                            </p>
                                                        </div>
                                                        {episode?.ep_desc && (
                                                            <p className="text-[#aaa] text-sm line-clamp-3">
                                                                {episode?.ep_desc}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            {movieData?.nextPageShow && !seasonLoading ? <div className={`relative z-10 flex justify-center -translate-y-5`}>
                                <div className="w-full h-[70px] hero_bg_leaner3 absolute -bottom-px left-0 z-10"></div>
                                <div className="border border-white/15 absolute top-1/2 left-1/2 -translate-1/2 w-full z-10" />
                                <button onClick={handleShowMore} className={`rounded-full border-2 hover:border-white border-white/50 w-10 h-10 flex items-center justify-center bg-[#2f2f2f]/80 relative z-10 cursor-pointer ${allCard ? "rotate-180" : ""}`} type="button">{episodesLoading ? <div className="w-5 xs:w-7 md:w-9 h-5 xs:h-7 md:h-9 border-4 border-t-black border-white rounded-full animate-spin"></div> : <ChevronDown />}</button>
                            </div> : <div className="pt-6" />}
                        </div>
                    )}

                    <div className="mt-7">
                        <h2 className="mb-5 text-2xl">More Like This</h2>
                        <div className={`grid grid-cols-3 gap-4 ${allCard ? "" : "h-[720px] overflow-y-hidden"}`}>
                            {movieData?.suggest && movieData?.suggest.map((item, ind) => {
                                return (
                                    <Link key={ind} className="bg-[#2f2f2f] rounded overflow-hidden h-[330px] cursor-pointer group">
                                        <div className="relative more_cards">
                                            <img src={getImageUrl2(item?.id, "341")} alt={"title" + ind} />
                                            <button className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full border border-white w-10 h-10 flex items-center justify-center bg-black/30 scale-0 group-hover:scale-100 transition-all duration-300 ease-in-out cursor-pointer" type="button"><Play className="fill-white" /></button>
                                            <span className="absolute top-1 right-3 z-10">{item.t}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4">
                                            <div className="flex gap-3 items-center">
                                                <span className="text-[#bcbcbc] text-lg">{item?.y || ""}</span>
                                                <span className="px-1.5 h-4 flex font-semibold items-center border border-white/50 text-[#bcbcbc] text-[11.2px]">
                                                    HD
                                                </span>
                                                <span className="px-1.5 h-5 leading-0 flex items-center border text-[15px] border-white/50 text-white pt-0.5">
                                                    {item?.ua || "U/A"}
                                                </span>
                                            </div>
                                            <button title="Like" className="w-9 h-9 flex items-center justify-center cursor-pointer transition-all duration-100 ease-in-out bg-transparent border-2 border-white/40 hover:border-white text-white rounded-full"><Plus className="w-6 h-6" /></button>
                                        </div>
                                        <p className="px-3.5 pb-5 text-[#dcdcdc] text-sm line-clamp-5">{item?.d}</p>
                                    </Link>
                                )
                            })}
                        </div>
                        <div className={`relative flex justify-center ${allCard ? "mt-10" : "-translate-y-5"}`}>
                            <div className="w-full h-[70px] hero_bg_leaner3 absolute -bottom-px left-0 z-10"></div>
                            <div className="border border-white/15 absolute top-1/2 left-1/2 -translate-1/2 w-full z-10" />
                            <button onClick={() => setAllCard(!allCard)} className={`rounded-full border-2 hover:border-white border-white/50 w-10 h-10 flex items-center justify-center bg-[#2f2f2f]/80 relative z-10 cursor-pointer ${allCard ? "rotate-180" : ""}`} type="button"><ChevronDown className="" /></button>
                        </div>
                    </div>

                    <div className={`text-sm flex flex-col gap-[7px] ${allCard ? "mt-10" : "mt-5"}`}>
                        <p className="mb-3 text-2xl font-medium line-clamp-1">{title}</p>
                        {movieData?.creator ? <p><span className="text-[#777777] font-medium">Creators:</span> {movieData?.creator}</p> : ""}
                        {movieData?.cast ? <p><span className="text-[#777777] font-medium">Cast:</span> {movieData?.cast}</p> : ""}
                        {movieData?.genre ? <p><span className="text-[#777777] font-medium">Genres:</span> {movieData?.genre}</p> : ""}
                        {movieData?.thismovieis ? <p><span className="text-[#777777] font-medium">This show is:</span> {movieData?.thismovieis}</p> : ""}
                        {movieData?.ua ? <div className=" flex gap-1"><span className="text-[#777777] font-medium">Maturity Rating:</span>
                            <div>
                                <p>
                                    <span className="px-1.5 h-5 me-3.5 border border-white/50 text-white pt-0.5">
                                        {movieData?.ua || "U/A"}
                                    </span>
                                    {movieData?.m_reason}
                                </p>
                                <p className="ms-4 pt-0.5">{movieData?.m_desc}</p>
                            </div>
                        </div> : ""}
                    </div>
                </section>
            </div>
        </div>
    );
}
