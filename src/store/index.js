import { create } from 'zustand';
import { authAPI, cartAPI, notificationsAPI } from '../services/api';
import socketService from '../services/socket';

// Store d'authentification
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (credentials) => {
    const response = await authAPI.login(credentials);
    const { user, token } = response.data;
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    
    set({ user, token, isAuthenticated: true });
    
    // Connecter Socket.IO
    socketService.connect(user.id);
    
    return response.data;
  },

  register: async (userData) => {
    const response = await authAPI.register(userData);
    const { user, token } = response.data;
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    
    set({ user, token, isAuthenticated: true });
    
    // Connecter Socket.IO
    socketService.connect(user.id);
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    socketService.disconnect();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setUser: (user) => set({ user }),
}));

// Store du panier - CORRIGÉ
export const useCartStore = create((set, get) => ({
  cart: null,
  total: 0,
  itemCount: 0,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const response = await cartAPI.get();
      const { cart, total, itemCount } = response.data;
      set({ cart, total, itemCount, loading: false });
    } catch (error) {
      console.error('Erreur fetch cart:', error);
      // Si le panier n'existe pas (404), initialiser un panier vide
      if (error.response?.status === 404) {
        set({ cart: { items: [] }, total: 0, itemCount: 0, loading: false });
      } else {
        set({ loading: false });
      }
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      await cartAPI.addItem({ productId, quantity });
      await get().fetchCart(); // Recharger le panier après ajout
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      throw error;
    }
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      await cartAPI.updateItem(itemId, { quantity });
      await get().fetchCart(); // Recharger le panier après mise à jour
    } catch (error) {
      console.error('Erreur mise à jour panier:', error);
      throw error;
    }
  },

  removeFromCart: async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      await get().fetchCart(); // Recharger le panier après suppression
    } catch (error) {
      console.error('Erreur suppression panier:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      console.log('Tentative de vidage du panier...');
      
      // Essayer d'abord l'endpoint /clear
      try {
        await cartAPI.clear();
        console.log('Panier vidé avec succès via /clear');
      } catch (clearError) {
        // Si /clear ne fonctionne pas, utiliser l'endpoint principal
        console.log('Endpoint /clear non disponible, utilisation de /cart...');
        await cartAPI.clear(); // Cela utilisera l'endpoint de base
      }
      
      // Réinitialiser l'état local
      set({ 
        cart: { items: [] }, 
        total: 0, 
        itemCount: 0 
      });
      
    } catch (error) {
      console.error('Erreur vidage panier:', error);
      
      // En cas d'erreur, réinitialiser localement quand même
      set({ 
        cart: { items: [] }, 
        total: 0, 
        itemCount: 0 
      });
      
      throw error;
    }
  },
}));

// Store des notifications
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const response = await notificationsAPI.getAll();
      const { notifications, unreadCount } = response.data;
      set({ notifications, unreadCount, loading: false });
    } catch (error) {
      console.error('Erreur fetch notifications:', error);
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      set({ unreadCount: response.data.unreadCount });
    } catch (error) {
      console.error('Erreur fetch unread count:', error);
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      const notifications = get().notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      set({
        notifications,
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsAPI.markAllAsRead();
      const notifications = get().notifications.map((n) => ({ ...n, isRead: true }));
      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error('Erreur marquage tous lus:', error);
    }
  },

  addNotification: (notification) => {
    set({
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1,
    });
  },
}));