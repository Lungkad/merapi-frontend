import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import StatusIndicator from "./StatusIndicator";

const MerapiIntro = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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

  // Data untuk timeline sejarah
  const historyData = [
    { year: "1672", event: "Salah satu letusan terbesar dalam sejarah Merapi, diperkirakan menyebabkan sekitar 3.000 korban jiwa" },
    { year: "1872", event: "Letusan besar pada abad ke-19 dengan VEI 4, menghasilkan awan panas yang mencapai hingga 20 km dari puncak." },
    { year: "1930", event: "Letusan terbesar pada abad ke-20, menewaskan 1.369 orang dan menghancurkan hektaran lahan pertanian serta pemukiman" },
    { year: "1961", event: "Letusan eksplosif yang menyebabkan hujan abu besar, membuat wilayah Sleman gelap gulita selama beberapa hari." },
    { year: "2006", event: "Letusan signifikan dengan VEI 3, menghasilkan aliran piroklastik yang merusak kawasan Kaliadem dan menewaskan 2 relawan" },
    { year: "2010", event: "Letusan terbesar dalam 100 tahun terakhir dengan VEI 4, menewaskan 353–386 orang" }
  ];

  // Data zona bahaya
  const dangerZones = [
    {
      zone: "Zona I (Radius 3 km)",
      level: "Sangat Berbahaya",
      color: "bg-red-500",
      description: "Area terlarang permanen, rawan awan panas dan lava"
    },
    {
      zone: "Zona II (Radius 3-7 km)",
      level: "Berbahaya",
      color: "bg-orange-500",
      description: "Area hunian terbatas, siaga evakuasi saat erupsi"
    },
    {
      zone: "Zona III (Radius 7-15 km)",
      level: "Waspada",
      color: "bg-yellow-500",
      description: "Area relatif aman, perlu waspada saat erupsi besar"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen">
      <StatusIndicator />
      {/* Fixed Navigation - Tetap tidak berubah */}
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
              Beranda
            </a>
            <a href="/merapiintro" className="text-red-400 border-b-2 border-red-400 ">
              Tentang
            </a>
            <a href="/mapsbarak" className="hover:text-red-400 transition-colors">
              Peta
            </a>
            <a href="/information"  className="hover:text-red-400 transition-colors">
              Mitigasi
            </a>
            <a href="/berita" className="hover:text-red-400 transition-colors">
              Berita
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

      {/* Konten Utama */}
      <div className="pt-28">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-orange-900/20"></div>
          <div className="relative text-center py-20 px-4">
            <div className="mb-8">
              <div className="inline-block p-4 bg-red-500/20 rounded-full mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌋</span>
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-6">
              Gunung Merapi
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              Penjaga Yogyakarta yang Megah dan Menakjubkan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => (window.location.href = "#fakta")} className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg hover:scale-105 transition-all shadow-lg">
                Jelajahi Sejarah
              </button>
              <button onClick={() => navigate("/mapsbarak")} className="px-8 py-4 border-2 border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all">
                Lihat Peta Interaktif
              </button>
            </div>
          </div>
        </div>

        {/* Fakta Singkat */}
        <div id="fakta" className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2  className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              Fakta Menarik Gunung Merapi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-2xl text-center">
                <div className="text-4xl font-bold text-white mb-2">2.968m</div>
                <div className="text-white/90">Ketinggian</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-6 rounded-2xl text-center">
                <div className="text-4xl font-bold text-white mb-2">~5 Tahun</div>
                <div className="text-white/90">Siklus Erupsi</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-red-500 p-6 rounded-2xl text-center">
                <div className="text-4xl font-bold text-white mb-2">200K+</div>
                <div className="text-white/90">Penduduk Sekitar</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl text-center">
                <div className="text-4xl font-bold text-white mb-2">68+</div>
                <div className="text-white/90">Letusan Besar yang Tercatat</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sejarah Timeline */}
        <div className="py-16 px-6 bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              Sejarah Erupsi Merapi
            </h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-red-500 to-orange-500"></div>
              {historyData.map((item, index) => (
                <div key={index} className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
                      <div className="text-red-400 font-bold text-xl mb-2">{item.year}</div>
                      <div className="text-gray-300">{item.event}</div>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border-4 border-gray-900"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zona Bahaya */}
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              Zona Bahaya Merapi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {dangerZones.map((zone, index) => (
                <div key={index} className="bg-gray-800 rounded-2xl p-8 border-l-4 border-red-500">
                  <div className={`inline-block px-4 py-2 rounded-full text-white font-bold mb-4 ${zone.color}`}>
                    {zone.level}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{zone.zone}</h3>
                  <p className="text-gray-300 leading-relaxed">{zone.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Karakteristik Geologi */}
        <div className="py-16 px-6 bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              Karakteristik Geologi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-red-400 mb-6">Tipe Gunung Api</h3>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">Stratovolcano</h4>
                    <p className="text-gray-300">Gunung kerucut dengan lereng curam, terbentuk dari lapisan lava dan material piroklastik</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">Erupsi Eksplosif</h4>
                    <p className="text-gray-300">Menghasilkan awan panas, aliran piroklastik, dan hujan abu yang berbahaya</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">Komposisi Magma</h4>
                    <p className="text-gray-300">Andesit-basaltik dengan kandungan silika sedang hingga tinggi</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-400 mb-6">Aktivitas Vulkanik</h3>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">Kubah Lava</h4>
                    <p className="text-gray-300">Pembentukan dan runtuhan kubah lava di puncak menjadi ciri khas erupsi Merapi</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">Wedhus Gembel</h4>
                    <p className="text-gray-300">Istilah lokal untuk awan panas yang menjadi ancaman utama Merapi</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">Lahar</h4>
                    <p className="text-gray-300">Aliran lumpur vulkanik yang terjadi saat hujan deras setelah erupsi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dampak dan Manfaat */}
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              Dampak dan Manfaat Merapi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-8 rounded-2xl border border-red-500/30">
                <h3 className="text-2xl font-bold text-red-400 mb-6">⚠️ Dampak Negatif</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• Ancaman nyawa dan keselamatan penduduk</li>
                  <li>• Kerusakan infrastruktur dan properti</li>
                  <li>• Gangguan transportasi dan ekonomi</li>
                  <li>• Pencemaran udara dan lingkungan</li>
                  <li>• Trauma psikologis masyarakat</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 p-8 rounded-2xl border border-green-500/30">
                <h3 className="text-2xl font-bold text-green-400 mb-6">✅ Manfaat Positif</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• Tanah subur untuk pertanian</li>
                  <li>• Sumber mata air dan mineral</li>
                  <li>• Potensi wisata dan edukasi</li>
                  <li>• Penelitian vulkanologi</li>
                  <li>• Identitas budaya dan spiritual</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sistem Monitoring */}
        <div className="py-16 px-6 bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              Sistem Monitoring Terkini
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              <a href="http://bpbd-sleman.online/jpegpull.htm">
              <div className="bg-gray-700 p-6 rounded-2xl text-center">
                <div className="text-4xl mb-4">📹</div>
                <h3 className="text-xl font-bold text-white mb-3">CCTV BPBD Sleman</h3>
                <p className="text-gray-300">Monitoring visual real-time mitigasi BPBD Sleman</p>
              </div>
              </a>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 py-16 text-center px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Siap Menghadapi Merapi Bersama
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Pengetahuan adalah kunci utama dalam menghadapi ancaman vulkanik. 
              Mari bersama-sama memahami, mempersiapkan, dan melindungi diri dari 
              potensi bahaya Gunung Merapi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate("/information")} className="px-8 py-4 bg-white text-red-500 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg">
                Pelajari Mitigasi
              </button >
              <button onClick={() => navigate("/mapsanalisis")} className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-red-500 transition-all">
                Lihat Peta Bahaya
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-900 py-8 px-6 text-center">
          <p className="text-gray-400">
            Data dan informasi diambil dari jurnal-jurnal tekait dan data resmi BPBD Sleman.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MerapiIntro;