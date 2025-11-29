import { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Virtual, FreeMode } from 'swiper/modules';
import { getSwiperItems, removeRecent } from '../utils/recentPlays';
import MovieCard from "./MovieCard";
import { usePlaylist } from "./usePlaylist";
import { ArrowIcon } from "../assets/icons";

export default function RecentSwiper() {
    const [items, setItems] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [reachStart, setReachStart] = useState(true);
    const [reachEnd, setReachEnd] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const { playlist } = usePlaylist();
    useEffect(() => {
        setItems(getSwiperItems());
    }, [playlist]);

    const handleDelete = (item) => {
        try {
            removeRecent(item);
            setItems(getSwiperItems());
        } catch (e) {
            console.error('Delete error', e);
        }
    };

    if (items.length === 0) {
        return null;
    }


    return (
        <div className="mt-6 md2:mt-9 2xl:mt-12 max-xs:ps-3 xs:ps-6 sm2:ps-8 md2:ps-11 2xl:ps-[72px]! group">
            <h2 className="text-[16px] sm:text-lg xl:text-xl font-semibold pb-2 sm:pb-[11px] 2xl:mb-4 relative -z-10">
                Continue Watching
            </h2>
            <div className="relative cards_slider group-hover:z-50">
                <button
                    onClick={() => setReachEnd(false)}
                    ref={prevRef}
                    className={`arrow absolute max-sm2:hidden -left-8 md2:-left-11 2xl:-left-[72px] top-1/2 -translate-y-1/2 
                           rounded-r-lg w-10 2xl:w-12 h-[calc(100%+2px)] bg-black/60 z-20 hidden items-center justify-center
                           transition-opacity duration-500 cursor-pointer
                           ${reachStart || activeIndex === hoveredIndex
                            ? "opacity-0 pointer-events-none"
                            : "opacity-100"
                        }`}>
                    <span className="rotate-180 scale-120 transition-all duration-300">
                        <ArrowIcon className="" />
                    </span>
                </button>

                {/* Swiper Container */}
                <div className="sm:pe-6">
                    <Swiper
                        modules={[Navigation, Virtual, FreeMode]}
                        virtual
                        simulateTouch={false}
                        allowTouchMove={true}
                        freeMode={true}
                        speed={600}
                        onReachEnd={() => setReachEnd(true)}
                        onReachBeginning={() => setReachStart(true)}
                        onSlideChange={(swiper) => {
                            setActiveIndex(swiper.activeIndex);
                            setReachStart(swiper.isBeginning);
                            setReachEnd(swiper.isEnd);
                        }}
                        // navigation={false}
                        // onSwiper={(swiper) => {
                        //     setTimeout(() => {
                        //         swiper.params.navigation.prevEl = prevRef?.current;
                        //         swiper.params.navigation.nextEl = nextRef?.current;
                        //         swiper.navigation.init();
                        //         swiper.navigation.update();
                        //     }, 100);
                        // }}
                        breakpoints={{
                            0: {
                                slidesPerView: 2.1,
                            },
                            450: {
                                slidesPerView: 2.3,
                            },
                            480: {
                                slidesPerView: 2.5,
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
                        {items.map((item, i) => (
                            <SwiperSlide className={`${hoveredIndex === i ? "z-50 relative" : "z-10"}`} key={`${item._type}-${item.id || item.episodeId}-${i}`} virtualIndex={i}>
                                <MovieCard
                                    id={item?.id ? item.id : item?.poster}
                                    index={i}
                                    isHovering={isHovering}
                                    activeIndex={activeIndex}
                                    setIsHovering={setIsHovering}
                                    onHoverStart={(idx) => setHoveredIndex(idx)}
                                    onHoverEnd={() => setHoveredIndex(null)}
                                    buttonName="Resume"
                                    hoveredIndex={hoveredIndex}
                                    reachEnd={reachEnd}
                                    ids={items}
                                    item={item}
                                    handleDelete={() => handleDelete(item)}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Right Arrow */}
                <button
                    ref={nextRef}
                    className={`arrow max-sm2:hidden absolute right-0 top-1/2 -translate-y-1/2 
                    rounded-l-md w-10 2xl:w-14 5xl:w-14 h-[calc(100%+2px)] bg-black/60 hidden items-center z-20             justify-center
                    transition-opacity duration-200 cursor-pointer
                    ${reachEnd ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    <span className="scale-120 transition-all duration-300">
                        <ArrowIcon />
                    </span>
                </button>
            </div>
        </div>
    );
}
