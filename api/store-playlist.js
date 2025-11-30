// Store playlist for iOS playback (production serverless function)
import { setPlaylist } from "./playlist-store.js";

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
      const { id, content } = req.body;

      if (!id || !content) {
        res.status(400).json({ error: "Missing id or content" });
        return;
      }

      // Store playlist
      setPlaylist(id, content);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error storing playlist:", error);
      res.status(500).json({ error: "Failed to store playlist" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
