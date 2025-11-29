exports.handler = async (event) => {
  const path = event.path.replace("/.netlify/functions/media", "");
  const targetUrl = `https://s10.nm-cdn7.top${path}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Referer: "https://net51.cc/",
        Origin: "https://net51.cc",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const data = await response.arrayBuffer();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
      },
      body: Buffer.from(data).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Media fetch failed" }),
    };
  }
};
