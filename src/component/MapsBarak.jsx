import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  GeoJSON,
  Circle,
  useMap,
  Polyline,
} from "react-leaflet";
import {
  Search,
  MapPin,
  Navigation,
  BarChart3,
  X,
  Menu,
  Activity,
  Route,
  Navigation2,
  Target,
} from "lucide-react";
import L from "leaflet";
import logo from "../assets/logo.png";
import { barakAPI } from "../services/api";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Routing Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Render nothing if there's an error
    }

    return this.props.children;
  }
}

// GraphHopper Configuration
const GRAPHHOPPER_CONFIG = {
  API_KEY: "36cb51ca-a3a3-43ca-a1c2-c34e784c7509",

  BASE_URL: "https://graphhopper.com/api/1/route",

  // Enhanced settings available with API key
  SETTINGS: {
    vehicle: "car",
    locale: "id",
    optimize: "true",
    instructions: "true",
    calc_points: "true",
    debug: "false",
    elevation: "false",
    points_encoded: "false",
    type: "json",

    // Advanced routing options (API key required)
    algorithm: "dijkstra",
    heading_penalty: "120",
    point_hint: "",
    // Traffic and road preferences (API key required)
    avoid: "",
    block_area: "",

    // Alternative routes (API key required)
    alternative_route: {
      max_paths: "2",
      max_weight_factor: "1.4",
      max_share_factor: "0.6",
    },
  },
};

const GraphHopperRouting = ({ start, end, onRouteFound, onRouteClear }) => {
  const map = useMap();
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);

  // CRITICAL FIX: Use refs to prevent infinite loops
  const lastRequestRef = useRef(null);
  const routeFoundRef = useRef(false);

  useEffect(() => {
    if (!map || !start || !end) {
      setRouteCoordinates([]);
      setAlternativeRoutes([]);
      setIsLoading(false);
      routeFoundRef.current = false;
      onRouteClear();
      return;
    }

    // CRITICAL FIX: Create a unique key for this request
    const requestKey = `${start.lat},${start.lng}-${end.lat},${end.lng}`;

    // CRITICAL FIX: Don't make the same request twice
    if (lastRequestRef.current === requestKey && routeFoundRef.current) {
      console.log("🔄 Skipping duplicate request for:", requestKey);
      return;
    }

    // CRITICAL FIX: Don't start new request if already loading the same route
    if (isLoading && lastRequestRef.current === requestKey) {
      console.log("⏳ Already loading this route, skipping...");
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    lastRequestRef.current = requestKey;
    setIsLoading(true);
    routeFoundRef.current = false;

    const fetchRoute = async () => {
      try {
        console.log("🚀 Starting route calculation for:", requestKey);

        // Validate coordinates first
        if (!start.lat || !start.lng || !end.lat || !end.lng) {
          throw new Error("Invalid start or end coordinates");
        }

        if (Math.abs(start.lat) > 90 || Math.abs(end.lat) > 90) {
          throw new Error(
            "Invalid latitude values (must be between -90 and 90)"
          );
        }

        if (Math.abs(start.lng) > 180 || Math.abs(end.lng) > 180) {
          throw new Error(
            "Invalid longitude values (must be between -180 and 180)"
          );
        }

        // OSRM expects lon,lat format!
        const startCoord = `${start.lng},${start.lat}`;
        const endCoord = `${end.lng},${end.lat}`;

        const url = `https://router.project-osrm.org/route/v1/driving/${startCoord};${endCoord}?overview=full&geometries=geojson&steps=true`;

        console.log("🌐 OSRM URL:", url);

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
          headers: {
            Accept: "application/json",
          },
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error(`OSRM HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== "Ok") {
          throw new Error(`OSRM: ${data.message || data.code}`);
        }

        if (!data.routes || data.routes.length === 0) {
          throw new Error("No routes found");
        }

        const route = data.routes[0];

        // Validate route data
        if (
          !route.geometry ||
          !route.geometry.coordinates ||
          route.geometry.coordinates.length === 0
        ) {
          throw new Error("Invalid route data received");
        }

        // Extract coordinates (OSRM returns [lon, lat], we need [lat, lon] for Leaflet)
        const coordinates = route.geometry.coordinates.map((coord) => [
          coord[1],
          coord[0],
        ]);

        // CRITICAL FIX: Only update state if this is still the current request
        if (
          lastRequestRef.current === requestKey &&
          !abortControllerRef.current.signal.aborted
        ) {
          setRouteCoordinates(coordinates);
          setAlternativeRoutes([]);
          routeFoundRef.current = true;

          // Calculate route info
          const distanceKm = (route.distance / 1000).toFixed(2);
          const timeMinutes = Math.round(route.duration / 60);

          // Extract instructions
          const instructions = [];
          if (route.legs && route.legs.length > 0) {
            route.legs.forEach((leg) => {
              if (leg.steps) {
                leg.steps.forEach((step) => {
                  if (step.maneuver && step.maneuver.instruction) {
                    instructions.push({
                      text: step.maneuver.instruction,
                      distance: step.distance,
                      duration: step.duration,
                      type: step.maneuver.type,
                    });
                  }
                });
              }
            });
          }

          const routeInfo = {
            distance: distanceKm,
            time: timeMinutes,
            instructions: instructions,
            alternatives: null,
            service: "OSRM",
          };

          // CRITICAL FIX: Use callback to prevent dependency issues
          setTimeout(() => {
            if (
              lastRequestRef.current === requestKey &&
              routeFoundRef.current
            ) {
              onRouteFound(routeInfo);
            }
          }, 0);

          // Fit map to route bounds
          if (coordinates.length > 0) {
            const bounds = L.latLngBounds(coordinates);
            map.fitBounds(bounds, { padding: [20, 20] });
          }

          console.log("✅ Route found successfully:", {
            key: requestKey,
            distance: distanceKm + " km",
            time: timeMinutes + " minutes",
            points: coordinates.length,
          });
        } else {
          console.log("🚫 Discarding outdated route result for:", requestKey);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("🛑 Route request was cancelled for:", requestKey);
          return;
        }

        console.error("❌ Routing failed for:", requestKey, error);

        // CRITICAL FIX: Only update state if this is still the current request
        if (
          lastRequestRef.current === requestKey &&
          !abortControllerRef.current.signal.aborted
        ) {
          setRouteCoordinates([]);
          setAlternativeRoutes([]);
          routeFoundRef.current = false;

          // CRITICAL FIX: Use callback to prevent dependency issues
          setTimeout(() => {
            if (lastRequestRef.current === requestKey) {
              onRouteClear();
            }
          }, 0);

          // Enhanced error messages
          let userMessage = "Gagal menghitung rute. ";

          if (
            error.message.includes("Invalid coordinates") ||
            error.message.includes("Invalid latitude") ||
            error.message.includes("Invalid longitude")
          ) {
            userMessage += "Koordinat tidak valid.";
          } else if (
            error.message.includes("No route") ||
            error.message.includes("NoRoute")
          ) {
            userMessage += "Tidak dapat menemukan rute ke tujuan.";
          } else if (
            error.message.includes("Too many requests") ||
            error.message.includes("429")
          ) {
            userMessage += "Terlalu banyak permintaan. Tunggu sebentar.";
          } else {
            userMessage += "Periksa koneksi internet.";
          }

          alert(userMessage);
        }
      } finally {
        // CRITICAL FIX: Only update loading state if this is still the current request
        if (lastRequestRef.current === requestKey) {
          setIsLoading(false);
        }
      }
    };

    // CRITICAL FIX: Add delay to prevent rapid successive requests
    const timeoutId = setTimeout(fetchRoute, 800);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // DON'T reset state in cleanup to prevent flicker
    };
  }, [
    // CRITICAL FIX: Use JSON.stringify to ensure proper comparison of objects
    JSON.stringify(start),
    JSON.stringify(end),
    map,
    // REMOVED: onRouteFound and onRouteClear from dependencies to prevent loops
  ]);

  // CRITICAL FIX: Separate cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setRouteCoordinates([]);
      setAlternativeRoutes([]);
      setIsLoading(false);
      routeFoundRef.current = false;
    };
  }, []);

  // Render the route
  return (
    <>
      {/* Loading indicator */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          🔄 Menghitung rute...
        </div>
      )}

      {/* Main Route */}
      {routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: "#3B82F6",
            weight: 6,
            opacity: 0.8,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      )}

      {/* Alternative Routes */}
      {alternativeRoutes.map((route, index) => (
        <Polyline
          key={`alt-route-${index}`}
          positions={route.coordinates}
          pathOptions={{
            color: "#9CA3AF",
            weight: 4,
            opacity: 0.6,
            dashArray: "10, 10",
          }}
        />
      ))}
    </>
  );
};

// Legend Component
const Legend = () => {
  const legendItems = [
    { icon: "fa-tent", color: "green", label: "Barak - Barak Evakuasi" },
    { icon: "fa-tent", color: "red", label: "Barak - Kantor Pemerintahan" },
    { icon: "fa-tent", color: "blue", label: "Barak - Fasilitas Pendidikan" },
    { icon: "fa-tent", color: "purple", label: "Barak - Fasilitas Olahraga" },
    { icon: "fa-mountain", color: "red", label: "Gunung Merapi" },
    { icon: "fa-user", color: "blue", label: "Lokasi Anda" },
    { icon: "fa-minus", color: "gray", label: "Jalur Evakuasi" },
    { icon: "fa-minus", color: "red", label: "Jarak dari Merapi" },
    { icon: "fa-route", color: "blue", label: "Rute Navigasi" },
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

  // Navigation States
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [nearestBarak, setNearestBarak] = useState(null);

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

  // Find nearest barak
  const findNearestBarak = () => {
    if (!userLocation || baraks.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    baraks.forEach((barak) => {
      const lat = parseFloat(barak.latitude);
      const lng = parseFloat(barak.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          lat,
          lng
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearest = { ...barak, distance };
        }
      }
    });

    return nearest;
  };

  // Update nearest barak when user location or baraks change
  useEffect(() => {
    if (userLocation && baraks.length > 0) {
      const nearest = findNearestBarak();
      setNearestBarak(nearest);
    }
  }, [userLocation, baraks]);

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

  // Navigate to nearest barak with improved error handling
  const navigateToNearestBarak = () => {
    try {
      if (!userLocation) {
        setError(
          "Lokasi Anda belum terdeteksi. Klik 'Gunakan Lokasi Saya' terlebih dahulu."
        );
        return;
      }

      const nearest = findNearestBarak();
      if (!nearest) {
        setError("Tidak ada barak yang ditemukan.");
        return;
      }

      const lat = parseFloat(nearest.latitude);
      const lng = parseFloat(nearest.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        setError("Koordinat barak terdekat tidak valid.");
        return;
      }

      // Clear any previous errors
      setError(null);

      setNavigationTarget({
        lat,
        lng,
        barak: nearest,
      });
      setIsNavigating(true);
    } catch (err) {
      console.error("Error in navigateToNearestBarak:", err);
      setError("Terjadi kesalahan saat memulai navigasi.");
    }
  };

  // Navigate to specific barak with improved error handling
  const navigateToBarak = (barak) => {
    try {
      if (!userLocation) {
        setError(
          "Lokasi Anda belum terdeteksi. Klik 'Gunakan Lokasi Saya' terlebih dahulu."
        );
        return;
      }

      const lat = parseFloat(barak.latitude);
      const lng = parseFloat(barak.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        setError("Koordinat barak tidak valid.");
        return;
      }

      // Clear any previous errors
      setError(null);

      setNavigationTarget({
        lat,
        lng,
        barak,
      });
      setIsNavigating(true);
    } catch (err) {
      console.error("Error in navigateToBarak:", err);
      setError("Terjadi kesalahan saat memulai navigasi.");
    }
  };

  // Handle route found with error checking
  const handleRouteFound = useCallback((info) => {
    console.log("📍 Route info received:", info);
    setRouteInfo(info);
  }, []);

  const handleRouteClear = useCallback(() => {
    console.log("🧹 Route cleared");
    setRouteInfo(null);
  }, []);

  const memoizedNavigationTarget = useMemo(() => {
    return navigationTarget;
  }, [
    navigationTarget?.lat,
    navigationTarget?.lng,
    navigationTarget?.barak?.id,
  ]);

  const memoizedUserLocation = useMemo(() => {
    return userLocation;
  }, [userLocation?.lat, userLocation?.lng]);

  // Stop navigation with proper cleanup
  const stopNavigation = () => {
    try {
      setIsNavigating(false);
      setNavigationTarget(null);
      setRouteInfo(null);
      // Clear any error messages related to navigation
      if (error && error.includes("navigasi")) {
        setError(null);
      }
    } catch (err) {
      console.error("Error stopping navigation:", err);
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
  const buildingIcons = {
    'Barak Evakuasi': new L.AwesomeMarkers.icon({
      icon: "tent", // Font Awesome icon for Type1
      prefix: "fa",
      markerColor: "green",
      iconColor: "black",
    }),
    'Fasilitas Pendidikan': new L.AwesomeMarkers.icon({
      icon: "tent", // Font Awesome icon for Type2
      prefix: "fa",
      markerColor: "blue",
      iconColor: "black",
    }),
    'Kantor Pemerintahan': new L.AwesomeMarkers.icon({
      icon: "tent", // Font Awesome icon for Type3
      prefix: "fa",
      markerColor: "red",
      iconColor: "black",
    }),
    'Fasilitas Olahraga': new L.AwesomeMarkers.icon({
      icon: "tent", // Font Awesome icon for Type4
      prefix: "fa",
      markerColor: "purple",
      iconColor: "black",
    }),
  };

  const getIconByBuildingType = (tipe_Bangunan) => {
    return buildingIcons[tipe_Bangunan] || buildingIcons['Barak Evakuasi']; // Fallback to Type1 icon if type is unknown
  };

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

  const targetIcon = new L.AwesomeMarkers.icon({
    icon: "bullseye", // Font Awesome target icon
    prefix: "fa", // Font Awesome prefix
    markerColor: "orange", // Marker color
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
            <a href="/berita" className="hover:text-red-400 transition-colors">
              Berita
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/mapsanalisis"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Analisis</span>
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

          {/* Location and Navigation Buttons */}
          <div className="mb-4 space-y-2">
            <button
              onClick={getUserLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Gunakan Lokasi Saya
            </button>

            {userLocation && nearestBarak && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-sm text-green-800 mb-2">
                  <strong>Barak Terdekat:</strong>
                  <br />
                  {nearestBarak.nama_barak}
                  <br />
                  <span className="text-green-600">
                    {nearestBarak.distance.toFixed(2)} km dari lokasi Anda
                  </span>
                </div>
                <button
                  onClick={navigateToNearestBarak}
                  disabled={isNavigating}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Target className="w-4 h-4" />
                  {isNavigating ? "Navigasi Aktif" : "Navigasi ke Sini"}
                </button>
              </div>
            )}

            {isNavigating && routeInfo && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800 mb-2">
                  <strong>Informasi Rute:</strong>
                  <br />
                  Jarak: {routeInfo.distance} km
                  <br />
                  Waktu: {routeInfo.time} menit
                  <br />
                  Tujuan: {navigationTarget.barak.nama_barak}
                  {routeInfo.alternatives && (
                    <>
                      <br />
                      <span className="text-blue-600">
                        🛣️ {routeInfo.alternatives.count} rute alternatif
                        tersedia
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={stopNavigation}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Hentikan Navigasi
                </button>
              </div>
            )}

            {isNavigating && !routeInfo && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="text-sm text-yellow-800 mb-2">
                  <strong>Mencari Rute...</strong>
                  <br />
                  Sedang menghitung rute terbaik ke{" "}
                  {navigationTarget?.barak?.nama_barak}
                </div>
                <button
                  onClick={stopNavigation}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Batalkan
                </button>
              </div>
            )}
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
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
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
                      {userLocation && (
                        <button
                          onClick={() => navigateToBarak(barak)}
                          disabled={isNavigating}
                          className="w-full flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <Route className="w-3 h-3" />
                          Navigasi
                        </button>
                      )}
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

          {/* GraphHopper Routing Control with Error Boundary */}
          {isNavigating && userLocation && navigationTarget && (
            <ErrorBoundary>
              <GraphHopperRouting
                start={userLocation}
                end={navigationTarget}
                onRouteFound={handleRouteFound}
                onRouteClear={handleRouteClear}
              />
            </ErrorBoundary>
          )}

          {isNavigating && userLocation && navigationTarget && (
            <ErrorBoundary>
              <GraphHopperRouting
                start={userLocation}
                end={navigationTarget}
                onRouteFound={handleRouteFound}
                onRouteClear={handleRouteClear}
              />
            </ErrorBoundary>
          )}

          {/* Jalur Evakuasi Layer */}
          {jalurevakuasiData && (
            <GeoJSON
              data={jalurevakuasiData}
              style={{ color: "#8a8a8aff", weight: 3 }}
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

          {/* Navigation target marker */}
          {isNavigating && navigationTarget && (
            <Marker
              position={[navigationTarget.lat, navigationTarget.lng]}
              icon={targetIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong className="text-lg text-orange-600">
                    🎯 Tujuan Navigasi
                  </strong>
                  <br />
                  <strong>{navigationTarget.barak.nama_barak}</strong>
                  <br />
                  <strong>Alamat:</strong> {navigationTarget.barak.alamat}
                  <br />
                  <strong>Kecamatan:</strong> {navigationTarget.barak.kecamatan}
                  <br />
                  <strong>Desa:</strong> {navigationTarget.barak.desa}
                  <br />
                  <strong>Kapasitas:</strong> {navigationTarget.barak.kapasitas}{" "}
                  orang
                  {routeInfo && (
                    <>
                      <br />
                      <br />
                      <div className="bg-blue-100 p-2 rounded mt-2">
                        <strong className="text-blue-800">Info Rute:</strong>
                        <br />
                        <span className="text-blue-700">
                          📏 Jarak: {routeInfo.distance} km
                          <br />
                          ⏱️ Waktu: {routeInfo.time} menit
                          {routeInfo.alternatives && (
                            <>
                              <br />
                              🛣️ {routeInfo.alternatives.count} rute alternatif
                            </>
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
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
                  icon={getIconByBuildingType(barak.tipe_bangunan)}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong className="text-lg">
                        {barak.nama_barak || "Nama tidak tersedia"}
                      </strong>
                      <br />
                      <strong>Tipe Bangunan:</strong>{" "}
                      {barak.tipe_bangunan || "-"}
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
                      {userLocation && (
                        <>
                          <br />
                          <br />
                          <button
                            onClick={() => navigateToBarak(barak)}
                            disabled={isNavigating}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                          >
                            <Route className="w-4 h-4" />
                            {isNavigating
                              ? "Navigasi Aktif"
                              : "Navigasi ke Sini"}
                          </button>
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

        {/* Quick Navigation Button */}
        {userLocation && nearestBarak && !isNavigating && (
          <button
            onClick={navigateToNearestBarak}
            className="w-12 h-12 bg-green-600 rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors"
            title="Navigasi ke Barak Terdekat"
          >
            <Navigation2 className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Stop Navigation Button */}
        {isNavigating && (
          <button
            onClick={stopNavigation}
            className="w-12 h-12 bg-red-600 rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-colors"
            title="Hentikan Navigasi"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MapsBarak;
