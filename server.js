/* eslint-env node */
/* global process */
import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Allow all origins for universal compatibility
app.use(
  cors({
    origin: true, // Allow all origins for universal platform support
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(cookieParser());

// Function to get captcha token using Puppeteer
// Works on all platforms: Windows, Mac, Linux (server-side)
async function getCaptchaToken() {
  let browser;
  try {
    // Detect platform for optimal browser launch
    const platform = process.platform;
    console.log('Server platform:', platform);

    const launchOptions = {
      headless: false, // Show browser so user can solve captcha
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--disable-blink-features=AutomationControlled',
      ],
      defaultViewport: null,
    };

    // Platform-specific optimizations
    if (platform === 'win32') {
      // Windows
      launchOptions.args.push('--start-maximized', '--window-position=0,0');
    } else if (platform === 'darwin') {
      // macOS
      launchOptions.args.push('--start-maximized');
    } else {
      // Linux and others
      launchOptions.args.push('--start-maximized', '--window-position=0,0');
    }

    browser = await puppeteer.launch(launchOptions);

    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    // Maximize window
    try {
      const client = await page.target().createCDPSession();
      const { windowId } = await client.send('Browser.getWindowForTarget', {
        targetId: page.target()._targetId,
      });
      await client.send('Browser.setWindowBounds', {
        windowId: windowId,
        bounds: { windowState: 'maximized' },
      });
    } catch (err) {
      console.log('Could not maximize via CDP:', err.message);
    }

    await page.bringToFront();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Navigate to the verification page
    await page.goto('https://net20.cc/verify', {
      waitUntil: 'networkidle2',
    });

    await page.bringToFront();
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('Waiting for captcha to be solved...');

    // Wait for t_hash_t cookie to be set (max 2 minutes)
    await page.waitForFunction(() => document.cookie.includes('t_hash_t'), {
      timeout: 120000,
    });

    // Extract cookies
    const cookies = await page.cookies();
    const tokenCookie = cookies.find((c) => c.name === 't_hash_t');

    if (!tokenCookie) {
      throw new Error('Token not found in cookies');
    }

    console.log('Token extracted:', tokenCookie.value);
    return tokenCookie.value;
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// API endpoint to get captcha token
app.post('/api/get-captcha-token', async (req, res) => {
  try {
    console.log('Received request for captcha token');
    const token = await getCaptchaToken();

    // Set cookie in response with universal compatibility
    // Works on all platforms: iOS, Android, Mac, Windows, Linux
    const cookieOptions = {
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      sameSite: 'lax', // Compatible with all browsers
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/', // Available site-wide
    };

    res.cookie('t_hash_t', token, cookieOptions);

    // Also set in response header for mobile compatibility
    res.setHeader('Set-Cookie', [
      `t_hash_t=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`,
    ]);

    res.json({
      success: true,
      token: token,
      message: 'Token extracted and set successfully',
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check endpoint - for server availability detection
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: process.platform,
    timestamp: new Date().toISOString(),
  });
});

// CORS preflight handler - handle OPTIONS requests
// Note: CORS middleware already handles most OPTIONS, but we add specific routes if needed
app.options('/api/get-captcha-token', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.options('/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Waiting for requests...');
});