import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';
import WatchlistProvider from "./hooks/useWatchlist.jsx";
import { AuthProvider } from "./hooks/useAuth.jsx";
import PlaylistProvider from "./components/usePlaylist.jsx";
import { HelmetProvider } from 'react-helmet-async';
import { PWAInstallProvider } from "./hooks/usePWAInstall.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <PWAInstallProvider>
        <PlaylistProvider>
          <WatchlistProvider>
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </WatchlistProvider>
        </PlaylistProvider>
      </PWAInstallProvider>
    </AuthProvider>
  </BrowserRouter>
)

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}
