import { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import MovieRow from '../components/MovieRow';
import { fetchShowpage } from '../services/api';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePlaylist } from '../components/usePlaylist';
import { Helmet } from 'react-helmet-async';
import { sliderData } from "../utils/sliderData";
import LazyMovieRow from "../components/LazyMovieRow";

const TVShows = () => {
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToWatchlist } = useWatchlist();
  const { setHolePageLoading } = usePlaylist();
  useEffect(() => {
    const loadData = async () => {
      try {
        setHolePageLoading(true);
        setLoading(true);
        const data = await fetchShowpage();
        setHomepageData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setHolePageLoading(false);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const slides = document.querySelectorAll(".swiper");
      const count = slides.length;

      slides.forEach((slide, index) => {
        slide.style.zIndex = count - index;
      });
    }, 300);
  }, []);

  if (loading) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-red-500 mb-4">Error loading content: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Series - Uniflix</title>
        <meta name="description" content="Browse unlimited series on Uniflix. Watch latest Hollywood, Bollywood series online." />
        <meta name="keywords" content="watch series online, bollywood series, hollywood series, movies, series, streaming, watch online, uniflix, prime video, netflix, live movies, sports, live tv, all series watch online movies,watch online series, free movies, watch unlimited movies, watch unlimited series , all movies free, all series free, jio hotstar, jio hotstar moveis, hotstar movies, hotstar , jio hotstar all movies, jio hotstar all series, disney movies, anime moveis , cartoon , viral movies, tranding movies, hindi movies, Dhurandhar, Dhurandhar movie download, watch online ,download all movie for free" />
        <meta property="og:title" content="Series - Uniflix" />
        <meta property="og:description" content="Browse unlimited series on Uniflix" />
        <meta property="og:url" content="https://uniflix.fun/series" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://uniflix.fun/series" />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Slider */}
        {homepageData?.slider && (
          <HeroSlider slides={sliderData.seriesData} />
        )}

        {/* Movie Rows */}
        <div className="pb-16">
          {homepageData?.post?.map((row, index) => (
            <LazyMovieRow
              key={index}
              title={row.cate}
              movieIds={row.ids}
              onAddToWatchlist={addToWatchlist}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default TVShows;

