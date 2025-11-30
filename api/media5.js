// ==========================================
// FILE: api/media5.js (Media CDN 5)
// ==========================================
export default async function handler(req, res) {
  const path = req.url.replace("/api/media5", "");
  const targetUrl = `https://s15.freecdn13.top${path}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        Referer: "https://net51.cc/",
        Origin: "https://net51.cc",
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
    console.error("Media5 proxy error:", error);
    res.status(500).json({ error: "Media fetch failed" });
  }
}
