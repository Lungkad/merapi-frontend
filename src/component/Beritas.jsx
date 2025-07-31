import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  Search,
  Zap,
  Menu,
  X,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { beritaAPI } from "../services/api";
import logo from "../assets/logo.png";
import StatusIndicator from "./StatusIndicator";

const Beritas = () => {
  const [beritas, setBeritas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const beritasPerPage = 3;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    fetchBeritas();
  }, []);

  const fetchBeritas = async () => {
    try {
      const response = await beritaAPI.getAll();
      setBeritas(response.data.data); // asumsi response data mengikuti struktur Form 2
    } catch (error) {
      console.error("Gagal mengambil data berita:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBeritas = beritas.filter(
    (berita) =>
      berita.judul_berita.toLowerCase().includes(searchTerm.toLowerCase()) ||
      berita.ringkasan_berita.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBeritas.length / beritasPerPage);
  const startIndex = (currentPage - 1) * beritasPerPage;
  const currentBeritas = filteredBeritas.slice(
    startIndex,
    startIndex + beritasPerPage
  );

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Memuat berita terkini...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen">
      <StatusIndicator />
      {/* Navigatiom */}
      <div className="fixed top-0 left-0 w-full z-20 bg-black/80 backdrop-blur-md border-b border-red-500/20">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-6 h-9" />
            </div>
            <span className="text-white font-bold text-xl">SiagaMerapi</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 xl:gap-8 text-white font-medium">
            <a href="/" className="hover:text-red-400 transition-colors pb-1">
              Beranda
            </a>
            <a
              href="/merapiintro"
              className="hover:text-red-400 transition-colors pb-1"
            >
              Tentang
            </a>
            <a
              href="/mapsbarak"
              className="hover:text-red-400 transition-colors pb-1"
            >
              Peta
            </a>
            <a
              href="/information"
              className="hover:text-red-400 transition-colors pb-1"
            >
              Mitigasi
            </a>
            <a
              href="/berita"
              className="text-red-400 border-b-2 border-red-400 pb-1"
            >
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
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <nav className="px-4 pb-4 space-y-2 bg-black/60 backdrop-blur-sm border-t border-white/10">
            {/* Time Display for Mobile */}
            <div className="md:hidden text-white text-center text-sm py-3 border-b border-white/10">
              <div className="font-medium">{date}</div>
              <div className="text-gray-300">{time}</div>
            </div>

            <a
              href="/"
              onClick={() => handleNavClick("/")}
              className="block text-white font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
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
              className="block text-red-400 font-medium py-3 px-4 rounded-lg bg-red-400/10"
            >
              Berita
            </a>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="pt-24 pb-12 px-6 md:px-20">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Berita Terkini
            </h1>
            <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-6">
            Gunung Merapi
          </h2>

          <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-8">
            Pantau perkembangan terkini aktivitas Gunung Merapi dan informasi
            penting untuk keselamatan masyarakat sekitar.
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
            {/* <button
              onClick={() => setFilterActive(!filterActive)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all font-medium ${
                filterActive
                  ? "bg-red-500 text-white"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button> */}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mb-12">
          {currentBeritas.map((item, index) => (
            <div
              key={item.id}
              className="group bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:scale-105 hover:border-red-500/30"
            >
              {/* Image Section */}
              <div className="relative overflow-hidden">
                <img
                  src={item.gambar_berita}
                  alt={item.judul_berita}
                  className="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    Breaking
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col h-64">
                <h3 className="text-xl font-bold text-white leading-tight mb-3 group-hover:text-red-400 transition-colors line-clamp-2">
                  {item.judul_berita}
                </h3>

                <p className="text-gray-300 text-sm mb-4 flex-1 line-clamp-3">
                  {item.ringkasan_berita.length > 150
                    ? item.ringkasan_berita.slice(0, 150) + "...."
                    : item.ringkasan_berita}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-400 text-xs space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.waktu_upload)}</span>
                    </div>
                  </div>

                  <a
                    href={item.url_berita}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-red-400 hover:text-red-300 font-medium text-sm group/link transition-colors"
                  >
                    <span>Baca Selengkapnya</span>
                    <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center space-x-1 px-4 py-2 bg-gray-800/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-red-500 text-white"
                        : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-1 px-4 py-2 bg-gray-800/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {filteredBeritas.length}
            </div>
            <div className="text-gray-300">Total Berita</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {currentPage}
            </div>
            <div className="text-gray-300">Halaman Saat Ini</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {totalPages}
            </div>
            <div className="text-gray-300">Total Halaman</div>
          </div>
        </div>

        {/* No Results */}
        {filteredBeritas.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Tidak ada berita ditemukan
            </h3>
            <p className="text-gray-500">
              Coba gunakan kata kunci yang berbeda
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Beritas;
