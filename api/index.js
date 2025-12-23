export default async function handler(req, res) {
  // Extract path after /api/proxy
  const path = req.url.replace("/api", "");
  const targetUrl = `https://net51.cc/pv${path}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
    });

    // Response body
    const data = await response.text();

    // Set CORS
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true"); // 👈 IMPORTANT
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookies");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    // Pass cookies back to client (set-cookie header)
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
