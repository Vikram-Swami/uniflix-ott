export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { pathname, search } = new URL(req.url);

    // /api/proxy/...  →  /pv/...
    const forwardPath = pathname.replace("/api/proxy", "");
    const targetUrl = `https://net51.cc/pv${forwardPath}${search}`;

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: {
        // ✅ browser-like headers (MOST IMPORTANT)
        "user-agent": req.headers.get("user-agent") || "Mozilla/5.0",
        accept: req.headers.get("accept") || "*/*",
        "accept-language": req.headers.get("accept-language") || "en-US,en;q=0.9",
        origin: "https://net51.cc",
        referer: "https://net51.cc/",
      },
      credentials: "include",
    });

    return new Response(res.body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "text/plain",
        "access-control-allow-origin": "*",
        "access-control-allow-credentials": "true",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Edge Proxy Failed", message: err.message }), {
      status: 500,
    });
  }
}
