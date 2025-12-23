# Server Deployment Guide

## Option 1: Render.com (Recommended - Free Tier Available)

### Steps:

1. **Create Account**: Go to [render.com](https://render.com) and sign up

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select repository: `uniflix-ott`

3. **Configure Service**:
   - **Name**: `uniflix-captcha-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Starter` (Free) or `Standard` (Paid)

4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   ```

5. **Deploy**: Click "Create Web Service"

6. **Get URL**: After deployment, you'll get a URL like:
   ```
   https://uniflix-captcha-server.onrender.com
   ```

7. **Update Frontend**: In `src/components/Verify.jsx`, update:
   ```javascript
   const SERVER_URL = import.meta.env.DEV
     ? 'http://localhost:3001'
     : 'https://uniflix-captcha-server.onrender.com'; // Your Render URL
   ```

---

## Option 2: Railway.app

### Steps:

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Get URL**: Railway will provide a URL automatically

---

## Option 3: DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)
2. Create new app from GitHub
3. Select your repository
4. Configure:
   - **Build Command**: `npm install`
   - **Run Command**: `node server.js`
   - **Port**: `3001`

---

## Option 4: Heroku (Paid)

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create uniflix-captcha-server`
4. Deploy: `git push heroku main`
5. Set config: `heroku config:set NODE_ENV=production`

---

## Option 5: VPS (DigitalOcean, AWS EC2, etc.)

### For Ubuntu/Debian:

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone your repo
git clone https://github.com/Vikram-Swami/uniflix-ott.git
cd uniflix-ott

# Install dependencies
npm install

# Start with PM2
pm2 start server.js --name captcha-server
pm2 save
pm2 startup
```

---

## Important Notes:

### Puppeteer Requirements:
- Render.com automatically installs Puppeteer dependencies
- For VPS, you may need:
  ```bash
  sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
  ```

### Update Frontend After Deployment:

1. Get your server URL (e.g., `https://uniflix-captcha-server.onrender.com`)
2. Update `src/components/Verify.jsx`:
   ```javascript
   const SERVER_URL = import.meta.env.DEV
     ? 'http://localhost:3001'
     : 'https://your-server-url.com'; // Replace with your deployed URL
   ```

3. Or use environment variable:
   Create `.env.production`:
   ```
   VITE_SERVER_URL=https://your-server-url.com
   ```

---

## Recommended: Render.com

**Why Render?**
- ✅ Free tier available
- ✅ Automatic Puppeteer support
- ✅ Easy GitHub integration
- ✅ Auto-deploy on push
- ✅ HTTPS included
- ✅ Good for Node.js apps

**Free Tier Limits:**
- 750 hours/month
- Spins down after 15 min inactivity (wakes on request)
- Good for development/testing

**Paid Plans:**
- $7/month for always-on service
- Better performance

---

## Testing After Deployment:

1. Check health endpoint:
   ```
   https://your-server-url.com/health
   ```

2. Test from frontend:
   - Open your app
   - Click "Get Token" button
   - Should connect to deployed server

---

## Troubleshooting:

### Server not responding:
- Check Render/Railway logs
- Verify PORT environment variable
- Check if Puppeteer dependencies are installed

### CORS errors:
- Verify CORS settings in `server.js`
- Check if frontend URL is allowed

### Puppeteer errors:
- Ensure server has enough memory (512MB+)
- Check if Chrome dependencies are installed