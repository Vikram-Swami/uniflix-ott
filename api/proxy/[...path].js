export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const url = new URL(req.url);

  // VERY IMPORTANT
  const path = url.pathname.replace("/api/proxy", "");

  if (!path || path === "/") {
    return new Response("Invalid proxy path", { status: 400 });
  }

  const targetUrl = `https://net51.cc/pv${path}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "user-agent": req.headers.get("user-agent") || "Mozilla/5.0",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        referer: "https://net51.cc/",
        origin: "https://net51.cc",
      },
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/vnd.apple.mpegurl",
        "access-control-allow-origin": "*",
      },
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
