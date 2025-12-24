/* eslint-env node */
/* global process */
import express from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
import cors from "cors";
import cookieParser from "cookie-parser";

// Stealth plugin use karein to avoid bot detection
puppeteer.use(StealthPlugin());

// RecaptchaPlugin use karein (optional - agar automated solve chahiye)
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: "2captcha",
      token: "OPTIONAL_API_KEY", // Free me blank chhod do
    },
    visualFeedback: true, // Show when captcha is being solved
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

// Enhanced getCaptchaToken with multiple bypass methods
async function getCaptchaToken() {
  let browser;
  try {
    const platform = process.platform;
    const isProduction = process.env.NODE_ENV === "production";
    const isRender = process.env.RENDER === "true" || process.env.RENDER_SERVICE_NAME;
    const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;
    const isCloud = isRender || isRailway || isProduction;

    console.log("Server platform:", platform);
    console.log("Cloud environment:", isCloud);

    const launchOptions = {
      headless: "new", // Always headless on server
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

        // Extra anti-detection flags
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

    console.log("Launching browser...");
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Anti-detection: Remove webdriver property
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });

      // Mock plugins
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });

      // Mock languages
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });

      // Mock chrome
      window.chrome = {
        runtime: {},
      };

      // Mock permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);
    });

    // Set realistic viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set extra headers
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    });

    console.log("Navigating to verification page...");
    await page.goto("https://net20.cc/verify", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Page loaded. Attempting automatic captcha bypass...");

    // Method 1: Try to solve captcha automatically (stealth plugin may help)
    try {
      // Wait a bit for captcha to load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check if captcha exists
      const captchaExists = await page.evaluate(() => {
        return document.querySelector('iframe[src*="recaptcha"]') !== null;
      });

      if (captchaExists) {
        console.log("reCAPTCHA detected. Attempting to solve...");

        // Method 1a: Try clicking checkbox (for v2 checkbox captcha)
        try {
          const recaptchaFrame = page.frames().find((frame) => frame.url().includes("recaptcha"));

          if (recaptchaFrame) {
            await recaptchaFrame.click(".recaptcha-checkbox-border");
            console.log("Clicked reCAPTCHA checkbox");
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        } catch (e) {
          console.log("Checkbox click failed:", e.message);
        }

        // Method 1b: Use plugin to solve (if available)
        try {
          await page.solveRecaptchas();
          console.log("Attempted plugin-based solving");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } catch (e) {
          console.log("Plugin solving not available:", e.message);
        }
      }
    } catch (error) {
      console.log("Captcha handling error:", error.message);
    }

    // Wait for cookie with longer timeout
    console.log("Waiting for token cookie...");
    try {
      await page.waitForFunction(() => document.cookie.includes("t_hash_t"), {
        timeout: 180000, // 3 minutes
        polling: 1000,
      });
      console.log("Cookie detected!");
    } catch (timeoutError) {
      // Check if cookie was set anyway
      const cookies = await page.cookies();
      const tokenCookie = cookies.find((c) => c.name === "t_hash_t");

      if (tokenCookie) {
        console.log("Cookie found despite timeout!");
      } else {
        console.error(
          "Available cookies:",
          cookies.map((c) => c.name)
        );
        throw new Error(
          "Captcha could not be solved automatically. " +
            "This site requires manual verification or a paid captcha service."
        );
      }
    }

    // Extract cookies
    const cookies = await page.cookies();
    const tokenCookie = cookies.find((c) => c.name === "t_hash_t");

    if (!tokenCookie) {
      throw new Error("Token not found in cookies");
    }

    console.log("Token extracted successfully:", tokenCookie.value.substring(0, 20) + "...");
    return tokenCookie.value;
  } catch (error) {
    console.error("Error getting token:", error);
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
    console.log("Received request for captcha token");
    const token = await getCaptchaToken();

    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    res.cookie("t_hash_t", token, cookieOptions);

    res.json({
      success: true,
      token: token,
      message: "Token extracted and set successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      suggestion: "Consider using a captcha solving service like 2captcha for reliable results",
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    platform: process.platform,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Captcha bypass mode: Stealth + Anti-detection vkram");
});
"ba25f5eeda7a6330403d9c760894bae3%3A%3Acc4267a87416ca444f50cb2b99a97c0b%3A%3A1766567450%3A%3Ani"
"565a2af135f878b36fa9a88a4919d0ea%3A%3Ae4f4295dffe72bb1d6986f2875e8f05e%3A%3A1766567306%3A%3Asu"
