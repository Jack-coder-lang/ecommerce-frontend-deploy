// frontend/src/pages/Orders.jsx
// VERSION AVEC COULEURS DE LA MARQUE INTÉGRÉES
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Package, Clock, Truck, CheckCircle, XCircle, ChevronRight,
  Sparkles, Filter, RefreshCw, ShoppingBag, Calendar,
  MapPin, CreditCard, User, Phone, Mail
} from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-refresh quand une commande est mise à jour
  useEffect(() => {
    const handleOrderUpdate = () => {
      fetchOrders();
    };

    window.addEventListener('order-update', handleOrderUpdate);
    return () => {
      window.removeEventListener('order-update', handleOrderUpdate);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5 text-brand-yellow" />;
      case 'PROCESSING': return <Package className="w-5 h-5 text-brand-cyan" />;
      case 'SHIPPED': return <Truck className="w-5 h-5 text-brand-blue" />;
      case 'DELIVERED': return <CheckCircle className="w-5 h-5 text-brand-green" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-brand-pink" />;
      default: return <Package className="w-5 h-5 text-gray-600" />;
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
      PENDING: 'bg-brand-yellow-light text-brand-yellow-dark',
      PROCESSING: 'bg-brand-cyan-light text-brand-cyan-dark',
      SHIPPED: 'bg-brand-blue-light text-brand-blue-dark',
      DELIVERED: 'bg-brand-green-light text-brand-green-dark',
      CANCELLED: 'bg-brand-pink-light text-brand-pink-dark',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusGradient = (status) => {
    const gradients = {
      PENDING: 'from-brand-yellow/20 to-brand-yellow-light/20',
      PROCESSING: 'from-brand-cyan/20 to-brand-cyan-light/20',
      SHIPPED: 'from-brand-blue/20 to-brand-blue-light/20',
      DELIVERED: 'from-brand-green/20 to-brand-green-light/20',
      CANCELLED: 'from-brand-pink/20 to-brand-pink-light/20',
    };
    return gradients[status] || 'from-gray-200/20 to-gray-300/20';
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'ALL') return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    totalAmount: orders.reduce((sum, order) => sum + order.total, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center animate-fadeInScale">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#e8cf3a] border-t-transparent mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-brand-yellow animate-pulse" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* HEADER SECTION */}
        <section className="mb-8 animate-slideInUp">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-cyan-light px-4 py-2 rounded-full mb-4">
                <ShoppingBag className="w-5 h-5 text-brand-cyan" />
                <span className="text-sm font-semibold text-brand-cyan">Suivi des Commandes</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Mes <span className="text-gradient-brand">Commandes</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Suivez l'état de vos commandes en temps réel
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-primary group"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>
        </section>

        {/* STATISTIQUES */}
        <section className="mb-8 animate-fadeIn">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total commandes', value: stats.total, icon: ShoppingBag, color: 'cyan' },
              { label: 'En attente', value: stats.pending, icon: Clock, color: 'yellow' },
              { label: 'Livrées', value: stats.delivered, icon: CheckCircle, color: 'green' },
              { label: 'Montant total', value: `${stats.totalAmount.toLocaleString()} F`, icon: CreditCard, color: 'pink' },
            ].map((stat, index) => (
              <div
                key={index}
                className="card-brand card-hover text-center group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl gradient-brand-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-brand-black" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FILTRES AVEC STYLE DE MARQUE */}
        <section className="mb-8 animate-slideInUp">
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'ALL', label: 'Toutes', icon: Filter },
              { value: 'PENDING', label: 'En attente', icon: Clock },
              { value: 'PROCESSING', label: 'En traitement', icon: Package },
              { value: 'SHIPPED', label: 'Expédiées', icon: Truck },
              { value: 'DELIVERED', label: 'Livrées', icon: CheckCircle },
              { value: 'CANCELLED', label: 'Annulées', icon: XCircle },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  filter === item.value
                    ? 'gradient-brand-primary text-brand-black shadow-brand'
                    : 'bg-white border border-gray-300 text-gray-700 hover:shadow-md hover:border-gray-400'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* LISTE DES COMMANDES */}
        <section className="animate-fadeIn">
          {filteredOrders.length === 0 ? (
            <div className="card-brand text-center py-16">
              <div className="w-24 h-24 gradient-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-brand-black" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Aucune commande trouvée
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {filter === 'ALL' 
                  ? "Vous n'avez pas encore passé de commande. Découvrez nos produits !"
                  : `Aucune commande avec le statut "${getStatusLabel(filter)}"`}
              </p>
              {filter === 'ALL' && (
                <Link
                  to="/products"
                  className="btn-primary shine inline-flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Découvrir les produits
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order, index) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block card-brand card-hover group relative overflow-hidden animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Fond gradient basé sur le statut */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${getStatusGradient(order.status)} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    {/* En-tête de commande */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-2xl ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-cyan transition-colors">
                              Commande #{order.orderNumber}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                            {order.shippingAddress && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {order.shippingAddress.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-brand-yellow">
                            {order.total.toLocaleString()} F
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.items?.length || 0} article(s)
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* Articles de la commande */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {order.items?.slice(0, 4).map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="w-10 h-10 bg-gray-200 rounded-lg border-2 border-white overflow-hidden"
                            >
                              {item.product?.images?.[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-full h-full p-2 text-gray-400" />
                              )}
                            </div>
                          ))}
                          {order.items && order.items.length > 4 && (
                            <div className="w-10 h-10 bg-brand-cyan-light rounded-lg border-2 border-white flex items-center justify-center text-xs font-bold text-brand-cyan">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {order.items?.map(item => item.product?.name).join(', ')}
                          {order.items && order.items.length > 2 && '...'}
                        </div>
                      </div>
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
                      {order.paymentMethod && (
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {order.paymentMethod}
                        </div>
                      )}
                      {order.trackingNumber && (
                        <div className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Suivi: {order.trackingNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* BANNIÈRE D'ASSISTANCE */}
        <section className="mt-12 animate-fadeIn">
          <div className="gradient-brand-rainbow rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 text-center">
              <h3 className="text-2xl font-bold mb-4">Besoin d'aide avec vos commandes ?</h3>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Notre équipe de support est disponible 24h/24 et 7j/7 pour vous accompagner
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all border-2 border-white/30">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Nous appeler
                </button>
                <button className="bg-white text-brand-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Nous écrire
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 