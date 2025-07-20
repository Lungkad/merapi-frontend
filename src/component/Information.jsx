import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MapPin, Play, Eye, AlertTriangle, Shield, Book, Calendar, Clock, Users, Phone, X, FileText } from "lucide-react";
import logo from "../assets/logo.png"; 
import StatusIndicator from "./StatusIndicator";

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

const infoItems = [
  {
    number: "1",
    title: "Panduan Mitigasi",
    desc: "Pelajari langkah-langkah mitigasi saat menghadapi erupsi Merapi.",
    icon: <Book className="w-8 h-8 text-blue-500" />,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    features: ["Checklist Darurat", "Buku Saku", "Kit Survival"],
    redirectUrl: "https://shorturl.at/29eNP"
  },
  {
    number: "2",
    title: "Peta Merapi",
    desc: "Temukan peta yang berkaitan dengan Gunung Merapi.",
    icon: <MapPin className="w-8 h-8 text-red-500" />,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    features: ["Jalur Evakuasi", "KRB", "Shelter Darurat"],
    redirectUrl: "https://shorturl.at/yQX7E"
  },
  {
    number: "3",
    title: "Infografis",
    desc: "Lihat visual edukatif untuk memahami risiko dan tindakan darurat.",
    icon: <Play className="w-8 h-8 text-green-500" />,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    features: ["Edukasi", "Infografis", "Visual"],
    redirectUrl: "https://shorturl.at/hRHSE" 
  },
];

const Information = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleScroll = () => {
      // setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
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
  
  const categories = ["Semua", ...new Set(faqs.map(faq => faq.category))];
  const filteredFaqs = selectedCategory === "Semua" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleRedirect = (url) => {
    window.location.href = url;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen">
      <StatusIndicator />
      {/* Navigation */}
      <div className="fixed top-0 left-0 w-full z-20 bg-black/80 bg-opacity-50 backdrop-blur-md border-b border-red-500/20">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-6 h-9" />
            </div>
            <span className="text-white font-bold text-xl">SiagaMerapi</span>
          </div>

          <nav className="hidden md:flex gap-8 text-white font-medium">
            <a href="/" className="hover:text-red-400 transition-colors">
              Home
            </a>
            <a
              href="/merapiintro" className="hover:text-red-400 transition-colors"
            >
              Introduction
            </a>
            <a href="/mapsbarak" className="hover:text-red-400 transition-colors">
              Maps
            </a>
            <a
              href="/information" className="text-red-400 border-b-2 border-red-400"
            >
              Mitigasi
            </a>
            <a href="beritas" className="hover:text-red-400 transition-colors">
              News
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-white text-right text-sm hidden sm:block">
              <div className="font-medium">{date}</div>
              <div className="text-gray-300">{time}</div>
            </div>
            <a
              href="/dashboard"
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
            >
              Login
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-red-500/20 text-red-300 px-6 py-3 rounded-full mb-6 border border-red-500/30">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Informasi Penting Gunung Merapi</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Pusat <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">Informasi</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Temukan panduan lengkap, peta evakuasi, dan jawaban atas pertanyaan umum tentang mitigasi bencana Gunung Merapi
          </p>
          
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Enhanced FAQ Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Book className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">FAQ</h2>
                <p className="text-gray-300">Pertanyaan yang sering diajukan</p>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                    className="w-full p-6 text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {faq.icon}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {faq.question}
                        </h3>
                        <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                      </div>
                    </div>
                    {expandedFaq === index ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                  
                  {expandedFaq === index && (
                    <div className="px-6 pb-6">
                      <div className="bg-white/5 rounded-lg p-4 border-l-4 border-red-500">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Info Items Section */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Layanan Informasi</h2>
              <p className="text-gray-300">Akses berbagai sumber informasi penting</p>
            </div>
            
            {infoItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleRedirect(item.redirectUrl)}
                className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="p-8">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 ${item.bgColor} rounded-2xl flex items-center justify-center relative`}>
                      {item.icon}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {item.number}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-gray-900">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 mb-4 leading-relaxed">{item.desc}</p>
                      
                      <div className="flex gap-2 mb-4">
                        {item.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:text-blue-700">
                        <Eye className="w-4 h-4" />
                        <span>Lihat Detail</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Information;