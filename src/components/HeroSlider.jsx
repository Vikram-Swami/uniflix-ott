import { Check, ChevronLeft, Plus } from "lucide-react";
import { useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { useWatchlist } from "../hooks/useWatchlist";

const HeroSlider = ({ slides }) => {
  const navigate = useNavigate()
  const sliderRef = useRef(null)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()

  const settings = {
    dots: true,
    fade: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    waitForAnimate: false,
    // autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <div className="slider-container relative">
      <button onClick={() => sliderRef.current?.slickPrev()} className="max-md:hidden absolute top-1/2 -translate-y-1/2 z-10 cursor-pointer"><ChevronLeft size={60} /></button>
      <Slider ref={sliderRef} {...settings}>
        {slides.map((item, i) => {
          return (
            <div key={i} className="h-[50vh] md:h-[85vh] relative">
              <div className="w-full h-50 hero_bg_leaner absolute -bottom-px"></div>
              <div className="w-[200px] h-full hero_bg_leaner_2 absolute left-0 bottom-0"></div>
              <div className="absolute bottom-0 right-0 text-white max-sm:hidden text-sm md:text-[16px] font-semibold mx-10 md:mx-20 mb-15 md:mb-20 bg-white/30 px-3 py-0.5 rounded-md">{item.ua}</div>
              <div className="absolute bottom-0 max-xs:px-3 xs:px-6 sm2:px-8 md2:px-11 2xl:px-[72px]! pb-10 md:pb-20 max-xs:w-full">
                <div className="relative z-10 flex max-xs:justify-center xs:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] 2xl:max-w-[700px]! flex-col gap-4">
                  <img className="max-xs:w-[70%] max-xs:mx-auto" src={item.namelogo} />
                  <p className="line_clamp_2  max-md:hidden!">{item.desc}</p>
                  <div className="flex gap-4 items-center max-xs:justify-center">
                    <Link to={`/home?movieId=${item.id}`} className="h-11 md:h-14 flex items-center justify-center w-[150px] md:w-[180px] rounded-lg bg-white/30 bg-background px-3 font-medium md:text-[18px] cursor-pointer text-center transition-all duration-300 ease-in-out hover:bg-white hover:text-black">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-8 md:w-10 h-8 md:h-10 pe-2" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440z"></path>
                      </svg>Watch Now
                    </Link>
                    <div className="group relative inline-block cursor-pointer text-center">
                      <button onClick={() => {
                        if (isInWatchlist(item.id)) {
                          removeFromWatchlist(item.id);
                        } else {
                          addToWatchlist(item.id);
                        }
                      }}
                        className="h-11 md:h-14 flex items-center justify-center w-11 md:w-14 rounded-full bg-white/30 cursor-pointer text-center transition-all duration-300 sm:hover:text-black ease-in-out sm:hover:bg-white">
                        {isInWatchlist(item.id) ? <Check className="w-5 md:w-7 h-5 md:h-7" /> : <Plus className="w-5 md:w-7 h-5 md:h-7" />}
                      </button>
                      <div className="pointer-events-none absolute left-1/2 -top-[calc(100%+20px)] z-100 -translate-x-1/2 rounded-xl bg-white px-3 py-2 text-center text-[#232323] opacity-0 transition-all ease-out group-hover:opacity-100 font-medium hidden sm:block">
                        <svg
                          className="absolute top-full left-1/2 h-2 w-full -translate-x-1/2 transform text-white"
                          viewBox="0 0 255 255">
                          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"></polygon>
                        </svg>
                        {"Watchlist"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <img onClick={() => navigate(`/home?movieId=${item.id}`)} className="w-full h-full object-cover object-top-right" src={item.img} alt="movie-poster" />
            </div>
          )
        })}
      </Slider>
      <button onClick={() => sliderRef.current?.slickNext()} className="max-md:hidden absolute right-0 rotate-180 top-1/2 -translate-y-1/2 z-10 cursor-pointer"><ChevronLeft size={60} /></button>
    </div>
  );
};

export default HeroSlider;