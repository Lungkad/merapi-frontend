import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { barakAPI } from "../services/api";
import { desaOptions, kecamatanOptions } from "../constants/options";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

const BarakForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama_barak: "",
    kapasitas: "",
    fasilitas: "",
    alamat: "",
    desa: "",
    kecamatan: "",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await barakAPI.create(formData);
      setAlert({ type: "success", message: "Barak berhasil ditambahkan" });
      setTimeout(() => {
        navigate("/baraks");
      }, 1500);
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

  return (
    <div className="max-w-2xl mx-auto">
      {alert && (
        <div
          className={`alert mb-4 p-4 rounded ${
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

      <div className="bg-white rounded shadow p-6">
        <h3 className="text-xl font-bold mb-6">Tambah Barak Baru</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="nama_barak"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Barak
            </label>
            <input
              type="text"
              id="nama_barak"
              name="nama_barak"
              value={formData.nama_barak}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nama_barak ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.nama_barak && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nama_barak[0]}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="kapasitas"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kapasitas
            </label>
            <input
              type="text"
              id="kapasitas"
              name="kapasitas"
              value={formData.kapasitas}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.kapasitas ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.kapasitas && (
              <p className="text-red-500 text-sm mt-1">{errors.kapasitas[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="fasilitas"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fasilitas
            </label>
            <textarea
              id="fasilitas"
              name="fasilitas"
              value={formData.fasilitas}
              onChange={handleChange}
              rows="3"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fasilitas ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.fasilitas && (
              <p className="text-red-500 text-sm mt-1">{errors.fasilitas[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="alamat"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Alamat
            </label>
            <textarea
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              rows="3"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.alamat ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.alamat && (
              <p className="text-red-500 text-sm mt-1">{errors.alamat[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="kecamatan"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kecamatan
            </label>
            <input
              list="kecamatan-list"
              id="kecamatan"
              name="kecamatan"
              value={formData.kecamatan}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.kecamatan ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ketik atau pilih kecamatan"
              required
            />
            <datalist id="kecamatan-list">
              {kecamatanOptions.map((option, i) => (
                <option key={i} value={option} />
              ))}
            </datalist>
            {errors.kecamatan && (
              <p className="text-red-500 text-sm mt-1">{errors.kecamatan[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="desa"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Desa
            </label>
            <input
              type="text"
              id="desa"
              name="desa"
              list="desa-list"
              value={formData.desa}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.desa ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ketik atau pilih desa"
              required
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="latitude"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Latitude
              </label>
              <input
                type="number"
                step="any"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Contoh: -7.773928013319334"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.latitude ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              <small className="text-gray-500">
                Masukkan angka latitude (boleh positif atau negatif)
              </small>
              {errors.latitude && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.latitude[0]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="longitude"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Longitude
              </label>
              <input
                type="number"
                step="any"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Contoh: 110.36118280243396"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.longitude ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              <small className="text-gray-500">
                Masukkan angka longitude (boleh positif atau negatif)
              </small>
              {errors.longitude && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.longitude[0]}
                </p>
              )}
            </div>
          </div>

          <div className="my-6">
            <MapContainer
              center={[
                formData.latitude || -7.773928013319334,
                formData.longitude || 110.36118280243396,
              ]}
              zoom={13}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker />
            </MapContainer>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/baraks")}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BarakForm;
