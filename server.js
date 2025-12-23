import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3001;

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173', // Your React app URL
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
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--start-maximized', // Maximize window on startup
        '--window-position=0,0', // Position at top-left
        '--disable-infobars', // Remove info bars
        '--disable-background-timer-throttling', // Prevent background throttling
        '--disable-backgrounding-occluded-windows', // Keep window active
        '--disable-renderer-backgrounding', // Keep renderer active
        '--disable-features=TranslateUI', // Disable translate UI
        '--app=https://net20.cc/verify', // App mode - hides browser UI (header, address bar, tabs)
      ],
      defaultViewport: null, // Use full window size
    });

    // Get the default page that opens with browser
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    // Maximize and focus window using Chrome DevTools Protocol
    let client;
    try {
      client = await page.target().createCDPSession();
      const { windowId } = await client.send('Browser.getWindowForTarget', {
        targetId: page.target()._targetId,
      });

      // Maximize window immediately
      await client.send('Browser.setWindowBounds', {
        windowId: windowId,
        bounds: {
          windowState: 'maximized',
        },
      });

      // Small delay then bring to front
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Minimize and maximize trick to bring to foreground
      await client.send('Browser.setWindowBounds', {
        windowId: windowId,
        bounds: { windowState: 'minimized' },
      });
      await new Promise((resolve) => setTimeout(resolve, 50));
      await client.send('Browser.setWindowBounds', {
        windowId: windowId,
        bounds: { windowState: 'maximized' },
      });
      await new Promise((resolve) => setTimeout(resolve, 150));
    } catch (err) {
      console.log('Could not maximize via CDP, using fallback:', err.message);
    }

    // Bring window to front immediately after creation
    await page.bringToFront();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Navigate to the page
    await page.goto('https://net20.cc/verify', {
      waitUntil: 'networkidle2',
    });

    // After page loads, bring to front again and focus using CDP
    await page.bringToFront();
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Use CDP to focus and activate the window (more reliable on Windows)
    if (client) {
      try {
        const { windowId } = await client.send('Browser.getWindowForTarget', {
          targetId: page.target()._targetId,
        });

        // Trick: Minimize and then maximize to bring window to foreground
        await client.send('Browser.setWindowBounds', {
          windowId: windowId,
          bounds: {
            windowState: 'minimized',
          },
        });
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Now maximize to bring it to front
        await client.send('Browser.setWindowBounds', {
          windowId: windowId,
          bounds: {
            windowState: 'maximized',
          },
        });
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.log('Could not focus window via CDP:', err.message);
      }
    }

    // Aggressive sequence to bring window to foreground
    // Repeat minimize/maximize trick multiple times
    if (client) {
      try {
        const { windowId } = await client.send('Browser.getWindowForTarget', {
          targetId: page.target()._targetId,
        });

        // Repeat minimize/maximize 2-3 times to ensure window comes to front
        for (let i = 0; i < 2; i++) {
          await client.send('Browser.setWindowBounds', {
            windowId: windowId,
            bounds: { windowState: 'minimized' },
          });
          await new Promise((resolve) => setTimeout(resolve, 50));
          await client.send('Browser.setWindowBounds', {
            windowId: windowId,
            bounds: { windowState: 'maximized' },
          });
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (err) {
        console.log('Could not use minimize/maximize trick:', err.message);
      }
    }

    // Multiple aggressive bringToFront calls
    for (let i = 0; i < 5; i++) {
      await page.bringToFront();
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Try to bring all browser pages to front
    try {
      const pages = await browser.pages();
      for (const p of pages) {
        await p.bringToFront();
      }
      await page.bringToFront(); // Ensure our page is on top
    } catch {
      // Ignore if it fails
    }

    // Try to focus window using JavaScript multiple times
    try {
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => {
          window.focus();
          if (document.hasFocus && !document.hasFocus()) {
            window.focus();
          }
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch {
      // Ignore if focus fails
    }

    // Final aggressive bringToFront sequence
    for (let i = 0; i < 3; i++) {
      await page.bringToFront();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

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

// API endpoint
app.post('/api/get-captcha-token', async (req, res) => {
  try {
    console.log('Received request for captcha token');
    const token = await getCaptchaToken();

    // Set cookie in response
    res.cookie('t_hash_t', token, {
      httpOnly: false,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
    });

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Waiting for requests...');
});