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
      token: process.env.CAPTCHA_API_KEY || "",
    },
    visualFeedback: true,
  })
);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS - Allow all origins
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

// Token cache
const tokenCache = {
  token: null,
  expiresAt: null,
  cookies: null,
};

function isCachedTokenValid() {
  return false;
}

async function getCaptchaToken() {
  let browser;
  try {
    // Check cache first
    if (isCachedTokenValid()) {
      const minutesLeft = Math.floor((tokenCache.expiresAt - Date.now()) / 1000 / 60);
      console.log(`✅ Using cached token (valid for ${minutesLeft} minutes)`);
      return {
        token: tokenCache.token,
        cookies: tokenCache.cookies,
        fromCache: true,
      };
    }

    const isRender = Boolean(process.env.RENDER);
    const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);
    const isProduction = process.env.NODE_ENV === "production";
    const isCloud = isRender || isRailway || isProduction;

    console.log("🌐 Environment:", { isRender, isRailway, isProduction, isCloud });

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
        "--window-size=1920,1080",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ],
    };

    if (isCloud) {
      launchOptions.args.push(
        "--single-process",
        "--disable-extensions",
        "--disable-background-networking",
        "--mute-audio",
        "--no-default-browser-check",
        "--password-store=basic",
        "--use-mock-keychain"
      );
    }

    console.log("🚀 Launching browser...");
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Anti-detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
      window.chrome = { runtime: {} };
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

    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("🔍 Checking for captcha...");
    const captchaExists = await page.evaluate(() => {
      return document.querySelector('iframe[src*="recaptcha"]') !== null;
    });

    if (captchaExists) {
      console.log("🤖 reCAPTCHA detected. Attempting to solve...");

      // Try clicking checkbox
      try {
        const frames = page.frames();
        const recaptchaFrame = frames.find((f) => f.url().includes("recaptcha"));
        if (recaptchaFrame) {
          await recaptchaFrame.click(".recaptcha-checkbox-border");
          console.log("✅ Clicked checkbox");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (e) {
        console.log("❌ Checkbox click failed:", e.message);
      }

      // Try plugin solve
      try {
        await page.solveRecaptchas();
        console.log("🔧 Plugin solve attempted");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (e) {
        console.log("⚠️  Plugin not available:", e.message);
      }
    }

    console.log("⏳ Waiting for token cookie...");
    await page.waitForFunction(() => document.cookie.includes("t_hash_t"), {
      timeout: 180000,
      polling: 1000,
    });

    const allCookies = await page.cookies();
    const tokenCookie = allCookies.find((c) => c.name === "t_hash_t");

    if (!tokenCookie) {
      throw new Error("Token not found in cookies");
    }

    console.log("🎯 Token extracted:", tokenCookie.value.substring(0, 20) + "...");

    // Cache for 6 days
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
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Get token endpoint
app.post("/api/get-captcha-token", async (req, res) => {
  try {
    console.log("📨 Token request received");
    const result = await getCaptchaToken();

    res.cookie("t_hash_t", result.token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      success: true,
      token: result.token,
      fromCache: result.fromCache,
      message: result.fromCache ? "Using cached token" : "New token extracted",
      expiresAt: tokenCache.expiresAt ? new Date(tokenCache.expiresAt).toISOString() : null,
    });
  } catch (error) {
    console.error("❌ API Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    platform: process.platform,
    timestamp: new Date().toISOString(),
    tokenCached: isCachedTokenValid(),
    cacheExpiresAt: tokenCache.expiresAt ? new Date(tokenCache.expiresAt).toISOString() : null,
  });
});

// Clear cache
app.post("/api/clear-cache", (req, res) => {
  tokenCache.token = null;
  tokenCache.expiresAt = null;
  tokenCache.cookies = null;
  res.json({ success: true, message: "Cache cleared" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "Captcha Token Service",
    status: "running",
    endpoints: {
      getToken: "POST /api/get-captcha-token",
      health: "GET /health",
      clearCache: "POST /api/clear-cache",
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("💾 Token caching: Enabled");
});
