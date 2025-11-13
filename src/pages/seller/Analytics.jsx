// frontend/src/pages/seller/Analytics.jsx
// VERSION AVEC COULEURS DE LA MARQUE INTÉGRÉES
import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, Package, ShoppingBag, Star, DollarSign,
  Calendar, BarChart3, PieChart, Sparkles, Target,
  Award, Users, Eye, Zap, ChevronDown, RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function SellerAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getSellerStats(period);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center animate-fadeInScale">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#e8cf3a] border-t-transparent mx-auto"></div>
            <BarChart3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-brand-yellow animate-pulse" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Configuration des couleurs des graphiques avec la marque
  const chartColors = {
    primary: '#e8cf3a', // brand-yellow
    secondary: '#1aa2af', // brand-cyan
    accent: '#bd1762', // brand-pink
    dark: '#212020', // brand-black
    light: '#f8fafc',
  };

  // Données pour le graphique de revenus
  const revenueChartData = {
    labels: analytics.salesChart.map(d => {
      const date = new Date(d.date);
      return period === '7' 
        ? date.toLocaleDateString('fr-FR', { weekday: 'short' })
        : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }),
    datasets: [
      {
        label: 'Revenus (FCFA)',
        data: analytics.salesChart.map(d => d.revenue),
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}20`,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Données pour le graphique des commandes
  const ordersChartData = {
    labels: analytics.salesChart.map(d => {
      const date = new Date(d.date);
      return period === '7' 
        ? date.toLocaleDateString('fr-FR', { weekday: 'short' })
        : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }),
    datasets: [
      {
        label: 'Commandes',
        data: analytics.salesChart.map(d => d.orders),
        backgroundColor: chartColors.secondary,
        borderColor: chartColors.secondary,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Données pour le graphique des statuts
  const statusChartData = {
    labels: analytics.ordersByStatus.map(s => {
      const labels = {
        PENDING: 'En attente',
        PROCESSING: 'En traitement',
        SHIPPED: 'Expédiées',
        DELIVERED: 'Livrées',
        CANCELLED: 'Annulées',
      };
      return labels[s.status] || s.status;
    }),
    datasets: [
      {
        data: analytics.ordersByStatus.map(s => s._count.id),
        backgroundColor: [
          chartColors.primary, // PENDING
          chartColors.secondary, // PROCESSING
          '#3b82f6', // SHIPPED (blue)
          '#10b981', // DELIVERED (green)
          chartColors.accent, // CANCELLED
        ],
        borderColor: '#ffffff',
        borderWidth: 3,
        borderRadius: 8,
        spacing: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'system-ui',
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(33, 32, 32, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: chartColors.primary,
        borderWidth: 1,
        cornerRadius: 12,
        usePointStyle: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            family: 'system-ui',
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'system-ui',
          },
        },
      },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: '65%',
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: 'bottom',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* EN-TÊTE */}
        <section className="mb-8 animate-slideInUp">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-cyan-light px-4 py-2 rounded-full mb-4">
                <BarChart3 className="w-5 h-5 text-brand-cyan" />
                <span className="text-sm font-semibold text-brand-cyan">Tableau de Bord Vendeur</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Mes <span className="text-gradient-brand">Statistiques</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Analysez vos performances et optimisez vos ventes
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-primary group"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>

              {/* FILTRE DE PÉRIODE */}
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="appearance-none px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all pr-12 cursor-pointer"
                >
                  <option value="7">7 derniers jours</option>
                  <option value="30">30 derniers jours</option>
                  <option value="90">90 derniers jours</option>
                  <option value="365">365 derniers jours</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* CARTES DE STATISTIQUES PRINCIPALES */}
        <section className="mb-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: DollarSign,
                label: 'Revenus totaux',
                value: `${analytics.stats.totalRevenue.toLocaleString()} F`,
                change: '+12%',
                trending: true,
                color: 'yellow',
              },
              {
                icon: ShoppingBag,
                label: 'Commandes',
                value: analytics.stats.totalOrders.toString(),
                change: '+8%',
                trending: true,
                color: 'cyan',
              },
              {
                icon: Package,
                label: 'Produits actifs',
                value: analytics.stats.totalProducts.toString(),
                change: '+5%',
                trending: true,
                color: 'pink',
              },
              {
                icon: Star,
                label: 'Satisfaction',
                value: `${analytics.stats.averageRating.toFixed(1)}/5`,
                change: `${analytics.stats.totalReviews} avis`,
                trending: null,
                color: 'green',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="card-brand card-hover group animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      stat.trending === true 
                        ? 'bg-brand-green-light text-brand-green-dark'
                        : stat.trending === false
                        ? 'bg-brand-pink-light text-brand-pink-dark'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {stat.trending !== null && (
                        <TrendingUp className={`w-3 h-3 ${stat.trending === false ? 'rotate-180' : ''}`} />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl gradient-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6 text-brand-black" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GRAPHIQUES PRINCIPAUX */}
        <section className="mb-8 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* GRAPHIQUE REVENUS */}
            <div className="xl:col-span-2 card-brand">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 gradient-brand-primary rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Évolution des revenus</h2>
                  <p className="text-gray-600">Performance de vos ventes sur la période</p>
                </div>
              </div>
              <div className="h-80">
                <Line data={revenueChartData} options={chartOptions} />
              </div>
            </div>

            {/* GRAPHIQUE STATUTS */}
            <div className="card-brand">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 gradient-brand-primary rounded-2xl flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-brand-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Statut des commandes</h2>
                  <p className="text-gray-600">Répartition par statut</p>
                </div>
              </div>
              <div className="h-80 flex items-center justify-center">
                <Doughnut data={statusChartData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </section>

        {/* DEUXIÈME RANGÉE DE GRAPHIQUES */}
        <section className="mb-8 animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GRAPHIQUE COMMANDES */}
            <div className="card-brand">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 gradient-brand-primary rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-brand-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Volume de commandes</h2>
                  <p className="text-gray-600">Nombre de commandes par jour</p>
                </div>
              </div>
              <div className="h-80">
                <Bar data={ordersChartData} options={chartOptions} />
              </div>
            </div>

            {/* PRODUITS LES PLUS VENDUS */}
            <div className="card-brand">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 gradient-brand-primary rounded-2xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-brand-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Produits populaires</h2>
                  <p className="text-gray-600">Vos meilleures performances</p>
                </div>
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {analytics.topProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-cyan transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow-light rounded-xl flex items-center justify-center">
                        <span className="text-sm font-bold text-brand-yellow-dark">{index + 1}</span>
                      </div>
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {product.totalSold} vendus • {product.orderCount} commandes
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-brand-yellow">
                        {(product.price * product.totalSold).toLocaleString()} F
                      </p>
                      <p className="text-xs text-gray-600">Chiffre d'affaires</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CATÉGORIES POPULAIRES */}
        <section className="animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <div className="card-brand">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 gradient-brand-primary rounded-2xl flex items-center justify-center">
                <Target className="w-5 h-5 text-brand-black" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Catégories populaires</h2>
                <p className="text-gray-600">Performance par catégorie de produits</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {analytics.topCategories.map((category, index) => (
                <div 
                  key={category.category} 
                  className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-brand-cyan transition-colors group card-hover"
                >
                  <div className="text-3xl font-bold text-brand-yellow mb-2">{category._count.id}</div>
                  <div className="text-sm font-semibold text-gray-900 truncate">{category.category}</div>
                  <div className="text-xs text-gray-600 mt-1">commandes</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MÉTRIQUES SUPPLÉMENTAIRES */}
        <section className="mt-8 animate-fadeIn" style={{ animationDelay: '500ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Clients fidèles', value: '85%', desc: 'Taux de retour' },
              { icon: Eye, title: 'Vues produits', value: '2.4K', desc: 'Visibilité mensuelle' },
              { icon: Zap, title: 'Taux de conversion', value: '3.2%', desc: 'Performance globale' },
            ].map((metric, index) => (
              <div key={index} className="card-brand text-center card-hover group">
                <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <metric.icon className="w-6 h-6 text-brand-black" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{metric.title}</h3>
                <div className="text-2xl font-bold text-brand-yellow mb-1">{metric.value}</div>
                <p className="text-sm text-gray-600">{metric.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}