import React, { useState, createContext, useContext } from "react";

export const PlaylistContext = createContext();

export const usePlaylist = () => useContext(PlaylistContext);

const PlaylistProvider = ({ children }) => {
    const [playlist, setPlaylist] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentMovieId, setCurrentMovieId] = useState(null);
    const [error, setError] = useState(null);
    const [holePageLoading, setHolePageLoading] = useState(false);


    const fetchPlaylist = async (id) => {
        setLoading(true);
        setError(null);
        setHolePageLoading(true)

        try {
            const res = await fetch(
                `/api/playlist.php?id=${id}&tm=1763899957`
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
                fileUrl = `/api${filePath.replace('/pv', '')}aa`;
            } else if (filePath?.startsWith('/')) {
                // If path starts with /, use /api
                fileUrl = `/api${filePath}aa`;
            } else {
                // Fallback to original URL
                fileUrl = `https://net51.cc${filePath}aa`;
            }
            let finalUrl = url.replace("::suaa", "::ni")
            const playlistResponse = await fetch(finalUrl, {
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

            if (link1.test(text)) {
                text = text.replace(
                    link1,
                    'https://uniflix-ott.vercel.app/api/media/files/'
                );
            } else if (link2.test(text)) {
                text = text.replace(
                    link2,
                    'https://uniflix-ott.vercel.app/api/media2/files/'
                );
            } else if (link3.test(text)) {
                text = text.replace(
                    link3,
                    'https://uniflix-ott.vercel.app/api/media3/files/'
                );
            } else if (link4.test(text)) {
                text = text.replace(
                    link4,
                    'https://uniflix-ott.vercel.app/api/media4/files/'
                );
            } else {
                console.log("No match found!");
            }
            setCurrentMovieId(id);
            setPlaylist(text);
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
            value={{ playlist, loading, error, fetchPlaylist, setPlaylist, currentMovieId, setHolePageLoading, holePageLoading }}
        >
            {children}
        </PlaylistContext.Provider>
    );
};

export default PlaylistProvider;