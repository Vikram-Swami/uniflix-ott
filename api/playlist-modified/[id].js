// API endpoint to serve modified playlist (for production)
// This will serve playlist content passed via query parameter
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      const { id } = req.query;
      const { content } = req.query;

      // If content is passed as query parameter (base64 encoded)
      if (content) {
        try {
          const playlistContent = Buffer.from(content, "base64").toString("utf-8");
          res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          return res.status(200).send(playlistContent);
        } catch (e) {
          console.error("Error decoding playlist:", e);
          return res.status(400).json({ error: "Invalid playlist content" });
        }
      }

      // If only ID is provided, try to get from a store (won't work in serverless)
      // This is a fallback - in practice, content should be passed
      return res
        .status(404)
        .json({ error: "Playlist not found. Please pass content as query parameter." });
    } catch (error) {
      console.error("Playlist serve error:", error);
      return res.status(500).json({ error: "Failed to serve playlist" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
