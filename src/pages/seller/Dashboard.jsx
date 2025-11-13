// frontend/src/pages/seller/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Package, Truck, TrendingUp, AlertCircle, Plus,
  BarChart3, MessageSquare, DollarSign, Users, Star, Clock,
  ChevronRight, Sparkles, Award, Zap
} from 'lucide-react';
import { productsAPI, ordersAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const mockProducts = [
        { id: 1, name: 'iPhone 14', price: 450000, images: [], stock: 10 },
        { id: 2, name: 'Samsung Galaxy', price: 320000, images: [], stock: 5 }
      ];
      
      const mockOrders = [
        { id: 1, orderNumber: 'CMD-001', total: 450000, status: 'PENDING', paymentStatus: 'PAID', createdAt: new Date() },
        { id: 2, orderNumber: 'CMD-002', total: 320000, status: 'DELIVERED', paymentStatus: 'PAID', createdAt: new Date() }
      ];

      setProducts(mockProducts);
      setOrders(mockOrders);

      setStats({
        totalProducts: mockProducts.length,
        totalOrders: mockOrders.length,
        pendingOrders: mockOrders.filter(o => o.status === 'PENDING').length,
        revenue: mockOrders
          .filter(o => o.paymentStatus === 'PAID')
          .reduce((sum, o) => sum + o.total, 0)
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Erreur chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PAID': return 'bg-brand-green-light text-brand-green border-brand-green/30';
      case 'PENDING': return 'bg-brand-yellow-light text-brand-yellow border-brand-yellow/30';
      case 'SHIPPED': return 'bg-brand-cyan-light text-brand-cyan border-brand-cyan/30';
      case 'DELIVERED': return 'bg-brand-green-light text-brand-green border-brand-green/30';
      case 'CANCELLED': return 'bg-brand-pink-light text-brand-pink border-brand-pink/30';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center animate-fadeInScale">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#e8cf3a] border-t-transparent mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-brand-yellow animate-pulse" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* HEADER AVEC COULEURS DE MARQUE */}
      <div className="gradient-brand-rainbow relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-[#e8cf3a] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-[#bd1762] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-slideInUp">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-3">
                <Award className="w-5 h-5 text-brand-gold" />
                <span className="text-sm font-semibold">Espace Vendeur</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Tableau de bord</h1>
              <p className="text-white/90 text-lg">
                Bonjour {user?.firstName || user?.email || 'Vendeur'} 👋
              </p>
            </div>
            
            <Link 
              to="/seller/products/new"
              className="btn-primary shine flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau produit</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* STATS CARDS AVEC COULEURS DE MARQUE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeIn">
          <div className="card-brand card-hover shadow-brand">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Produits</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-xs text-brand-cyan mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +2 ce mois
                </p>
              </div>
              <div className="w-16 h-16 gradient-brand-primary rounded-2xl flex items-center justify-center shadow-brand">
                <ShoppingBag className="w-8 h-8 text-brand-black" />
              </div>
            </div>
          </div>

          <div className="card-brand card-hover shadow-brand">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Commandes</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-xs text-brand-green mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% ce mois
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-brand-cyan to-brand-green rounded-2xl flex items-center justify-center shadow-brand-green">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card-brand card-hover shadow-brand">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">En attente</p>
                <p className="text-4xl font-bold text-gray-900">{stats.pendingOrders}</p>
                <p className="text-xs text-brand-yellow mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  À traiter
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-brand-yellow to-brand-gold rounded-2xl flex items-center justify-center shadow-brand">
                <AlertCircle className="w-8 h-8 text-brand-black" />
              </div>
            </div>
          </div>

          <div className="card-brand card-hover shadow-brand">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Revenus</p>
                <p className="text-3xl font-bold text-brand-yellow">
                  {stats.revenue.toLocaleString()} F
                </p>
                <p className="text-xs text-brand-green mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +15% ce mois
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-brand-pink to-brand-magenta rounded-2xl flex items-center justify-center shadow-brand-pink">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MES PRODUITS AVEC COULEURS DE MARQUE */}
          <div className="card-brand shadow-brand animate-fadeIn animation-delay-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient-brand flex items-center gap-2">
                <Package className="w-6 h-6 text-brand-cyan" />
                Mes produits
              </h2>
              <Link 
                to="/seller/products" 
                className="text-sm text-brand-cyan hover:text-brand-pink font-semibold flex items-center gap-1 transition-colors"
              >
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-brand-yellow-light rounded-xl border border-brand-yellow/30 hover:border-brand-yellow transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 gradient-brand-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="w-7 h-7 text-brand-black" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-brand-cyan transition-colors">
                        {product.name}
                      </p>
                      <p className="text-sm text-brand-gold font-semibold">
                        {product.price.toLocaleString()} F
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">
                      Stock: <span className="text-brand-cyan">{product.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COMMANDES RÉCENTES AVEC COULEURS DE MARQUE */}
          <div className="card-brand shadow-brand animate-fadeIn animation-delay-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient-brand flex items-center gap-2">
                <Truck className="w-6 h-6 text-brand-green" />
                Commandes récentes
              </h2>
              <Link 
                to="/seller/orders" 
                className="text-sm text-brand-cyan hover:text-brand-pink font-semibold flex items-center gap-1 transition-colors"
              >
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-4 bg-brand-cyan-light rounded-xl border border-brand-cyan/30 hover:border-brand-cyan transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-brand-cyan transition-colors">
                        #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-brand-yellow">
                        {order.total.toLocaleString()} F
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 border ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus === 'PAID' ? 'Payée' : 'En attente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ACTIONS RAPIDES AVEC COULEURS DE MARQUE */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fadeIn animation-delay-400">
          <Link 
            to="/seller/products/new" 
            className="card-brand card-hover text-center group shadow-brand"
          >
            <div className="w-16 h-16 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-brand">
              <Plus className="w-8 h-8 text-brand-black" />
            </div>
            <p className="font-bold text-gray-900 group-hover:text-brand-cyan transition-colors">
              Ajouter produit
            </p>
          </Link>

          <Link 
            to="/seller/orders" 
            className="card-brand card-hover text-center group shadow-brand"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-brand-cyan to-brand-green rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-brand-green">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <p className="font-bold text-gray-900 group-hover:text-brand-cyan transition-colors">
              Commandes
            </p>
          </Link>

          <Link 
            to="/seller/analytics" 
            className="card-brand card-hover text-center group shadow-brand"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-brand-pink to-brand-magenta rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-brand-pink">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <p className="font-bold text-gray-900 group-hover:text-brand-pink transition-colors">
              Statistiques
            </p>
          </Link>

          <Link 
            to="/seller/messages" 
            className="card-brand card-hover text-center group shadow-brand"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-brand-yellow to-brand-gold rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-brand">
              <MessageSquare className="w-8 h-8 text-brand-black" />
            </div>
            <p className="font-bold text-gray-900 group-hover:text-brand-yellow transition-colors">
              Messages
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}