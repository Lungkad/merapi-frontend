import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    console.log('Form data:', formData);

    try {
      const result = await login(formData.email, formData.password);
      
      console.log('Login result:', result); // Debug log
      
      if (result.success) {
        setAlert({ type: 'success', message: 'Login berhasil!' });
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);
      } else {
        // Handle different types of errors here
        let errorMessage = 'Login gagal';
        
        if (result.message) {
          if (result.message.toLowerCase().includes('email')) {
            errorMessage = 'Email tidak ditemukan.';
          } else if (result.message.toLowerCase().includes('password')) {
            errorMessage = 'Password salah.';
          } else {
            errorMessage = result.message;
          }
        }
        
        setAlert({ type: 'error', message: errorMessage });
      }
    } catch (error) {
      console.error('Login error:', error);
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat login' });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masuk sebagai administrator sistem
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {alert && (
            <div className={`alert p-4 rounded ${
              alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {alert.message}
              <button 
                onClick={() => setAlert(null)}
                className="float-right font-bold"
              >
                ×
              </button>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Admin
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Memuat...' : 'Masuk'}
            </button>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800">Kredensial Default:</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Email: <span className="font-mono">admin@merapi.com</span><br />
              Password: <span className="font-mono">123</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;