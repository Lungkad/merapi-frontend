import React, { useState, useEffect } from "react";
import {
  MapPin,
  ShieldPlus,
  Newspaper,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusIndicator from "./StatusIndicator";
import logo from "../assets/logo.png";

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleScroll = () => {
      //setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const formatTime = (date) => {
    return {
      date: date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time:
        date.toLocaleTimeString("id-ID", {
          hour12: false,
          timeZone: "Asia/Jakarta",
        }) + " WIB",
    };
  };

  const { date, time } = formatTime(currentTime);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (href) => {
    setIsMobileMenuOpen(false);
    
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <StatusIndicator />
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/11733123/pexels-photo-11733123.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
      </div>

      {/* Navigation */}
      <div className="fixed top-0 left-0 w-full z-20 bg-black/80 bg-opacity-50 backdrop-blur-md border-b border-red-500/20">
        <div className="flex justify-between items-center px-4 sm:px-6 py-4">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-5 h-7 sm:w-6 sm:h-9" />
            </div>
            <span className="text-white font-bold text-lg sm:text-xl">SiagaMerapi</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 xl:gap-8 text-white font-medium">
            <a href="/" className="text-red-400 border-b-2 border-red-400 pb-1">
              Beranda
            </a>
            <a href="/merapiintro" className="hover:text-red-400 transition-colors pb-1">
              Tentang
            </a>
            <a href="/mapsbarak" className="hover:text-red-400 transition-colors pb-1">
              Peta
            </a>
            <a href="/information" className="hover:text-red-400 transition-colors pb-1">
              Mitigasi
            </a>
            <a href="/berita" className="hover:text-red-400 transition-colors pb-1">
              Berita
            </a>
          </nav>

          {/* Right Section - Time & Login */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Time Display - Hidden on very small screens */}
            <div className="text-white text-right text-xs sm:text-sm hidden md:block">
              <div className="font-medium">{date}</div>
              <div className="text-gray-300">{time}</div>
            </div>
            
            {/* Login Button */}
            <a
              href="/dashboard"
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
            >
              Login
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="px-4 pb-4 space-y-2 bg-black/60 backdrop-blur-sm border-t border-white/10">
            {/* Time Display for Mobile */}
            <div className="md:hidden text-white text-center text-sm py-3 border-b border-white/10">
              <div className="font-medium">{date}</div>
              <div className="text-gray-300">{time}</div>
            </div>
            
            <a 
              href="/" 
              onClick={() => handleNavClick("/")}
              className="block text-red-400 font-medium py-3 px-4 rounded-lg bg-red-400/10"
            >
              Beranda
            </a>
            <a 
              href="/merapiintro" 
              onClick={() => handleNavClick("/merapiintro")}
              className="block text-white font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              Tentang
            </a>
            <a 
              href="/mapsbarak" 
              onClick={() => handleNavClick("/mapsbarak")}
              className="block text-white font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              Peta
            </a>
            <a 
              href="/information" 
              onClick={() => handleNavClick("/information")}
              className="block text-white font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              Mitigasi
            </a>
            <a 
              href="/berita" 
              onClick={() => handleNavClick("/berita")}
              className="block text-white font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              Berita
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative mt-24 z-10 flex flex-col justify-center min-h-screen px-8 md:px-24 text-white">
        <div className="max-w-4xl">
          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
              Siaga
            </span>
            <br />
            <span className="text-white drop-shadow-2xl">Merapi</span>
          </h1>

          {/* Description */}
          <p className="max-w-3xl text-lg md:text-xl font-light leading-relaxed mb-8 text-gray-200">
            Website ini merupakan sistem WebGIS interaktif yang dirancang untuk
            membantu masyarakat dan pemerintah daerah dalam memahami zona rawan
            bencana vulkanik Gunung Merapi serta merencanakan langkah mitigasi
            yang tepat.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all">
              <MapPin className="w-6 h-6 text-orange-400 mb-2" />
              <h3 className="font-semibold mb-1">Peta Interaktif</h3>
              <p className="text-sm text-gray-300">
                Data spasial terkait Gunung Merapi
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all">
              <ShieldPlus className="w-6 h-6 text-orange-400 mb-2" />
              <h3 className="font-semibold mb-1">Informasi Mitigasi</h3>
              <p className="text-sm text-gray-300">Informasi terkait mitigasi bencana</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all">
              <Newspaper className="w-6 h-6 text-orange-400 mb-2" />
              <h3 className="font-semibold mb-1">Informasi Berita</h3>
              <p className="text-sm text-gray-300">
                Berita terkait dengan Gunung Merapi
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate("/maps")} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200">
              Mulai Eksplorasi
            </button>
            <button onClick={() => navigate("/merapiintro")} className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
      </div>
      {/* Image attribution */}
      <div className="absolute bottom-4 left-4 text-xs text-white/70 z-10 bg-black/30 backdrop-blur-sm px-3 py-1 rounded">
      
        Photo by Kelly ·{" "}
        <a
          className="underline hover:text-white transition-colors"
          href="https://www.pexels.com/photo/aerial-view-of-the-mountain-volcano-11733123/"
          target="_blank"
          rel="noopener noreferrer"
        >
          source
        </a>
      </div>
    </div>
  );
};

export default Home;
