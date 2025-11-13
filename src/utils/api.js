// frontend/src/utils/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-backend-q0r2.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Erreur réseau - Backend inaccessible');
      if (!isProduction) {
        console.error('Vérifiez que le backend est démarré sur localhost:5000');
      }
    }
    
    // Rediriger vers login si non autorisé
    if (error.response?.status === 401) {
      const authStore = require('../store/authStore').useAuthStore.getState();
      authStore.logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;