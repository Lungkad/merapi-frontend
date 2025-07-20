import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Link,
  Image,
  AlignLeft,
} from "lucide-react";
import beritaAPI from "../services/api";

const BeritaForm = () => {
  const [id, setId] = useState(null); // Set to some ID to test edit mode
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    judul_berita: "",
    ringkasan_berita: "",
    gambar_berita: "",
    url_berita: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchBerita = async (id) => {
    setLoading(true);
    try {
      const response = await beritaAPI.get(`/beritas/${id}`);
      setFormData(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data berita", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    if (id) {
      await beritaAPI.put(`/beritas/${id}`, formData);
      alert('Berita berhasil diupdate!');
    } else {
      await beritaAPI.post('/beritas', formData);
      alert('Berita berhasil dibuat!');
    }
    navigate('/beritalist');
  } catch (error) {
    console.error('Gagal menyimpan data:', error);
    alert('Terjadi kesalahan saat menyimpan berita.');
  }
  setLoading(false);
};

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
              <h1 className="text-xl font-semibold">
                {id ? "Edit Berita" : "Tambah Berita"}
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              {id ? "Edit Berita" : "Buat Berita Baru"}
            </h2>
            <p className="text-blue-100 mt-1">
              {id
                ? "Perbarui informasi berita yang sudah ada"
                : "Isi formulir di bawah untuk membuat berita baru"}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Judul Berita */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                Judul Berita
              </label>
              <input
                type="text"
                value={formData.judul_berita}
                onChange={(e) =>
                  setFormData({ ...formData, judul_berita: e.target.value })
                }
                placeholder="Masukkan judul berita yang menarik..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Ringkasan Berita */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <AlignLeft className="w-4 h-4 mr-2 text-green-500" />
                Ringkasan Berita
              </label>
              <textarea
                value={formData.ringkasan_berita}
                onChange={(e) =>
                  setFormData({ ...formData, ringkasan_berita: e.target.value })
                }
                placeholder="Tulis ringkasan berita yang informatif dan menarik..."
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
              />
            </div>

            {/* Gambar Berita */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Image className="w-4 h-4 mr-2 text-purple-500" />
                URL Gambar Berita
              </label>
              <input
                type="text"
                value={formData.gambar_berita}
                onChange={(e) =>
                  setFormData({ ...formData, gambar_berita: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
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
                value={formData.url_berita}
                onChange={(e) =>
                  setFormData({ ...formData, url_berita: e.target.value })
                }
                placeholder="https://example.com/berita"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
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
                    <span>{id ? "Update Berita" : "Simpan Berita"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Tips Menulis Berita
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Gunakan judul yang menarik dan informatif</li>
                  <li>Ringkasan harus mencakup poin-poin utama berita</li>
                  <li>Pastikan URL gambar dapat diakses dan relevan</li>
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

export default BeritaForm;
