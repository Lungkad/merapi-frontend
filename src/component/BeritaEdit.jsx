import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Link,
  Image,
  AlignLeft,
} from "lucide-react";
import { beritaAPI } from "../services/api";

const BeritaEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    judul_berita: "",
    ringkasan_berita: "",
    gambar_berita: "",
    url_berita: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchBerita();
  }, [id]);

  const fetchBerita = async () => {
    try {
      const response = await beritaAPI.getById(id);
      if (response.data?.data) {
        setFormData(response.data.data);
      } else {
        setAlert({ type: "error", message: "Data tidak ditemukan." });
      }
    } catch (error) {
      setAlert({ type: "error", message: "Gagal memuat data berita." });
    } finally {
      setLoading(false);
    }
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
    setLoading(true);
    setErrors({});

    try {
      await beritaAPI.update(id, formData);
      setAlert({ type: "success", message: "Berita berhasil diperbarui" });
      setTimeout(() => navigate("/beritalist"), 1500);
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
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate("/beritalist")}
                className="flex items-center space-x-2 hover:bg-gray-800 px-3 py-2 rounded-md transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali</span>
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <h1 className="text-xl font-semibold">Edit Berita</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
              <FileText className="w-6 h-6 mr-2" />
              Edit Berita
            </h2>
            <p className="text-blue-100 mt-1">
              Perbarui informasi berita yang sudah ada
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Judul Berita */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                Judul Berita
              </label>
              <input
                type="text"
                name="judul_berita"
                value={formData.judul_berita}
                onChange={handleChange}
                placeholder="Masukkan judul berita yang menarik..."
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                  errors.judul_berita ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.judul_berita && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.judul_berita[0]}
                </p>
              )}
            </div>

            {/* Ringkasan Berita */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <AlignLeft className="w-4 h-4 mr-2 text-green-500" />
                Ringkasan Berita
              </label>
              <textarea
                name="ringkasan_berita"
                value={formData.ringkasan_berita}
                onChange={handleChange}
                placeholder="Tulis ringkasan berita yang informatif dan menarik..."
                required
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none ${
                  errors.ringkasan_berita ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.ringkasan_berita && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.ringkasan_berita[0]}
                </p>
              )}
            </div>

            {/* Gambar Berita */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Image className="w-4 h-4 mr-2 text-purple-500" />
                URL Gambar Berita
              </label>
              <input
                type="text"
                name="gambar_berita"
                value={formData.gambar_berita}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                  errors.gambar_berita ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.gambar_berita && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.gambar_berita[0]}
                </p>
              )}
              {formData.gambar_berita && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview Gambar:</p>
                  <img
                    src={formData.gambar_berita}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* URL Berita */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Link className="w-4 h-4 mr-2 text-orange-500" />
                URL Berita
              </label>
              <input
                type="url"
                name="url_berita"
                value={formData.url_berita}
                onChange={handleChange}
                placeholder="https://example.com/berita"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                  errors.url_berita ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.url_berita && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.url_berita[0]}
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/beritalist")}
                className="px-6 py-3 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Perbarui Berita</span>
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
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Tips Mengedit Berita
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Pastikan judul tetap menarik dan informatif</li>
                  <li>Ringkasan harus mencakup poin-poin utama berita</li>
                  <li>Periksa kembali URL gambar masih dapat diakses</li>
                  <li>URL berita harus mengarah ke sumber yang kredibel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeritaEdit;