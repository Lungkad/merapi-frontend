import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { barakAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext for authentication

const BarakDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barak, setBarak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const { user, logout, isAuthenticated } = useAuth(); // Get user authentication status

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); // Redirect if not authenticated
    } else {
      fetchBarak();
    }
  }, [id, isAuthenticated]);

  const fetchBarak = async () => {
    try {
      setLoading(true);
      const response = await barakAPI.getById(id);
      if (response.data && response.data.success && response.data.data) {
        setBarak(response.data.data);
      } else {
        setAlert({ type: 'error', message: 'Data barak tidak ditemukan' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Gagal memuat data barak' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus barak ini?')) {
      try {
        await barakAPI.delete(id);
        setAlert({ type: 'success', message: 'Barak berhasil dihapus' });
        setTimeout(() => {
          navigate('/baraks');
        }, 1500);
      } catch (error) {
        setAlert({ type: 'error', message: 'Gagal menghapus barak' });
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!barak) {
    return <div className="text-center py-8">Barak tidak ditemukan</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {alert && (
        <div className={`alert mb-4 p-4 rounded ${alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {alert.message}
          <button onClick={() => setAlert(null)} className="float-right font-bold">×</button>
        </div>
      )}

      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Detail Barak</h3>
          <div className="flex space-x-2">
            <Link to={`/baraks/${barak.id}/edit`} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
              Edit
            </Link>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Hapus
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h5 className="text-lg font-semibold mb-4">Informasi Barak</h5>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Nama Barak:</td>
                  <td className="py-2">{barak.nama_barak || 'N/A'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Kapasitas:</td>
                  <td className="py-2">{barak.kapasitas || 'N/A'} orang</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Dibuat:</td>
                  <td className="py-2">{barak.created_at ? new Date(barak.created_at).toLocaleString('id-ID') : 'N/A'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Diperbarui:</td>
                  <td className="py-2">{barak.updated_at ? new Date(barak.updated_at).toLocaleString('id-ID') : 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h5 className="text-lg font-semibold mb-4">Lokasi</h5>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Desa:</td>
                  <td className="py-2">{barak.desa || 'N/A'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Kecamatan:</td>
                  <td className="py-2">{barak.kecamatan || 'N/A'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Latitude:</td>
                  <td className="py-2">{barak.latitude || 'N/A'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Longitude:</td>
                  <td className="py-2">{barak.longitude || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8">
          <h5 className="text-lg font-semibold mb-4">Fasilitas</h5>
          <div className="border p-4 rounded bg-gray-50">{barak.fasilitas || 'Tidak ada fasilitas'}</div>
        </div>

        <div className="mt-8">
          <h5 className="text-lg font-semibold mb-4">Alamat</h5>
          <div className="border p-4 rounded bg-gray-50">{barak.alamat || 'Alamat tidak tersedia'}</div>
        </div>

        <div className="mt-8">
          <Link to="/baraks" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BarakDetail;
