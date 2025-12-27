// import React, { useRef, useEffect, useState } from 'react';
// import Cookies from 'js-cookie';

// const MyComponent = () => {
//   const iframeRef = useRef(null);
//   const [tokenStatus, setTokenStatus] = useState('Waiting for reCAPTCHA...');
//   const [loading, setLoading] = useState(false);
//   const [platform, setPlatform] = useState('');
//   const pollingIntervalRef = useRef(null);
//   const [token, setToken] = useState("")

//   // Detect platform
//   useEffect(() => {
//     const userAgent = navigator.userAgent || navigator.vendor || window.opera;
//     let detectedPlatform = 'Unknown';

//     if (/android/i.test(userAgent)) {
//       detectedPlatform = 'Android';
//     } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
//       detectedPlatform = 'iOS';
//     } else if (/Mac/.test(navigator.platform)) {
//       detectedPlatform = 'Mac';
//     } else if (/Win/.test(navigator.platform)) {
//       detectedPlatform = 'Windows';
//     } else if (/Linux/.test(navigator.platform)) {
//       detectedPlatform = 'Linux';
//     }

//     setPlatform(detectedPlatform);
//     console.log('Detected platform:', detectedPlatform);
//   }, []);

//   // Server URL - auto-detect or use environment variable
//   const getServerUrl = () => {
//     // Try to detect server automatically
//     if (import.meta.env.DEV) {
//       return 'http://localhost:3001';
//     }
//     // Production: use environment variable or default Render URL
//     // Update this with your deployed server URL
//     return (
//       import.meta.env.VITE_SERVER_URL ||
//       'https://uniflix-captcha-server-production.up.railway.app' // Replace with your deployed URL
//     );
//   };

//   const SERVER_URL = getServerUrl();

//   const getCookieByName = (cookieString, name) => {
//     const match = cookieString.match(
//       new RegExp('(^|;\\s*)' + name + '=([^;]*)')
//     );
//     return match ? match[2] : null;
//   };

//   useEffect(() => {
//     const storeTokenInCookies = (token) => {
//       if (token) {
//         // Store token in parent page cookies using js-cookie
//         Cookies.set('t_hash_t', token, { expires: 7 }); // 7 days expiry
//         setTokenStatus('✅ Token stored successfully!');
//         console.log('Token stored in cookies:', token);

//         // Stop polling if token is found
//         if (pollingIntervalRef.current) {
//           clearInterval(pollingIntervalRef.current);
//           pollingIntervalRef.current = null;
//         }
//         return true;
//       }
//       return false;
//     };

//     const tryGetIframeCookies = () => {
//       try {
//         // Try to access iframe cookies (will fail if cross-origin)
//         if (iframeRef.current?.contentDocument) {
//           const iframeCookies = iframeRef.current.contentDocument.cookie;
//           const token = getCookieByName(iframeCookies, 't_hash_t');
//           console.log('iframeCookies', iframeCookies);
//           if (token) {
//             return storeTokenInCookies(token);
//           }
//         }
//       } catch {
//         // Expected error for cross-origin iframes
//         // This is normal and we'll use postMessage instead
//       }
//       return false;
//     };
//     // Listen for postMessage from iframe
//     const handleMessage = (event) => {
//       // Verify origin for security (optional but recommended)
//       // if (event.origin !== 'https://net20.cc') return;

//       // Check if message contains token
//       if (event.data && typeof event.data === 'object') {
//         if (event.data.type === 't_hash_t' || event.data.token) {
//           const token =
//             event.data.token || event.data.t_hash_t || event.data.value;
//           if (token) {
//             storeTokenInCookies(token);
//           }
//         }
//       } else if (typeof event.data === 'string') {
//         // If token is sent as string
//         if (event.data.includes('t_hash_t') || event.data.length > 20) {
//           // Try to extract token from string
//           const tokenMatch = event.data.match(/t_hash_t[=:]([^;,\s]+)/);
//           if (tokenMatch) {
//             storeTokenInCookies(tokenMatch[1]);
//           } else {
//             // Assume entire string is token
//             storeTokenInCookies(event.data);
//           }
//         }
//       }
//     };

//     window.addEventListener('message', handleMessage);

//     // Poll for cookies periodically (will only work if same-origin)
//     const startPolling = () => {
//       // Try immediately
//       tryGetIframeCookies();

//       // Poll every 2 seconds
//       pollingIntervalRef.current = setInterval(() => {
//         if (!tryGetIframeCookies()) {
//           setTokenStatus('Waiting for reCAPTCHA to be solved...');
//         }
//       }, 2000);
//     };

//     const handleIframeLoad = () => {
//       setTokenStatus('reCAPTCHA loaded. Please solve it...');
//       startPolling();
//     };

//     // Setup iframe load listener
//     if (iframeRef.current) {
//       iframeRef.current.onload = handleIframeLoad;
//       // If iframe is already loaded
//       if (iframeRef.current.contentDocument?.readyState === 'complete') {
//         handleIframeLoad();
//       }
//     }

//     // Cleanup
//     return () => {
//       window.removeEventListener('message', handleMessage);
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current);
//       }
//     };
//   }, []);

//   // Check if server is available
//   const checkServerAvailability = async () => {
//     try {
//       const response = await fetch(`${SERVER_URL}/health`, {
//         method: 'GET',
//         signal: AbortSignal.timeout(3000), // 3 second timeout
//       });
//       return response.ok;
//     } catch {
//       return false;
//     }
//   };

//   const checkCookies = () => {
//     const cookies = document.cookie;
//     alert(cookies || 'No cookies found');
//   };

//   // Function to get token from server using Puppeteer (works on all platforms)
//   const getTokenFromServer = async () => {
//     setLoading(true);
//     setTokenStatus('🔄 Checking server connection...');

//     // First check if server is available
//     const serverAvailable = await checkServerAvailability();
//     if (!serverAvailable) {
//       setTokenStatus(
//         `❌ Server not available at ${SERVER_URL}. Please start the server first.`
//       );
//       setLoading(false);
//       return;
//     }

//     setTokenStatus('🔄 Opening browser to solve reCAPTCHA...');

//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 150000); // 2.5 minutes timeout

//       const response = await fetch(`${SERVER_URL}/api/get-captcha-token`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         signal: controller.signal,
//       });
//       clearTimeout(timeoutId);

//       if (!response.ok) {
//         throw new Error(`Server error: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.success && data.token) {
//         // Store token in cookies with platform-specific settings
//         setToken(data.token)
//         const cookieOptions = {
//           expires: 7, // 7 days
//           path: '/',
//           sameSite: 'none',
//         };

//         // For mobile platforms, ensure cookie is accessible
//         if (platform === 'iOS' || platform === 'Android') {
//           // Mobile browsers may need different settings
//           Cookies.set('t_hash_t', data.token, cookieOptions);
//         } else {
//           Cookies.set('t_hash_t', data.token, cookieOptions);
//         }

//         setTokenStatus('✅ Token stored successfully!');
//         console.log('Token stored in cookies:', data.token);
//         console.log('Token stored in fromCache:', data.fromCache);
//         console.log('Token stored in expiresAt:', data.expiresAt);
//         console.log('Token stored in ccc:', data.ccc);
//         console.log('Token stored in allCookies:', data.allCookies);
//         console.log('Token stored in cookies:', data.token);
//         console.log('Tokendata:', data);
//         console.log('Platform:', platform);

//         // Verify cookie was set
//         const storedToken = Cookies.get('t_hash_t');
//         if (storedToken) {
//           console.log('Cookie verified:', storedToken);
//         } else {
//           console.warn('Cookie may not have been set properly');
//         }
//       } else {
//         setTokenStatus(
//           '❌ Failed to get token: ' + (data.error || 'Unknown error')
//         );
//       }
//     } catch (error) {
//       console.error('Error getting token from server:', error);
//       if (error.name === 'AbortError') {
//         setTokenStatus('❌ Request timeout. Please try again.');
//       } else {
//         setTokenStatus(
//           `❌ Error: ${error.message}. Platform: ${platform}. Server: ${SERVER_URL}`
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <iframe
//         ref={iframeRef}
//         src="https://net20.cc/verify"
//         width="100%"
//         height="700"
//         title="reCAPTCHA Verification"
//         style={{ border: '1px solid #ccc', borderRadius: '4px' }}
//       />
//       <div
//         style={{
//           marginTop: '15px',
//           display: 'flex',
//           flexDirection: 'column',
//           gap: '10px',
//         }}
//       >
//         {platform && (
//           <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
//             Platform: {platform}
//           </p>
//         )}
//         <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
//           {tokenStatus}
//         </p>
//         <button
//           onClick={getTokenFromServer}
//           disabled={loading}
//           style={{
//             padding: '12px 24px',
//             backgroundColor: loading ? '#ccc' : '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: loading ? 'not-allowed' : 'pointer',
//             fontSize: '14px',
//             fontWeight: '500',
//             minHeight: '44px', // Better touch target for mobile
//             transition: 'background-color 0.2s',
//           }}
//           onMouseEnter={(e) => {
//             if (!loading) {
//               e.currentTarget.style.backgroundColor = '#0056b3';
//             }
//           }}
//           onMouseLeave={(e) => {
//             if (!loading) {
//               e.currentTarget.style.backgroundColor = '#007bff';
//             }
//           }}
//         >
//           {loading ? (
//             <span>⏳ Processing... Please wait</span>
//           ) : (
//             <span>🔑 Get Token (Works on {platform || 'All'} Platforms)</span>
//           )}
//         </button>
//         <h1 className="text-5xl">Token : <span className="text-base!">{token}</span></h1>
//         <div style={{ fontSize: '12px', color: '#999', lineHeight: '1.5' }}>
//           <p style={{ margin: '5px 0' }}>
//             <strong>How it works:</strong>
//           </p>
//           <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
//             <li>Server will open a browser window</li>
//             <li>Solve the reCAPTCHA in that window</li>
//             <li>Token will be automatically saved to your cookies</li>
//             <li>Works on iOS, Android, Mac, Windows, and Linux</li>
//           </ul>
//           <p style={{ margin: '5px 0', fontSize: '11px' }}>
//             Server: {SERVER_URL}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyComponent;

import ReCAPTCHA from "react-google-recaptcha";

export default function Verify() {

  function onChange(value) {
    console.log("Captcha value:", value);
  }
  // 6LcCmTUqAAAAAFuT20OLQ5_UXqQ6x3M5V32PHt4y
  return (
    <div className="mt-20">
      <ReCAPTCHA
        sitekey="6LeHJTgsAAAAALnuAFKdhUZp0AFi0ZwJMu95Mim8"
        onChange={onChange}
      />
      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quis, necessitatibus? Consequatur assumenda omnis eaque labore temporibus. Placeat at ea quos nulla delectus consequatur aspernatur omnis et deleniti autem! Numquam dolorem doloribus adipisci iusto consequatur odit dolores sit neque tenetur beatae quidem earum quo est cum minus perferendis quod placeat quos dolorum, nemo, voluptatum totam quia excepturi veritatis! Temporibus aspernatur non qui obcaecati, itaque minus expedita atque, maxime quis ipsum esse ab quod dolor. Doloremque, similique. Dolore illo, saepe minima omnis excepturi magnam accusamus, cupiditate, aut ullam fuga aliquid reiciendis est debitis laudantium consequatur quas modi culpa distinctio impedit placeat consequuntur.</p>
    </div>
  )
}
