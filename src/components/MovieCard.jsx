import React, { useState, useRef, useEffect } from 'react';
import { getImageUrl, fetchMovieInfo } from '../services/api';
import { Check, Plus, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWatchlist } from "../hooks/useWatchlist";
import LazyImage from "./LazyImage";

const MovieCard = ({ id, index, ids, isHovering, setIsHovering, activeIndex, onHoverStart, onHoverEnd, hoveredIndex, Icons, buttonName, item, handleDelete, className, handleWatchlist, item2, ct, du }) => {
    const [hoverInfo, setHoverInfo] = useState(null);
    const [hoverInfoList, setHoverInfoList] = useState([]);
    const { addToWatchlist, removeFromWatchlist, isInWatchlist, isTouchDevice } = useWatchlist();
    const timeoutRef = useRef(null);
    const cardRef = useRef(null);
    const navigate = useNavigate();
    const OnetoTenIcons = Icons?.length > 0 ? Icons[index] : false
    const handleMouseEnter = () => {
        onHoverStart(index);
        setIsHovering(true);
        if (!isTouchDevice) {
            timeoutRef.current = setTimeout(async () => {
                if (hoverInfoList.some(info => info.id === id)) {
                    const existingInfo = hoverInfoList.find(info => info.id === id);
                    setHoverInfo(existingInfo);
                } else {
                    try {
                        const info = await fetchMovieInfo(id);
                        if (!hoverInfo) {
                            setHoverInfo(info);
                            setHoverInfoList([{ ...info, id: id }]);
                        } else {
                            setHoverInfoList([...hoverInfoList, { ...info, id: id }])
                        }
                    } catch (error) {
                        console.error('Error fetching movie info:', error);
                    }
                }
            }, 800);
        }
    };

    const handleMouseLeave = () => {
        onHoverEnd();
        setIsHovering(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const formatTime = (sec) => {
        if (!sec && sec !== 0) return "00:00";

        sec = Math.floor(sec);

        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;

        if (h === 0) {
            return `${String(m)}min`;
        }

        return `${String(h)}h  ${String(m)}min`;
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={cardRef}
            className={`relative flex items-center me-2.5 5xl:me-6 ${className ? className : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
            <div className={`relative [box-shadow:0px_20px_20px_0px_#000000b5] w-full aspect-auto rounded-2xl transition-transform duration-300  ${isHovering && index === hoveredIndex && !isTouchDevice ? "movie_details" : ""} ${index === activeIndex ? "origin-left" : index === (ids?.length - 1) ? "origin-right" : "origin-center"}`}>
                {(item || item2) && <button onClick={() => {
                    if (item) {
                        handleDelete()
                    } else {
                        handleWatchlist(id)
                    }
                }} className={`absolute top-[3px] sm:top-2 right-[3px] sm:right-2 transition-all duration-200 cursor-pointer z-10 ${isHovering && index === hoveredIndex ? "opacity-100" : "sm:opacity-0"}`} type="button"><X className="w-[23px] sm:w-7 h-[23px] sm:h-7 filter-[drop-shadow(0px_0px_10px_black)]" /></button>}
                <Link to={`/home?movieId=${id}`} className={`${OnetoTenIcons ? "" : "overflow-hidden"} relative block rounded-sm xs:rounded-lg`}>
                    {OnetoTenIcons ? <span className={`absolute bottom-0 ${isHovering && index === hoveredIndex ? "number" : "number2"}`}><OnetoTenIcons className="w-8 h-8 xs:w-10 md:w-13 md2:w-15 xs:h-10 md:h-13 md2:h-15" /></span> : ""}
                    <LazyImage src={getImageUrl(id) || "https://picsum.photos/220/330"} alt="Movie poster" className="w-full h-full object-cover rounded-sm xs:rounded-lg" />
                    {item && (
                        <p className="bg-gray-800 text-white text-[10px] sm:text-xs py-0.5 px-1 rounded-sm absolute bottom-2 sm:bottom-3 right-2">
                            {`${formatTime((du || 0) - (ct || 0))} Left`}

                        </p>
                    )}
                    {item && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-full">
                        <div
                            className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                            style={{
                                width: du ? `${Math.min(100, (ct / item.duration) * 100)}%` : '0%',
                            }}
                        />
                    </div>}
                </Link>
                <div className="movie_details_box px-2.5 py-2 md:py-4 bg-[#131212] w-full absolute rounded-b-lg cursor-auto [box-shadow:0px_35px_20px_-10px_#000000b5]">
                    {!hoverInfo ? <>
                        <div className="h-5 md:h-7 bg-gray-300/20 rounded-full mb-3 shimmer" />
                        <div className="flex gap-2 items-center">
                            <button onClick={() => navigate(`/home?movieId=${id}`)} className="h-7 md:h-8 flex items-center justify-center rounded-sm md:rounded-md bg-background px-2 sm:px-3 font-medium text-[12px] sm:text-[13px] cursor-pointer text-center transition-all duration-300 ease-in-out bg-[#cbd6f7] hover:bg-white text-black w-full">
                                <svg fill="black" strokeWidth="0" viewBox="0 0 512 512" className="w-6 h-6 pe-2" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440z"></path>
                                </svg>{buttonName}
                            </button>
                            <button title="Watchlist" onClick={() => {
                                if (isInWatchlist(id)) {
                                    removeFromWatchlist(id);
                                } else {
                                    addToWatchlist(id);
                                    console.log("added to watchlist", id)
                                }
                                if (handleWatchlist) {
                                    handleWatchlist(id)
                                }
                            }} className="h-7 md:h-8 flex items-center justify-center min-w-7 md:min-w-8 rounded-sm md:rounded-md  cursor-pointer text-center transition-all duration-300 ease-in-out bg-[#cbd6f7]/30 hover:bg-white hover_inner_black">{isInWatchlist(id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</button>
                        </div>
                        <div className="flex items-center gap-4 mb-2 md:mb-4 mt-2 md:mt-4">
                            <div className="bg-gray-300/20 rounded-full shimmer w-10 h-4 md:h-5"></div>
                            <div className="bg-gray-300/20 rounded-full shimmer w-10 h-4 md:h-5"></div>
                            <div className="bg-gray-300/20 rounded-full shimmer w-10 h-4 md:h-5"></div>

                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="bg-gray-300/20 rounded-full shimmer h-3 md:h-3 w-full"></div>
                            <div className="bg-gray-300/20 rounded-full shimmer h-3 md:h-3 w-full"></div>
                            <div className="bg-gray-300/20 rounded-full shimmer h-3 md:h-3 w-full"></div>
                        </div>
                    </> :
                        <>
                            <h3 className="text-white font-semibold mb-2 md:mb-3 max-md:text-sm">
                                {hoverInfo?.title}
                            </h3>
                            <div className="flex gap-2 items-center">
                                <button onClick={() => navigate(`/home?movieId=${id}`)} className="h-7 md:h-8 flex items-center justify-center rounded-sm md:rounded-md bg-background px-2 sm:px-3 font-medium text-[12px] sm:text-[13px] cursor-pointer text-center transition-all duration-300 ease-in-out bg-[#cbd6f7] hover:bg-white text-black w-full">
                                    <svg fill="black" strokeWidth="0" viewBox="0 0 512 512" className="w-6 h-6 pe-2" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440z"></path>
                                    </svg>{buttonName}
                                </button>
                                <button title="Watchlist" onClick={() => {
                                    if (isInWatchlist(id)) {
                                        removeFromWatchlist(id);
                                    } else {
                                        addToWatchlist(id);
                                        console.log("added to watchlist", id)
                                    }
                                    if (handleWatchlist) {
                                        handleWatchlist(id)
                                    }
                                }} className="h-7 md:h-8 flex items-center justify-center min-w-7 md:min-w-8 rounded-sm md:rounded-md  cursor-pointer text-center transition-all duration-300 ease-in-out bg-[#cbd6f7]/30 hover:bg-white hover_inner_black">{isInWatchlist(id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</button>
                            </div>
                            <div className="flex items-center gap-4 mb-2 md:mb-4 mt-2 md:mt-4">
                                <span className="text-gray-400 text-xs">{hoverInfo?.year || "N/A"}</span>
                                <span className="text-gray-400 text-xs">{hoverInfo?.runtime || "Series"}</span>
                                <span className="px-2 py-1 bg-gray-800 text-gray-300 text-[10px] rounded">
                                    {hoverInfo?.ua || "N/A"}
                                </span>
                            </div>
                            <p className="text-white/90 text-xs line-clamp-3 font-medium">
                                {hoverInfo?.desc}
                            </p>
                        </>}
                </div>
            </div>
        </div>
    );
};

export default React.memo(MovieCard);

