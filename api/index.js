export default async function handler(req, res) {
  // Extract path after /api/proxy
  const path = req.url.replace("/api", "");
  const targetUrl = `https://net51.cc/pv${path}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        // ✅ IMPORTANT: Forward cookies to backend
        ...(req.headers.cookie && { Cookie: req.headers.cookie }),
      },
      // Forward credentials
      credentials: "include",
      ...(req.method !== "GET" &&
        req.method !== "HEAD" && {
          body: JSON.stringify(req.body),
        }),
    });

    const data = await response.text();

    // ✅ Forward Set-Cookie headers from backend
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      res.setHeader("Set-Cookie", setCookieHeader);
    }

    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cookie");
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy failed", message: error.message });
  }
}
