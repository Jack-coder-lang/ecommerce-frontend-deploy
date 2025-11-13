// Hook pour polling des notifications (alternative à Socket.IO en serverless)
import { useEffect } from 'react';
import { useAuthStore } from '../store';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useNotificationPolling = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    let intervalId;
    let lastNotificationId = null;

    const checkNotifications = async () => {
      try {
        const response = await notificationsAPI.getAll({ limit: 5 });
        const notifications = response.data.notifications || [];

        // Si c'est la première fois, juste mémoriser l'ID
        if (lastNotificationId === null && notifications.length > 0) {
          lastNotificationId = notifications[0].id;
          return;
        }

        // Vérifier s'il y a de nouvelles notifications
        if (notifications.length > 0 && notifications[0].id !== lastNotificationId) {
          const newNotifications = [];

          for (const notif of notifications) {
            if (notif.id === lastNotificationId) break;
            newNotifications.push(notif);
          }

          // Afficher les nouvelles notifications
          newNotifications.reverse().forEach(notif => {
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

            toast(notif.title, {
              duration: 5000,
              icon: icons[notif.type] || '🔔',
            });
          });

          lastNotificationId = notifications[0].id;

          // Déclencher un événement pour recharger le compteur
          window.dispatchEvent(new Event('notification-update'));
        }
      } catch (error) {
        // Ignorer les erreurs silencieusement (403 si non connecté)
        if (error.response?.status !== 403) {
          console.error('Erreur polling notifications:', error);
        }
      }
    };

    // Vérifier immédiatement
    checkNotifications();

    // Puis toutes les 30 secondes
    intervalId = setInterval(checkNotifications, 30000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated]);
};
