import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (token) {
        const response = await authAPI.me();
        if (response.data.success) {
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      // Token invalid, remove it
      Cookies.remove('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      console.log('Login response:', response.data); // Debug log
      
      if (response.data.success) {
        const { access_token, data } = response.data;
        
        // Store token in cookie
        Cookies.set('auth_token', access_token, { 
          expires: 7, // 7 days
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Remove navigate from here - let the component handle navigation
        return { success: true, user: data.user };
      }
      
      return { 
        success: false, 
        message: response.data.message || 'Login gagal' 
      };
    } catch (error) {
      console.error('Login error:', error); // Debug log
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login gagal' 
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};