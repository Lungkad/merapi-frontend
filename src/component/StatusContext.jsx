// src/component/StatusContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Buat context untuk status
const StatusContext = createContext();

// Provider komponen untuk membagikan state ke seluruh aplikasi
export const StatusProvider = ({ children }) => {
  const [currentStatus, setCurrentStatus] = useState('normal');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fungsi untuk update status
  const updateStatus = (newStatus) => {
    setCurrentStatus(newStatus);
    setLastUpdated(new Date());
    
    // Simpan ke localStorage agar status tetap ada setelah refresh
    localStorage.setItem('merapiStatus', JSON.stringify({
      status: newStatus,
      timestamp: new Date().toISOString()
    }));

    // Log untuk debugging
    console.log(`Status updated to: ${newStatus} at ${new Date().toLocaleString()}`);
  };

  // Load status dari localStorage saat komponen dimount
  useEffect(() => {
    const savedStatus = localStorage.getItem('merapiStatus');
    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus);
        setCurrentStatus(parsed.status);
        setLastUpdated(new Date(parsed.timestamp));
        console.log(`Loaded saved status: ${parsed.status}`);
      } catch (error) {
        console.error('Error parsing saved status:', error);
        // Reset ke default jika error
        localStorage.removeItem('merapiStatus');
        setCurrentStatus('normal');
        setLastUpdated(new Date());
      }
    }
  }, []);

  // Fungsi untuk reset status ke normal (untuk testing)
  const resetStatus = () => {
    updateStatus('normal');
  };

  // Value yang akan dibagikan ke seluruh aplikasi
  const value = {
    currentStatus,
    updateStatus,
    resetStatus,
    lastUpdated
  };

  return (
    <StatusContext.Provider value={value}>
      {children}
    </StatusContext.Provider>
  );
};

// Custom hook untuk menggunakan status context
export const useStatus = () => {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error('useStatus must be used within StatusProvider');
  }
  return context;
};

// Export context untuk keperluan lain jika diperlukan
export { StatusContext };