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
    <video controls src="https://s15.freecdn13.top/files/0OQLX86W1PXLU0CRSWPE7L2UL1/480p/480p.m3u8?in=::788151f1a99ba4302d561e7a4c200198::1764497222::ni"></video>
    <PlaylistProvider>
      <WatchlistProvider>
        <App />
      </WatchlistProvider>
    </PlaylistProvider>
  </BrowserRouter>
)
