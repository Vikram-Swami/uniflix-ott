import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { useWatchlist } from '../hooks/useWatchlist';
import { Link } from "react-router-dom";

const Watchlist = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWatchlistItems = async () => {
      if (watchlist.length === 0) {
        setWatchlistItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const items = watchlist
        setWatchlistItems(items);
      } catch (error) {
        console.error('Error loading watchlist items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlistItems();
  }, [watchlist]);

  if (loading) {
    return;
  }
  //ok
  return (
    <div className="pt-16 xs:pt-20 xl:pt-24 min-h-[calc(100dvh-193px)] xs:min-h-[calc(100dvh-204px)] sm:min-h-[calc(100dvh-229px)] md:min-h-[calc(100dvh-241px)] pb-16">
      <div className="max-xs:px-3 xs:px-6 sm2:px-8 md2:px-11 2xl:px-[72px]!">
        <h1 className="text-base md:text-xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 md:mb-8 xl:mb-12">
          My watchlist
        </h1>
        {watchlistItems.length === 0 ? (
          <p className="text-white max-xs:text-sm text-base 2xl:text-xl text-center  py-16">
            Your Watchlist is currently empty
            <br />
            Add <Link className="underline" to="/movies"> Movies</Link> and <Link className="underline" to="/series"> TV shows</Link> that you want to watch later by clicking Add to Watchlist.
          </p>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 md2:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-6! gap-y-3">
            {watchlistItems.map((item, i) => (
              <MovieCard
                className="hover:z-50"
                key={i}
                id={item}
                index={i}
                onHoverStart={(idx) => setHoveredIndex(idx)}
                onHoverEnd={() => setHoveredIndex(null)}
                hoveredIndex={hoveredIndex}
                buttonName="Play"
                isHovering={isHovering}
                item2={window.innerWidth > 600 ? false : true}
                setIsHovering={setIsHovering}
                handleWatchlist={removeFromWatchlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;

