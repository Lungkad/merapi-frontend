import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Tent, Newspaper, PanelBottom, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { barakAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const BarakList = () => {
  const [baraks, setBaraks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [alert, setAlert] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState("baraks");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBaraks(currentPage);
  }, [currentPage]);

  const fetchBaraks = async (page = 1, order = sortOrder) => {
    try {
      setLoading(true);
      const response = await barakAPI.getAll(page, order);
      setBaraks(response.data.data);
      setPagination({
        current_page: response.data.pagination.current_page,
        last_page: response.data.pagination.last_page,
        per_page: response.data.pagination.per_page,
        total: response.data.pagination.total,
      });
    } catch (error) {
      setAlert({ type: "error", message: "Gagal memuat data barak" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus barak ini?")) {
      try {
        await barakAPI.delete(id);
        setAlert({ type: "success", message: "Barak berhasil dihapus" });
        fetchBaraks(currentPage);
      } catch (error) {
        setAlert({ type: "error", message: "Gagal menghapus barak" });
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
                  activeTab === "reports"
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
          <h1 className="text-2xl font-bold">Daftar Barak</h1>
          <Link
            to="/baraksform"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tambah Barak
          </Link>
        </div>
        <div className="flex justify-end mb-4">
          <label className="mr-2 text-sm font-medium text-gray-700">
            Urutkan:
          </label>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              fetchBaraks(currentPage, e.target.value); // fetch ulang
            }}
            className="border border-gray-300 text-sm rounded px-2 py-1"
          >
            <option value="desc">Terbaru</option>
            <option value="asc">Terlama</option>
          </select>
        </div>
        <div className="bg-white rounded shadow overflow-hidden">
          {baraks.length > 0 ? (
            <>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Barak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kapasitas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alamat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Koordinat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {baraks.map((barak, index) => (
                    <tr key={barak.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {barak.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {barak.nama_barak}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {barak.kapasitas} orang
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {barak.alamat.length > 50
                          ? barak.alamat.substring(0, 50) + "..."
                          : barak.alamat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {barak.latitude}, {barak.longitude}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/baraks/${barak.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Detail
                          </Link>
                          <Link
                            to={`/baraks/${barak.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(barak.id)}
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
              <p className="text-gray-500 mb-4">Belum ada data barak.</p>
              <Link
                to="/baraksform"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Tambah Barak Pertama
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarakList;
