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

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <PlaylistProvider>
          <WatchlistProvider>
            <App />
          </WatchlistProvider>
      </PlaylistProvider>
    </AuthProvider>
  </BrowserRouter>
)
