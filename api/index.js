// api/index.js
export default async function handler(req, res) {
  const path = req.url.replace("/api", "");
  const targetUrl = `https://net51.cc/pv${path}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://net51.cc/",
        Origin: "https://net51.cc",
        "X-Forwarded-For":
          req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "192.168.1.9",
        "X-Real-IP":
          req.headers["x-real-ip"] ||
          req.headers["x-forwarded-for"]?.split(",")[0] ||
          "192.168.1.9",

        // Forward cookies from client
        ...(req.headers.cookie && { Cookie: req.headers.cookie }),

        // Content-Type only for POST/PUT
        ...(req.method !== "GET" &&
          req.method !== "HEAD" && {
            "Content-Type": req.headers["content-type"] || "application/json",
          }),
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cookie");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    // Forward Set-Cookie from backend
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("Set-Cookie", setCookie);
    }

    res.status(response.status).send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy failed", message: error.message });
  }
}
