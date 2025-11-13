// frontend/src/services/socket.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  }

  connect(userId) {
    // En production, ne pas se connecter si l'URL est localhost
    const socketUrl = import.meta.env.VITE_API_BASE_URL || 'https://ecommerce-backend-q0r2.onrender.com';
    
    if (this.isProduction && socketUrl.includes('localhost')) {
      console.warn('⚠️ Socket.IO désactivé en production: URL backend non configurée');
      return;
    }

    if (!this.socket) {
      console.log(`🔌 Tentative de connexion Socket.IO à: ${socketUrl}`);
      
      this.socket = io(socketUrl, {
        auth: {
          token: localStorage.getItem('token'),
          userId: userId
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 3
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket.IO connecté');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO déconnecté:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur connexion Socket.IO:', error.message);
        // En production, ne pas spam les erreurs
        if (!this.isProduction) {
          console.error('Détails erreur:', error);
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Socket.IO reconnecté (tentative ${attemptNumber})`);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket.IO déconnecté manuellement');
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket non connecté, impossible d\'émettre:', event);
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();