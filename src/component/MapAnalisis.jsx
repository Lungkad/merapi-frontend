import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  GeoJSON,
  LayersControl,
} from "react-leaflet";
import {
  TrendingUp,
  Layers,
  Activity,
  Map,
  Menu,
  X,
  ArrowLeft,
  Target,
  AlertTriangle,
  Shield,
} from "lucide-react";
import L from "leaflet";
import { barakAPI } from "../services/api";
import logo from "../assets/logo.png";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers";
import "@fortawesome/fontawesome-free/css/all.min.css";

const { BaseLayer, Overlay } = LayersControl;

// Coverage Gap Analysis - Spatial distribution analysis using heatmap
const CoverageGapAnalysis = ({
  data,
  map,
  serviceRadius = 2000,
  showCoverageZones = true,
}) => {
  useEffect(() => {
    if (!map || !data?.length) return;

    const layers = [];

    // Create coverage heatmap
    const coveragePoints = data
      .map((barak) => {
        const lat = parseFloat(barak.latitude);
        const lng = parseFloat(barak.longitude);
        return !isNaN(lat) && !isNaN(lng) ? [lat, lng, 0.7] : null; // Standard intensity
      })
      .filter((point) => point !== null);

    let heatLayer = null;

    // Load heatmap plugin for coverage visualization
    const loadHeatPlugin = () => {
      return new Promise((resolve) => {
        if (window.L && window.L.heatLayer) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadHeatPlugin().then(() => {
      heatLayer = window.L.heatLayer(coveragePoints, {
        radius: 80,
        blur: 50,
        maxZoom: 17,
        max: 1.5,
        minOpacity: 0.3,
        gradient: {
          0.0: "#003366",
          0.2: "#3366CC",
          0.4: "#66CC66",
          0.6: "#FFFF33",
          0.8: "#FF9933",
          1.0: "#FF3333",
        },
      });
      heatLayer.addTo(map);
      layers.push(heatLayer);
    });

    return () => {
      layers.forEach((layer) => map.removeLayer(layer));
    };
  }, [map, data, serviceRadius, showCoverageZones]);

  return null;
};

// Distance-based Risk Analysis (without capacity dependency)
const DistanceRiskAnalysis = ({ data, map }) => {
  useEffect(() => {
    if (!map || !data?.length) return;

    const riskCircles = [];
    const merapiLat = -7.540585;
    const merapiLng = 110.44638;

    data.forEach((barak) => {
      const lat = parseFloat(barak.latitude);
      const lng = parseFloat(barak.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const distanceFromMerapi = calculateDistance(
          lat,
          lng,
          merapiLat,
          merapiLng
        );

        let riskLevel = "low";
        let riskScore = 0;
        let riskColor = "#00aa00";

        riskScore = Math.max(0, 100 - distanceFromMerapi * 4);

        if (riskScore >= 75) {
          riskLevel = "very_high";
          riskColor = "#cc0000";
        } else if (riskScore >= 50) {
          riskLevel = "high";
          riskColor = "#ff4400";
        } else if (riskScore >= 25) {
          riskLevel = "medium";
          riskColor = "#ffaa00";
        } else {
          riskLevel = "low";
          riskColor = "#00aa00";
        }

        const radius = 500;
        const circle = L.circle([lat, lng], {
          radius: radius,
          fillColor: riskColor,
          fillOpacity: 0.3,
          stroke: true,
          color: riskColor,
          weight: 3,
          opacity: 0.8,
        });

        circle.bindPopup(`
          <div class="text-sm">
            <strong>${barak.nama_barak}</strong><br/>
            <strong>Risk Level:</strong> <span style="color: ${riskColor}; font-weight: bold;">${riskLevel
          .replace("_", " ")
          .toUpperCase()}</span><br/>
            <strong>Risk Score:</strong> ${riskScore.toFixed(1)}/100<br/>
            <strong>Distance from Merapi:</strong> ${distanceFromMerapi.toFixed(
              1
            )} km<br/>
            <strong>Kecamatan:</strong> ${barak.kecamatan}<br/>
            <strong>Desa:</strong> ${barak.desa}
          </div>
        `);

        circle.addTo(map);
        riskCircles.push(circle);
      }
    });

    return () => {
      riskCircles.forEach((circle) => map.removeLayer(circle));
    };
  }, [map, data]);

  return null;
};

// Marker Clustering component
const MarkerClustering = ({ data, map, showClustering, icon }) => {
  useEffect(() => {
    if (!map || !data?.length || !showClustering) return;

    const loadClusterPlugin = () => {
      return new Promise((resolve) => {
        if (window.L && window.L.MarkerClusterGroup) {
          resolve();
          return;
        }

        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.css";
        document.head.appendChild(css);

        const cssDefault = document.createElement("link");
        cssDefault.rel = "stylesheet";
        cssDefault.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.Default.css";
        document.head.appendChild(cssDefault);

        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadClusterPlugin().then(() => {
      const markers = window.L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 60,
        iconCreateFunction: function (cluster) {
          const count = cluster.getChildCount();
          let className = "marker-cluster marker-cluster-";

          if (count < 10) {
            className += "small";
          } else if (count < 50) {
            className += "medium";
          } else {
            className += "large";
          }

          return window.L.divIcon({
            html: `<div><span>${count}</span></div>`,
            className: className,
            iconSize: window.L.point(40, 40),
          });
        },
      });

      data.forEach((barak) => {
        const lat = parseFloat(barak.latitude);
        const lng = parseFloat(barak.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          const merapiDistance = calculateDistance(
            lat,
            lng,
            -7.540585,
            110.44638
          );

          const marker = window.L.marker([lat, lng], { icon }).bindPopup(`
              <div class="text-xs">
                <strong>${
                  barak.nama_barak || "Nama tidak tersedia"
                }</strong><br />
                <strong>Kecamatan:</strong> ${barak.kecamatan || "-"}<br />
                <strong>Desa:</strong> ${barak.desa || "-"}<br />
                <strong>Jarak dari Merapi:</strong> ${merapiDistance.toFixed(
                  2
                )} km<br />
                <strong>Koordinat:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}
              </div>
            `);

          markers.addLayer(marker);
        }
      });

      map.addLayer(markers);

      return () => {
        map.removeLayer(markers);
      };
    });
  }, [map, data, showClustering, icon]);

  return null;
};

// Helper function untuk menghitung jarak
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
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

const CoverageGapAnalysisMain = () => {
  const [baraks, setBaraks] = useState([]);
  const [slemankecData, setSlemankecData] = useState(null);
  const [krbData, setKrbData] = useState(null);
  const [jarakmerapiData, setJarakmerapiData] = useState(null);
  const [jalurevakuasiData, setJalurevakuasiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSidebar, setShowSidebar] = useState(true);
  const [analysisMode, setAnalysisMode] = useState("coverage");
  const [showLayersControl, setShowLayersControl] = useState(true);
  const [showClustering, setShowClustering] = useState(true);

  const [serviceRadius, setServiceRadius] = useState(2000);
  const [showCoverageZones, setShowCoverageZones] = useState(true);

  const [mapInstance, setMapInstance] = useState(null);
  const [selectedKecamatan, setSelectedKecamatan] = useState("");

  const fetchBaraks = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const response = await barakAPI.getAllNoPagination();
        if (response.data.success && response.data.data) {
          const baraksData = response.data.data;
          console.log(`✅ Loaded ${baraksData.length} baraks for analysis`);
          setBaraks(baraksData);
          return;
        }
      } catch (error) {
        console.log("Trying pagination fallback...");
        const response = await barakAPI.getAll(1, "desc");

        if (response.data.data && response.data.last_page) {
          const totalPages = response.data.last_page;
          let allBaraks = [...response.data.data];

          if (totalPages > 1) {
            const pagePromises = [];
            for (let page = 2; page <= totalPages; page++) {
              pagePromises.push(barakAPI.getAll(page, "desc"));
            }

            const pageResponses = await Promise.all(pagePromises);
            pageResponses.forEach((pageResponse) => {
              if (pageResponse.data.data) {
                allBaraks = [...allBaraks, ...pageResponse.data.data];
              }
            });
          }

          console.log(`✅ Loaded ${allBaraks.length} baraks using pagination`);
          setBaraks(allBaraks);
        }
      }
    } catch (error) {
      console.error("Error fetching baraks:", error);
      setError("Gagal memuat data untuk analisis");
      setBaraks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaraks();
  }, []);

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
    loadGeoJSON("/geojson/krb.geojson", setKrbData);
    loadGeoJSON("/geojson/jarak_merapi.geojson", setJarakmerapiData);
    loadGeoJSON("/geojson/jalurevakuasi.geojson", setJalurevakuasiData);
  }, []);

  const analysisResults = useMemo(() => {
    if (!baraks.length) return null;

    const merapiLat = -7.540585;
    const merapiLng = 110.44638;

    const riskCategories = { veryHigh: 0, high: 0, medium: 0, low: 0 };
    let totalCoverageArea = 0;
    const coverageAnalysis = {};
    const distanceAnalysis = {};

    baraks.forEach((barak) => {
      const lat = parseFloat(barak.latitude);
      const lng = parseFloat(barak.longitude);
      const kecamatan = barak.kecamatan || "Unknown";

      if (!isNaN(lat) && !isNaN(lng)) {
        const distanceFromMerapi = calculateDistance(
          lat,
          lng,
          merapiLat,
          merapiLng
        );

        const riskScore = Math.max(0, 100 - distanceFromMerapi * 4);

        if (riskScore >= 75) riskCategories.veryHigh++;
        else if (riskScore >= 50) riskCategories.high++;
        else if (riskScore >= 25) riskCategories.medium++;
        else riskCategories.low++;

        const coverageArea =
          (Math.PI * serviceRadius * serviceRadius) / 1000000;
        totalCoverageArea += coverageArea;

        if (!coverageAnalysis[kecamatan]) {
          coverageAnalysis[kecamatan] = { count: 0, totalArea: 0 };
        }
        coverageAnalysis[kecamatan].count++;
        coverageAnalysis[kecamatan].totalArea += coverageArea;

        if (!distanceAnalysis[kecamatan]) {
          distanceAnalysis[kecamatan] = { distances: [], avgDistance: 0 };
        }
        distanceAnalysis[kecamatan].distances.push(distanceFromMerapi);
      }
    });

    Object.keys(distanceAnalysis).forEach((kec) => {
      const distances = distanceAnalysis[kec].distances;
      distanceAnalysis[kec].avgDistance =
        distances.reduce((a, b) => a + b, 0) / distances.length;
    });

    return {
      riskCategories,
      totalCoverageArea,
      coverageAnalysis,
      distanceAnalysis,
    };
  }, [baraks, serviceRadius]);

  const filteredBaraks = useMemo(() => {
    if (!selectedKecamatan) return baraks;
    return baraks.filter((barak) => barak.kecamatan === selectedKecamatan);
  }, [baraks, selectedKecamatan]);

  const kecamatanList = useMemo(
    () => [...new Set(baraks.map((b) => b.kecamatan).filter((k) => k))].sort(),
    [baraks]
  );

  const barakIcon = new L.AwesomeMarkers.icon({
    icon: "tent",
    prefix: "fa",
    markerColor: "green",
    iconColor: "black",
  });

  const merapiIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen">
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
            <a
              href="/merapiintro"
              className="hover:text-red-400 transition-colors"
            >
              Tentang
            </a>
            <a href="/maps" className="text-red-400 border-b-2 border-red-400">
              Peta
            </a>
            <a
              href="/information"
              className="hover:text-red-400 transition-colors"
            >
              Mitigasi
            </a>
            <a href="/beritas" className="hover:text-red-400 transition-colors">
              Berita
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/mapsbarak"
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Maps
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

      <div
        className={`fixed top-20 left-0 w-80 bg-white shadow-2xl z-20 transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto`}
        style={{ height: "calc(100vh - 5rem)" }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Coverage Analysis
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode Analisis
            </label>
            <select
              value={analysisMode}
              onChange={(e) => setAnalysisMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="coverage">🗺️ Coverage Gap Analysis</option>
              <option value="risk">⚠️ Distance-based Risk</option>
            </select>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showClustering}
                onChange={(e) => setShowClustering(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Marker Clustering</span>
            </label>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Kecamatan
            </label>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map((kec) => (
                <option key={kec} value={kec}>
                  {kec}
                </option>
              ))}
            </select>
          </div>

          {analysisResults && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                {analysisMode === "coverage" && (
                  <>
                    <Target className="w-4 h-4" />
                    Coverage Analysis
                  </>
                )}
                {analysisMode === "risk" && (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Risk Analysis
                  </>
                )}
              </h3>

              {loading ? (
                <div className="p-3 bg-blue-50 rounded-lg border text-center">
                  <div className="text-blue-600">Memuat data...</div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  {analysisMode === "coverage" && (
                    <>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span>Total Area Cakupan:</span>
                          <span className="font-medium">
                            {analysisResults.totalCoverageArea.toFixed(2)} km²
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Radius Layanan:</span>
                          <span className="font-medium">
                            {(serviceRadius / 1000).toFixed(1)} km
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Total Barak:</span>
                          <span className="font-medium">
                            {filteredBaraks.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rerata Cakupan Barak:</span>
                          <span className="font-medium">
                            {(
                              analysisResults.totalCoverageArea /
                              filteredBaraks.length
                            ).toFixed(2)}{" "}
                            km²
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">
                          Coverage per Kecamatan:
                        </h4>
                        {Object.entries(analysisResults.coverageAnalysis)
                          .sort((a, b) => b[1].totalArea - a[1].totalArea)
                          .slice(0, 5)
                          .map(([kec, data]) => (
                            <div
                              key={kec}
                              className="p-2 bg-gray-50 rounded text-xs"
                            >
                              <div className="font-medium">{kec}</div>
                              <div className="flex justify-between">
                                <span>
                                  Area: {data.totalArea.toFixed(1)} km²
                                </span>
                                <span>Barak: {data.count}</span>
                              </div>
                              <div className="text-gray-600">
                                Rerata/Barak:{" "}
                                {(data.totalArea / data.count).toFixed(2)} km²
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Gap Analysis:
                        </h4>
                        <div className="text-xs space-y-1">
                          <div>
                            • Area dengan cakupan yang tumpang tindih dapat
                            mengindikasikan adanya surplus barak
                          </div>
                          <div>
                            • Area tanpa cakupan menunjukkan potensi kesenjangan
                            barak
                          </div>
                          <div>
                            • Pertimbangkan distribusi barak yang optimal untuk
                            cakupan maksimum
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {analysisMode === "risk" && (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-red-800">
                            Very High Risk
                          </span>
                        </div>
                        <div className="text-red-700">
                          {analysisResults.riskCategories.veryHigh} barak (&lt;5
                          km from Merapi)
                        </div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-orange-600" />
                          <span className="font-medium text-orange-800">
                            High Risk
                          </span>
                        </div>
                        <div className="text-orange-700">
                          {analysisResults.riskCategories.high} barak (5-12.5 km
                          from Merapi)
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">
                            Medium Risk
                          </span>
                        </div>
                        <div className="text-yellow-700">
                          {analysisResults.riskCategories.medium} barak
                          (12.5-18.75 km from Merapi)
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-800">
                            Low Risk
                          </span>
                        </div>
                        <div className="text-green-700">
                          {analysisResults.riskCategories.low} barak (&gt;18.75
                          km from Merapi)
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">
                          Rerata Jarak ke Merapi:
                        </h4>
                        {Object.entries(analysisResults.distanceAnalysis)
                          .sort((a, b) => a[1].avgDistance - b[1].avgDistance)
                          .slice(0, 5)
                          .map(([kec, data]) => (
                            <div
                              key={kec}
                              className="p-2 bg-gray-50 rounded text-xs"
                            >
                              <div className="font-medium">{kec}</div>
                              <div className="flex justify-between">
                                <span>
                                  Rerata Jarak: {data.avgDistance.toFixed(1)} km
                                </span>
                                <span>Barak: {data.distances.length}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      <div
        className={`absolute top-20 bottom-0 right-0 transition-all duration-300 ${
          showSidebar ? "left-80" : "left-0"
        }`}
      >
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

              <BaseLayer name="Terrain">
                <TileLayer
                  attribution="&copy; OpenTopoMap"
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>

              {slemankecData && (
                <Overlay checked name="Kecamatan">
                  <GeoJSON
                    data={slemankecData}
                    style={{ color: "#333333", weight: 2, fillOpacity: 0.05 }}
                    onEachFeature={(feature, layer) => {
                      const { Kecamatan } = feature.properties;
                      layer.bindPopup(
                        `<strong>Kecamatan: ${Kecamatan}</strong>`
                      );
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
                      layer.bindPopup(
                        `<strong>${namazona}</strong><br/>Resiko: ${resiko}`
                      );
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
                      layer.bindPopup(
                        `<strong>Jalur Evakuasi</strong><br/>${nm_ruas}`
                      );
                    }}
                  />
                </Overlay>
              )}
            </LayersControl>
          )}

          {!showLayersControl && (
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

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

          {analysisMode === "coverage" && mapInstance && (
            <CoverageGapAnalysis
              data={filteredBaraks}
              map={mapInstance}
              serviceRadius={serviceRadius}
              showCoverageZones={showCoverageZones}
            />
          )}

          {analysisMode === "risk" && mapInstance && (
            <DistanceRiskAnalysis data={filteredBaraks} map={mapInstance} />
          )}

          {mapInstance && (
            <MarkerClustering
              data={filteredBaraks}
              map={mapInstance}
              showClustering={showClustering}
              icon={barakIcon}
            />
          )}

          {!showClustering &&
            filteredBaraks
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
                      <div className="text-xs">
                        <strong>
                          {barak.nama_barak || "Nama tidak tersedia"}
                        </strong>
                        <br />
                        <strong>Kecamatan:</strong> {barak.kecamatan || "-"}
                        <br />
                        <strong>Desa:</strong> {barak.desa || "-"}
                        <br />
                        <strong>Koordinat:</strong> {lat.toFixed(4)},{" "}
                        {lng.toFixed(4)}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
        </MapContainer>
      </div>
      {(analysisMode === "coverage" || analysisMode === "risk") && (
        <div className="fixed bottom-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-xs text-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Legend
          </h3>
          <div className="space-y-2 text-xs">
            {analysisMode === "coverage" && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-2 bg-gradient-to-r from-[#003366] via-[#3366CC] via-[#66CC66] via-[#FFFF33] via-[#FF9933] to-[#FF3333]"></div>
                  <span>Densitas Cakupan</span>
                </div>
                <div className="text-gray-600 mt-2">
                  • <span style={{ color: "#003366" }}>Biru Gelap</span>:
                  Densitas terendah (0.0)
                  <br />• <span style={{ color: "#3366CC" }}>Biru Sedang</span>:
                  Densitas rendah (0.2)
                  <br />• <span style={{ color: "#66CC66" }}>Hijau</span>:
                  Densitas moderat (0.4)
                  <br />• <span style={{ color: "#FFFF33" }}>Kuning</span>:
                  Densitas tinggi (0.6)
                  <br />• <span style={{ color: "#FF9933" }}>Oranye</span>:
                  Densitas sangat tinggi (0.8)
                  <br />• <span style={{ color: "#FF3333" }}>Merah</span>:
                  Densitas tertinggi (1.0)
                  <br /> <br />Area yang lebih gelap menunjukkan konsentrasi barak
                  yang lebih tinggi; area yang lebih terang menunjukkan celah
                </div>
              </>
            )}
            {analysisMode === "risk" && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Low Risk (&gt;18.75 km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>Medium Risk (12.5-18.75 km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span>High Risk (5-12.5 km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600"></div>
                  <span>Very High Risk (&lt;5 km)</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverageGapAnalysisMain;
