import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
});
