import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  GeoJSON,
  Circle,
} from "react-leaflet";
import {
  Search,
  MapPin,
  Navigation,
  BarChart3,
  X,
  Menu,
  Activity,
} from "lucide-react";
import L from "leaflet";
import logo from "../assets/logo.png";
import { barakAPI } from "../services/api";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Legend Component
const Legend = () => {
  const legendItems = [
    { icon: "fa-tent", color: "green", label: "Barak" },
    { icon: "fa-mountain", color: "red", label: "Gunung Merapi" },
    { icon: "fa-user", color: "blue", label: "Lokasi Anda" },
    { icon: "fa-minus", color: "yellow", label: "Jalur Evakuasi" },
    { icon: "fa-minus", color: "red", label: "Jarak dari Merapi" },
  ];

  return (
    <div className="legend bg-gray p-4 rounded-lg mt-4 mb-4">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Legenda</h3>
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center mb-2">
          {item.icon ? (
            <i className={`fas ${item.icon} text-${item.color}-600 mr-2`} />
          ) : (
            <div
              className={`w-4 h-4 bg-[${item.color}] mr-2`}
              style={{ backgroundColor: item.color }}
            />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const MapsBarak = () => {
  // State untuk data
  const [baraks, setBaraks] = useState([]);
  const [filteredBaraks, setFilteredBaraks] = useState([]);
  const [krbData, setKrbData] = useState(null);
  const [jalurevakuasiData, setJalurevakuasiData] = useState(null);
  const [jarakmerapiData, setJarakmerapiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [selectedDesa, setSelectedDesa] = useState("");
  const [maxDistance, setMaxDistance] = useState(10);
  const [userLocation, setUserLocation] = useState(null);

  // Fungsi untuk mengambil data barak dari database
  const fetchBaraks = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching baraks data...");

      try {
        const response = await barakAPI.getAllNoPagination();
        console.log("All baraks response:", response.data);

        if (response.data.success && response.data.data) {
          const baraksData = response.data.data;
          console.log(
            `✅ Successfully loaded ${baraksData.length} baraks using getAllNoPagination`
          );
          setBaraks(baraksData);
          setFilteredBaraks(baraksData);
          return;
        }
      } catch (error) {
        console.log("⚠️ getAllNoPagination failed:", error.message);
        console.log("Trying pagination strategy...");
      }
    } catch (error) {
      console.error("Error fetching baraks:", error);

      if (error.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (error.response?.status === 403) {
        setError("Anda tidak memiliki akses untuk melihat data barak.");
      } else if (error.response?.status >= 500) {
        setError("Server sedang bermasalah. Coba lagi nanti.");
      } else {
        setError("Gagal memuat data barak. Periksa koneksi internet Anda.");
      }

      setBaraks([]);
      setFilteredBaraks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data barak saat komponen dimount
  useEffect(() => {
    fetchBaraks();
  }, []);

  // Get unique kecamatan and desa with null safety
  const kecamatanList = useMemo(
    () =>
      [
        ...new Set(
          baraks
            .map((b) => b.kecamatan)
            .filter((kec) => kec && kec.trim() !== "")
        ),
      ].sort(),
    [baraks]
  );

  const desaList = useMemo(
    () =>
      [
        ...new Set(
          baraks
            .filter(
              (b) => !selectedKecamatan || b.kecamatan === selectedKecamatan
            )
            .map((b) => b.desa)
            .filter((desa) => desa && desa.trim() !== "")
        ),
      ].sort(),
    [baraks, selectedKecamatan]
  );

  // Calculate distance between two points
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

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Tidak dapat mengakses lokasi Anda");
        }
      );
    } else {
      setError("Browser tidak mendukung geolocation");
    }
  };

  // Filter baraks based on search criteria
  useEffect(() => {
    let filtered = baraks;

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(
        (barak) =>
          (barak.nama_barak || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (barak.alamat || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (barak.kecamatan || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (barak.desa || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Kecamatan filter
    if (selectedKecamatan) {
      filtered = filtered.filter(
        (barak) => barak.kecamatan === selectedKecamatan
      );
    }

    // Desa filter
    if (selectedDesa) {
      filtered = filtered.filter((barak) => barak.desa === selectedDesa);
    }

    // Distance filter
    if (userLocation && maxDistance) {
      filtered = filtered.filter((barak) => {
        const lat = parseFloat(barak.latitude);
        const lng = parseFloat(barak.longitude);

        if (isNaN(lat) || isNaN(lng)) return false;

        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          lat,
          lng
        );
        return distance <= maxDistance;
      });
    }

    setFilteredBaraks(filtered);
  }, [
    searchQuery,
    selectedKecamatan,
    selectedDesa,
    maxDistance,
    userLocation,
    baraks,
  ]);

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
    loadGeoJSON("/geojson/jalurevakuasi.geojson", setJalurevakuasiData);
    loadGeoJSON("/geojson/jarak_merapi.geojson", setJarakmerapiData);
  }, []);

  // Custom icon for barak markers using Leaflet Awesome Markers
  const barakIcon = new L.AwesomeMarkers.icon({
    icon: "tent", // Font Awesome tent icon
    prefix: "fa", // Font Awesome prefix
    markerColor: "green", // Marker color
    iconColor: "black", // Icon color
  });

  const merapiIcon = new L.AwesomeMarkers.icon({
    icon: "mountain", // Font Awesome mountain icon
    prefix: "fa", // Font Awesome prefix
    markerColor: "red", // Marker color
    iconColor: "white", // Icon color
  });

  const userIcon = new L.AwesomeMarkers.icon({
    icon: "user", // Font Awesome user icon
    prefix: "fa", // Font Awesome prefix
    markerColor: "blue", // Marker color
    iconColor: "white", // Icon color
  });

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen">
      {/* Header */}
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
              href="/merapiintro"
              className="hover:text-red-400 transition-colors"
            >
              Introduction
            </a>
            <a href="/maps" className="text-red-400 border-b-2 border-red-400">
              Maps
            </a>
            <a
              href="/information"
              className="hover:text-red-400 transition-colors"
            >
              Mitigasi
            </a>
            <a href="/beritas" className="hover:text-red-400 transition-colors">
              News
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/mapsanalisis"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </a>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors md:hidden"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-20 left-0 w-80 bg-white shadow-2xl z-20 transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto`}
        style={{ height: "calc(100vh - 5rem)" }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Pencarian Barak</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Barak
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nama barak, alamat, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location Button */}
          <div className="mb-4">
            <button
              onClick={getUserLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Gunakan Lokasi Saya
            </button>
          </div>

          {/* Legend */}
          <Legend />

          {/* Kecamatan Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kecamatan
            </label>
            <select
              value={selectedKecamatan}
              onChange={(e) => {
                setSelectedKecamatan(e.target.value);
                setSelectedDesa("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map((kec) => (
                <option key={kec} value={kec}>
                  {kec}
                </option>
              ))}
            </select>
          </div>

          {/* Desa Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desa
            </label>
            <select
              value={selectedDesa}
              onChange={(e) => setSelectedDesa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Semua Desa</option>
              {desaList.map((desa) => (
                <option key={desa} value={desa}>
                  {desa}
                </option>
              ))}
            </select>
          </div>

          {/* Distance Filter */}
          {userLocation && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jarak Maksimal: {maxDistance} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Refresh Button */}
          <div className="mb-4">
            <button
              onClick={() => fetchBaraks()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BarChart3 className="w-4 h-4" />
              {loading ? "Memuat..." : "Refresh Data"}
            </button>
          </div>

          {/* Results */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Hasil Pencarian ({loading ? "..." : filteredBaraks.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {loading && (
              <div className="p-3 bg-blue-50 rounded-lg border text-center">
                <div className="text-blue-600">Memuat data barak...</div>
              </div>
            )}

            {!loading &&
              filteredBaraks
                .filter((barak) => {
                  const lat = parseFloat(barak.latitude);
                  const lng = parseFloat(barak.longitude);
                  return !isNaN(lat) && !isNaN(lng);
                })
                .map((barak, index) => {
                  const lat = parseFloat(barak.latitude);
                  const lng = parseFloat(barak.longitude);

                  return (
                    <div
                      key={barak.id || index}
                      className="p-3 bg-gray-50 rounded-lg border"
                    >
                      <h4 className="font-medium text-gray-800 text-sm">
                        {barak.nama_barak || "Nama tidak tersedia"}
                      </h4>
                      <p className="text-xs text-gray-600 mb-1">
                        {barak.alamat || "Alamat tidak tersedia"}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        {barak.desa || "-"}, {barak.kecamatan || "-"}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Kapasitas: {barak.kapasitas || 0}</span>
                        {userLocation && !isNaN(lat) && !isNaN(lng) && (
                          <span>
                            {calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              lat,
                              lng
                            ).toFixed(1)}{" "}
                            km
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

            {!loading && filteredBaraks.length === 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg border text-center">
                <div className="text-yellow-600">
                  Tidak ada barak yang sesuai dengan kriteria pencarian
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <div className="mb-2">{error}</div>
              <button
                onClick={() => fetchBaraks()}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div
        className={`absolute top-20 bottom-0 right-0 transition-all duration-300 ${
          showSidebar ? "left-80" : "left-0"
        }`}
      >
        <MapContainer
          center={[-7.674246017544997, 110.39503800761653]}
          zoom={12}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <ZoomControl position="topleft" />

          {/* Base Layer */}
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Jalur Evakuasi Layer */}
          {jalurevakuasiData && (
            <GeoJSON
              data={jalurevakuasiData}
              style={{ color: "#FB9E3A", weight: 3 }}
              onEachFeature={(feature, layer) => {
                const { nm_ruas } = feature.properties;
                layer.bindPopup(
                  `<strong>Jalur Evakuasi</strong><br/>${nm_ruas}`
                );
              }}
            />
          )}

          {/* Jarak Merapi Layer */}
          {jarakmerapiData && (
            <GeoJSON
              data={jarakmerapiData}
              style={{ color: "#ED3500", weight: 4, fillOpacity: 0.2 }}
              onEachFeature={(feature, layer) => {
                const { Jarak } = feature.properties;
                layer.bindPopup(
                  `<strong>Jarak dari Merapi</strong><br/>${Jarak}`
                );
              }}
            />
          )}

          {/* User location marker */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>
                <div>
                  <strong>Lokasi Anda</strong>
                  <br />
                  Koordinat: {userLocation.lat.toFixed(6)},{" "}
                  {userLocation.lng.toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Distance circle */}
          {userLocation && maxDistance && (
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={maxDistance * 1000}
              fillColor="blue"
              fillOpacity={0.1}
              color="blue"
              weight={2}
            />
          )}

          {/* Merapi marker */}
          <Marker position={[-7.540585, 110.44638]} icon={merapiIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Gunung Merapi</strong>
                <br />
                <strong>Koordinat:</strong> -7.540585, 110.446380
                <br />
                <strong>Status:</strong> Aktif
                <br />
                <strong>Ketinggian:</strong> 2,968 mdpl
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

              return (
                <Marker
                  key={barak.id || index}
                  position={[lat, lng]}
                  icon={barakIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong className="text-lg">
                        {barak.nama_barak || "Nama tidak tersedia"}
                      </strong>
                      <br />
                      <strong>Alamat:</strong>{" "}
                      {barak.alamat || "Alamat tidak tersedia"}
                      <br />
                      <strong>Kecamatan:</strong> {barak.kecamatan || "-"}
                      <br />
                      <strong>Desa:</strong> {barak.desa || "-"}
                      <br />
                      <strong>Kapasitas:</strong> {barak.kapasitas || 0} orang
                      <br />
                      <strong>Fasilitas:</strong>{" "}
                      {barak.fasilitas || "Tidak ada informasi"}
                      <br />
                      <strong>Koordinat:</strong> {lat.toFixed(6)},{" "}
                      {lng.toFixed(6)}
                      {userLocation && (
                        <>
                          <br />
                          <strong>Jarak:</strong>{" "}
                          {calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            lat,
                            lng
                          ).toFixed(2)}{" "}
                          km
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {/* Floating controls */}
      <div className="fixed bottom-6 right-6 z-20 space-y-2">
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MapsBarak;
