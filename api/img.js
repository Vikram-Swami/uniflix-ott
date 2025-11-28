// ==========================================
// FILE: api/img.js (Optimized Image CDN)
// ==========================================
import sharp from "sharp";

export default async function handler(req, res) {
  const path = req.url.replace("/api/img", "");
  const targetUrl = `https://imgcdn.kim/pv${path}`;

  try {
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return res.status(response.status).send("Image fetch failed");
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Convert + compress using Sharp
    const optimizedImage = await sharp(buffer)
      .jpeg({ quality: 30 }) // ⭐ HD quality + small size
      .toBuffer();

    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).send(optimizedImage);
  } catch (error) {
    console.error("Image proxy error:", error);
    res.status(500).json({ error: "Image optimization failed" });
  }
}

