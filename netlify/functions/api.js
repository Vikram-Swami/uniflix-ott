exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Cookie",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
        "Access-Control-Allow-Credentials": "true",
      },
      body: "",
    };
  }

  // ✅ Correct path extraction
  const pathMatch = event.path.match(/\.netlify\/functions\/api(\/.*)?$/);
  const path = pathMatch ? pathMatch[1] || "" : "";
  const queryString = event.rawQuery ? `?${event.rawQuery}` : "";
  const targetUrl = `https://net51.cc/pv${path}${queryString}`;

  console.log("API Request:", event.path);
  console.log("Target URL:", targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json, text/plain, */*",
        Referer: "https://net51.cc/",
        Origin: "https://net51.cc",
        Cookie: event.headers.cookie || "",
        ...(event.httpMethod !== "GET" && {
          "Content-Type": "application/json",
        }),
      },
      ...(event.httpMethod !== "GET" &&
        event.body && {
          body: event.body,
        }),
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
    console.error("Proxy error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Proxy failed",
        message: error.message,
        path: event.path,
        targetUrl,
      }),
    };
  }
};
