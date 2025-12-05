import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";

async function generateSitemap() {
  const sitemap = new SitemapStream({
    hostname: "https://yourmoviewebsite.com",
  });

  const writeStream = createWriteStream("./public/sitemap.xml");
  sitemap.pipe(writeStream);

  // ✅ Website pages (example movie pages)
  sitemap.write({ url: "/home", changefreq: "daily", priority: 1.0 });
  sitemap.write({ url: "/movies", changefreq: "daily", priority: 0.9 });
  sitemap.write({ url: "/series", changefreq: "daily", priority: 0.5 });

  sitemap.end();

  await streamToPromise(sitemap);
  console.log("✅ sitemap.xml created");
}

generateSitemap();
