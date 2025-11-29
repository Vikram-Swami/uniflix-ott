import { useState, useEffect, useRef } from "react";
import { getImageUrl, searchMovie } from "../services/api";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const SearchPopup = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]); // Dummy data for testing
    const [loading, setLoading] = useState(false);
    const popupRef = useRef(null);

    // Close when clicking outside popup
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    // Debounced Search
    useEffect(() => {
        setResults([]);
        if (query.length > 0) {
            setLoading(true);
            const delay = setTimeout(async () => {
                try {
                    const res = await searchMovie(query)
                    setResults(res?.searchResult || []);
                } catch (err) {
                    console.error("Search Error:", err);
                }
                finally {
                    setLoading(false);
                }
            }, 500);
            return () => clearTimeout(delay);
        }


    }, [query]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-[#00050d]/80 z-5000 flex justify-center items-start pt-20"
            role="dialog"
        >
            <div
                ref={popupRef}
                className="w-[82%] max-w-[1400px] pt-6 pb-0 bg-[#191e25e6] rounded-xl overflow-hidden"
            >
                {/* Search Box */}
                <div className="relative flex items-center bg-zinc-700 rounded-xl mx-6">
                    <div className="absolute left-4 text-white text-2xl">
                        <Search />
                    </div>
                    <input
                        type="text"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search movies..."
                        className="w-full h-16 bg-zinc-700 text-white text-xl pl-14 rounded-xl outline-none"
                    />
                </div>

                {/* Results Container */}
                <div className="serach_results mt-5 max-h-[calc(100dvh-200px)] overflow-y-auto grid grid-cols-2 px-6 bg-[#191e25]">
                    {/* Loader */}
                    {loading && (
                        <p className="text-zinc-400 text-center col-span-full py-10 text-lg font-medium">Loading...</p>
                    )}

                    {/* No Results */}
                    {!loading && results.length === 0 && (
                        <p className="text-zinc-400 text-center col-span-full py-10 text-lg font-medium">No Results Found</p>
                    )}

                    {/* Search Results */}
                    {results.length > 0 && results.map((movie, i) => (
                        <Link onClick={() => {
                            onClose()
                            setQuery("")
                        }} key={movie?.id} to={`/home?movieId=${movie?.id}`} className="cursor-pointer p-4 flex items-center rounded-md shadow-md text-white" type="button">
                            <img className="max-w-[250px] rounded-[10px]" src={getImageUrl(movie?.id)} alt={movie?.t} />
                            <div className="ps-4">
                                <div className="text-2xl max-md:text-[16px] leading-[1.2] font-bold">{movie?.t}</div>
                                <div className="max-md:text-[14px]">{movie?.y} {movie?.r}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchPopup;
