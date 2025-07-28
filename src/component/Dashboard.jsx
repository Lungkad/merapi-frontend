import React, { useState } from "react";
import {
  TrendingUp,
  Tent,
  Newspaper,
  LogOut,
  User,
  PanelBottom,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStatus } from "./StatusContext";
import { statusConfig, getAllStatuses } from "../config/statusConfig";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const { currentStatus, updateStatus, lastUpdated } = useStatus();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = "blue",
    status,
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
          {status && (
            <div
              className={`flex items-center mt-2 text-sm ${
                status === "normal"
                  ? "text-green-600"
                  : status === "waspada"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              <span className="font-medium">{status.toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

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
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col h-screen">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Siaga Merapi</h1>
          <p className="text-gray-400 text-sm mt-1">Dashboard Admin</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab("dashboard")}
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
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Dashboard Siaga Merapi
              </h2>
              <p className="text-gray-600 mt-1">
                Selamat datang kembali! Berikut ringkasan data terkini sistem
                pengungsian.
              </p>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Barak"
              value="50"
              icon={Tent}
              trend="up"
              color="blue"
            />
            <StatCard
              title="Total Berita"
              value="10"
              icon={Newspaper}
              trend="up"
              color="green"
            />
          </div>

          {/* Status Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Aktivitas Barak Terkini
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm text-gray-900">Barak aktif</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    50 dari 50
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">
                      Kapasitas tersedia
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    NaN orang
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"></div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
