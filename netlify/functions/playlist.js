exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Cookie",
        "Access-Control-Allow-Methods": "GET, POST",
        "Access-Control-Allow-Credentials": "true",
      },
      body: "",
    };
  }

  const path = event.path.replace("/.netlify/functions/playlist", "");
  const queryString = event.rawQuery ? `?${event.rawQuery}` : "";
  const targetUrl = `https://net51.cc/pv${path}${queryString}`;

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/vnd.apple.mpegurl",
        Referer: "https://net51.cc/",
        Origin: "https://net51.cc",
        Cookie: event.headers.cookie || "",
      },
    });

    const data = await response.text();
    const setCookie = response.headers.get("set-cookie");

    return {
      statusCode: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": response.headers.get("content-type") || "application/json",
        ...(setCookie && { "Set-Cookie": setCookie }),
      },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Playlist fetch failed" }),
    };
  }
};
