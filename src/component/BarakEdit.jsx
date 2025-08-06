import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { barakAPI } from "../services/api";
import { desaOptions, kecamatanOptions, bangunanOptions } from "../constants/options";
import {
  ArrowLeft,
  Save,
  Loader2,
  Building,
  Users,
  MapPin,
  Navigation,
  Home,
  Map,
  Settings,
  Edit3,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

const BarakEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nama_barak: "",
    tipe_bangunan: "",
    kapasitas: "",
    fasilitas: "",
    alamat: "",
    desa: "",
    kecamatan: "",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchBarak();
  }, [id]);

  const fetchBarak = async () => {
    try {
      const response = await barakAPI.getById(id);
      if (response.data?.data) {
        setFormData(response.data.data);
      } else {
        setAlert({ type: "error", message: "Data tidak ditemukan." });
      }
    } catch (error) {
      setAlert({ type: "error", message: "Gagal memuat data barak." });
    } finally {
      setLoading(false);
    }
  };

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
      },
    });

    return formData.latitude && formData.longitude ? (
      <Marker position={[formData.latitude, formData.longitude]}>
        <Popup>
          Latitude: {formData.latitude}
          <br />
          Longitude: {formData.longitude}
        </Popup>
      </Marker>
    ) : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      await barakAPI.update(id, formData);
      setAlert({ type: "success", message: "Barak berhasil diperbarui" });
      setTimeout(() => navigate("/baraks"), 1500);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setAlert({
          type: "error",
          message: error.response?.data?.message || "Terjadi kesalahan",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Memuat data barak...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate("/baraks")}
                className="flex items-center space-x-2 hover:bg-gray-800 px-3 py-2 rounded-md transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali</span>
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <h1 className="text-xl font-semibold">Edit Barak</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {alert && (
          <div
            className={`alert mb-6 p-4 rounded-lg ${
              alert.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {alert.message}
            <button
              onClick={() => setAlert(null)}
              className="float-right font-bold hover:opacity-70"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Edit3 className="w-6 h-6 mr-2" />
              Edit Data Barak
            </h2>
            <p className="text-blue-100 mt-1">
              Perbarui informasi barak pengungsian
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informasi Dasar Barak */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nama Barak */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Building className="w-4 h-4 mr-2 text-green-500" />
                  Nama Barak
                </label>
                <input
                  type="text"
                  name="nama_barak"
                  value={formData.nama_barak}
                  onChange={handleChange}
                  placeholder="Masukkan nama barak..."
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                    errors.nama_barak ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.nama_barak && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.nama_barak[0]}
                  </p>
                )}
              </div>

              {/* Tipe Bangunan */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Home className="w-4 h-4 mr-2 text-blue-500" />
                  Tipe Bangunan
                </label>
                <input
                  list="bangunan-list"
                  name="tipe_bangunan"
                  value={formData.tipe_bangunan}
                  onChange={handleChange}
                  placeholder="Ketik atau pilih tipe bangunan"
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                    errors.tipe_bangunan ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <datalist id="bangunan-list">
                  {bangunanOptions.map((option, i) => (
                    <option key={i} value={option} />
                  ))}
                </datalist>
                {errors.tipe_bangunan && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tipe_bangunan[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Kapasitas */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Users className="w-4 h-4 mr-2 text-purple-500" />
                Kapasitas
              </label>
              <input
                type="text"
                name="kapasitas"
                value={formData.kapasitas}
                onChange={handleChange}
                placeholder="Masukkan kapasitas barak (orang)..."
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                  errors.kapasitas ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.kapasitas && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.kapasitas[0]}
                </p>
              )}
            </div>

            {/* Fasilitas */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Settings className="w-4 h-4 mr-2 text-orange-500" />
                Fasilitas
              </label>
              <textarea
                name="fasilitas"
                value={formData.fasilitas}
                onChange={handleChange}
                rows={4}
                placeholder="Deskripsikan fasilitas yang tersedia di barak..."
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none ${
                  errors.fasilitas ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.fasilitas && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fasilitas[0]}
                </p>
              )}
            </div>

            {/* Alamat */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                Alamat
              </label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                rows={3}
                placeholder="Masukkan alamat lengkap barak..."
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none ${
                  errors.alamat ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.alamat && (
                <p className="text-red-500 text-sm mt-1">{errors.alamat[0]}</p>
              )}
            </div>

            {/* Kecamatan dan Desa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kecamatan */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Navigation className="w-4 h-4 mr-2 text-indigo-500" />
                  Kecamatan
                </label>
                <input
                  list="kecamatan-list"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  placeholder="Ketik atau pilih kecamatan"
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                    errors.kecamatan ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <datalist id="kecamatan-list">
                  {kecamatanOptions.map((option, i) => (
                    <option key={i} value={option} />
                  ))}
                </datalist>
                {errors.kecamatan && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.kecamatan[0]}
                  </p>
                )}
              </div>

              {/* Desa */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Home className="w-4 h-4 mr-2 text-teal-500" />
                  Desa
                </label>
                <input
                  type="text"
                  name="desa"
                  list="desa-list"
                  value={formData.desa}
                  onChange={handleChange}
                  placeholder="Ketik atau pilih desa"
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                    errors.desa ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <datalist id="desa-list">
                  {desaOptions.map((option, i) => (
                    <option key={i} value={option} />
                  ))}
                </datalist>
                {errors.desa && (
                  <p className="text-red-500 text-sm mt-1">{errors.desa[0]}</p>
                )}
              </div>
            </div>

            {/* Koordinat */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <Map className="w-5 h-5 mr-2 text-green-600" />
                Koordinat Lokasi
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Latitude */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Navigation className="w-4 h-4 mr-2 text-blue-500" />
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Contoh: -7.773928013319334"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                      errors.latitude ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <small className="text-gray-500 text-xs">
                    Masukkan angka latitude (boleh positif atau negatif)
                  </small>
                  {errors.latitude && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.latitude[0]}
                    </p>
                  )}
                </div>

                {/* Longitude */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Navigation className="w-4 h-4 mr-2 text-green-500" />
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Contoh: 110.36118280243396"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                      errors.longitude ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <small className="text-gray-500 text-xs">
                    Masukkan angka longitude (boleh positif atau negatif)
                  </small>
                  {errors.longitude && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.longitude[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Interactive Map */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-3 flex items-center">
                  <Map className="w-4 h-4 mr-2" />
                  Klik pada peta untuk memperbarui lokasi barak
                </p>
                <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                  <MapContainer
                    center={[
                      formData.latitude || -7.773928013319334,
                      formData.longitude || 110.36118280243396,
                    ]}
                    zoom={13}
                    style={{ height: "400px", width: "100%" }}
                    key={`${formData.latitude}-${formData.longitude}`} // Force re-render when coordinates change
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker />
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/baraks")}
                className="px-6 py-3 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Perbarui Barak</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Edit3 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Tips Mengedit Barak
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Pastikan perubahan data sudah sesuai dan akurat</li>
                  <li>Periksa kembali koordinat lokasi pada peta</li>
                  <li>Update fasilitas jika ada perubahan</li>
                  <li>Verifikasi kapasitas barak sesuai kondisi terkini</li>
                  <li>Pastikan alamat mudah ditemukan oleh petugas lapangan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarakEdit;