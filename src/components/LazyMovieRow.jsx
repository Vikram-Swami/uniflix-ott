import { useEffect, useRef, useState } from 'react';
import MovieRow from '../components/MovieRow';
import { useOtt } from "../hooks/useOtt";
import MovieRow2 from "./MovieRow2";

const LazyMovieRow = ({ title, movieIds }) => {
  const [isVisible, setIsVisible] = useState(false);
  const rowRef = useRef(null);
  const { ott } = useOtt()
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '200px', // 200px pehle hi load start ho jayega
        threshold: 0.01
      }
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => {
      if (rowRef.current) {
        observer.unobserve(rowRef.current);
      }
    };
  }, []);

  return (
    <div ref={rowRef}>
      {isVisible && ott === "pv" ? (
        <MovieRow title={title} movieIds={movieIds} />
      ) : isVisible && ott === "nf" ? <MovieRow2 title={title} movieIds={movieIds} /> : (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default LazyMovieRow;