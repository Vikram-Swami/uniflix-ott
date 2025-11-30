import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import SearchPopup from "./components/SearchPopup";
import MovieDetailsPopup from "./components/MovieDetailsPopup";
import VideoPlayerPopup from "./components/VideoPlayerPopup";
import { usePlaylist } from "./components/usePlaylist";

// 🔥 Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Movies = lazy(() => import("./pages/Movies"));
const TVShows = lazy(() => import("./pages/TVShows"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Login = lazy(() => import("./authentication/Login"));

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [MovieDetailsPopupScroll, setMovieDetailsPopupScroll] = useState(0);
  const [movieData, setMovieData] = useState(null);
  const popupRef = useRef(null);
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
    const html = document.querySelector("html");
    if (movieId || playlist) {
      html.classList.add("overflow-hidden");
    } else {
      html.classList.remove("overflow-hidden");
    }
    window.scrollTo(0, 0);
    if (!movieId) {
      setPlaylist(null)
      setMovieDetailsPopupScroll(0)
      html.classList.remove("overflow-hidden");
    }
    if (!p) {
      setPlaylist(null)
      setMovieDetailsPopupScroll(0)
      html.classList.remove("overflow-hidden");
    }
  }, [movieId, p]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsOpen(false)
        console.log("firstget", popupRef.current && !popupRef.current.contains(e.target))
      }
      console.log("firstget2", popupRef.current && !popupRef.current.contains(e.target))
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {holePageLoading && <div className="fixed inset-0 bg-black/50 z-100000">
        <div className="shimmer2 h-1 w-full bg-sky-500"></div>
      </div>}
      {playlist && <VideoPlayerPopup movieData={movieData} />}
      {isOpen && <div className="bg-[#00050d]/80 fixed inset-0 z-50"></div>}
      <div ref={popupRef}>
        <Navbar setIsOpen={setIsOpen} movieDetailsPopupScroll={MovieDetailsPopupScroll} isOpen={isOpen} />
        <SearchPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
      {movieId && <MovieDetailsPopup setMovieDetailsPopupScroll={setMovieDetailsPopupScroll} setMovieData={setMovieData} movieData={movieData} />}
      <Suspense
        fallback={
          <div className="flex justify-center items-end h-[50vh]">
            <div className="w-10 md:w-14 h-10 md:h-14 border-5 border-t-black border-white rounded-full animate-spin"></div>
          </div>
        }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<TVShows />} />
          <Route path="/watch-list" element={<Watchlist />} />

          {/* Invalid route → redirect to /home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense >
    </>
  );
}

export default App;
