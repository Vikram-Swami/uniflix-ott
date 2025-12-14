import { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import MovieRow from '../components/MovieRow';
import { fetchMoviepage } from '../services/api';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePlaylist } from '../components/usePlaylist';
import { Helmet } from 'react-helmet-async';
import { sliderData } from "../utils/sliderData";
import LazyMovieRow from "../components/LazyMovieRow";

const Movies = () => {
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
        const data = await fetchMoviepage();
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
        <title>Movies - Uniflix</title>
        <meta name="description" content="Browse unlimited movies on Uniflix. Watch latest Hollywood, Bollywood movies online." />
        <meta name="keywords" content="watch movies online, bollywood movies, hollywood movies" />
        <meta property="og:title" content="Movies - Uniflix" />
        <meta property="og:description" content="Browse unlimited movies on Uniflix" />
        <meta property="og:url" content="https://uniflix.fun/movies" />
        <meta property="og:description" content="Browse unlimited movies and series on Uniflix" />
        <link rel="canonical" href="https://uniflix.fun/movies" />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Slider */}
        {homepageData?.slider && (
          <HeroSlider slides={sliderData.movieData} />
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

export default Movies;

