import express from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
import cors from "cors";
import cookieParser from "cookie-parser";

puppeteer.use(StealthPlugin());
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: "2captcha",
      token: process.env.CAPTCHA_API_KEY || "OPTIONAL_API_KEY",
    },
    visualFeedback: true,
  })
);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

// Token cache with expiry
const tokenCache = {
  token: null,
  expiresAt: null,
  cookies: null,
  generatedIP: null,
};

// Check if cached token is still valid
function isCachedTokenValid() {
  if (!tokenCache.token || !tokenCache.expiresAt) {
    return false;
  }
  return Date.now() < tokenCache.expiresAt;
}

// India proxy configuration
// FREE OPTIONS (कम reliable लेकिन free):
const FREE_INDIA_PROXIES = [
  // Ye free proxies हैं, agar काम nahi करें तो comment कर दो
  "103.148.72.192:80",
  "103.159.90.6:83",
  "43.230.123.14:80",
];

// PAID PROXY - Best option (uncomment करके use करो)
const PROXY_CONFIG = {
  use: process.env.USE_PROXY === "true", // Set to true to enable
  type: "http", // or "socks5"
  host: process.env.PROXY_HOST || "proxy.example.com",
  port: process.env.PROXY_PORT || "8080",
  username: process.env.PROXY_USER || "",
  password: process.env.PROXY_PASS || "",
};

async function getCaptchaToken() {
  let browser;
  try {
    if (isCachedTokenValid()) {
      console.log(
        "✅ Using cached token (valid for " +
          Math.floor((tokenCache.expiresAt - Date.now()) / 1000 / 60) +
          " minutes)"
      );
      console.log("🌍 Generated from IP:", tokenCache.generatedIP || "Unknown");
      return {
        token: tokenCache.token,
        cookies: tokenCache.cookies,
        fromCache: true,
        generatedIP: tokenCache.generatedIP,
      };
    }

    const platform = process.platform;
    const isProduction = process.env.NODE_ENV === "production";
    const isRender = process.env.RENDER == true || process.env.RENDER_SERVICE_NAME;
    const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;
    const isCloud = isRender || isRailway || isProduction;

    console.log("🌐 Server platform:", platform);
    console.log("☁️  Cloud environment:", isCloud);
    console.log("🇮🇳 India location targeting: ENABLED");

    const launchOptions = {
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--window-size=1920,1080",
        // India से browser ka user agent
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ],
      defaultViewport: null,
    };

    // PROXY CONFIGURATION
    if (PROXY_CONFIG.use && PROXY_CONFIG.host) {
      const proxyURL = `${PROXY_CONFIG.type}://${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`;
      launchOptions.args.push(`--proxy-server=${proxyURL}`);
      console.log("🔒 Proxy enabled:", proxyURL);
    } else if (process.env.USE_FREE_PROXY === "true" && FREE_INDIA_PROXIES.length > 0) {
      // Random free proxy select करो
      const randomProxy = FREE_INDIA_PROXIES[Math.floor(Math.random() * FREE_INDIA_PROXIES.length)];
      launchOptions.args.push(`--proxy-server=http://${randomProxy}`);
      console.log("🆓 Free proxy enabled:", randomProxy);
    } else {
      console.log("⚠️  No proxy configured - using Railway IP");
    }

    if (isCloud || platform === "linux") {
      launchOptions.args.push(
        "--single-process",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-default-apps",
        "--disable-hang-monitor",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--disable-sync",
        "--disable-translate",
        "--metrics-recording-only",
        "--mute-audio",
        "--no-crash-upload",
        "--no-default-browser-check",
        "--no-pings",
        "--password-store=basic",
        "--use-mock-keychain"
      );
    }

    console.log("🚀 Launching browser...");
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Proxy authentication (agar paid proxy use कर रहे हो)
    if (PROXY_CONFIG.use && PROXY_CONFIG.username && PROXY_CONFIG.password) {
      await page.authenticate({
        username: PROXY_CONFIG.username,
        password: PROXY_CONFIG.password,
      });
      console.log("✅ Proxy authentication successful");
    }

    // Anti-detection measures + India specific settings
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });

      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });

      // India timezone set करो
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-IN", "hi-IN", "en-US", "en"],
      });

      // India timezone
      Intl.DateTimeFormat = function () {
        return {
          resolvedOptions: () => ({ timeZone: "Asia/Kolkata" }),
        };
      };

      window.chrome = {
        runtime: {},
      };

      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);
    });

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-IN,hi-IN;q=0.9,en-US;q=0.8,en;q=0.7",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
    });

    // Check IP before accessing site
    try {
      console.log("🌍 Checking current IP...");
      await page.goto("https://api.ipify.org?format=json", {
        waitUntil: "networkidle2",
        timeout: 10000,
      });
      const ipData = await page.evaluate(() => {
        try {
          return JSON.parse(document.body.innerText);
        } catch {
          return { ip: "Unknown" };
        }
      });
      console.log("📍 Current IP:", ipData.ip);
      tokenCache.generatedIP = ipData.ip;
    } catch (e) {
      console.log("⚠️  Could not fetch IP:", e.message);
    }

    console.log("🌐 Navigating to verification page...");
    await page.goto("https://net20.cc/verify", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("🔍 Page loaded. Attempting automatic captcha bypass...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const captchaExists = await page.evaluate(() => {
        return document.querySelector('iframe[src*="recaptcha"]') !== null;
      });

      if (captchaExists) {
        console.log("🤖 reCAPTCHA detected. Attempting to solve...");

        try {
          const recaptchaFrame = page.frames().find((frame) => frame.url().includes("recaptcha"));
          if (recaptchaFrame) {
            await recaptchaFrame.click(".recaptcha-checkbox-border");
            console.log("✅ Clicked reCAPTCHA checkbox");
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        } catch (e) {
          console.log("❌ Checkbox click failed:", e.message);
        }

        try {
          await page.solveRecaptchas();
          console.log("🔧 Attempted plugin-based solving");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } catch (e) {
          console.log("⚠️  Plugin solving not available:", e.message);
        }
      }
    } catch (error) {
      console.log("⚠️  Captcha handling error:", error.message);
    }

    console.log("⏳ Waiting for token cookie...");
    try {
      await page.waitForFunction(() => document.cookie.includes("t_hash_t"), {
        timeout: 180000,
        polling: 1000,
      });
      console.log("🎉 Cookie detected!");
    } catch (timeoutError) {
      const cookies = await page.cookies();
      const tokenCookie = cookies.find((c) => c.name === "t_hash_t");

      if (tokenCookie) {
        console.log("✅ Cookie found despite timeout!");
      } else {
        console.error(
          "❌ Available cookies:",
          cookies.map((c) => c.name)
        );
        throw new Error(
          "Captcha could not be solved automatically. " +
            "Possible reasons: IP mismatch, proxy not working, or manual verification required."
        );
      }
    }

    // Extract ALL cookies from net20.cc domain
    const allCookies = await page.cookies();
    const tokenCookie = allCookies.find((c) => c.name === "t_hash_t");

    if (!tokenCookie) {
      throw new Error("Token not found in cookies");
    }

    console.log("🎯 Token extracted successfully:", tokenCookie.value.substring(0, 20) + "...");
    console.log("🔑 Token ending:", tokenCookie.value.slice(-2));

    // Cache the token for 6 days
    const sixDays = 6 * 24 * 60 * 60 * 1000;
    tokenCache.token = tokenCookie.value;
    tokenCache.expiresAt = Date.now() + sixDays;
    tokenCache.cookies = allCookies;

    console.log(
      "💾 Token cached until:",
      new Date(tokenCache.expiresAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    );

    return {
      token: tokenCookie.value,
      cookies: allCookies,
      fromCache: false,
      generatedIP: tokenCache.generatedIP,
    };
  } catch (error) {
    console.error("❌ Error getting token:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// API endpoint
app.post("/api/get-captcha-token", async (req, res) => {
  try {
    console.log("📨 Received request for captcha token");
    const result = await getCaptchaToken();

    // Set cookie with proper domain settings for net20.cc
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    res.cookie("t_hash_t", result.token, cookieOptions);
    res.json({
      success: true,
      token: result.token,
      tokenEnding: result.token.slice(-2),
      fromCache: result.fromCache,
      generatedIP: result.generatedIP,
      message: result.fromCache ? "Using cached token" : "Token extracted and cached successfully",
      expiresAt: tokenCache.expiresAt ? new Date(tokenCache.expiresAt).toISOString() : null,
      allCookies: result.cookies.map((c) => ({
        name: c.name,
        value: c.value.substring(0, 20) + "...",
        domain: c.domain,
      })),
      proxyUsed: PROXY_CONFIG.use || process.env.USE_FREE_PROXY === "true",
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      suggestion: "Consider using a paid India proxy or 2captcha service for reliable results",
      proxyConfigured: PROXY_CONFIG.use || process.env.USE_FREE_PROXY === "true",
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    platform: process.platform,
    timestamp: new Date().toISOString(),
    tokenCached: isCachedTokenValid(),
    cacheExpiresAt: tokenCache.expiresAt ? new Date(tokenCache.expiresAt).toISOString() : null,
    generatedIP: tokenCache.generatedIP || "Not yet generated",
    proxyEnabled: PROXY_CONFIG.use || process.env.USE_FREE_PROXY === "true",
    location: "India (Asia/Kolkata)",
  });
});

// Clear cache endpoint (for testing)
app.post("/api/clear-cache", (req, res) => {
  tokenCache.token = null;
  tokenCache.expiresAt = null;
  tokenCache.cookies = null;
  tokenCache.generatedIP = null;
  res.json({ success: true, message: "Cache cleared" });
});

// Test IP endpoint
app.get("/api/check-ip", async (req, res) => {
  let browser;
  try {
    console.log("🔍 Checking current IP configuration...");

    const launchOptions = {
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    if (PROXY_CONFIG.use && PROXY_CONFIG.host) {
      const proxyURL = `${PROXY_CONFIG.type}://${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`;
      launchOptions.args.push(`--proxy-server=${proxyURL}`);
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    if (PROXY_CONFIG.use && PROXY_CONFIG.username && PROXY_CONFIG.password) {
      await page.authenticate({
        username: PROXY_CONFIG.username,
        password: PROXY_CONFIG.password,
      });
    }

    await page.goto("https://api.ipify.org?format=json", { waitUntil: "networkidle2" });
    const ipData = await page.evaluate(() => {
      return JSON.parse(document.body.innerText);
    });

    await browser.close();

    res.json({
      success: true,
      ip: ipData.ip,
      proxyConfigured: PROXY_CONFIG.use,
      message: "This is the IP that will be used to generate tokens",
    });
  } catch (error) {
    if (browser) await browser.close();
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🔒 Captcha bypass mode: Stealth + Anti-detection");
  console.log("💾 Token caching: Enabled (6 days)");
  console.log("🇮🇳 India location: Configured");
  console.log(
    "🌐 Proxy status:",
    PROXY_CONFIG.use || process.env.USE_FREE_PROXY === "true" ? "ENABLED ✅" : "DISABLED ⚠️"
  );
  console.log("\n📋 Environment variables needed for proxy:");
  console.log("   USE_PROXY=true");
  console.log("   PROXY_HOST=your-proxy-host.com");
  console.log("   PROXY_PORT=8080");
  console.log("   PROXY_USER=username (optional)");
  console.log("   PROXY_PASS=password (optional)");
  console.log("   PROXY_TYPE=http (or socks5)");
  console.log("\n🆓 For free proxy: USE_FREE_PROXY=true");
});
