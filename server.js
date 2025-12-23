import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Your React app URL
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Function to get captcha token
async function getCaptchaToken() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Set to true for production
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://net20.cc/verify", {
      waitUntil: "networkidle2",
    });

    console.log("Waiting for captcha to be solved...");

    // Wait for t_hash_t cookie to be set (max 2 minutes)
    await page.waitForFunction(() => document.cookie.includes("t_hash_t"), { timeout: 120000 });

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

// API endpoint
app.post("/api/get-captcha-token", async (req, res) => {
  try {
    console.log("Received request for captcha token");
    const token = await getCaptchaToken();

    // Set cookie in response
    res.cookie("t_hash_t", token, {
      httpOnly: false,
      secure: false, // Set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 3600000, // 1 hour
    });

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Waiting for requests...");
});
