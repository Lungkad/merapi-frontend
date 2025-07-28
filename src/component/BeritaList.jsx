import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Tent,
  Newspaper,
  PanelBottom,
  User,
  LogOut,
} from "lucide-react";
import { beritaAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const BeritaList = () => {
  const [beritas, setBeritas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [alert, setAlert] = useState(null);
  const { logout } = useAuth();

  const navigate = useNavigate();
  const activeTab = "beritalist"; // Hardcoded for this component

  useEffect(() => {
    fetchBeritas(currentPage);
  }, [currentPage]);

  const fetchBeritas = async (page) => {
    try {
      setLoading(true);
      const response = await beritaAPI.getAll(page);
      setBeritas(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch (error) {
      setAlert({ type: "error", message: "Gagal memuat data berita" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
      try {
        await beritaAPI.delete(id);
        setAlert({ type: "success", message: "Berita berhasil dihapus" });
        fetchBeritas(currentPage);
      } catch (error) {
        setAlert({ type: "error", message: "Gagal menghapus berita" });
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Siaga Merapi</h1>
          <p className="text-gray-400 text-sm mt-1">Dashboard Admin</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigate("/dashboard")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <TrendingUp className="w-5 h-5 mr-3" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/baraks")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "baraks"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Tent className="w-5 h-5 mr-3" />
                Manajemen Barak
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/beritalist")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "beritalist"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Newspaper className="w-5 h-5 mr-3" />
                Manajeman Berita
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/dbtoggle")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "dbtoggle"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <PanelBottom className="w-5 h-5 mr-3" />
                Panel Status
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admininstrator</p>
              <p className="text-xs text-gray-400">admin@merapi.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center px-6 py-2 text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {alert && (
          <div
            className={`alert mt-4 mb-4 p-4 rounded ${
              alert.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {alert.message}
            <button
              onClick={() => setAlert(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-6 mt-6">
          <h1 className="text-2xl font-bold">Daftar Berita</h1>
          <Link
            to="/beritaform"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tambah Berita
          </Link>
        </div>

        <div className="bg-white rounded shadow overflow-hidden">
          {beritas.length > 0 ? (
            <>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gambar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Summary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link Berita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {beritas.map((berita, index) => (
                    <tr key={berita.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(currentPage - 1) * 10 + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {berita.judul_berita}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <img
                          src={berita.gambar_berita}
                          alt={berita.judul_berita}
                          className="w-20 h-20 object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {berita.ringkasan_berita}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <a
                          href={berita.url_berita}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Lihat Berita
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/beritas/${berita.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(berita.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.last_page}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(currentPage - 1) * pagination.per_page + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              currentPage * pagination.per_page,
                              pagination.total
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {pagination.total}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          {Array.from(
                            { length: pagination.last_page },
                            (_, i) => i + 1
                          ).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Belum ada data berita.</p>
              <Link
                to="/beritaform"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Tambah Berita Pertama
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeritaList;
