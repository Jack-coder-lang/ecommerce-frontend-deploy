import axios from 'axios';

// ✅ URL de l'API depuis les variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-backend-q0r2.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log pour debugging
      console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      console.log(`🔑 Token présent: ${token.substring(0, 20)}...`);
    } else {
      console.warn('⚠️ Aucun token trouvé dans localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // Ne pas logger les erreurs 403 pour les routes protégées quand non connecté
    const isProtectedRoute = url?.includes('/cart') || url?.includes('/orders') || url?.includes('/notifications');
    const isUnauthorized = status === 403 || status === 401;

    if (!(isProtectedRoute && isUnauthorized)) {
      console.error(`❌ API Error: ${status} ${url}`, error.message);
    }

    if (status === 401) {
      // Éviter la boucle de redirection
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Utiliser une seule redirection sans recharger la page complète
        if (!window.__redirecting) {
          window.__redirecting = true;
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
    }
    return Promise.reject(error);
  }
);

// API Authentication
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// API Products
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getSellerProducts: () => api.get('/products/seller/products'), // 🔥 Corrigé: /seller/products au lieu de /seller/my-products
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// API Cart
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (itemData) => api.post('/cart/items', itemData),
  updateItem: (itemId, updateData) => api.put(`/cart/items/${itemId}`, updateData),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart/clear'),
};

// API Notifications
export const notificationsAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAllRead: () => api.delete('/notifications/read'),
};

// API Orders
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
  getSellerOrders: () => api.get('/orders/seller/my-orders'),
};

// API Analytics
export const analyticsAPI = {
  getSellerStats: (period = '30') => api.get(`/analytics/seller/stats?period=${period}`),
  getRevenueDetails: (startDate, endDate) => 
    api.get(`/analytics/seller/revenue?startDate=${startDate}&endDate=${endDate}`),
};

// API Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.post('/profile/change-password', data),
  deleteAccount: (data) => api.delete('/profile', { data }),
  getStats: () => api.get('/profile/stats'),
};

// API Preorders
export const preorderAPI = {
  create: (data) => api.post('/preorders', data),
  getUserPreorders: () => api.get('/preorders/user'),
  cancel: (id) => api.delete(`/preorders/${id}`),
  subscribe: (data) => api.post('/preorders/subscribe', data),
  notifyAvailable: (preorderId) => api.post(`/preorders/${preorderId}/notify`),
};

// API Inventory
export const inventoryAPI = {
  getLowStock: () => api.get('/inventory/low-stock'),
  getForecast: () => api.get('/inventory/forecast'),
  updateStock: (id, data) => api.put(`/inventory/${id}`, data),
};

// API Commissions
export const commissionAPI = {
  getAll: () => api.get('/commissions'),
  getStats: () => api.get('/commissions/stats'),
  create: (data) => api.post('/commissions', data),
};

// API Tickets
export const ticketAPI = {
  getAll: () => api.get('/tickets'),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
};

// API Barcode
export const barcodeAPI = {
  search: (barcode) => api.get(`/products/barcode/${barcode}`),
};

// API Payment
export const paymentAPI = {
  createApplePaySession: (data) => api.post('/payments/apple-pay/session', data),
  processApplePay: (data) => api.post('/payments/apple-pay/process', data),
  createGooglePaySession: (data) => api.post('/payments/google-pay/session', data),

  // CinetPay
  initializeCinetPay: (data) => api.post('/payments/cinetpay/initialize', data),
  checkCinetPayStatus: (transactionId) => api.get(`/payments/cinetpay/check/${transactionId}`),
  getPayments: (params = {}) => api.get('/payments', { params }),
};

// API Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getPendingUsers: () => api.get('/admin/users/pending'),
  approveUser: (userId) => api.put(`/admin/users/${userId}/approve`),
  rejectUser: (userId, data) => api.put(`/admin/users/${userId}/reject`, data),
  suspendUser: (userId, data) => api.put(`/admin/users/${userId}/suspend`, data),
  activateUser: (userId) => api.put(`/admin/users/${userId}/activate`),
};

export default api;