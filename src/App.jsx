import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import SearchPopup from "./components/SearchPopup";
import MovieDetailsPopup from "./components/MovieDetailsPopup";
import VideoPlayerPopup from "./components/VideoPlayerPopup";
import { usePlaylist } from "./components/usePlaylist";

// 🔥 Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Movies = lazy(() => import("./pages/Movies"));
const TVShows = lazy(() => import("./pages/TVShows"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Login = lazy(() => import("./authentication/Login"));

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [MovieDetailsPopupScroll, setMovieDetailsPopupScroll] = useState(0);
  const [movieData, setMovieData] = useState(null);
  const { playlist, holePageLoading, setPlaylist } = usePlaylist();
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const movieId = query.get("movieId")
  // useEffect(() => {
  //   const html = document.querySelector("html");
  //   if (isOpen) {
  //     if (window.innerWidth > 600) {
  //       html.classList.add("overflow-hidden");
  //     } else {
  //       document.body.classList.add("overflow-hidden");
  //     }
  //   } else {
  //     if (!movieId && !playlist) {
  //       if (window.innerWidth > 600) {
  //         html.classList.remove("overflow-hidden");
  //       } else {
  //         document.body.classList.remove("overflow-hidden");
  //       }
  //     }
  //   }
  // }, [isOpen]);

  // useEffect(() => {
  //   const html = document.querySelector("html");
  //   if (movieId || playlist) {
  //     if (window.innerWidth > 600) {
  //       html.classList.add("overflow-hidden");
  //     } else {
  //       document.body.classList.add("overflow-hidden");
  //     }
  //   } else {
  //     if (window.innerWidth > 600) {
  //       html.classList.remove("overflow-hidden");
  //     } else {
  //       document.body.classList.remove("overflow-hidden");
  //     }
  //   }
  //   window.scrollTo(0, 0);
  //   if (!movieId) {
  //     setPlaylist(null)
  //     if (window.innerWidth > 600) {
  //       html.classList.remove("overflow-hidden");
  //     } else {
  //       document.body.classList.remove("overflow-hidden");
  //     }
  //   }
  // }, [movieId]);

  return (
    <>
      {holePageLoading && <div className="fixed inset-0 bg-black/50 z-100000">
        <div className="shimmer2 h-1 w-full bg-sky-500"></div>
      </div>}
      {playlist && <VideoPlayerPopup movieData={movieData} />}
      <Navbar setIsOpen={setIsOpen} movieDetailsPopupScroll={MovieDetailsPopupScroll} isOpen={isOpen} />
      <SearchPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
      {movieId && <div className="fixed inset-0 bg-[#00050d]/80 z-5000 flex justify-center items-center pt-20 h-screen overscroll-y-auto overflow-x-hidden">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut alias a quas porro optio amet, quidem id soluta quibusdam numquam, harum quisquam nulla sequi non! Tenetur, saepe, sequi aliquid optio error excepturi nemo ducimus praesentium voluptas enim tempore. Quam fugit dolor explicabo, expedita in tempora minima! Officia quisquam commodi quis qui repudiandae officiis distinctio ipsam, explicabo adipisci, ipsum saepe earum? Hic illo sunt earum mollitia totam sit dolorem quae adipisci libero enim voluptatibus porro voluptatum architecto aspernatur voluptas consequuntur fugiat tempore non nisi reprehenderit nulla nemo, ad blanditiis perspiciatis. Facere molestias fuga ratione quae deserunt modi, praesentium nobis nesciunt, rem exercitationem minus facilis. Ratione quas obcaecati, repudiandae libero ipsum porro dignissimos, nam officiis voluptatibus laudantium nobis vel quos, at doloremque fugiat dolores ut fuga assumenda. Fugit pariatur maxime quod molestias possimus eum vel quia porro dolorum illum, qui assumenda impedit voluptates suscipit neque velit laborum vero voluptate harum incidunt iure earum illo quibusdam. Fugiat vel dolor repudiandae ipsa, consequuntur, aspernatur vero dolorem explicabo asperiores id perferendis eum illum ut hic sapiente alias veniam, soluta quas fugit dolores facere magni iusto. Sit numquam corrupti quisquam nihil ipsum dolore consequuntur enim, velit pariatur quam autem sequi culpa dolores! Magni voluptates ex laboriosam ut cupiditate hic consequuntur harum quo minus provident perspiciatis voluptas ipsa dicta soluta deleniti, culpa exercitationem odio corrupti vel excepturi blanditiis. Eos est adipisci nam officiis praesentium sapiente vitae earum aspernatur dicta distinctio nihil velit cupiditate dolorum in molestias perferendis, cum consectetur asperiores inventore. Ducimus animi sequi, harum accusantium, quidem totam temporibus ullam iusto nemo ex debitis repudiandae reiciendis suscipit atque commodi saepe vitae exercitationem possimus eum. Velit provident totam odio sapiente repellat optio numquam quae libero sed quis! Nihil, eos numquam voluptates tempora iure magnam, cupiditate nostrum corrupti eaque, quod saepe perferendis voluptatibus autem! Quod deserunt quis maxime facilis sunt sapiente corporis, nihil porro nisi delectus quibusdam laboriosam, autem tenetur nemo velit esse eaque animi quidem veniam qui dolore unde perspiciatis, aliquam quasi? Quis magnam aut consectetur dolorum voluptatem porro cum asperiores aspernatur nobis dolore! Laudantium aut incidunt architecto, eius reiciendis facere obcaecati magni quod. Atque rerum sunt temporibus vitae optio architecto, voluptatum incidunt nulla, accusamus magni a aliquam. Ex nihil saepe magnam officiis id dolore. Nisi deserunt magnam possimus ea quidem accusantium officiis error rem iste, blanditiis ab eos accusamus nulla corporis porro incidunt assumenda omnis non animi! Nulla deleniti dolorum vitae aut sed, repudiandae dolor adipisci qui possimus maxime tempora doloribus doloremque fugit fugiat magnam pariatur consequatur voluptas fuga aspernatur deserunt nisi, eius vel! Doloribus minus saepe, voluptatibus perferendis natus cupiditate, aspernatur ab nobis, earum molestias ullam? Fugit, optio, non id perferendis velit sequi nisi repellat at consectetur neque beatae laboriosam dicta commodi labore porro iure ipsa officia, tempore debitis aut nam. Velit rem repudiandae adipisci asperiores ratione ipsam numquam sit maiores dolor possimus vitae sed atque quidem, qui laboriosam quo necessitatibus tenetur similique illum molestias! Dolorem dicta vitae placeat harum quam! Ducimus quis quo ratione possimus. Exercitationem quaerat magnam nobis corporis quasi cupiditate dolore aliquid sunt totam, velit consequuntur illo sapiente nam recusandae dolores voluptates veritatis saepe ullam enim necessitatibus adipisci! Suscipit aut enim deleniti praesentium ipsa consectetur eius iste, tempore nemo pariatur expedita delectus, tenetur neque unde labore consequuntur quia nihil fugiat ab ut! Officiis corporis sit repellat minima placeat atque qui, illum aspernatur iure doloribus quod veritatis cupiditate fugiat tempora excepturi quisquam, reiciendis blanditiis. Officiis aperiam, aut minus soluta vero incidunt placeat iure eos cumque quaerat est explicabo dolore? Cumque sed aut sit in doloribus, nobis pariatur voluptatibus voluptatum aperiam fuga eius saepe, delectus harum maxime cupiditate? Iste doloremque cumque nesciunt accusamus quod, neque a placeat nobis adipisci nostrum hic temporibus aliquam totam iusto similique perferendis qui laboriosam ea ab culpa! Maiores aut molestias blanditiis atque eum eos quas natus ea sunt ut quaerat odit quos a architecto nostrum perferendis tempora veniam ipsum labore, mollitia aperiam? Vitae non rerum similique! Iste corrupti rem aut tempora aliquid vel incidunt voluptates dicta. Officia laboriosam ipsam accusamus. Eveniet porro ducimus pariatur corporis exercitationem ullam molestiae impedit aut commodi, ratione optio facere reprehenderit sapiente perspiciatis laudantium atque laboriosam natus, minima provident enim modi labore illo nihil! Amet maiores voluptatem, mollitia distinctio quae quod ipsam quaerat deserunt temporibus provident? At itaque debitis ullam quisquam nostrum deserunt, mollitia necessitatibus atque perferendis et iste nisi nesciunt sed, quia tempore magnam adipisci, nam cumque recusandae vero. Hic reprehenderit ipsa, debitis assumenda excepturi rerum repellat, ex saepe iste beatae unde neque, tenetur inventore esse deserunt aperiam praesentium laudantium ut! Eveniet impedit eius consequatur, vitae reprehenderit, fugiat qui, dicta beatae quae quaerat assumenda laudantium excepturi omnis? Molestias, ex! Doloribus est harum numquam quisquam, laboriosam quam consequuntur, recusandae, dicta iusto saepe quis blanditiis molestiae vitae itaque reprehenderit? Fugiat, dolores iusto. Fugit fugiat facere eaque dignissimos eligendi, vel praesentium ipsum incidunt in rerum architecto quod maxime similique et, voluptate cumque aliquid. Beatae, rem officiis atque excepturi sequi obcaecati alias itaque sapiente aliquid? Iste assumenda a ratione perferendis dolore illo repudiandae exercitationem laborum architecto! Aliquid ad cumque voluptas accusamus, ab vitae modi repudiandae corrupti! Aliquid ad error similique, accusantium unde modi totam officiis temporibus tempora nostrum doloremque, ullam magni deleniti laudantium accusamus eum rem. Esse eaque nemo repellendus libero, corporis assumenda sint, laudantium alias quidem quas eius beatae itaque praesentium accusantium non magni aperiam, deleniti dolor ab eum. Quisquam esse, officiis commodi est ut doloribus ad nisi aperiam excepturi repudiandae, quod, rerum corrupti sunt earum. Pariatur atque officiis nisi, harum earum suscipit laudantium cumque impedit fugit optio corrupti, molestiae perferendis doloribus nesciunt nam voluptatum quam odio quidem laboriosam sed ducimus? Rerum molestias aperiam vitae quia, minima consequuntur qui molestiae nesciunt tempore amet dicta sint, asperiores incidunt quaerat assumenda dolorem. Omnis recusandae incidunt consectetur vitae magni vel neque aut laborum? Molestiae aspernatur optio quas! Reiciendis voluptate deleniti doloribus ratione sunt rerum quisquam nihil aliquam architecto beatae laboriosam et recusandae iure esse amet expedita debitis, voluptatem fuga iste quaerat eius odit tenetur! Incidunt quaerat perferendis quisquam accusamus cumque natus ducimus labore eveniet. Illo, numquam quas ipsum facilis recusandae accusantium.
      </div>}
      <Suspense
        fallback={
          <div className="flex justify-center items-end h-[50vh]">
            <div className="w-10 md:w-14 h-10 md:h-14 border-5 border-t-black border-white rounded-full animate-spin"></div>
          </div>
        }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<TVShows />} />
          <Route path="/watch-list" element={<Watchlist />} />

          {/* Invalid route → redirect to /home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense >
    </>
  );
}

export default App;
