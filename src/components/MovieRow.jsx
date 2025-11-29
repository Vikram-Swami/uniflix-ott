import { useRef, useState } from "react";
import MovieCard from "./MovieCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Virtual, Navigation, FreeMode } from "swiper/modules";
import {
  ArrowIcon,
  EightIcon,
  FiveIcon,
  FourIcon,
  NineIcon,
  OneIcon,
  SevenIcon,
  SixIcon,
  TenIcon,
  ThreeIcon,
  TwoIcon,
} from "../assets/icons";

const MovieRow = ({ title, movieIds }) => {
  const [reachStart, setReachStart] = useState(true);
  const [reachEnd, setReachEnd] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  if (!movieIds || movieIds.length === 0) return null;

  const ids = movieIds.split(",").filter((id) => id.trim());
  const OneToTenicons = [
    OneIcon,
    TwoIcon,
    ThreeIcon,
    FourIcon,
    FiveIcon,
    SixIcon,
    SevenIcon,
    EightIcon,
    NineIcon,
    TenIcon,
  ];

  return (
    <div className="mt-6 md2:mt-9 2xl:mt-12 max-xs:ps-3 xs:ps-6 sm2:ps-8 md2:ps-11 2xl:ps-[72px]! xs:pe-6">
      <h2 className="text-[16px] 6xl:text-sky-500 sm:text-lg xl:text-xl font-semibold mb-2 sm:mb-[11px] 2xl:mb-4 relative -z-10">
        {title}
      </h2>
      <div className="relative cards_slider">
        {/* Left Arrow */}
        <button
          onClick={() => setReachEnd(false)}
          ref={prevRef}
          className={`arrow absolute max-sm2:hidden group -left-8 md2:-left-11 2xl:-left-[72px] top-1/2 -translate-y-1/2 
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
          navigation={false}
          onSwiper={(swiper) => {
            setTimeout(() => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            });
          }}
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
          {ids.map((id, i) => (
            <SwiperSlide
              className={`${hoveredIndex === i ? "z-500 relative hide_number" : "z-10"}`}
              key={id.trim() + i}
              virtualIndex={i}>
              <MovieCard
                id={id.trim()}
                index={i}
                ids={ids}
                activeIndex={activeIndex}
                isHovering={isHovering}
                setIsHovering={setIsHovering}
                onHoverStart={(idx) => setHoveredIndex(idx)}
                onHoverEnd={() => setHoveredIndex(null)}
                buttonName="Watch Now"
                hoveredIndex={hoveredIndex}
                reachEnd={reachEnd}
                Icons={
                  title === "Top 10 Movies in Prime" || title === "Top 10 Series in Prime"
                    ? OneToTenicons
                    : []
                }
              />
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Right Arrow */}
        <button
          ref={nextRef}
          className={`arrow group max-sm2:hidden absolute -right-6 top-1/2 -translate-y-1/2 
        rounded-l-md w-10 2xl:w-14 5xl:w-14 h-[calc(100%+2px)] bg-black/60 hidden items-center z-20 justify-center
        transition-opacity duration-200 cursor-pointer
        ${reachEnd ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <span className="scale-120 group-hover:scale-150 transition-all duration-300">
            <ArrowIcon />
          </span>
        </button>
      </div>
    </div>
  );
};

export default MovieRow;
