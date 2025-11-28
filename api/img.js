// ==========================================
// FILE: api/img.js (Image CDN)
// ==========================================
export default async function handler(req, res) {
  const path = req.url.replace("/api/img", "");
  const targetUrl = `https://imgcdn.kim/pv${path}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
      },
    });

    const data = await response.arrayBuffer();
    const contentType = response.headers.get("content-type");

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.status(response.status).send(Buffer.from(data));
  } catch (error) {
    console.error("Image proxy error:", error);
    res.status(500).json({ error: "Image fetch failed" });
  }
}
