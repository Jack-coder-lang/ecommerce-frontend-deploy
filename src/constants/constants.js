// src/config/constants.js
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://ecommerce-backend-q0r2.onrender.com',
  API_URL: `${import.meta.env.VITE_API_BASE_URL || 'https://ecommerce-backend-q0r2.onrender.com'}/api`,
  ENDPOINTS: {
    PRODUCTS: '/products',
    CATEGORIES: '/products/categories',
    AUTH: '/auth',
    ORDERS: '/orders',
  }
};