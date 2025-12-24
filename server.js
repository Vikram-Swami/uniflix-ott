/* eslint-env node */
/* global process */
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
      token: "OPTIONAL_API_KEY",
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
};

// Check if cached token is still valid
function isCachedTokenValid() {
  return false;
}

async function getCaptchaToken() {
  let browser;
  try {
    if (isCachedTokenValid()) {
      console.log(
        "✅ Using cached token (valid for " +
          Math.floor((tokenCache.expiresAt - Date.now()) / 1000 / 60) +
          " minutes)"
      );
      return {
        token: tokenCache.token,
        cookies: tokenCache.cookies,
        fromCache: true,
      };
    }

    const platform = process.platform;
    const isProduction = process.env.NODE_ENV === "production";
    const isRender = process.env.RENDER === "true" || process.env.RENDER_SERVICE_NAME;
    const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;
    const isCloud = isRender || isRailway || isProduction;

    console.log("🌐 Server platform:", platform);
    console.log("☁️  Cloud environment:", isCloud);

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
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ],
      defaultViewport: null,
    };

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

    // Anti-detection measures
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });

      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });

      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });

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
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    });

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
            "This site requires manual verification or a paid captcha service."
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

    // Cache the token for 6 days
    const sixDays = 6 * 24 * 60 * 60 * 1000;
    tokenCache.token = tokenCookie.value;
    tokenCache.expiresAt = Date.now() + sixDays;
    tokenCache.cookies = allCookies;

    console.log("💾 Token cached until:", new Date(tokenCache.expiresAt).toLocaleString());

    return {
      token: tokenCookie.value,
      cookies: allCookies,
      fromCache: false,
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
      fromCache: result.fromCache,
      message: result.fromCache ? "Using cached token" : "Token extracted and cached successfully",
      expiresAt: tokenCache.expiresAt ? new Date(tokenCache.expiresAt).toISOString() : null,
      ccc: result,
      allCookies: result.cookies.map((c) => ({
        name: c.name,
        value: c.value.substring(0, 20) + "...",
        domain: c.domain,
      })),
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      suggestion: "Consider using a captcha solving service like 2captcha for reliable results",
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
  });
});

// Clear cache endpoint (for testing)
app.post("/api/clear-cache", (req, res) => {
  tokenCache.token = null;
  tokenCache.expiresAt = null;
  tokenCache.cookies = null;
  res.json({ success: true, message: "Cache cleared" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🔒 Captcha bypass mode: Stealth + Anti-detection");
  console.log("💾 Token caching: Enabled (65 days)");
});
