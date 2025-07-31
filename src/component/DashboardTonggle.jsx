// src/pages/AdminPage.jsx
import React, { useState } from "react";
import {
  Settings,
  Save,
  History,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Tent,
  Newspaper,
  LogOut,
  User,
  PanelBottom,
} from "lucide-react";
import { useStatus } from "./StatusContext";
import { statusConfig, getAllStatuses } from "../config/statusConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminPage = () => {
  const { currentStatus, updateStatus, lastUpdated } = useStatus();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dbtoggle");
  const { logout } = useAuth();

  // Fungsi untuk menampilkan notifikasi
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    logout();
  };

  // Fungsi untuk handle perubahan status
  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus) {
      showNotification(
        "warning",
        "Status yang dipilih sama dengan status saat ini"
      );
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateStatus(selectedStatus);
      setConfirmDialog(false);
      showNotification(
        "success",
        `Status berhasil diubah ke: ${statusConfig[selectedStatus].label}`
      );
    } catch (error) {
      showNotification("error", "Gagal mengubah status. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk format waktu
  const formatTime = (date) => {
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${
            notification.type === "success"
              ? "bg-green-500"
              : notification.type === "error"
              ? "bg-red-500"
              : "bg-yellow-500"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <CheckCircle size={20} className="mr-2" />
            ) : (
              <AlertCircle size={20} className="mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

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
                  activeTab === "db"
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
                  activeTab === "visitors"
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
                onClick={() => setActiveTab("dbtoggle")}
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
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-lg mb-6">
          <div className="bg-white text-black p-4">
            <h1 className="text-3xl font-bold flex items-center">
              <Settings className="mr-3" size={32} />
              Panel Admin - Status Gunung Merapi
            </h1>
            <p className="mt-2 opacity-90">
              Kelola dan update status siaga gunung Merapi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Saat Ini */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <History className="mr-2" />
                Status Saat Ini
              </h2>
              <div
                className={`${statusConfig[currentStatus].color} text-white p-6 rounded-lg`}
              >
                <div className="flex items-center mb-3">
                  {React.createElement(statusConfig[currentStatus].icon, {
                    size: 32,
                    className: "mr-4",
                  })}
                  <div>
                    <div className="text-2xl font-bold">
                      {statusConfig[currentStatus].label}
                    </div>
                    <div className="text-sm opacity-90">
                      Diperbarui: {formatTime(lastUpdated)}
                    </div>
                  </div>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                  {statusConfig[currentStatus].description}
                </p>
              </div>
            </div>
          </div>

          {/* Form Update Status */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Update Status</h2>
              <div className="space-y-4">
                {getAllStatuses().map((key) => {
                  const config = statusConfig[key];
                  const IconComponent = config.icon;
                  const isSelected = selectedStatus === key;
                  const isCurrent = currentStatus === key;

                  return (
                    <div
                      key={key}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? `${config.borderColor} bg-opacity-10 ${config.color}`
                          : "border-gray-200 hover:border-gray-300"
                      } ${isCurrent ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => setSelectedStatus(key)}
                    >
                      <div className="flex items-center mb-3">
                        <div
                          className={`${config.color} text-white p-3 rounded-full mr-4`}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg flex items-center">
                            {config.label}
                            {isCurrent && (
                              <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                AKTIF
                              </span>
                            )}
                          </h3>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            isSelected ? config.color : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div
                              className={`w-full h-full rounded-full ${config.color}`}
                            ></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setConfirmDialog(true)}
                disabled={selectedStatus === currentStatus || loading}
                className={`w-full py-3 mt-6 rounded-lg font-semibold transition-colors ${
                  selectedStatus === currentStatus || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading
                  ? "Memproses..."
                  : selectedStatus === currentStatus
                  ? "Status Sudah Aktif"
                  : "Update Status"}
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {confirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Konfirmasi Perubahan Status
                </h3>
                <div className="mb-4">
                  <p className="text-gray-600 mb-3">
                    Anda akan mengubah status dari:
                  </p>
                  <div className="flex items-center justify-between">
                    <div
                      className={`${statusConfig[currentStatus].color} text-white px-3 py-2 rounded-lg text-sm`}
                    >
                      {statusConfig[currentStatus].label}
                    </div>
                    <span className="mx-3">→</span>
                    <div
                      className={`${statusConfig[selectedStatus].color} text-white px-3 py-2 rounded-lg text-sm`}
                    >
                      {statusConfig[selectedStatus].label}
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Perubahan status akan mempengaruhi seluruh sistem dan
                    masyarakat. Pastikan keputusan ini sudah sesuai dengan
                    kondisi lapangan.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setConfirmDialog(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={loading}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleStatusChange}
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : "Ya, Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
