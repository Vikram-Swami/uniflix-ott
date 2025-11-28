// WatchlistContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const WATCHLIST_KEY = "uniflix_watchlist";
const WatchlistContext = createContext();

const WatchlistProvider = ({ children }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [watchlist, setWatchlist] = useState(() => {
    const stored = Cookies.get(WATCHLIST_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        return [];
      }
    }
    return [];
  });

  // Jab bhi watchlist change ho, cookie me save karo
  useEffect(() => {
    Cookies.set(WATCHLIST_KEY, JSON.stringify(watchlist), {
      expires: 90,
      sameSite: "Lax",
      path: "/",
    });
  }, [watchlist]);

  const addToWatchlist = (id) => {
    setWatchlist((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const removeFromWatchlist = (id) => {
    setWatchlist((prev) => prev.filter((item) => item !== id));
  };

  const isInWatchlist = (id) => watchlist.includes(id);

  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;

      setIsTouchDevice(hasTouch);
    };

    checkTouchDevice();

    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);


  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        isTouchDevice
      }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }
  return context;
};

export default WatchlistProvider