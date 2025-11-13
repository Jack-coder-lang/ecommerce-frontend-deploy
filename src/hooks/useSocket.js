// frontend/src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    // ⚠️ Socket.IO désactivé en production Vercel (serverless ne supporte pas WebSockets)
    const isVercelProduction = import.meta.env.VITE_API_URL?.includes('vercel.app');

    if (isVercelProduction) {
      console.log('ℹ️ Socket.IO désactivé (Vercel serverless)');
      return;
    }

    if (isAuthenticated && user) {
      // Ne créer qu'une seule instance de socket
      if (socketRef.current?.connected) {
        return;
      }

      // ✅ URL dynamique selon l'environnement
      const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
        || import.meta.env.VITE_API_URL?.replace('/api', '')
        || 'https://ecommerce-backend-q0r2.onrender.com';

      console.log('🔌 Connexion Socket.IO à:', SOCKET_URL);

      // Connexion Socket.IO
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token'),
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('✅ Socket.IO connecté');
        socket.emit('authenticate', user.id);
      });

      socket.on('new-notification', (notification) => {
        console.log('🔔 Nouvelle notification:', notification);
        
        // Toast avec icône personnalisée selon le type
        const icons = {
          ORDER_CREATED: '🎉',
          ORDER_UPDATE: '📦',
          PAYMENT_SUCCESS: '💰',
          PAYMENT_FAILED: '❌',
          PRODUCT_SOLD: '🛒',
          NEW_MESSAGE: '💬',
          SUCCESS: '✅',
          ERROR: '❌',
          WARNING: '⚠️',
          INFO: 'ℹ️',
          SYSTEM: '🔔',
        };

        toast(notification.title, {
          duration: 5000,
          icon: icons[notification.type] || '🔔',
        });
        
        // Recharger le compteur de notifications
        window.dispatchEvent(new Event('notification-update'));
      });

      socket.on('order-status-update', (data) => {
        console.log('📦 Mise à jour commande:', data);
        
        const statusEmojis = {
          PENDING: '⏳',
          PROCESSING: '📦',
          SHIPPED: '🚚',
          DELIVERED: '✅',
          CANCELLED: '❌',
        };

        toast(`${statusEmojis[data.status]} Commande #${data.orderNumber} - ${data.status}`, {
          duration: 6000,
        });
        
        // Déclencher un événement pour recharger les commandes
        window.dispatchEvent(new Event('order-update'));
      });

      socket.on('payment-success', (data) => {
        console.log('💰 Paiement réussi:', data);
        toast.success(`Paiement réussi pour la commande #${data.orderNumber}`, {
          duration: 6000,
          icon: '💰',
        });
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket.IO déconnecté:', reason);
        if (reason === 'io server disconnect') {
          socket.connect();
        }
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Erreur connexion Socket.IO:', error.message);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket.IO reconnecté après', attemptNumber, 'tentatives');
        socket.emit('authenticate', user.id);
      });

      return () => {
        console.log('🔌 Nettoyage Socket.IO');
        socket?.off('connect');
        socket?.off('new-notification');
        socket?.off('order-status-update');
        socket?.off('payment-success');
        socket?.off('disconnect');
        socket?.off('connect_error');
        socket?.off('reconnect');
        socket?.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  return socketRef.current;
};