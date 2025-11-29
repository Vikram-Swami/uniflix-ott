// api/index.js
export default async function handler(req, res) {
  const path = req.url.replace("/api", "");
  const targetUrl = `https://net51.cc/pv${path}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        // ✅ Real browser headers - backend ko lagega browser se request aa rahi hai
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://net51.cc/",
        Origin: "https://net51.cc",
        "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        Connection: "keep-alive",
        DNT: "1",

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
