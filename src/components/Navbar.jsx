import { HelpCircle, LogOut, Search, TextAlignJustify, User2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import UserProfile from "../assets/images/prime-user.png";
import ComboOtt from "../assets/images/combo.png";
import AppleOtt from "../assets/images/at.png";
import Uniflix from "../assets/images/uniflix.svg";
import { MenuIcon } from "../assets/icons";
import Cookies from "js-cookie"
import { toast } from "react-toastify";
// import { useAuth } from "../hooks/useAuth";

export default function Navbar({ setIsOpen, movieDetailsPopupScroll, isOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(window.innerWidth > 768 ? true : false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [ottDropdown, setOttDropdown] = useState(false)
  const menuRef = useRef(null)
  const menuRef2 = useRef(null)
  const menuRef3 = useRef(null)
  const isUser = Cookies.get("vk")
  // const userName = Cookies.get("displayName")
  // const useremil = Cookies.get("email")
  // const { signOut } = useAuth()
  function handleOtt(ott) {
    if (ott === "at") {
      Cookies.set('ott', "at", { expires: 365 });
      toast.info("Apple TV is integrated with Prime Video")
    } else if (ott==="pv") {
      Cookies.set('ott', "pv", { expires: 365 });
    } else if (ott === "nf") {
      Cookies.set('ott', "nf", { expires: 365 });
    } else {
      Cookies.set('ott', "combo", { expires: 365 });
    }
  }

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setIsOpenDropdown(false)
      } else {
        setIsOpenDropdown(true)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [window.innerWidth])
  // dropdown functionality 
  useEffect(() => {
    const handleClickOutside2 = (event) => {
      if (menuRef2.current && !menuRef2.current.contains(event.target)) {
        setUserDropdown(false)
      }
    }
    const handleClickOutside3 = (event) => {
      if (menuRef3.current && !menuRef3.current.contains(event.target)) {
        setOttDropdown(false)
      }
    }
    document.addEventListener("scroll", handleClickOutside3)
    document.addEventListener("scroll", handleClickOutside2)
    document.addEventListener("mousedown", handleClickOutside3)
    document.addEventListener("mousedown", handleClickOutside2)
    return () => {
      document.removeEventListener("scroll", handleClickOutside3)
      document.removeEventListener("scroll", handleClickOutside2)
      document.removeEventListener("mousedown", handleClickOutside3)
      document.removeEventListener("mousedown", handleClickOutside2)
    }
  }, [userDropdown])
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (window.innerWidth < 768) {
          setIsOpenDropdown(false)
        }
      }
    }
    document.addEventListener("scroll", handleClickOutside)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("scroll", handleClickOutside)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpenDropdown])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 70);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <nav className={`fixed left-1/2 -translate-x-1/2 w-full md:px-[23px] 2xl:px-[51px]! md:rounded-b-xl z-5000000 transition-all duration-300 ease-in-out`}>
      <div className={`flex relative items-center justify-between h-[50px] md:h-[60px] 2xl:h-[70px] px-3 xs:px-[21px] md:rounded-b-xl transition-all duration-300 ease-in-out ${isScrolled || movieDetailsPopupScroll ? "nav_bg_leaner2" : "nav_bg_leaner"
        }`}>
        <div ref={menuRef} className="flex items-center xs:gap-17 gap-4">
          <Link to="/home" className="max-md:hidden"><img className="max-lg:w-[90px] lg:w-[100px]" src={Uniflix} alt="logo" /></Link>
          <button onClick={() => setIsOpenDropdown(!isOpenDropdown)} className="md:hidden cursor-pointer"><TextAlignJustify className="max-xs:w-5 max-xs:h-5" /></button>
          {isOpenDropdown && <div div className="flex max-md:flex-col md:items-center text-sm 2xl:text-[16px] font-semibold gap-1 md:gap-[5px] max-md:absolute top-[50px] mt-0.5 max-md:[background:linear-gradient(to_bottom,#191e25cc,#191e25cc)] max-md:w-[150px] max-md:px-3 py-2 max-md:rounded-md max-md:left-3">
            <NavLink onClick={() => {
              if (window.innerWidth < 768) {
                setIsOpenDropdown(false)
              }
            }} to="/home" className="max-md:hover:bg-white md:border-transparent md:border-b md:hover:border-white max-md:hover:text-black transition-all duration-300 max-md:py-2 max-md:px-3 px-3.5 py-2 rounded-sm">
              Home
            </NavLink>
            <NavLink onClick={() => {
              if (window.innerWidth < 768) {
                setIsOpenDropdown(false)
              }
            }} to="/movies" className="max-md:hover:bg-white md:border-transparent md:border-b md:hover:border-white max-md:hover:text-black transition-all duration-300 max-md:py-2 max-md:px-3 px-3.5 py-2 rounded-sm">
              Movies
            </NavLink>
            <NavLink onClick={() => {
              if (window.innerWidth < 768) {
                setIsOpenDropdown(false)
              }
            }} to="/series" className="max-md:hover:bg-white md:border-transparent md:border-b md:hover:border-white max-md:hover:text-black transition-all duration-300 max-md:py-2 max-md:px-3 px-3.5 py-2 rounded-sm">
              TV Shows
            </NavLink>
            <NavLink onClick={() => {
              if (window.innerWidth < 768) {
                setIsOpenDropdown(false)
              }
            }} to="watch-list" className="max-md:hover:bg-white md:border-transparent md:border-b md:hover:border-white max-md:hover:text-black transition-all duration-300 max-md:py-2 max-md:px-3 px-3.5 py-2 rounded-sm">
              Watch list
            </NavLink>
          </div>}
          <Link to="/home" className={`2xl:text-3xl text-2xl max-xs:text-xl md:hidden xs:absolute xs:left-1/2 xs:-translate-x-1/2 ${isUser ? "xs:absolute xs:left-1/2 xs:-translate-x-1/2" : ""}`}><img className="w-[60px] xs:w-[70px]" src={Uniflix} alt="logo" /></Link>
        </div>
        <div className="flex items-center gap-3">
          <button className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-full hover:bg-white hover:text-black transition-all duration-300 ease-in-out ${isOpen ? "bg-white text-black" : "bg-transparent text-white"}`} onClick={() => setIsOpen(prev => !prev)}>{!isOpen ? <Search size={19} /> : <X size={22} />}</button>

          <div ref={menuRef3} className="relative w-7 h-7 lg:w-[33px] lg:h-[33px] max-xs:w-6 max-xs:h-6">
            <button onClick={() => setOttDropdown(!ottDropdown)} className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-full sm:hover:bg-white sm:hover:text-black transition-all duration-300 ease-in-out menu_icon`}><MenuIcon className="w-5 h-5" /></button>
            <div className={`absolute top-10 xs:top-11 md:top-13 md:-right-[21px] nav_bg_leaner2 w-40 xs:w-[550px] right-0 px-1 md:px-4 py-4 rounded-md grid grid-cols-2 gap-3 ${ottDropdown ? "scale-100 opacity-100" : "scale-0 opacity-0"} origin-top transition-all duration-300`}>
              <div onClick={()=>handleOtt("pv")} className="border-2 border-transparent transition-all duration-300 hover:border-white rounded-lg overflow-hidden hover:scale-110 cursor-pointer hover:z-10 relative origin-left">
                <img className="w-[250px] h-[120px] object-cover" src="https://net51.cc/img/ottimg/pv.webp" alt="pv" />
              </div>
              <div onClick={()=>handleOtt("nf")} className="border-2 border-transparent transition-all duration-300 hover:border-white rounded-lg overflow-hidden hover:scale-110 cursor-pointer hover:z-10 relative origin-right">
                <img className="w-[250px] h-[120px] object-cover" src="https://net51.cc/img/ottimg/nf.webp" alt="nf" />
              </div>
              <div onClick={()=>handleOtt("at")} className="border-2 border-transparent transition-all duration-300 hover:border-white rounded-lg overflow-hidden hover:scale-110 cursor-pointer hover:z-10 relative origin-left">
                <img className="w-[250px] h-[120px] object-cover" src={AppleOtt} alt="at" />
              </div>
              <div onClick={()=>handleOtt("combo")} className="border-2 border-transparent transition-all duration-300 hover:border-white rounded-lg overflow-hidden hover:scale-110 cursor-pointer hover:z-10 relative origin-right">
                <img className="w-[250px] h-[120px] object-cover" src={ComboOtt} alt="combo-ott" />
              </div>
            </div>
          </div>

          <div ref={menuRef2} className="relative w-7 h-7 lg:w-[33px] lg:h-[33px] max-xs:w-6 max-xs:h-6">
            <button onClick={() => setUserDropdown(!userDropdown)}><img src={UserProfile} style={{ border: userDropdown ? "2px solid white" : "" }} alt="User Profile" className="w-7 h-7 lg:w-[33px] lg:h-[33px] max-xs:w-6 max-xs:h-6 rounded-full cursor-pointer" /></button>
            {userDropdown && <div className="absolute top-10 xs:top-11 md:top-13 md:-right-[21px] nav_bg_leaner2 w-40 xs:w-50 right-0 px-1 md:px-2 py-2 rounded-md flex flex-col">
              <div className="flex items-center gap-2 xs:gap-3 xs:py-2 px-2 max-xs:mb-3">
                <User2 className="min-w-5 h-5" />
                {/* <p className="text-xs xs:text-sm whitespace-nowrap! overflow-hidden text-ellipsis!">{userName ? userName : useremil}</p> */}
                <p className="text-xs xs:text-sm whitespace-nowrap! overflow-hidden text-ellipsis!">Guest</p>
              </div>
              <button className="max-xs:mb-3 text-sm lg:text-base! flex items-center gap-2 xs:gap-3 xs:py-1 mt-1 cursor-pointer hover:xs:bg-white hover:xs:text-black w-full rounded-sm transition-all duration-300 px-2"><HelpCircle className="w-5 h-5" /> Help center</button>
              <button className="text-sm lg:text-base! flex items-center gap-2 xs:gap-3 xs:py-1 mt-1 cursor-pointer hover:xs:bg-white hover:xs:text-black w-full rounded-sm transition-all duration-300 px-2"><LogOut className="w-5 h-5" /> Log out</button>
            </div>}
          </div>
        </div>
      </div>
    </nav >
  )
}
