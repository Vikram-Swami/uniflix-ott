/* eslint-env node */
/* global process */
import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Allow all origins for universal compatibility
app.use(
  cors({
    origin: true, // Allow all origins for universal platform support
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

// Function to get captcha token using Puppeteer
// Works on all platforms: Windows, Mac, Linux (server-side)
async function getCaptchaToken() {
  let browser;
  try {
    // Detect platform and environment
    const platform = process.platform;
    const isProduction = process.env.NODE_ENV === "production";
    const isRender = process.env.RENDER === "true" || process.env.RENDER_SERVICE_NAME;
    const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;
    const isCloud = isRender || isRailway || isProduction;

    console.log("Server platform:", platform);
    console.log("Production:", isProduction);
    console.log("Render.com:", isRender);
    console.log("Railway.app:", isRailway);
    console.log("Cloud environment:", isCloud);

    // Cloud platforms (Render, Railway, etc.) में headless mode use करें
    // Local development में browser show करें
    const launchOptions = {
      headless: isCloud ? "new" : false, // Cloud पर headless, local पर GUI
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Render.com के लिए important
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-infobars",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
      defaultViewport: { width: 1920, height: 1080 },
    };

    // Cloud platforms/Linux के लिए specific args
    if (isCloud || platform === "linux") {
      launchOptions.args.push(
        "--single-process", // Render.com के लिए
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
        "--no-crash-upload",
        "--no-default-browser-check",
        "--no-pings",
        "--password-store=basic",
        "--use-mock-keychain"
      );
    }

    // Platform-specific optimizations
    if (platform === "win32" && !isProduction) {
      launchOptions.args.push("--start-maximized", "--window-position=0,0");
    } else if (platform === "darwin" && !isProduction) {
      launchOptions.args.push("--start-maximized");
    }

    // Render.com पर executablePath specify करें (अगर needed हो)
    // Puppeteer automatically bundled Chrome use करेगा
    console.log("Launching browser with options:", {
      headless: launchOptions.headless,
      argsCount: launchOptions.args.length,
    });

    browser = await puppeteer.launch(launchOptions);

    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Maximize window (only if not headless and not Render.com)
    const isHeadless = isProduction || isRender;
    if (!isHeadless) {
      try {
        const client = await page.target().createCDPSession();
        const { windowId } = await client.send("Browser.getWindowForTarget", {
          targetId: page.target()._targetId,
        });
        await client.send("Browser.setWindowBounds", {
          windowId: windowId,
          bounds: { windowState: "maximized" },
        });
        await page.bringToFront();
      } catch (err) {
        console.log("Could not maximize via CDP:", err.message);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Navigate to the verification page
    console.log("Navigating to verification page...");
    await page.goto("https://net20.cc/verify", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    if (!isHeadless) {
      await page.bringToFront();
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Page loaded. Waiting for captcha to be solved...");
    if (isCloud) {
      console.log("Note: Running in headless mode. User interaction not possible.");
      console.log("For manual captcha solving, use local server or VPS with GUI.");
    }

    // Wait for t_hash_t cookie to be set (max 2 minutes)
    // Render.com पर headless mode में user manually solve नहीं कर सकता
    // इसलिए timeout बढ़ाएं या automation use करें
    try {
      await page.waitForFunction(() => document.cookie.includes("t_hash_t"), {
        timeout: 120000, // 2 minutes
        polling: 1000, // Check every second
      });
      console.log("Cookie detected!");
    } catch (timeoutError) {
      console.error("Timeout waiting for cookie:", timeoutError.message);
      // Check current cookies
      const currentCookies = await page.cookies();
      console.log(
        "Current cookies:",
        currentCookies.map((c) => c.name)
      );
      throw new Error("Captcha not solved within timeout. Please try again.");
    }

    // Extract cookies
    const cookies = await page.cookies();
    const tokenCookie = cookies.find((c) => c.name === "t_hash_t");

    if (!tokenCookie) {
      throw new Error("Token not found in cookies");
    }

    console.log("Token extracted:", tokenCookie.value);
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

// API endpoint to get captcha token
app.post("/api/get-captcha-token", async (req, res) => {
  try {
    console.log("Received request for captcha token");
    const token = await getCaptchaToken();

    // Set cookie in response with universal compatibility
    // Works on all platforms: iOS, Android, Mac, Windows, Linux
    const cookieOptions = {
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === "production", // HTTPS in production
      sameSite: "lax", // Compatible with all browsers
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/", // Available site-wide
    };

    res.cookie("t_hash_t", token, cookieOptions);

    // Also set in response header for mobile compatibility
    res.setHeader("Set-Cookie", [
      `t_hash_t=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    ]);

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
    });
  }
});

// Health check endpoint - for server availability detection
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    platform: process.platform,
    timestamp: new Date().toISOString(),
  });
});

// CORS preflight handler - handle OPTIONS requests
// Note: CORS middleware already handles most OPTIONS, but we add specific routes if needed
app.options("/api/get-captcha-token", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

app.options("/health", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Waiting for requests...");
});
