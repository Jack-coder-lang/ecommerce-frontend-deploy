// Hook pour polling des notifications (alternative à Socket.IO en serverless)
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useNotificationPolling = (interval = 60000) => { // Augmenté à 60 secondes
  const { isAuthenticated } = useAuthStore();
  const lastNotificationIdRef = useRef(null);
  const intervalIdRef = useRef(null);
  const isPollingActiveRef = useRef(false); // Prevent multiple intervals
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Ne rien faire si pas authentifié
    if (!isAuthenticated) {
      // Cleanup if user logs out
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        isPollingActiveRef.current = false;
        console.log('🛑 Polling des notifications désactivé (déconnexion)');
      }
      return;
    }

    // Prevent multiple intervals from being created
    if (isPollingActiveRef.current) {
      return;
    }

    const checkNotifications = async () => {
      // Skip if component unmounted or not authenticated
      if (!mountedRef.current || !isAuthenticated) {
        return;
      }

      try {
        const response = await notificationsAPI.getAll({ limit: 10 });
        const notifications = response.data.notifications || [];

        // Si c'est la première fois, juste mémoriser l'ID
        if (lastNotificationIdRef.current === null && notifications.length > 0) {
          lastNotificationIdRef.current = notifications[0].id;
          console.log('📬 Polling notifications initialisé');
          return;
        }

        // Vérifier s'il y a de nouvelles notifications
        if (notifications.length > 0 && notifications[0].id !== lastNotificationIdRef.current) {
          const newNotifications = [];

          for (const notif of notifications) {
            if (notif.id === lastNotificationIdRef.current) break;
            newNotifications.push(notif);
          }

          console.log(`🔔 ${newNotifications.length} nouvelle(s) notification(s) détectée(s)`);

          // Afficher les nouvelles notifications (max 3 pour éviter le spam)
          newNotifications.reverse().slice(0, 3).forEach(notif => {
            const icons = {
              ORDER: '📦',
              ORDER_CREATED: '🎉',
              ORDER_UPDATE: '📦',
              PAYMENT: '💰',
              PAYMENT_SUCCESS: '💰',
              PAYMENT_FAILED: '❌',
              PRODUCT: '🛍️',
              PRODUCT_SOLD: '🛒',
              MESSAGE: '💬',
              NEW_MESSAGE: '💬',
              SUCCESS: '✅',
              ERROR: '❌',
              WARNING: '⚠️',
              INFO: 'ℹ️',
              SYSTEM: '🔔',
              SECURITY: '🔒',
              PROMOTION: '🎁',
              COMMUNITY: '👥',
            };

            toast(notif.message || notif.title, {
              duration: 6000,
              icon: icons[notif.type] || '🔔',
            });
          });

          // Si plus de 3 notifications, afficher un message récapitulatif
          if (newNotifications.length > 3) {
            toast(`Et ${newNotifications.length - 3} autre(s) notification(s)`, {
              duration: 4000,
              icon: '📬',
            });
          }

          lastNotificationIdRef.current = notifications[0].id;

          // Déclencher un événement pour recharger le compteur
          window.dispatchEvent(new Event('notification-update'));
        }
      } catch (error) {
        // Ignorer les erreurs 401/403 silencieusement (non authentifié)
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          console.error('❌ Erreur polling notifications:', error);
        }
      }
    };

    // Mark polling as active
    isPollingActiveRef.current = true;

    // Vérifier immédiatement
    checkNotifications();

    // Puis à l'intervalle spécifié (par défaut 60 secondes)
    intervalIdRef.current = setInterval(checkNotifications, interval);

    console.log(`🔄 Polling des notifications activé (intervalle: ${interval / 1000}s)`);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        isPollingActiveRef.current = false;
        console.log('🛑 Polling des notifications désactivé');
      }
    };
  }, [isAuthenticated, interval]); // Removed 'token' from dependencies
};
