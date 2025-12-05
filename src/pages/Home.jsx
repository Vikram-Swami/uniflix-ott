import { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import RecentSwiper from '../components/RecentSwiper';
import MovieRow from '../components/MovieRow';
import { fetchHomepage } from '../services/api';
import { usePlaylist } from '../components/usePlaylist';
import { useInView } from "react-intersection-observer";
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setHolePageLoading } = usePlaylist();

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
        <title>Home - Uniflix</title>
        <meta name="description" content="Browse unlimited movies and series on Uniflix. Watch latest Hollywood, Bollywood movies and series online." />
        <meta name="keywords" content="watch movies online, bollywood movies, hollywood movies, watch series online, bollywood series, hollywood series" />
        <meta property="og:title" content="Home - Uniflix" />
        <meta property="og:description" content="Browse unlimited movies and series on Uniflix" />
        <meta property="og:url" content="https://uniflix.fun/home" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://uniflix.fun/home" />
      </Helmet>

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
              <MovieRow
                key={index}
                title={row.cate}
                movieIds={row.ids}
              />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;

