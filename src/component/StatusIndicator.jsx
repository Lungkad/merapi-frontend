// src/component/StatusIndicator.jsx
import React, { useState } from 'react';
import { X, Clock, MapPin, Phone, AlertTriangle, Shield, Eye, Skull } from 'lucide-react';
import { useStatus } from './StatusContext';

// Konfigurasi status
const statusConfig = {
  normal: {
    label: 'Normal',
    color: 'bg-green-500',
    borderColor: 'border-green-500',
    textColor: 'text-green-500',
    icon: Shield,
    description: 'Gunung Merapi dalam kondisi normal. Tidak ada tanda-tanda aktivitas vulkanik yang mengkhawatirkan.',
    details: [
      'Aktivitas seismik rendah',
      'Suhu kawah dalam batas normal',
      'Tidak ada deformasi tanah yang signifikan',
      'Aman untuk aktivitas normal di zona hijau'
    ],
    recommendations: [
      'Tetap waspada dan ikuti informasi resmi',
      'Lakukan aktivitas normal seperti biasa',
      'Siapkan tas siaga sebagai antisipasi'
    ]
  },
  waspada: {
    label: 'Waspada',
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-500',
    icon: Eye,
    description: 'Terjadi peningkatan aktivitas vulkanik. Masyarakat diminta tetap waspada dan mengikuti perkembangan.',
    details: [
      'Peningkatan aktivitas seismik',
      'Suhu kawah mulai meningkat',
      'Terdeteksi deformasi tanah ringan',
      'Peningkatan emisi gas vulkanik'
    ],
    recommendations: [
      'Hindari area dalam radius 3 km dari puncak',
      'Siapkan tas siaga dan rencana evakuasi',
      'Pantau informasi resmi secara berkala',
      'Koordinasi dengan RT/RW setempat'
    ]
  },
  siaga: {
    label: 'Siaga',
    color: 'bg-orange-500',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-500',
    icon: AlertTriangle,
    description: 'Aktivitas vulkanik meningkat signifikan. Masyarakat di zona bahaya diminta bersiap untuk evakuasi.',
    details: [
      'Aktivitas seismik tinggi',
      'Suhu kawah meningkat drastis',
      'Deformasi tanah signifikan',
      'Peningkatan emisi gas berbahaya'
    ],
    recommendations: [
      'Evakuasi zona merah (radius 5 km)',
      'Siapkan tas siaga dan jalur evakuasi',
      'Hindari aktivitas di lereng gunung',
      'Ikuti arahan petugas BPBD',
      'Siapkan masker dan pakaian tertutup'
    ]
  },
  awas: {
    label: 'Awas',
    color: 'bg-red-500',
    borderColor: 'border-red-500',
    textColor: 'text-red-500',
    icon: Skull,
    description: 'Letusan dapat terjadi dalam 24 jam. Evakuasi segera untuk semua penduduk di zona bahaya.',
    details: [
      'Aktivitas vulkanik sangat tinggi',
      'Tremor kontinyu terdeteksi',
      'Deformasi tanah ekstrem',
      'Emisi gas berbahaya maksimal'
    ],
    recommendations: [
      'Evakuasi total zona bahaya SEGERA',
      'Ikuti instruksi petugas BPBD',
      'Gunakan masker dan pakaian tertutup',
      'Hindari area terbuka',
      'Menuju shelter/pengungsian terdekat'
    ]
  }
};

const StatusIndicator = () => {
  const { currentStatus, lastUpdated } = useStatus();
  const [showDetails, setShowDetails] = useState(false);
  
  const config = statusConfig[currentStatus] || statusConfig.normal;
  const IconComponent = config.icon;

  // Fungsi untuk format waktu
  const formatTime = (date) => {
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Floating Status Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDetails(true)}
          className={`${config.color} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 min-w-[120px] justify-center hover:scale-105 active:scale-95`}
          title={`Status: ${config.label} - Klik untuk detail`}
        >
          <IconComponent size={20} />
          <span className="font-medium">{config.label}</span>
        </button>
        
        {/* Pulse animation untuk status awas */}
        {currentStatus === 'awas' && (
          <div className={`absolute inset-0 ${config.color} rounded-full animate-ping opacity-75`}></div>
        )}
      </div>

      {/* Modal Detail */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`${config.color} text-white p-4 rounded-t-lg flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <IconComponent size={24} />
                <div>
                  <h2 className="text-xl font-bold">Status: {config.label}</h2>
                  <p className="text-sm opacity-90 flex items-center">
                    <Clock size={14} className="mr-1" />
                    {formatTime(lastUpdated)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              {/* Deskripsi */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{config.description}</p>
              </div>
              
              {/* Kondisi Saat Ini */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <MapPin size={16} className="mr-2" />
                  Kondisi Saat Ini:
                </h3>
                <ul className="space-y-2">
                  {config.details.map((detail, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className={`${config.textColor} mr-2 font-bold`}>•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rekomendasi */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Rekomendasi Tindakan:</h3>
                <ul className="space-y-2">
                  {config.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className={`${config.textColor} mr-2 font-bold`}>→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kontak Darurat */}
              <div className={`${config.color} bg-opacity-10 p-3 rounded-lg`}>
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Phone size={16} className="mr-2" />
                  Kontak Darurat:
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>BPBD Sleman: 0274-86854</p>  
                  <p>Damkar: 113</p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="text-xs text-gray-500 border-t pt-2 mt-4">
                <p>Data dari Balai Penyelidikan dan Pengembangan Teknologi Kegunungapian (BPPTKG)</p>
                <p>Terakhir diperbarui: {formatTime(lastUpdated)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusIndicator;