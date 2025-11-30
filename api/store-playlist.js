// API endpoint to store playlist (for production)
// Uses query parameter to pass playlist content (base64 encoded)
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { id, content } = req.body;

      if (!id || !content) {
        return res.status(400).json({ error: "Missing id or content" });
      }

      // In production, we'll use the id to create a URL that serves the content
      // For now, we'll return success and the client will use the content directly
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ success: true, id });
    } catch (error) {
      console.error("Store playlist error:", error);
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(500).json({ error: "Failed to store playlist" });
    }
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(405).json({ error: "Method not allowed" });
}
