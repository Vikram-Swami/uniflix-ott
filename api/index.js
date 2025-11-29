export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const url = new URL(req.url);
  const target = `https://net51.cc/pv${url.pathname}${url.search}`;

  const res = await fetch(target, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "*/*",
      Referer: "https://net51.cc/",
    },
  });

  const text = await res.text();

  return new Response(text, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "text/plain",
    },
  });
}
