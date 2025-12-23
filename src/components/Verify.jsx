
import React, { useState } from 'react';

export default function CaptchaTokenSystem() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [showSetup, setShowSetup] = useState(true);

  // Frontend function to call backend
  const getTokenFromBackend = async () => {
    setLoading(true);
    setStatus('🔄 Getting token from net20.cc...');
    
    try {
      const response = await fetch('http://localhost:3001/api/get-captcha-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        setStatus('✅ Token received successfully!');
        
        // Set cookie in your domain
        document.cookie = `t_hash_t=${data.token}; path=/; max-age=3600`;
      } else {
        setStatus('❌ Failed to get token: ' + data.error);
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCookies = () => {
    const cookies = document.cookie;
    alert(cookies || 'No cookies found');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#1e3c72' }}>
            🔐 reCAPTCHA Token Extraction System
          </h1>
          <p style={{ margin: 0, color: '#666' }}>
            Backend Puppeteer + Frontend React Integration
          </p>
        </div>

        {/* Setup Instructions */}
        {showSetup && (
          <div style={{
            background: '#fff3cd',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '20px',
            border: '2px solid #ffc107'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#856404' }}>
              ⚙️ Backend Setup Required
            </h3>
            <div style={{
              background: '#2d2d2d',
              color: '#00ff00',
              padding: '20px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
              overflow: 'auto',
              marginBottom: '15px'
            }}>
              <div># Step 1: Create backend folder</div>
              <div>mkdir captcha-backend && cd captcha-backend</div>
              <div><br/></div>
              <div># Step 2: Initialize Node.js project</div>
              <div>npm init -y</div>
              <div><br/></div>
              <div># Step 3: Install dependencies</div>
              <div>npm install express puppeteer cors cookie-parser</div>
              <div><br/></div>
              <div># Step 4: Create server.js file (code below)</div>
              <div><br/></div>
              <div># Step 5: Run server</div>
              <div>node server.js</div>
            </div>
            <button 
              onClick={() => setShowSetup(false)}
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Hide Setup Instructions
            </button>
          </div>
        )}

        {/* Backend Code */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            📄 Backend Code (server.js)
          </h3>
          <pre style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '20px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px',
            lineHeight: '1.6'
          }}>
{`const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your React app URL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Function to get captcha token
async function getCaptchaToken() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Set to true for production
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('https://net20.cc/verify', {
      waitUntil: 'networkidle2'
    });

    console.log('Waiting for captcha to be solved...');
    
    // Wait for t_hash_t cookie to be set (max 2 minutes)
    await page.waitForFunction(
      () => document.cookie.includes('t_hash_t'),
      { timeout: 120000 }
    );

    // Extract cookies
    const cookies = await page.cookies();
    const tokenCookie = cookies.find(c => c.name === 't_hash_t');
    
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
      maxAge: 3600000 // 1 hour
    });

    res.json({ 
      success: true, 
      token: token,
      message: 'Token extracted and set successfully'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
  console.log('Waiting for requests...');
});`}
          </pre>
        </div>

        {/* Main Interface */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
            🎯 Get Token from net20.cc
          </h3>

          {status && (
            <div style={{
              background: status.includes('❌') ? '#f8d7da' : 
                         status.includes('✅') ? '#d4edda' : '#d1ecf1',
              color: status.includes('❌') ? '#721c24' : 
                     status.includes('✅') ? '#155724' : '#0c5460',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              {status}
            </div>
          )}

          <button
            onClick={getTokenFromBackend}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px',
              transition: 'all 0.3s'
            }}
          >
            {loading ? '⏳ Processing... (Solve captcha in browser window)' : '🚀 Get Token from net20.cc'}
          </button>

          <button
            onClick={checkCookies}
            style={{
              width: '100%',
              padding: '12px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🍪 Check Current Cookies
          </button>

          {token && (
            <div style={{
              marginTop: '20px',
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #28a745'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>
                ✅ Token Extracted Successfully!
              </h4>
              <div style={{
                background: 'white',
                padding: '15px',
                borderRadius: '6px',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#333'
              }}>
                {token}
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          marginTop: '20px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            🔍 How It Works
          </h3>
          <ol style={{ color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li><strong>Frontend:</strong> User clicks "Get Token" button</li>
            <li><strong>Backend:</strong> Puppeteer opens net20.cc/verify in automated browser</li>
            <li><strong>Manual Step:</strong> You solve the captcha in the opened browser window</li>
            <li><strong>Backend:</strong> Waits for t_hash_t cookie to be set</li>
            <li><strong>Backend:</strong> Extracts token and sends to frontend</li>
            <li><strong>Frontend:</strong> Receives token and sets it in your domain's cookies</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
