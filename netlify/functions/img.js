exports.handler = async (event) => {
  const path = event.path.replace("/.netlify/functions/img", "");
  const targetUrl = `https://imgcdn.kim/pv${path}`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.arrayBuffer();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
      },
      body: Buffer.from(data).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Image fetch failed" }),
    };
  }
};
