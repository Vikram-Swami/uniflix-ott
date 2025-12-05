import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "playlist-middleware",
      configureServer(server) {
        // Store for playlists (in-memory, will be populated by client)
        const playlistStore = new Map();

        server.middlewares.use("/api/playlist-modified", (req, res, next) => {
          // Parse URL to get query parameters
          const url = new URL(req.url, `http://${req.headers.host}`);
          const playlistId = url.pathname.split("/").pop()?.replace(".m3u8", "");
          const content = url.searchParams.get("content");

          // If content is passed as query parameter (works in production)
          if (content) {
            try {
              const playlistContent = Buffer.from(content, "base64").toString("utf-8");
              res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
              return res.end(playlistContent);
            } catch (e) {
              return res.status(400).end("Invalid playlist content");
            }
          }

          // Fallback to in-memory store (dev only)
          if (playlistId && playlistStore.has(playlistId)) {
            const playlistContent = playlistStore.get(playlistId);
            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Cache-Control", "no-cache");
            return res.end(playlistContent);
          }

          res.status(404).end("Playlist not found");
        });

        // Endpoint to store playlist (called from client)
        server.middlewares.use("/api/store-playlist", (req, res, next) => {
          if (req.method === "POST") {
            let body = "";
            req.on("data", (chunk) => {
              body += chunk.toString();
            });
            req.on("end", () => {
              try {
                const { id, content } = JSON.parse(body);
                playlistStore.set(id, content);
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                res.status(400).end("Invalid request");
              }
            });
          } else {
            next();
          }
        });
      },
    },
  ],
  optimizeDeps: {
    include: ["swiper/react", "swiper/modules"],
  },
  server: {
    proxy: {
      "/api/media2": {
        target: "https://s10.nm-cdn7.top",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/media2/, ""),
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            proxyReq.setHeader("Referer", "https://net51.cc/");
            proxyReq.setHeader("Origin", "https://net51.cc");
          });
        },
      },
      "/api/media3": {
        target: "https://s13.freecdn2.top",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/media3/, ""),
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            proxyReq.setHeader("Referer", "https://net51.cc/");
            proxyReq.setHeader("Origin", "https://net51.cc");
          });
        },
      },
      "/api/media4": {
        target: "https://s14.freecdn2.top",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/media4/, ""),
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            proxyReq.setHeader("Referer", "https://net51.cc/");
            proxyReq.setHeader("Origin", "https://net51.cc");
          });
        },
      },
      "/api/media5": {
        target: "https://s15.freecdn13.top",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/media5/, ""),
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            proxyReq.setHeader("Referer", "https://net51.cc/");
            proxyReq.setHeader("Origin", "https://net51.cc");
          });
        },
      },
      "/api/media": {
        target: "https://s11.nm-cdn8.top",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/media/, ""),
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            proxyReq.setHeader("Referer", "https://net51.cc/");
            proxyReq.setHeader("Origin", "https://net51.cc");
          });
        },
      },
      "/img": {
        target: "https://imgcdn.kim/pv/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/img\//, ""),
      },
      "/api": {
        target: "https://net51.cc",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/pv"),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  server: {
    historyApiFallback: true,
  },
});
