import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cookies from "js-cookie";

import BarakDetail from "./component/BarakDetail";
import BarakForm from "./component/BarakForm";
import BarakList from "./component/BarakList";
import BarakEdit from "./component/BarakEdit";

import BeritaList from "./component/BeritaList";
import Beritas from "./component/Beritas";
import BeritaForm from "./component/BeritaForm";

import Home from "./component/Home";
import Maps from "./component/Maps";
import MerapiIntro from "./component/MerapiIntro";
import Information from "./component/Information";
import Login from "./component/Login";

import Dashboard from "./component/Dashboard";
import DashboardToggle from "./component/DashboardTonggle";

import MapsBarak from "./component/MapsBarak";
import MapsAnalisis from "./component/MapAnalisis";

import ProtectedRoute from "./contexts/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

import StatusIndicator from "./component/StatusIndicator";
import { StatusProvider } from "./component/StatusContext";

import "./App.css";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <StatusProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes - Accessible without authentication */}
            <Route path="/" element={<Home />} />
            <Route path="/merapiintro" element={<MerapiIntro />} />
            <Route path="/information" element={<Information />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/beritas" element={<Beritas />} />
            <Route path="/login" element={<Login />} />

            <Route path="/mapsbarak" element={<MapsBarak />} />
            <Route path="/mapsanalisis" element={<MapsAnalisis />} />

            {/* Protected Routes - Only accessible when authenticated */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dbtoggle"
              element={
                <ProtectedRoute>
                  <DashboardToggle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/baraks"
              element={
                <ProtectedRoute>
                  <BarakList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/baraksform"
              element={
                <ProtectedRoute>
                  <BarakForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/baraks/:id"
              element={
                <ProtectedRoute>
                  <BarakDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/baraks/:id/edit"
              element={
                <ProtectedRoute>
                  <BarakEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/beritalist"
              element={
                <ProtectedRoute>
                  <BeritaList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/beritaform"
              element={
                <ProtectedRoute>
                  <BeritaForm />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </StatusProvider>
    </AuthProvider>
  );
}

export default App;
