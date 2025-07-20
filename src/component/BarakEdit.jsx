import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { barakAPI } from "../services/api";
import { desaOptions, kecamatanOptions } from "../constants/options";

const BarakEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nama_barak: "",
    kapasitas: "",
    fasilitas: "",
    alamat: "",
    kecamatan: "",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

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
        <h3 className="text-xl font-bold mb-6">Edit Barak</h3>
        <form onSubmit={handleSubmit}>
          {/* 💡 Form field: Salin & tempel juga ke BarakForm */}
          {[
            {
              id: "nama_barak",
              label: "Nama Barak",
              type: "text",
              required: true,
            },
            {
              id: "kapasitas",
              label: "Kapasitas",
              type: "text",
              required: true,
            },
            {
              id: "fasilitas",
              label: "Fasilitas",
              type: "textarea",
              required: true,
            },
            {
              id: "alamat",
              label: "Alamat",
              type: "textarea",
              required: true,
            },
            {
              id: "desa",
              label: "Desa",
              type: "text",
              required: true,
            },
            {
              id: "kecamatan",
              label: "Kecamatan",
              type: "text",
              required: true,
            },
            {
              id: "latitude",
              label: "Latitude",
              type: "number",
              required: true,
              placeholder: "Contoh: -7.773928013319334",
            },
            {
              id: "longitude",
              label: "Longitude",
              type: "number",
              required: true,
              placeholder: "Contoh: 110.36118280243396",
            },
          ].map((field, index) => {
            const isTextArea = field.type === "textarea";
            const inputClass = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[field.id] ? "border-red-500" : "border-gray-300"
            }`;

            return (
              <div key={index} className="mb-4">
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </label>

                {field.id === "kecamatan" ? (
                  <>
                    <input
                      list="kecamatan-list"
                      id="kecamatan"
                      name="kecamatan"
                      value={formData.kecamatan}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ketik atau pilih kecamatan"
                      required={field.required}
                    />
                    <datalist id="kecamatan-list">
                      {kecamatanOptions.map((option, i) => (
                        <option key={i} value={option} />
                      ))}
                    </datalist>
                  </>
                ) : field.id === "desa" ? (
                  <>
                    <input
                      list="desa-list"
                      id="desa"
                      name="desa"
                      value={formData.desa}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ketik atau pilih desa"
                      required={field.required}
                    />
                    <datalist id="desa-list">
                      {desaOptions.map((option, i) => (
                        <option key={i} value={option} />
                      ))}
                    </datalist>
                  </>
                ) : isTextArea ? (
                  <textarea
                    id={field.id}
                    name={field.id}
                    value={formData[field.id]}
                    onChange={handleChange}
                    rows="3"
                    className={inputClass}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    name={field.id}
                    value={formData[field.id]}
                    onChange={handleChange}
                    className={inputClass}
                    required={field.required}
                    placeholder={field.placeholder || ""}
                    step={field.type === "text" ? "any" : undefined}
                  />
                )}

                {errors[field.id] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[field.id][0]}
                  </p>
                )}
              </div>
            );
          })}

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
              {loading ? "Menyimpan..." : "Perbarui"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BarakEdit;
