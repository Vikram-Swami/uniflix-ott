import { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import MovieRow from '../components/MovieRow';
import { fetchMoviepage } from '../services/api';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePlaylist } from '../components/usePlaylist';
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
    <div className="min-h-screen sm:pb-36 md:pb-52">
      {/* Hero Slider */}
      {homepageData?.slider && (
        <HeroSlider slides={homepageData.slider} />
      )}

      {/* Movie Rows */}
      <div className="pb-16">
        {homepageData?.post?.map((row, index) => (
          <MovieRow
            key={index}
            title={row.cate}
            movieIds={row.ids}
            onAddToWatchlist={addToWatchlist}
          />
        ))}
      </div>
    </div>
  );
};

export default Movies;

