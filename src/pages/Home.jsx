import { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import RecentSwiper from '../components/RecentSwiper';
import MovieRow from '../components/MovieRow';
import { fetchHomepage } from '../services/api';
import { usePlaylist } from '../components/usePlaylist';
import { useInView } from "react-intersection-observer";
const Home = () => {
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setHolePageLoading } = usePlaylist();


  const LazyRow = ({ children }) => {
    const { ref, inView } = useInView({
      threshold: 0.1,
      triggerOnce: true,
    });

    return <div ref={ref}>{inView ? children : null}</div>;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setHolePageLoading(true);
        setLoading(true);
        const data = await fetchHomepage();
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
    }, 1000);
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

      {/* Recent Swiper */}
      <RecentSwiper />

      {/* Movie Rows */}
      <div className="pb-16">
        {homepageData?.post?.map((row, index) => (
          <LazyRow key={index}>
            <MovieRow
              key={index}
              title={row.cate}
              movieIds={row.ids}
            />
          </LazyRow>
        ))}
      </div>
    </div>
  );
};

export default Home;

