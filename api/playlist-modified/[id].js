// Serve stored playlist for iOS playback (production serverless function)
import { getPlaylist, hasPlaylist } from "../playlist-store.js";

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    try {
      // Extract playlist ID from URL
      // For Vercel: req.query.id (from [id].js dynamic route)
      // Also handle .m3u8 extension
      let playlistId = req.query?.id;

      // If id includes .m3u8, remove it
      if (playlistId && playlistId.endsWith(".m3u8")) {
        playlistId = playlistId.replace(".m3u8", "");
      }

      // Fallback: parse from URL if query param not available
      if (!playlistId && req.url) {
        playlistId = req.url.split("/").pop()?.replace(".m3u8", "");
      }

      if (!playlistId) {
        res.status(400).json({ error: "Missing playlist ID" });
        return;
      }

      if (hasPlaylist(playlistId)) {
        const playlistContent = getPlaylist(playlistId);
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "no-cache");
        res.status(200).end(playlistContent);
      } else {
        res.status(404).json({ error: "Playlist not found" });
      }
    } catch (error) {
      console.error("Error serving playlist:", error);
      res.status(500).json({ error: "Failed to serve playlist" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
