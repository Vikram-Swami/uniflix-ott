import React, { useState, createContext, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const PlaylistContext = createContext();

export const usePlaylist = () => useContext(PlaylistContext);

const PlaylistProvider = ({ children }) => {
    const [playlist, setPlaylist] = useState("");
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentMovieId, setCurrentMovieId] = useState(null);
    const [error, setError] = useState(null);
    const [holePageLoading, setHolePageLoading] = useState(false);
    const navigate = useNavigate()
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    };
    const query = useQuery();
    const movieId = query.get("movieId")
    const fetchPlaylist = async (id) => {
        setLoading(true);
        setError(null);
        setHolePageLoading(true)

        try {
            const res = await fetch(
                `/api/playlist.php?id=${id}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                }
            }
            );
            const data = await res.json();

            // Convert file URL to use proxy
            const filePath = data[0]?.sources[0]?.file;
            let fileUrl;

            if (filePath?.startsWith('http')) {
                // If it's already a full URL, replace net51.cc with proxy
                fileUrl = filePath.replace('https://net51.cc', '/api');
            } else if (filePath?.startsWith('/pv/')) {
                // If path starts with /pv/, use /api and remove /pv
                fileUrl = `/api${filePath.replace('/pv', '')}`;
            } else if (filePath?.startsWith('/')) {
                // If path starts with /, use /api
                fileUrl = `/api${filePath}`;
            } else {
                // Fallback to original URL
                fileUrl = `https://net51.cc${filePath}`;
            }

            const playlistResponse = await fetch(fileUrl, {
                method: "GET",
                credentials: "include",
                headers: {
                    'Accept': 'application/vnd.apple.mpegurl',
                }
            },);
            let text = await playlistResponse.text();
            const link1 = /https:\/\/s11\.nm-cdn8\.top\/files\//g;
            const link2 = /https:\/\/s10\.nm-cdn7\.top\/files\//g;
            const link3 = /https:\/\/s13\.freecdn2\.top\/files\//g;
            const link4 = /https:\/\/s14\.freecdn2\.top\/files\//g;
            const link5 = /https:\/\/s15\.freecdn13\.top\/files\//g;

            // Get current origin for URL replacement (works in both dev and production)
            const currentOrigin = window.location.origin;

            if (link1.test(text)) {
                text = text.replace(
                    link1,
                    `${currentOrigin}/api/media/files/`
                );
            } else if (link2.test(text)) {
                text = text.replace(
                    link2,
                    `${currentOrigin}/api/media2/files/`
                );
            } else if (link3.test(text)) {
                text = text.replace(
                    link3,
                    `${currentOrigin}/api/media3/files/`
                );
            } else if (link4.test(text)) {
                text = text.replace(
                    link4,
                    `${currentOrigin}/api/media4/files/`
                );

            } else if (link5.test(text)) {
                text = text.replace(
                    link5,
                    `${currentOrigin}/api/media5/files/`
                );
            } else {
                console.log("No match found!");
            }

            setCurrentMovieId(id);
            setPlaylist(text);
            setPlaylistUrl("");
            if (text) {
                navigate(`?movieId=${movieId}&p=1`)
            }
            // Not used anymore, but keep for compatibility
        } catch (err) {
            setError(err);
            console.error("Fetch Error:", err);
        } finally {
            setHolePageLoading(false);
            setLoading(false);
        }
    };

    return (
        <PlaylistContext.Provider
            value={{ playlist, playlistUrl, loading, error, fetchPlaylist, setPlaylist, currentMovieId, setHolePageLoading, holePageLoading }}
        >
            {children}
        </PlaylistContext.Provider>
    );
};

export default PlaylistProvider;