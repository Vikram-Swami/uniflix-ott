import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';
import PlaylistProvider from "./components/usePlaylist.jsx";
import WatchlistProvider from "./hooks/useWatchlist.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <PlaylistProvider>
      <WatchlistProvider>
        <App />
      </WatchlistProvider>
    </PlaylistProvider>
  </BrowserRouter>
)
