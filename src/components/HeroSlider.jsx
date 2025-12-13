import { Check, Plus } from "lucide-react";
import { useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { useWatchlist } from "../hooks/useWatchlist";
import { ArrowIcon } from "../assets/icons";

const HeroSlider = ({ slides }) => {
  const navigate = useNavigate()
  const sliderRef = useRef(null)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()

  const settings = {
    dots: true,
    fade: true,
    arrows: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    waitForAnimate: false,
    // autoplay: true,
    pauseOnHover: false,
    autoplaySpeed: 5000,
  };

  return (
    <div className="slider-container relative pt-[60px] md:pt-[70px] cards_slider2">
      <button onClick={() => sliderRef.current?.slickPrev()} className="max-md:hidden absolute top-1/2 -translate-y-1/2 z-10 rotate-180 cursor-pointer arrow opacity-0 transition-all duration-300">
        <ArrowIcon className="w-[50px] h-[35px]" />
      </button>
      <Slider className="mx-2 xs:mx-6 md2:mx-[51px]!" ref={sliderRef} {...settings}>
        {slides.map((item, i) => {
          return (
            <div key={i} className="h-[26vh] xs:h-[calc(Max(100vw,0px)*4/8)] xl:h-[calc(Max(100vw,0px)*3/8)]">
              <div className="absolute bottom-0 right-0 text-white max-sm:hidden text-sm md:text-[16px] mx-10 md:mx-20 mb-15 md:mb-20 bg-white/30 px-3 py-0.5 rounded-md z-10">{item.ua}</div>
              <div className="absolute bottom-0 max-xs:px-3 xs:px-6 sm2:px-8 md2:px-11 pb-10 lg:pb-15 max-xs:w-full">
                <div className="relative z-10 flex max-xs:justify-center xs:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] 2xl:max-w-[700px]! flex-col gap-4">
                  <Link to={`?movieId=${item.id}`}>
                    <img className={`max-sm:mx-auto ${item.m === "f1" ? "w-[180px] xs:w-[230px] sm:w-[260px] lg:w-[350px] 2xl:w-[550px]!" : item.m === "reacher" ? "w-[180px] xs:w-[230px] sm:w-[260px] lg:w-[350px] 2xl:w-[550px]!" : item.m === "minecraft" ? "w-[210px] xs:w-[260px] sm:w-[290px] lg:w-[390px] 2xl:w-[550px]!" : item.m === "sonic" ? "w-[210px] xs:w-[290px] sm:w-[260px] lg:w-[390px] 2xl:w-[550px]!" : item.m === "ghost" ? "w-[180px] xs:w-[230px] sm:w-[260px] lg:w-[350px] 2xl:w-[510px]!" : item.m === "diesel" ? "w-[180px] xs:w-[230px] sm:w-[260px] lg:w-[350px] 2xl:w-[510px]!" : item.m === "mission" ? "w-[180px] xs:w-[230px] sm:w-[260px] lg:w-[350px] 2xl:w-[510px]!" : item.m === "smu" ? "w-[180px] xs:w-[230px] sm:w-[260px] lg:w-[350px] 2xl:w-[510px]!" : item.m === "family" ? "w-[170px] xs:w-[230px] sm:w-[260px] lg:w-[350px] 2xl:w-[410px]!" : item.m === "genv" ? "w-[90px] h-[100px] sm:w-[120px] sm:h-[130px] md2:w-[170px] md2:h-[190px] 2xl:w-[260px]! 2xl:h-[280px]!" : item.m === "toomuch" ? "w-[180px] xs:w-[230px] sm:w-[260px] lg:w-[350px] 2xl:w-[460px]!" : item.m === "fourmore" ? "w-[130px] xs:w-[190px] sm:w-[200px] lg:w-[290px] 2xl:w-[380px]!" : item.m === "malice" ? "w-[180px] xs:w-[230px] sm:w-[260px] lg:w-[350px] 2xl:w-[510px]!" : ""}`} src={item.namelogo} />
                  </Link>
                  <p className="line_clamp_2  max-md:hidden! max-lg:text-sm">{item.desc}</p>
                  <div className="flex gap-4 items-center max-xs:justify-center max-sm2:hidden">
                    <Link to={`?movieId=${item.id}`} className="h-11 lg:h-14 flex items-center justify-center w-[150px] lg:w-[180px] rounded-lg bg-white px-3 font-medium lg:text-[18px] cursor-pointer text-center transition-all duration-300 ease-in-out hover:bg-white/90 text-black">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-8 lg:w-10 h-8 lg:h-10 pe-2" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440z"></path>
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
                        className="h-11 lg:h-14 flex items-center justify-center w-11 lg:w-14 rounded-full bg-white/30 cursor-pointer text-center transition-all duration-300 sm:hover:text-black ease-in-out sm:hover:bg-white">
                        {isInWatchlist(item.id) ? <Check className="w-5 lg:w-7 h-5 lg:h-7" /> : <Plus className="w-5 lg:w-7 h-5 lg:h-7" />}
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
              <div className="relative w-full h-full">
                <div
                  className="absolute inset-0 rounded-xl shadow-2xl  mask_bottom2"
                  style={{
                    background: 'rgb(224 211 211)'
                  }}
                />
                <div
                  onClick={() => {
                    if (window.innerWidth < 680) {
                      navigate(`?movieId=${item.id}`)
                    }
                  }}
                  className="rounded-xl max-sm2:cursor-pointer w-full h-full bg-cover bg-right movie_poster relative border border-[#282931] mask_bottom"
                  style={{
                    backgroundImage: `url(${item.img})`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </Slider>
      <button onClick={() => sliderRef.current?.slickNext()} className="max-md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer arrow opacity-0 transition-all duration-300">
        <ArrowIcon className="w-[50px] h-[35px]" />
      </button>
    </div>
  );
};

export default HeroSlider;