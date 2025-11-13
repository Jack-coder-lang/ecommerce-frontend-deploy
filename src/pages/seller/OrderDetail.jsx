// frontend/src/pages/seller/OrderDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Package, MapPin, CreditCard, Phone, Mail, 
  User, Clock, CheckCircle, Truck 
} from 'lucide-react';

export default function SellerOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data.order);
    } catch (error) {
      toast.error('Erreur lors du chargement de la commande');
      navigate('/seller/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success('Statut mis à jour');
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusSteps = () => {
    const allSteps = [
      { key: 'PENDING', label: 'En attente', icon: Clock },
      { key: 'PROCESSING', label: 'En traitement', icon: Package },
      { key: 'SHIPPED', label: 'Expédiée', icon: Truck },
      { key: 'DELIVERED', label: 'Livrée', icon: CheckCircle },
    ];

    const currentIndex = allSteps.findIndex(step => step.key === order?.status);
    
    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-gray-100 text-gray-800',
      PROCESSING: 'bg-gray-100 text-gray-800',
      SHIPPED: 'bg-gray-100 text-gray-800',
      DELIVERED: 'bg-gray-100 text-gray-900',
      CANCELLED: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const getPaymentMethodLabel = (method) => {
    const labels = {
      CASH: 'Paiement à la livraison',
      MOBILE_MONEY: 'Mobile Money',
      CARD: 'Carte bancaire',
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-800 border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <button
          onClick={() => navigate('/seller/orders')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour aux commandes</span>
        </button>

        {/* EN-TÊTE */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold mb-2">
                Commande #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-600">
                Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-md text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>

          {/* TIMELINE DE STATUT */}
          {order.status !== 'CANCELLED' && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                {getStatusSteps().map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex-1 relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-gray-800' : 'bg-gray-200'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            step.completed ? 'text-white' : 'text-gray-400'
                          }`} />
                        </div>
                        <p className={`text-xs mt-2 text-center ${
                          step.completed ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                      {index < getStatusSteps().length - 1 && (
                        <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                          step.completed ? 'bg-gray-800' : 'bg-gray-200'
                        }`} style={{ transform: 'translateY(-50%)' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIONS RAPIDES */}
          {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
            <div className="mt-6 flex flex-wrap gap-3">
              {order.status === 'PENDING' && (
                <button
                  onClick={() => handleUpdateStatus('PROCESSING')}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Mise à jour...' : 'Accepter la commande'}
                </button>
              )}
              {order.status === 'PROCESSING' && (
                <button
                  onClick={() => handleUpdateStatus('SHIPPED')}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Mise à jour...' : 'Marquer comme expédiée'}
                </button>
              )}
              {order.status === 'SHIPPED' && (
                <button
                  onClick={() => handleUpdateStatus('DELIVERED')}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Mise à jour...' : 'Marquer comme livrée'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PRODUITS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Produits commandés</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantité: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Prix unitaire: {item.price.toLocaleString()} F
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()} F
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{order.total.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium text-green-600">Gratuite</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-semibold">{order.total.toLocaleString()} F</span>
                </div>
              </div>
            </div>
          </div>

          {/* INFORMATIONS CLIENT */}
          <div className="lg:col-span-1 space-y-6">
            {/* CLIENT */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold">Client</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">
                  {order.user.firstName} {order.user.lastName}
                </p>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{order.user.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{order.user.email}</span>
                </div>
              </div>
            </div>

            {/* ADRESSE DE LIVRAISON */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold">Adresse de livraison</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.commune}, {order.shippingAddress.city}
                </p>
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{order.shippingAddress.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{order.shippingAddress.email}</span>
                  </div>
                </div>
                {order.shippingAddress.instructions && (
                  <div className="pt-2 border-t border-gray-200 mt-2">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Instructions:</span> {order.shippingAddress.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* MODE DE PAIEMENT */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold">Paiement</h2>
              </div>
              <p className="text-sm text-gray-900 font-medium">
                {getPaymentMethodLabel(order.paymentMethod)}
              </p>
              <p className={`text-xs mt-2 px-2 py-1 rounded inline-block ${
                order.paymentStatus === 'PAID' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {order.paymentStatus === 'PAID' ? 'Payé' : 'En attente'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}