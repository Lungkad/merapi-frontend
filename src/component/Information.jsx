import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MapPin, Play, Eye, AlertTriangle, Shield, Book, Clock,  Phone, X, FileText, Download, Menu } from "lucide-react";
import logo from "../assets/logo.png";
import StatusIndicator from "./StatusIndicator"; 
import { redirect } from "react-router-dom";

const faqs = [
  {
    question: "Apa yang harus dilakukan saat status Merapi Siaga?",
    answer:
      "Siapkan tas darurat, periksa rute evakuasi, dan ikuti perkembangan informasi dari BPPTKG atau BNPB.",
    icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
    category: "Darurat"
  },
  {
    question: "Bagaimana cara mengetahui zona bahaya Merapi?",
    answer:
      "Zona bahaya biasanya diumumkan oleh BPPTKG dan dapat dilihat melalui peta evakuasi resmi.",
    icon: <MapPin className="w-5 h-5 text-red-500" />,
    category: "Zona Bahaya"
  },
  {
    question: "Apakah hewan peliharaan perlu dievakuasi juga?",
    answer:
      "Jika memungkinkan, bawa hewan peliharaan saat evakuasi. Jika tidak, lepaskan agar bisa menyelamatkan diri.",
    icon: <Shield className="w-5 h-5 text-blue-500" />,
    category: "Evakuasi"
  },
  {
    question: "Berapa lama waktu evakuasi yang diperlukan?",
    answer:
      "Waktu evakuasi bervariasi tergantung lokasi dan kondisi jalan. Biasanya 30 menit hingga 2 jam untuk mencapai zona aman.",
    icon: <Clock className="w-5 h-5 text-green-500" />,
    category: "Waktu"
  },
  {
    question: "Siapa yang harus dihubungi saat darurat?",
    answer:
      "Hubungi 112 untuk darurat, atau BPBD setempat. Pantau juga pengumuman dari speaker masjid atau RT/RW.",
    icon: <Phone className="w-5 h-5 text-purple-500" />,
    category: "Kontak"
  }
];

// Data untuk kategori Panduan Mitigasi
const mitigationDocs = [
  {
    id: 1,
    title: "Panduan Mitigasi Bencana Gunung Merapi",
    description: "Panduan lengkap untuk persiapan dan tindakan darurat",
    filename: "panduan-mitigasi-merapi.pdf",
    size: "10.2 MB",
    pages: 94,
    category: "Panduan Utama",
    redirectURL: "https://drive.google.com/file/d/1Q0__v0MQANRAxvoYh2aIuf_UbxMzli2a/view?usp=drive_link"
  },
  {
    id: 2,
    title: "Pengenalan Gunung Api",
    description: "Mengenal lebih jauh tentang gunung api dan aktivitasnya",
    filename: "pengenalan_gunung_api.pdf",
    size: "630 KB",
    pages: 12,
    category: "Pengenalan",
    redirectURL: "https://drive.google.com/file/d/17UTMPfWFIs6-vE3ZTAQLPLARYTcqoRaR/view?usp=drive_link"
  },
];

// Data untuk kategori Peta Merapi
const mapDocs = [
  {
    id: 1,
    title: "Peta Erupsi Gunung Merapi",
    description: "Peta zona bahaya dan tingkat risiko area Merapi",
    filename: "peta-erupsi-merapi.jpeg",
    size: "541 KB",
    pages: 1,
    category: "Erupsi",
    mapType: "Bahaya Letusan",
    redirectURL: "https://drive.google.com/file/d/15-4LHyrgy7npF6Hrya5jHOIwzPM6VeRm/view?usp=drive_link"
  },
  {
    id: 2,
    title: "Peta Jalur Evakuasi Sleman",
    description: "Jalur evakuasi resmi untuk wilayah Kabupaten Sleman",
    filename: "jalur-evakuasi-sleman.pdf",
    size: "3.1 MB",
    pages: 1,
    category: "Evakuasi",
    mapType: "Jalur",
    redirectURL: "https://drive.google.com/file/d/1rSHhuFJXKNtop6YmVacGTSmW9cVpghUI/view?usp=drive_link"
  },
];

// Data untuk kategori Infografis
const infographicDocs = [
  {
    id: 1,
    title: "Tanda-tanda Erupsi Merapi",
    description: "Infografis visual tentang gejala-gejala sebelum erupsi",
    filename: "tanda-erupsi-merapi.png",
    size: "1.2 MB",
    type: "Infografis",
    category: "Gejala Erupsi",
    format: "JPG",
    redirectURL: "https://drive.google.com/file/d/1OMfUxU8HTAwtNi0tCSCzC-mhNEcvRTFZ/view?usp=drive_link"
  },
  {
    id: 2,
    title: "Isi Tas Darurat Ideal",
    description: "Visual checklist barang-barang penting untuk tas darurat",
    filename: "isi-tas-darurat.png",
    size: "1.5 MB",
    type: "Infografis",
    category: "Persiapan",
    format: "JPG",
    redirectURL: "https://drive.google.com/file/d/1VlOMhYR5gMAtWX4JhO775YiBfRXmfALp/view?usp=drive_link"
  },
  {
    id: 3,
    title: "Level Status Gunung Merapi",
    description: "Penjelasan visual tingkatan status aktivitas Merapi",
    filename: "level-status-merapi.jpg",
    size: "750 KB",
    type: "Infografis",
    category: "Status",
    format: "JPEG",
    redirectURL: "https://drive.google.com/file/d/1w2Lec319ziiYIR-Nw4blgzedVYrLJXNM/view?usp=drive_link"
  },
  {
    id: 4,
    title: "Nomor Darurat Penting",
    description: "Infografis berisi kontak darurat dan hotline penting",
    filename: "nomor-darurat.png",
    size: "680 KB",
    type: "Infografis",
    category: "Kontak",
    format: "JPEG",
    redirectURL: "https://drive.google.com/file/d/1u6b_SVmO2FCyUQyc3mC9J4hBpVfAv82Z/view?usp=drive_link"
  },
  {
    id: 5,
    title: "Video Simulasi Evakuasi",
    description: "Video edukasi simulasi evakuasi dalam format infografis",
    filename: "simulasi-evakuasi.mp4",
    size: "25.3 MB",
    type: "Video",
    category: "Simulasi",
    format: "MP4",
    duration: "5:13",
    redirectURL: "https://www.youtube.com/watch?v=aIxvmNAEhZU&ab_channel=HUMASBNPB"
  }
];

const infoItems = [
  {
    number: "1",
    title: "Panduan Mitigasi",
    desc: "Pelajari langkah-langkah mitigasi saat menghadapi erupsi Merapi.",
    icon: <Book className="w-8 h-8 text-blue-500" />,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    features: ["Checklist Darurat", "Persiapan Keluarga", "Kit Survival"],
    action: "mitigation"
  },
  {
    number: "2",
    title: "Peta Merapi",
    desc: "Temukan peta yang berkaitan dengan Gunung Merapi.",
    icon: <MapPin className="w-8 h-8 text-red-500" />,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    features: ["Jalur Evakuasi", "KRB", "Shelter Darurat"],
    action: "maps"
  },
  {
    number: "3",
    title: "Infografis",
    desc: "Lihat visual edukatif untuk memahami risiko dan tindakan darurat.",
    icon: <Play className="w-8 h-8 text-green-500" />,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    features: ["Edukasi", "Infografis", "Visual"],
    action: "infographics"
  },
];

const Information = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showInfographicModal, setShowInfographicModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleScroll = () => {
      //setIsScrolled(window.scrollY > 50);
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showPdfModal || showMapModal || showInfographicModal || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPdfModal, showMapModal, showInfographicModal, isMobileMenuOpen]);

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
  
  const categories = ["Semua", ...new Set(faqs.map(faq => faq.category))];
  const filteredFaqs = selectedCategory === "Semua" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleInfoItemClick = (action) => {
    if (action === "mitigation") {
      setShowPdfModal(true);
    } else if (action === "maps") {
      setShowMapModal(true);
    } else if (action === "infographics") {
      setShowInfographicModal(true);
    }
  };

  const handleRedirect = (url) => {
    window.location.href = url;
  };

  const handlePdfDownload = (filename) => {
    const link = document.createElement('a');
    link.href = `/assets/pdf/${filename}`;
    link.download = filename;
    link.click();
  };

  const handleMapDownload = (filename) => {
    const link = document.createElement('a');
    link.href = `/assets/maps/${filename}`;
    link.download = filename;
    link.click();
  };

  const handleInfographicDownload = (filename) => {
    const link = document.createElement('a');
    link.href = `/assets/infographics/${filename}`;
    link.download = filename;
    link.click();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen">
      <StatusIndicator />
      {/* Navigation */}
      <div className="fixed top-0 left-0 w-full z-20 bg-black/80 bg-opacity-50 backdrop-blur-md border-b border-red-500/20">
        <div className="flex justify-between items-center px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-5 h-7 sm:w-6 sm:h-9" />
            </div>
            <span className="text-white font-bold text-lg sm:text-xl">SiagaMerapi</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 xl:gap-8 text-white font-medium">
            <a href="/" className="hover:text-red-400 transition-colors pb-1">
              Beranda
            </a>
            <a href="/merapiintro" className="hover:text-red-400 transition-colors pb-1">
              Tentang
            </a>
            <a href="/mapsbarak" className="hover:text-red-400 transition-colors pb-1">
              Peta
            </a>
            <a href="/information" className="text-red-400 border-b-2 border-red-400 pb-1">
              Mitigasi
            </a>
            <a href="/berita" className="hover:text-red-400 transition-colors pb-1">
              Berita
            </a>
          </nav>

          {/* Right Section - Time & Login */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Time Display - Hidden on mobile */}
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
              className="block text-red-400 font-medium py-3 px-4 rounded-lg bg-red-400/10"
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

      {/* Hero Section - Mobile optimized */}
      <div className="pt-24 sm:pt-32 pb-8 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-red-500/20 text-red-300 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-red-500/30 text-sm sm:text-base">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold">Informasi Penting Gunung Merapi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Pusat <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">Informasi</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            Temukan panduan lengkap, peta evakuasi, dan jawaban atas pertanyaan umum tentang mitigasi bencana Gunung Merapi
          </p>
        </div>
      </div>

      {/* Main Content - Mobile optimized layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
          {/* FAQ Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Book className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">FAQ</h2>
                <p className="text-gray-300 text-sm sm:text-base">Pertanyaan yang sering diajukan</p>
              </div>
            </div>

            {/* Category Filter - Mobile optimized */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all hover:bg-white/10"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 sm:p-6 text-left flex items-center justify-between"
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-1 sm:mt-0">
                        {faq.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-1 leading-tight">
                          {faq.question}
                        </h3>
                        <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {expandedFaq === index ? 
                        <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      }
                    </div>
                  </button>
                  
                  {expandedFaq === index && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="bg-white/5 rounded-lg p-3 sm:p-4 border-l-4 border-red-500">
                        <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Items Section - Mobile optimized */}
          <div className="space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Layanan Informasi</h2>
              <p className="text-gray-300 text-sm sm:text-base">Akses berbagai sumber informasi penting</p>
            </div>
            
            {infoItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInfoItemClick(item.action)}
                className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 ${item.bgColor} rounded-2xl flex items-center justify-center relative flex-shrink-0`}>
                      <div className="scale-75 sm:scale-100">
                        {item.icon}
                      </div>
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                        {item.number}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 group-hover:text-gray-900">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">{item.desc}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                        {item.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:text-blue-700">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm sm:text-base">Lihat Detail</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal untuk Panduan Mitigasi (PDF) - Mobile optimized */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Dokumen Panduan Mitigasi</h3>
                <p className="text-gray-600 text-sm sm:text-base">Pilih dokumen yang ingin Anda lihat</p>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto" style={{height: 'calc(100% - 100px)'}}>
              <div className="grid gap-4 sm:grid-cols-2">
                {mitigationDocs.map((doc) => (
                  <div key={doc.id} className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{doc.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">{doc.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 mb-4">
                          <span>{doc.pages} halaman</span>
                          <span>{doc.size}</span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{doc.category}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleRedirect(doc.redirectURL)}
                            className="flex items-center gap-2 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            {isMobile ? 'Buka' : 'Lihat'}
                          </button>
                          <button
                            onClick={() => handlePdfDownload(doc.filename)}
                            className="flex items-center gap-2 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal untuk Peta Merapi - Mobile optimized */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-5xl h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Peta Gunung Merapi</h3>
                <p className="text-gray-600 text-sm sm:text-base">Koleksi peta dan jalur evakuasi Gunung Merapi</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto" style={{height: 'calc(100% - 100px)'}}>
              <div className="grid gap-4 sm:grid-cols-2">
                {mapDocs.map((map) => (
                  <div key={map.id} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-red-200 hover:border-red-300 transition-colors">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{map.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">{map.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 mb-4">
                          <span>{map.pages} halaman</span>
                          <span>{map.size}</span>
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">{map.category}</span>
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">{map.mapType}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleRedirect(map.redirectURL)}
                            className="flex items-center gap-2 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            {isMobile ? 'Buka' : 'Lihat'}
                          </button>
                          <button
                            onClick={() => handleMapDownload(map.filename)}
                            className="flex items-center gap-2 bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal untuk Infografis - Mobile optimized */}
      {showInfographicModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-5xl h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Infografis Edukasi Merapi</h3>
                <p className="text-gray-600 text-sm sm:text-base">Visual edukatif untuk memahami risiko dan tindakan darurat</p>
              </div>
              <button
                onClick={() => setShowInfographicModal(false)}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto" style={{height: 'calc(100% - 100px)'}}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {infographicDocs.map((item) => (
                  <div key={item.id} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-green-200 hover:border-green-300 transition-colors">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.type === 'Video' ? (
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          ) : (
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded font-medium">
                            {item.type}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-1 sm:gap-2 text-xs text-gray-500 mb-4">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{item.category}</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{item.format}</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{item.size}</span>
                          {item.duration && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">⏱️ {item.duration}</span>}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRedirect(item.redirectURL)}
                            className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-600 transition-colors flex-1 justify-center"
                          >
                            {item.type === 'Video' ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            {item.type === 'Video' ? 'Putar' : 'Lihat'}
                          </button>
                          <button
                            onClick={() => handleInfographicDownload(item.filename)}
                            className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Information;