import { Search, TextAlignJustify } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import UserProfile from "../assets/images/prime-user.png";
import { MenuIcon } from "../assets/icons";

export default function Navbar({ setIsOpen, movieDetailsPopupScroll, isOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(window.innerWidth > 768 ? true : false)
  const menuRef = useRef(null)
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
    <nav className={`fixed left-1/2 -translate-x-1/2 w-full md:px-[23px] 2xl:px-[51px]! md:rounded-b-xl z-5000 transition-all duration-300 ease-in-out`}>
      <div className={`flex relative items-center justify-between h-[50px] md:h-[60px] 2xl:h-[70px] px-3 xs:px-[21px] md:rounded-b-xl transition-all duration-300 ease-in-out ${isScrolled || movieDetailsPopupScroll ? "nav_bg_leaner2" : "nav_bg_leaner"
        }`}>
        <div ref={menuRef} className="flex items-center xs:gap-17 gap-4">
          <Link to="/home" className="2xl:text-3xl text-2xl max-md:hidden">UniFlix</Link>
          <button onClick={() => setIsOpenDropdown(!isOpenDropdown)} className="md:hidden cursor-pointer"><TextAlignJustify className="max-xs:w-5 max-xs:h-5" /></button>
          {isOpenDropdown && <div className="flex max-md:flex-col md:items-center text-sm 2xl:text-[16px] font-semibold gap-1 md:gap-[5px] max-md:absolute top-[50px] mt-0.5 max-md:[background:linear-gradient(to_bottom,#191e25cc,#191e25cc)] max-md:w-[150px] max-md:px-3 py-2 max-md:rounded-md max-md:left-3">
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
              Movie
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
          <Link to="/home" className="2xl:text-3xl text-2xl max-xs:text-xl md:hidden xs:absolute xs:left-1/2 xs:-translate-x-1/2">UniFlix</Link>
        </div>
        <div className="flex items-center gap-3">
          <button className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-full hover:bg-white hover:text-black transition-all duration-300 ease-in-out ${isOpen ? "bg-white text-black" : "bg-transparent text-white"}`} onClick={() => setIsOpen(true)}><Search size={19} /></button>
          <button className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-full hover:bg-white hover:text-black transition-all duration-300 ease-in-out menu_icon`} onClick={() => setIsOpen(true)}><MenuIcon className="w-5 h-5" /></button>
          <button><img src={UserProfile} alt="User Profile" className="w-[28px] h-[28px] lg:w-[33px] lg:h-[33px] max-xs:w-6 max-xs:h-6 rounded-full" /></button>
        </div>
      </div>
    </nav>
  )
}
