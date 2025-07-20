// src/config/statusConfig.js
import { AlertTriangle, Shield, Zap, Skull, Eye } from 'lucide-react';

// Konfigurasi untuk setiap level status
export const statusConfig = {
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

// Fungsi helper untuk mendapatkan config berdasarkan status
export const getStatusConfig = (status) => {
  return statusConfig[status] || statusConfig.normal;
};

// Fungsi untuk mendapatkan semua status yang tersedia
export const getAllStatuses = () => {
  return Object.keys(statusConfig);
};

// Fungsi untuk mendapatkan status berdasarkan level (0-3)
export const getStatusByLevel = (level) => {
  const statuses = ['normal', 'waspada', 'siaga', 'awas'];
  return statuses[level] || 'normal';
};