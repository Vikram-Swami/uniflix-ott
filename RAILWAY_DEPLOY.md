# Railway.app Deployment Guide

## Quick Steps:

### 1. Install Railway CLI

```bash
npm i -g @railway/cli
```

### 2. Login

```bash
railway login
```

### 3. Initialize Project

```bash
railway init
```

### 4. Set Environment Variables

```bash
railway variables set NODE_ENV=production
railway variables set PORT=3001
```

### 5. Deploy

```bash
railway up
```

### 6. Get URL

```bash
railway domain
```

---

## OR Use Railway Web Dashboard:

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway automatically detects Node.js
6. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=3001`
7. Deploy automatically starts
8. Get your URL from dashboard

---

## Railway Advantages:

- ✅ Better Puppeteer support
- ✅ Automatic Chrome installation
- ✅ More flexible than Render
- ✅ Better for headless browsers
- ✅ Free tier available ($5 credit/month)

---

## Update Frontend After Deployment:

In `src/components/Verify.jsx`, update SERVER_URL:

```javascript
const SERVER_URL = import.meta.env.DEV
  ? 'http://localhost:3001'
  : 'https://your-app-name.up.railway.app'; // Your Railway URL