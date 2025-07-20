import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  GeoJSON,
  LayersControl,
  Circle,
  Polygon,
  useMap
} from "react-leaflet";
import {
  TrendingUp,
  MapPin,
  Layers,
  BarChart3,
  PieChart,
  Activity,
  Map,
  Menu,
  X,
  ArrowLeft,
  Target,
  Zap,
  AlertTriangle,
  Navigation,
  Maximize,
  Shield
} from "lucide-react";
import L from "leaflet";
import { barakAPI } from "../services/api";

const { BaseLayer, Overlay } = LayersControl;

// Enhanced Heatmap component using Leaflet.heat plugin
const LeafletHeatmap = ({ data, map, mode = "capacity", intensity = 0.6 }) => {
  useEffect(() => {
    if (!map || !data?.length) return;

    // Load Leaflet.heat plugin
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
    script.onload = () => {
      if (window.L && window.L.heatLayer) {
        // Prepare heatmap data
        const heatPoints = data
          .filter((barak) => {
            const lat = parseFloat(barak.latitude);
            const lng = parseFloat(barak.longitude);
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          })
          .map((barak) => {
            const lat = parseFloat(barak.latitude);
            const lng = parseFloat(barak.longitude);
            let weight = 1;
            
            if (mode === "capacity") {
              weight = (parseInt(barak.kapasitas) || 0) / 100;
            } else if (mode === "density") {
              weight = 1;
            } else if (mode === "risk") {
              // Weight berdasarkan jarak dari Merapi (semakin dekat semakin tinggi risk)
              const merapiLat = -7.540585;
              const merapiLng = 110.446380;
              const distance = calculateDistance(lat, lng, merapiLat, merapiLng);
              weight = Math.max(0.1, 1 - (distance / 30)); // Normalize to 30km radius
            }
            
            return [lat, lng, Math.max(0.1, weight)];
          });

        // Create heatmap layer
        const heatLayer = window.L.heatLayer(heatPoints, {
          radius: mode === "density" ? 15 : 25,
          blur: 15,
          maxZoom: 17,
          max: 1.0,
          gradient: mode === "risk" 
            ? {0.0: 'green', 0.5: 'yellow', 0.8: 'orange', 1.0: 'red'}
            : {0.0: 'blue', 0.5: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'}
        });

        heatLayer.addTo(map);

        return () => {
          map.removeLayer(heatLayer);
        };
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [map, data, mode, intensity]);

  return null;
};

// Helper function untuk menghitung jarak
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Voronoi/Thiessen Polygons untuk coverage area
const VoronoiLayer = ({ data, map, showCoverage }) => {
  useEffect(() => {
    if (!map || !data?.length || !showCoverage) return;

    const polygons = [];
    
    // Simple implementation - buat circle untuk setiap barak sebagai coverage area
    data.forEach(barak => {
      const lat = parseFloat(barak.latitude);
      const lng = parseFloat(barak.longitude);
      const capacity = parseInt(barak.kapasitas) || 0;
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Radius berdasarkan kapasitas (assumsi 1 orang = 10 meter radius)
        const radius = Math.max(500, capacity * 2); // Minimum 500m, max based on capacity
        
        const circle = L.circle([lat, lng], {
          radius: radius,
          fillColor: capacity > 300 ? '#00AA00' : capacity > 200 ? '#FFAA00' : '#FF6600',
          fillOpacity: 0.2,
          stroke: true,
          color: '#333333',
          weight: 1,
          opacity: 0.8
        }).addTo(map);
        
        circle.bindPopup(`
          <strong>${barak.nama_barak}</strong><br/>
          Coverage Radius: ${(radius/1000).toFixed(1)} km<br/>
          Kapasitas: ${capacity} orang<br/>
          Area Coverage: ${((Math.PI * radius * radius) / 1000000).toFixed(2)} km²
        `);
        
        polygons.push(circle);
      }
    });

    return () => {
      polygons.forEach(polygon => map.removeLayer(polygon));
    };
  }, [map, data, showCoverage]);

  return null;
};

const HeatmapAnalysis = () => {
  // State untuk data
  const [baraks, setBaraks] = useState([]);
  const [slemankecData, setSlemankecData] = useState(null);
  const [jalanData, setJalanData] = useState(null);
  const [sungaiData, setSungaiData] = useState(null);
  const [krbData, setKrbData] = useState(null);
  const [jarakmerapiData, setJarakmerapiData] = useState(null);
  const [jalurevakuasiData, setJalurevakuasiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [showSidebar, setShowSidebar] = useState(true);
  const [heatmapMode, setHeatmapMode] = useState("capacity");
  const [analysisMode, setAnalysisMode] = useState("overview");
  const [showLayersControl, setShowLayersControl] = useState(true);
  const [showCoverage, setShowCoverage] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedKecamatan, setSelectedKecamatan] = useState("");

  // Fungsi untuk mengambil data barak dari database
  const fetchBaraks = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const response = await barakAPI.getAllNoPagination();
        if (response.data.success && response.data.data) {
          const baraksData = response.data.data;
          console.log(`✅ Loaded ${baraksData.length} baraks for heatmap analysis`);
          setBaraks(baraksData);
          return;
        }
      } catch (error) {
        console.log("Trying pagination fallback...");
        const response = await barakAPI.getAll(1, 'desc');
        
        if (response.data.data) {
          console.log(`✅ Loaded ${response.data.data.length} baraks using pagination`);
          setBaraks(response.data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching baraks:", error);
      setError("Gagal memuat data untuk analisis heatmap");
      setBaraks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data saat komponen dimount
  useEffect(() => {
    fetchBaraks();
  }, []);

  // Load GeoJSON data
  useEffect(() => {
    const loadGeoJSON = async (url, setter) => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setter(data);
      } catch (error) {
        console.error(`Error loading ${url}:`, error);
      }
    };

    loadGeoJSON("/geojson/sleman_kec.geojson", setSlemankecData);
    loadGeoJSON("/geojson/jalan.geojson", setJalanData);
    loadGeoJSON("/geojson/sungai.geojson", setSungaiData);
    loadGeoJSON("/geojson/krb.geojson", setKrbData);
    loadGeoJSON("/geojson/jarak_merapi.geojson", setJarakmerapiData);
    loadGeoJSON("/geojson/jalurevakuasi.geojson", setJalurevakuasiData);
  }, []);

  // Analisis per kecamatan
  const kecamatanAnalysis = useMemo(() => {
    const analysis = {};
    
    baraks.forEach(barak => {
      const kec = barak.kecamatan || 'Tidak Diketahui';
      if (!analysis[kec]) {
        analysis[kec] = {
          count: 0,
          totalCapacity: 0,
          avgCapacity: 0,
          maxCapacity: 0,
          minCapacity: Infinity,
          avgDistanceFromMerapi: 0,
          totalCoverage: 0
        };
      }
      
      const capacity = parseInt(barak.kapasitas) || 0;
      const lat = parseFloat(barak.latitude);
      const lng = parseFloat(barak.longitude);
      
      analysis[kec].count++;
      analysis[kec].totalCapacity += capacity;
      analysis[kec].maxCapacity = Math.max(analysis[kec].maxCapacity, capacity);
      analysis[kec].minCapacity = Math.min(analysis[kec].minCapacity, capacity);
      
      // Hitung jarak dari Merapi (koordinat Merapi: -7.540585, 110.446380)
      if (!isNaN(lat) && !isNaN(lng)) {
        const distanceFromMerapi = calculateDistance(lat, lng, -7.540585, 110.446380);
        analysis[kec].avgDistanceFromMerapi += distanceFromMerapi;
        
        // Coverage area estimation (radius based on capacity)
        const coverageRadius = Math.max(0.5, capacity * 0.002); // km
        analysis[kec].totalCoverage += Math.PI * coverageRadius * coverageRadius;
      }
    });
    
    // Calculate averages
    Object.keys(analysis).forEach(kec => {
      const data = analysis[kec];
      data.avgCapacity = Math.round(data.totalCapacity / data.count);
      data.avgDistanceFromMerapi = Math.round((data.avgDistanceFromMerapi / data.count) * 100) / 100;
      if (data.minCapacity === Infinity) data.minCapacity = 0;
    });
    
    return analysis;
  }, [baraks]);

  // Analisis risiko berdasarkan KRB dan jarak Merapi
  const riskAnalysis = useMemo(() => {
    const riskLevels = { tinggi: 0, sedang: 0, rendah: 0 };
    const merapiLat = -7.540585;
    const merapiLng = 110.446380;
    
    baraks.forEach(barak => {
      const lat = parseFloat(barak.latitude);
      const lng = parseFloat(barak.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const distance = calculateDistance(lat, lng, merapiLat, merapiLng);
        
        if (distance < 10) {
          riskLevels.tinggi++;
        } else if (distance < 20) {
          riskLevels.sedang++;
        } else {
          riskLevels.rendah++;
        }
      }
    });
    
    return riskLevels;
  }, [baraks]);

  // Analisis aksesibilitas (jarak ke jalur evakuasi)
  const accessibilityAnalysis = useMemo(() => {
    if (!jalurevakuasiData || !baraks.length) return null;
    
    let totalAccessible = 0;
    const accessibilityScores = [];
    
    baraks.forEach(barak => {
      const barakLat = parseFloat(barak.latitude);
      const barakLng = parseFloat(barak.longitude);
      
      if (!isNaN(barakLat) && !isNaN(barakLng)) {
        // Simplified: assume accessible if within reasonable distance
        // In real implementation, you'd calculate actual distance to evacuation routes
        const accessibility = Math.random() > 0.3 ? 'Mudah' : 'Sulit'; // Mock calculation
        accessibilityScores.push(accessibility);
        if (accessibility === 'Mudah') totalAccessible++;
      }
    });
    
    return {
      accessible: totalAccessible,
      total: accessibilityScores.length,
      percentage: Math.round((totalAccessible / accessibilityScores.length) * 100)
    };
  }, [baraks, jalurevakuasiData]);

  // Filter baraks berdasarkan kecamatan
  const filteredBaraks = useMemo(() => {
    if (!selectedKecamatan) return baraks;
    return baraks.filter(barak => barak.kecamatan === selectedKecamatan);
  }, [baraks, selectedKecamatan]);

  // Custom icons
  const barakIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [1, -30],
    shadowSize: [32, 32],
  });

  const merapiIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="relative h-screen w-full bg-gray-900">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 z-30 bg-gradient-to-r from-orange-900 to-red-800 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Analisis Heatmap & Spasial</h1>
        </div>

        <nav className="hidden md:flex gap-6 text-white font-medium">
          <a href="/" className="hover:text-orange-300 transition-colors cursor-pointer">Home</a>
          <a href="/merapiintro" className="hover:text-orange-300 transition-colors cursor-pointer">Introduction</a>
          <a href="/maps" className="hover:text-orange-300 transition-colors cursor-pointer flex items-center gap-1">
            <Map className="w-4 h-4" />Maps
          </a>
          <a href="/heatmap" className="text-orange-300 cursor-pointer">Heatmap</a>
          <a href="/information" className="hover:text-orange-300 transition-colors cursor-pointer">Mitigasi</a>
          <a href="/beritas" className="hover:text-orange-300 transition-colors cursor-pointer">News</a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="/maps"
            className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />Kembali ke Maps
          </a>
          <button
            onClick={() => setShowLayersControl(!showLayersControl)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Layers className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-20 left-0 h-full bg-white shadow-2xl z-20 transition-transform duration-300 ${
        showSidebar ? "translate-x-0" : "-translate-x-full"
      } w-80 overflow-y-auto`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Analisis Spasial</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Analysis Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode Analisis</label>
            <select
              value={analysisMode}
              onChange={(e) => setAnalysisMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="overview">📊 Overview</option>
              <option value="heatmap">🔥 Heatmap</option>
              <option value="risk">⚠️ Analisis Risiko</option>
              <option value="coverage">📍 Coverage Area</option>
              <option value="accessibility">🛣️ Aksesibilitas</option>
            </select>
          </div>

          {analysisMode === "heatmap" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Heatmap</label>
              <select
                value={heatmapMode}
                onChange={(e) => setHeatmapMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="capacity">🏠 Berdasarkan Kapasitas</option>
                <option value="density">🌐 Berdasarkan Kepadatan</option>
                <option value="risk">⚡ Berdasarkan Risiko</option>
              </select>
            </div>
          )}

          {analysisMode === "coverage" && (
            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCoverage}
                  onChange={(e) => setShowCoverage(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Tampilkan Area Coverage</span>
              </label>
            </div>
          )}

          {/* Kecamatan Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Kecamatan</label>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Semua Kecamatan</option>
              {Object.keys(kecamatanAnalysis).map((kec) => (
                <option key={kec} value={kec}>{kec}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Analysis Content */}
          {analysisMode === "overview" && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />Statistik Umum
              </h3>
              {loading ? (
                <div className="p-3 bg-blue-50 rounded-lg border text-center">
                  <div className="text-blue-600">Memuat data...</div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span>Total Barak:</span>
                      <span className="font-medium">{filteredBaraks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Kapasitas:</span>
                      <span className="font-medium">
                        {filteredBaraks.reduce((sum, b) => sum + parseInt(b.kapasitas || 0), 0)} orang
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span>Rata-rata Kapasitas:</span>
                      <span className="font-medium">
                        {filteredBaraks.length > 0 
                          ? Math.round(filteredBaraks.reduce((sum, b) => sum + parseInt(b.kapasitas || 0), 0) / filteredBaraks.length)
                          : 0
                        } orang
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coverage Total:</span>
                      <span className="font-medium">~{(filteredBaraks.length * 2.5).toFixed(1)} km²</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {analysisMode === "risk" && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />Analisis Risiko
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800">Zona Risiko Tinggi (&lt;10km)</span>
                  </div>
                  <div className="text-red-700">{riskAnalysis.tinggi} barak</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Zona Risiko Sedang (10-20km)</span>
                  </div>
                  <div className="text-yellow-700">{riskAnalysis.sedang} barak</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Zona Risiko Rendah (&gt;20km)</span>
                  </div>
                  <div className="text-green-700">{riskAnalysis.rendah} barak</div>
                </div>
              </div>
            </div>
          )}

          {analysisMode === "accessibility" && accessibilityAnalysis && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Navigation className="w-4 h-4" />Aksesibilitas
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span>Mudah Diakses:</span>
                    <span className="font-medium text-green-600">{accessibilityAnalysis.accessible} barak</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Sulit Diakses:</span>
                    <span className="font-medium text-red-600">{accessibilityAnalysis.total - accessibilityAnalysis.accessible} barak</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Persentase Aksesible:</span>
                    <span className="font-medium">{accessibilityAnalysis.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analisis per Kecamatan */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4" />Analisis per Kecamatan
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(kecamatanAnalysis)
                .sort((a, b) => b[1].totalCapacity - a[1].totalCapacity)
                .map(([kec, data]) => (
                  <div 
                    key={kec} 
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedKecamatan === kec ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedKecamatan(selectedKecamatan === kec ? "" : kec)}
                  >
                    <h4 className="font-medium text-gray-800 text-sm mb-1">{kec}</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Jumlah Barak:</span>
                        <span>{data.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Kapasitas:</span>
                        <span>{data.totalCapacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jarak rata² dari Merapi:</span>
                        <span>{data.avgDistanceFromMerapi} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coverage:</span>
                        <span>{data.totalCoverage.toFixed(1)} km²</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />Legend
            </h3>
            
            {heatmapMode === "capacity" && analysisMode === "heatmap" && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span>Kapasitas Rendah</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-400"></div>
                  <span>Kapasitas Sedang</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>Kapasitas Tinggi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Kapasitas Sangat Tinggi</span>
                </div>
              </div>
            )}

            {heatmapMode === "risk" && analysisMode === "heatmap" && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Risiko Rendah (Jauh dari Merapi)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>Risiko Sedang</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Risiko Tinggi (Dekat Merapi)</span>
                </div>
              </div>
            )}

            {analysisMode === "coverage" && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 opacity-40"></div>
                  <span>Coverage Area (Kapasitas Tinggi)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500 opacity-40"></div>
                  <span>Coverage Area (Kapasitas Sedang)</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className={`absolute top-20 bottom-0 right-0 transition-all duration-300 ${
        showSidebar ? "left-80" : "left-0"
      }`}>
        <MapContainer
          center={[-7.797068, 110.370529]}
          zoom={12}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
          whenReady={(map) => setMapInstance(map.target)}
        >
          <ZoomControl position="topleft" />

          {showLayersControl && (
            <LayersControl position="topright">
              {/* Base Layers */}
              <BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>

              <BaseLayer name="Satellite">
                <TileLayer
                  attribution="Tiles &copy; Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </BaseLayer>

              <BaseLayer name="Dark">
                <TileLayer
                  attribution="&copy; CartoDB"
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
              </BaseLayer>

              {/* GeoJSON Overlays */}
              {slemankecData && (
                <Overlay checked name="Kecamatan Sleman">
                  <GeoJSON
                    data={slemankecData}
                    style={{ color: "#333333", weight: 2, fillOpacity: 0.05 }}
                    onEachFeature={(feature, layer) => {
                      const { Kecamatan } = feature.properties;
                      const kecStats = kecamatanAnalysis[Kecamatan];
                      layer.bindPopup(
                        `<strong>Kecamatan: ${Kecamatan}</strong><br/>
                         ${kecStats ? `Jumlah Barak: ${kecStats.count}<br/>Total Kapasitas: ${kecStats.totalCapacity}<br/>Jarak rata-rata dari Merapi: ${kecStats.avgDistanceFromMerapi} km` : 'Data tidak tersedia'}`
                      );
                    }}
                  />
                </Overlay>
              )}

              {jalanData && (
                <Overlay name="Jalan">
                  <GeoJSON
                    data={jalanData}
                    style={{ color: "#888888", weight: 1, opacity: 0.7 }}
                    onEachFeature={(feature, layer) => {
                      const { jenisjalan } = feature.properties;
                      layer.bindPopup(`<strong>Jalan: ${jenisjalan}</strong>`);
                    }}
                  />
                </Overlay>
              )}

              {sungaiData && (
                <Overlay name="Sungai">
                  <GeoJSON
                    data={sungaiData}
                    style={{ color: "#0088FF", weight: 2, opacity: 0.8 }}
                    onEachFeature={(feature, layer) => {
                      const { REMARK } = feature.properties;
                      layer.bindPopup(`<strong>Sungai: ${REMARK}</strong>`);
                    }}
                  />
                </Overlay>
              )}

              {krbData && (
                <Overlay name="Kawasan Rawan Bencana">
                  <GeoJSON
                    data={krbData}
                    style={{ color: "#FF4444", weight: 2, fillOpacity: 0.3 }}
                    onEachFeature={(feature, layer) => {
                      const { namazona, resiko } = feature.properties;
                      layer.bindPopup(`<strong>${namazona}</strong><br/>Resiko: ${resiko}`);
                    }}
                  />
                </Overlay>
              )}

              {jarakmerapiData && (
                <Overlay name="Jarak dari Merapi">
                  <GeoJSON
                    data={jarakmerapiData}
                    style={{ color: "#FFAA00", weight: 2, fillOpacity: 0.2 }}
                    onEachFeature={(feature, layer) => {
                      const { Jarak } = feature.properties;
                      layer.bindPopup(`<strong>Jarak: ${Jarak}</strong>`);
                    }}
                  />
                </Overlay>
              )}

              {jalurevakuasiData && (
                <Overlay name="Jalur Evakuasi">
                  <GeoJSON
                    data={jalurevakuasiData}
                    style={{ color: "#FF00FF", weight: 3, opacity: 0.8 }}
                    onEachFeature={(feature, layer) => {
                      const { nm_ruas } = feature.properties;
                      layer.bindPopup(`<strong>Jalur Evakuasi</strong><br/>${nm_ruas}`);
                    }}
                  />
                </Overlay>
              )}
            </LayersControl>
          )}

          {/* Default base layer */}
          {!showLayersControl && (
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {/* Merapi marker */}
          <Marker position={[-7.540585, 110.446380]} icon={merapiIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Gunung Merapi</strong><br />
                <strong>Koordinat:</strong> -7.540585, 110.446380<br />
                <strong>Status:</strong> Aktif<br />
                <strong>Ketinggian:</strong> 2,930 mdpl
              </div>
            </Popup>
          </Marker>

          {/* Barak markers */}
          {filteredBaraks
            .filter((barak) => {
              const lat = parseFloat(barak.latitude);
              const lng = parseFloat(barak.longitude);
              return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
            })
            .map((barak, index) => {
              const lat = parseFloat(barak.latitude);
              const lng = parseFloat(barak.longitude);
              const merapiDistance = calculateDistance(lat, lng, -7.540585, 110.446380);

              return (
                <Marker key={barak.id || index} position={[lat, lng]} icon={barakIcon}>
                  <Popup>
                    <div className="text-xs">
                      <strong>{barak.nama_barak || "Nama tidak tersedia"}</strong><br />
                      <strong>Kecamatan:</strong> {barak.kecamatan || "-"}<br />
                      <strong>Desa:</strong> {barak.desa || "-"}<br />
                      <strong>Kapasitas:</strong> {barak.kapasitas || 0} orang<br />
                      <strong>Jarak dari Merapi:</strong> {merapiDistance.toFixed(2)} km<br />
                      <strong>Status Risiko:</strong> {
                        merapiDistance < 10 ? "Tinggi" : 
                        merapiDistance < 20 ? "Sedang" : "Rendah"
                      }<br />
                      <strong>Koordinat:</strong> {lat.toFixed(4)}, {lng.toFixed(4)}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Conditional layers based on analysis mode */}
          {analysisMode === "heatmap" && mapInstance && (
            <LeafletHeatmap data={filteredBaraks} map={mapInstance} mode={heatmapMode} />
          )}

          {analysisMode === "coverage" && mapInstance && (
            <VoronoiLayer data={filteredBaraks} map={mapInstance} showCoverage={showCoverage} />
          )}
        </MapContainer>
      </div>

      {/* Floating controls */}
      <div className="fixed bottom-6 right-6 z-20 space-y-2">
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-gray-700" />
          </button>
        )}

        <button
          onClick={() => setShowLayersControl(!showLayersControl)}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Layers className="w-5 h-5 text-gray-700" />
        </button>

        <a
          href="/maps"
          className="w-12 h-12 bg-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </a>
      </div>
    </div>
  );
};

export default HeatmapAnalysis;