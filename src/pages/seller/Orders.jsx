// frontend/src/pages/seller/Orders.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Package, Clock, Truck, CheckCircle, XCircle, 
  ChevronRight, Filter, Search, AlertCircle 
} from 'lucide-react';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getSellerOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success('Statut mis à jour');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur mise à jour');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'PROCESSING':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'En attente',
      PROCESSING: 'En traitement',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-orange-100 text-orange-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'ALL' || order.status === filter;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Statistiques
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-800 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-6">Gestion des commandes</h1>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-semibold mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">En attente</p>
            <p className="text-2xl font-semibold mt-1 text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">En traitement</p>
            <p className="text-2xl font-semibold mt-1 text-blue-600">{stats.processing}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Expédiées</p>
            <p className="text-2xl font-semibold mt-1 text-purple-600">{stats.shipped}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Livrées</p>
            <p className="text-2xl font-semibold mt-1 text-green-600">{stats.delivered}</p>
          </div>
        </div>

        {/* RECHERCHE ET FILTRES */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* BARRE DE RECHERCHE */}
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro ou client..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* FILTRES */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === 'ALL'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === 'PENDING'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En attente
              </button>
              <button
                onClick={() => setFilter('PROCESSING')}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === 'PROCESSING'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En traitement
              </button>
              <button
                onClick={() => setFilter('SHIPPED')}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === 'SHIPPED'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expédiées
              </button>
              <button
                onClick={() => setFilter('DELIVERED')}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === 'DELIVERED'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Livrées
              </button>
            </div>
          </div>
        </div>

        {/* LISTE DES COMMANDES */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Commande #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Client: {order.user.firstName} {order.user.lastName}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* JAUGE DE PROGRESSION DE LIVRAISON */}
                <DeliveryProgressBar status={order.status} />

                {/* PRODUITS */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
                      <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Quantité: {item.quantity} • Prix: {item.price.toLocaleString()} F
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString()} F
                      </p>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {order.total.toLocaleString()} F
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors text-sm font-medium"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    {order.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors text-sm font-medium"
                      >
                        Marquer comme expédiée
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors text-sm font-medium"
                      >
                        Marquer comme livrée
                      </button>
                    )}
                    <Link
                      to={`/seller/orders/${order.id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Voir détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Composant jauge de progression
function DeliveryProgressBar({ status }) {
  const steps = [
    { key: 'PENDING', label: 'Commande reçue', icon: AlertCircle },
    { key: 'PROCESSING', label: 'En préparation', icon: Package },
    { key: 'SHIPPED', label: 'En livraison', icon: Truck },
    { key: 'DELIVERED', label: 'Livrée', icon: CheckCircle },
  ];

  const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = statusOrder.indexOf(status);
  const isCancelled = status === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center gap-2 text-red-700">
          <XCircle className="w-5 h-5" />
          <span className="font-medium">Commande annulée</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6 mb-4">
      <div className="relative">
        {/* Barre de progression */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-blue-500 via-purple-500 to-green-500 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Étapes */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center" style={{ width: '25%' }}>
                {/* Icône */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? index === 0
                        ? 'bg-orange-500 text-white shadow-lg'
                        : index === 1
                        ? 'bg-blue-500 text-white shadow-lg'
                        : index === 2
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'scale-110 ring-4 ring-white ring-offset-2' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Label */}
                <p
                  className={`mt-2 text-xs text-center font-medium transition-colors ${
                    isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>

                {/* Date/heure si disponible */}
                {isCompleted && (
                  <p className="mt-1 text-xs text-gray-500">
                    {index === 0 && '✓'}
                    {index === 1 && '✓'}
                    {index === 2 && '✓'}
                    {index === 3 && '✓'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Message selon le statut */}
      <div className="mt-6 text-center">
        {status === 'PENDING' && (
          <p className="text-sm text-orange-700 bg-orange-50 px-4 py-2 rounded-md inline-block">
            ⏳ En attente de confirmation
          </p>
        )}
        {status === 'PROCESSING' && (
          <p className="text-sm text-blue-700 bg-blue-50 px-4 py-2 rounded-md inline-block">
            📦 Commande en cours de préparation
          </p>
        )}
        {status === 'SHIPPED' && (
          <p className="text-sm text-purple-700 bg-purple-50 px-4 py-2 rounded-md inline-block">
            🚚 Votre colis est en route
          </p>
        )}
        {status === 'DELIVERED' && (
          <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-md inline-block">
            ✅ Commande livrée avec succès
          </p>
        )}
      </div>
    </div>
  );
}