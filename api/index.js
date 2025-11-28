export default async function handler(req, res) {
  // Extract path after /api/proxy
  const path = req.url.replace("/api", "");
  const targetUrl = `https://net51.cc/pv${path}`;
  console.log("target", targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
      },
      ...(req.method !== "GET" &&
        req.method !== "HEAD" && {
          body: JSON.stringify(req.body),
        }),
    });

    const data = await response.text();

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.status(response.status).send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy failed", message: error.message });
  }
}
