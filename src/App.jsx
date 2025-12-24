import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import SearchPopup from "./components/SearchPopup";
import MovieDetailsPopup from "./components/MovieDetailsPopup";
import VideoPlayerPopup from "./components/VideoPlayerPopup";
import { usePlaylist } from "./components/usePlaylist";
import { ToastContainer } from "react-toastify";
// import ProtectedRoute from "./authentication/ProtectedRoute";
import Cookies from "js-cookie"
import InstallPWA from "./components/InstallPWA";
import DevToolsProtection from "./protection/DevToolsProtection";
import Preloading from "./components/Preloading";
import MovieDetailsNfPopup from "./components/MovieDetailsNfPopup";
import Verify from "./components/Verify";
import VideoPlayer from "./components/VideoPlayer";

// 🔥 Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const HomeNf = lazy(() => import("./netflix/Home"));
const Movies = lazy(() => import("./pages/Movies"));
const TVShows = lazy(() => import("./pages/TVShows"));
const Watchlist = lazy(() => import("./pages/Watchlist"));

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [MovieDetailsPopupScroll, setMovieDetailsPopupScroll] = useState(0);
  const [movieData, setMovieData] = useState(null);
  const popupRef = useRef(null);
  const ott = "nf"
  const { playlist, holePageLoading, setPlaylist } = usePlaylist();
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const movieId = query.get("movieId")
  const p = query.get("p")
  useEffect(() => {
    const html = document.querySelector("html");
    if (isOpen) {
      html.classList.add("overflow-hidden");
    } else {
      if (!movieId && !playlist) {
        html.classList.remove("overflow-hidden");
      }
    }
  }, [isOpen]);
  useEffect(() => {
    function handleOverflow() {
      const html = document.querySelector("html");
      window.scrollTo(0, 0);
      if (movieId || playlist) {
        html.classList.add("overflow-hidden");
        return;
      }
      if (!movieId) {
        setPlaylist(null)
        setMovieDetailsPopupScroll(0)
        html.classList.remove("overflow-hidden");
        return;
      }
      if (!p) {
        setPlaylist(null)
        setMovieDetailsPopupScroll(0)
        html.classList.remove("overflow-hidden");
        return;
      }
    }
    handleOverflow()
  }, [movieId, p]);

  useEffect(() => {
    const html = document.querySelector("html");
    if (!p && !movieId) {
      setPlaylist(null)
      setMovieDetailsPopupScroll(0)
      html.classList.remove("overflow-hidden");
    }
    if (!p) {
      setPlaylist(null)
    }
  }, [p, movieId])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="grow">
        {/* <DevToolsProtection /> */}
        {/* <VideoPlayer /> */}
        <Preloading />
        {holePageLoading && <div className="fixed inset-0 bg-black/50 z-50000000">
          <div className="shimmer2 h-1 w-full bg-sky-500"></div>
        </div>}
        {/* {playlist && <VideoPlayerPopup movieData={movieData} />} */}
        {isOpen && <div className="bg-[#00050d]/80 fixed inset-0 z-1000"></div>}
        <div ref={popupRef}>
          <Navbar setIsOpen={setIsOpen} movieDetailsPopupScroll={MovieDetailsPopupScroll} isOpen={isOpen} />
          {/* <SearchPopup isOpen={isOpen} onClose={() => setIsOpen(false)} /> */}
        </div>
        {ott === "pv" ? <>
          {movieId && <MovieDetailsPopup setMovieDetailsPopupScroll={setMovieDetailsPopupScroll} setMovieData={setMovieData} movieData={movieData} />}
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-screen">
                <div className="w-10 md:w-14 h-10 md:h-14 border-5 border-t-black border-white rounded-full animate-spin"></div>
              </div>
            }>
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/series" element={<TVShows />} />
              <Route path="/watch-list" element={<Watchlist />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </> :
          <>
            {movieId && <MovieDetailsNfPopup setMovieDetailsPopupScroll={setMovieDetailsPopupScroll} setMovieData={setMovieData} movieData={movieData} />}
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-screen">
                  <div className="w-10 md:w-14 h-10 md:h-14 border-5 border-t-black border-white rounded-full animate-spin"></div>
                </div>
              }>
              <Routes>
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/home" element={<HomeNf />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/series" element={<TVShows />} />
                <Route path="/watch-list" element={<Watchlist />} />
                {/* <Route path="*" element={<Navigate to="/home" replace />} /> */}
              </Routes>
            </Suspense>
          </>}
      </div>
      {!holePageLoading && <InstallPWA />}
      <ToastContainer theme="dark" position="top-center" />
    </div>
  );
}

export default App;