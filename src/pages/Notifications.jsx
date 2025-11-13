// frontend/src/pages/Notifications.jsx
import { useEffect, useState } from 'react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Bell, Check, CheckCheck, Trash2, Package, ShoppingCart, 
  TrendingUp, MessageSquare, Filter, Search, Clock,
  AlertCircle, Info, Star, Users, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll();
      setNotifications(response.data?.notifications || []);
    } catch (error) {
      console.error('Erreur notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      toast.success('Notification marquée comme lue');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      toast.success('Toutes les notifications sont lues');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationsAPI.delete(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast.success('Notification supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      await notificationsAPI.deleteAllRead();
      setNotifications(prev => prev.filter(notif => !notif.isRead));
      toast.success('Notifications lues supprimées');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    
    switch (type) {
      case 'ORDER':
        return <Package className={iconClass} />;
      case 'PAYMENT':
        return <ShoppingCart className={iconClass} />;
      case 'PRODUCT':
        return <TrendingUp className={iconClass} />;
      case 'MESSAGE':
        return <MessageSquare className={iconClass} />;
      case 'SECURITY':
        return <Shield className={iconClass} />;
      case 'SYSTEM':
        return <Info className={iconClass} />;
      case 'PROMOTION':
        return <Star className={iconClass} />;
      case 'COMMUNITY':
        return <Users className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'ORDER':
        return 'bg-blue-100 text-blue-600';
      case 'PAYMENT':
        return 'bg-green-100 text-green-600';
      case 'PRODUCT':
        return 'bg-purple-100 text-purple-600';
      case 'MESSAGE':
        return 'bg-yellow-100 text-yellow-600';
      case 'SECURITY':
        return 'bg-red-100 text-red-600';
      case 'SYSTEM':
        return 'bg-gray-100 text-gray-600';
      case 'PROMOTION':
        return 'bg-orange-100 text-orange-600';
      case 'COMMUNITY':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-4 border-l-red-500';
      case 'MEDIUM':
        return 'border-l-4 border-l-yellow-500';
      case 'LOW':
        return 'border-l-4 border-l-green-500';
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  // Filtrer les notifications
  const filteredNotifications = notifications
    .filter(notification => {
      // Filtre par statut
      if (filter === 'unread' && notification.isRead) return false;
      if (filter === 'read' && !notification.isRead) return false;
      
      // Filtre par recherche
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          notification.title?.toLowerCase().includes(term) ||
          notification.message?.toLowerCase().includes(term) ||
          notification.type?.toLowerCase().includes(term)
        );
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 gradient-brand-primary rounded-2xl">
              <Bell className="w-8 h-8 text-brand-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 
                  ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Toutes les notifications sont lues'
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-brand-cyan text-white rounded-xl font-semibold hover:bg-brand-cyan-dark transition-all"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Tout marquer comme lu</span>
              </button>
            )}
            
            {notifications.some(n => n.isRead) && (
              <button
                onClick={handleDeleteAllRead}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer les lues</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="card-brand mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-brand-cyan text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  filter === 'unread'
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                Non lues
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Liste des notifications */}
        {filteredNotifications.length === 0 ? (
          <div className="card-brand text-center py-16">
            <Bell className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filter !== 'all' ? 'Aucune notification trouvée' : 'Aucune notification'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || filter !== 'all' 
                ? 'Essayez de modifier vos critères de recherche ou de filtre.'
                : 'Vous serez notifié ici lorsque vous recevrez de nouvelles notifications.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`card-brand transition-all duration-300 hover:shadow-md ${
                  !notification.isRead ? 'ring-2 ring-brand-cyan ring-opacity-20' : ''
                } ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icône */}
                  <div className={`p-3 rounded-2xl ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-semibold ${
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="bg-brand-cyan text-white text-xs px-2 py-1 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(notification.createdAt).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          
                          <span className="capitalize px-2 py-1 bg-gray-100 rounded-md text-xs">
                            {notification.type?.toLowerCase()}
                          </span>
                        </div>

                        {notification.link && (
                          <Link
                            to={notification.link}
                            className="inline-flex items-center gap-2 mt-3 text-brand-cyan hover:text-brand-cyan-dark font-medium transition-colors group"
                          >
                            Voir les détails
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </Link>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4 text-gray-600 group-hover:text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques */}
        {notifications.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-brand text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="card-brand text-center">
              <div className="text-2xl font-bold text-red-500 mb-1">{unreadCount}</div>
              <div className="text-sm text-gray-600">Non lues</div>
            </div>
            <div className="card-brand text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">{notifications.length - unreadCount}</div>
              <div className="text-sm text-gray-600">Lues</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}