import React, { useState, useRef, useEffect } from 'react';
import { getImageUrl2, fetchMovieInfo2 } from '../services/api';
import { ChevronDown, Plus, ThumbsUp, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWatchlist } from "../hooks/useWatchlist";
import LazyImage from "./LazyImage";
import { toast } from "react-toastify";

const MovieCard2 = ({ id, index, ids, isHovering, setIsHovering, activeIndex, onHoverStart, onHoverEnd, hoveredIndex, Icons, item, handleDelete, className, handleWatchlist, item2, ct, du }) => {
    const [hoverInfo, setHoverInfo] = useState(null);
    const [hoverInfoList, setHoverInfoList] = useState([]);
    const { isTouchDevice } = useWatchlist();
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
                        const info = await fetchMovieInfo2(id);
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
            className={`relative flex items-center me-2 ${className ? className : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
            <div className={`relative [box-shadow:0px_20px_20px_0px_#000000b5] w-full aspect-auto rounded-2xl transition-transform duration-300  ${isHovering && index === hoveredIndex && !isTouchDevice ? "movie_details movie_details2" : ""} ${index === activeIndex ? "origin-left" : index === (ids?.length - 1) ? "origin-right" : "origin-center"}`}>
                {(item || item2) && <button onClick={() => {
                    if (item) {
                        handleDelete()
                    } else {
                        handleWatchlist(id)
                    }
                }} className={`absolute top-[3px] sm:top-2 right-[3px] sm:right-2 transition-all duration-200 cursor-pointer z-10 ${isHovering && index === hoveredIndex ? "opacity-100" : "sm:opacity-0"}`} type="button"><X className="w-[23px] sm:w-7 h-[23px] sm:h-7 filter-[drop-shadow(0px_0px_10px_black)]" /></button>}
                <Link to={`/home?movieId=${id}`} className={`${OnetoTenIcons ? "" : "overflow-hidden"} relative block rounded-sm`}>
                    {OnetoTenIcons ? <span className={`absolute bottom-0 ${isHovering && index === hoveredIndex ? "number" : "number2"}`}><OnetoTenIcons className="w-8 h-8 xs:w-10 md:w-13 md2:w-15 xs:h-10 md:h-13 md2:h-15" /></span> : ""}
                    <LazyImage src={getImageUrl2(id, isHovering ? "h" : "341") || "https://picsum.photos/220/330"} alt="Movie poster" className="w-full h-full object-cover rounded-sm" />
                    {item && (
                        <p className="bg-gray-800 text-white text-[10px] sm:text-xs py-0.5 px-1 rounded-sm absolute bottom-2 sm:bottom-3 right-2">
                            {`${formatTime((du || 0) - (ct || 0))} Left`}
                        </p>
                    )}
                    {item && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-full">
                        <div
                            className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                            style={{
                                width: du ? `${Math.min(100, (ct / du) * 100)}%` : '0%',
                            }}
                        />
                    </div>}
                </Link>
                <div className="movie_details_box px-2.5 py-3 bg-[#131212] w-full absolute rounded-b-lg cursor-auto [box-shadow:0px_35px_20px_-10px_#000000b5]">
                    <div className="flex gap-2 items-center">
                        <button title="Play" onClick={() => navigate(`/home?movieId=${id}`)} className="min-w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out bg-white hover:bg-white/80 text-black rounded-full ps-0.5">
                            <svg fill="black" strokeWidth="0" viewBox="0 0 512 512" className="min-w-5 h-5" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440z"></path>
                            </svg>
                        </button>
                        <button title="Watchlist" onClick={() => {
                            toast.info("Added to watchlist")
                        }} className="min-w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-100 ease-in-out bg-transparent border border-white/40 hover:border-white text-white rounded-full"><Plus className="w-5 h-5" /></button>
                        <button title="Like" className="min-w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-100 ease-in-out bg-transparent border border-white/40 hover:border-white text-white rounded-full"><ThumbsUp className="w-4 h-4" /></button>
                        <div className="w-full flex justify-end">
                            <button title="Like" className="w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-100 ease-in-out bg-transparent border border-white/40 hover:border-white text-white rounded-full"><ChevronDown className="w-5 h-5" /></button>
                        </div>
                    </div>
                    {hoverInfo ? <>
                        <div className="flex items-center gap-4 mb-2 mt-3">
                            <span className="text-green-400 text-[10px]">{hoverInfo?.match || "68% match"}</span>
                            <span className="px-2 border border-white/80 text-white text-[9px]">
                                {hoverInfo?.ua || "U/A"}
                            </span>
                            <span className="text-white text-[10px]">{hoverInfo?.runtime || "Series"}</span>
                            <span className="px-1 h-3 flex font-semibold items-center border border-white/50 text-[#bcbcbc] text-[8.2px]">
                                {hoverInfo?.hdsd || "HD"}
                            </span>
                        </div>
                        <div className="text-white text-[10px] truncate">
                            {hoverInfo?.genre?.split(",").join("\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0")}
                        </div>
                    </> :
                        <>
                            <div className="flex items-center gap-4 mb-2 mt-3">
                                <div className="w-[20%] rounded-md h-3 bg-gray-300/20 shimmer"></div>
                                <div className="w-[20%] rounded-md h-3 bg-gray-300/20 shimmer"></div>
                                <div className="w-[20%] rounded-md h-3 bg-gray-300/20 shimmer"></div>
                                <div className="w-5 h-4 rounded-md bg-gray-300/20 shimmer"></div>
                            </div>
                            <div className="text-white text-xs font-medium truncate">
                                <div className="w-full rounded-md h-3 bg-gray-300/20 shimmer"></div>
                            </div>
                        </>}
                </div>
            </div>
        </div >
    );
};

export default React.memo(MovieCard2);
