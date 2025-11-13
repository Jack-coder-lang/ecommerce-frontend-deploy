// frontend/src/store/notificationStore.js
import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 3, // Simulation de 3 notifications non lues

  fetchUnreadCount: async () => {
    // Simulation d'appel API
    set({ unreadCount: 3 });
  },

  markAsRead: (notificationId) => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },

  clearAll: () => {
    set({ unreadCount: 0 });
  }
}));