// frontend/src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-backend-q0r2.onrender.com/api';

          console.log('🌐 Connexion à:', `${API_BASE_URL}/auth/login`);

          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erreur ${response.status}`);
          }

          const data = await response.json();
          const { user, token } = data;

          // Sauvegarder explicitement dans localStorage AVANT de set (pour le login)
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          console.log('✅ Token sauvegardé (login):', token);
          console.log('✅ User sauvegardé (login):', user);

          return data;

        } catch (error) {
          console.error('❌ Login error:', error);

          set({
            loading: false,
            error: error.message || 'Erreur de connexion'
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });

        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-backend-q0r2.onrender.com/api';

          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erreur ${response.status}`);
          }

          const data = await response.json();
          const { user, token } = data;

          // Sauvegarder explicitement dans localStorage AVANT de set
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          console.log('✅ Token sauvegardé (register):', token);
          console.log('✅ User sauvegardé (register):', user);

          return data;

        } catch (error) {
          console.error('Register error:', error);
          
          set({ 
            loading: false, 
            error: error.message || 'Erreur d\'inscription' 
          });
          throw error;
        }
      },

      logout: () => {
        // Déconnecter le socket
        if (window.socket) {
          window.socket.disconnect();
          window.socket = null;
        }

        // Nettoyer localStorage explicitement
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });

        console.log('✅ Déconnecté et localStorage nettoyé');
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);