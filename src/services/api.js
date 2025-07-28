import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, 
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs (hanya login)
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

export const barakAPI = {
  // Get all baraks with pagination
  getAll: (page = 1, order = 'desc', perPage = 10) =>
    api.get(`/baraks?page=${page}&sort_by=id&order=${order}&per_page=${perPage}`),
  
  // Get ALL baraks without pagination (if backend supports it)
  getAllNoPagination: () => api.get('/baraks/all'),
  
  // Get all baraks with large per_page to get everything
  getAllWithLargeLimit: (order = 'desc') =>
    api.get(`/baraks?sort_by=id&order=${order}&per_page=1000`),
  
  // Get single barak
  getById: (id) => api.get(`/baraks/${id}`),
  
  // Create new barak
  create: (data) => api.post('/baraks', data),
  
  // Update barak
  update: (id, data) => api.put(`/baraks/${id}`, data),
  
  // Delete barak
  delete: (id) => api.delete(`/baraks/${id}`),

};

export const beritaAPI = {
    getAll: () => api.get('/beritas'),
    getById: (id) => api.get(`/beritas/${id}`),
    create: (data) => api.post('/beritas', data),
    update: (id, data) => api.put(`/beritas/${id}`, data),
    delete: (id) => api.delete(`/beritas/${id}`),
};

export default api;