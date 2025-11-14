import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Users, Package, ShoppingBag, TrendingUp, Shield,
  CheckCircle, XCircle, AlertTriangle, RefreshCw,
  UserCheck, UserX, Search, Filter, MoreVertical,
  Eye, Mail, Phone, Calendar, Crown
} from 'lucide-react';

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [endpointsMissing, setEndpointsMissing] = useState(false);

  // États pour les modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [modalReason, setModalReason] = useState('');

  // Debug
  console.log('AdminPanel - user:', user);
  console.log('AdminPanel - isAuthenticated:', isAuthenticated);

  // ⚠️ TOUS LES HOOKS DOIVENT ÊTRE ICI, AVANT TOUT RETURN
  // Vérifier l'authentification une seule fois
  useEffect(() => {
    setAuthChecked(true);
  }, []);

  // Fonction de chargement des données
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, pendingRes] = await Promise.all([
        adminAPI.getStats().catch(err => {
          // Silently handle 404 for missing endpoint
          if (err.response?.status === 404) {
            return { data: { stats: {}, recentUsers: [] } };
          }
          throw err;
        }),
        adminAPI.getUsers().catch(err => {
          // Silently handle 404 for missing endpoint
          if (err.response?.status === 404) {
            return { data: { users: [] } };
          }
          throw err;
        }),
        adminAPI.getPendingUsers().catch(err => {
          // Silently handle 404 for missing endpoint
          if (err.response?.status === 404) {
            return { data: { users: [] } };
          }
          throw err;
        })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setPendingUsers(pendingRes.data.users || []);

      // Check if all endpoints returned 404 (backend not implemented)
      const all404 = !statsRes.data.stats && !usersRes.data.users?.length && !pendingRes.data.users?.length;
      if (all404) {
        setEndpointsMissing(true);
        toast.error('Les endpoints admin ne sont pas encore implémentés sur le backend', {
          duration: 6000,
          icon: '⚠️',
        });
      } else {
        setEndpointsMissing(false);
      }
    } catch (error) {
      console.error('Erreur chargement admin:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Erreur lors du chargement des données';
      toast.error(errorMsg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données une fois au montage
  useEffect(() => {
    if (authChecked && isAuthenticated && user?.role === 'ADMIN') {
      loadDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked]);

  // ✅ MAINTENANT ON PEUT FAIRE LES RETURNS CONDITIONNELS

  // Attendre que l'authentification soit vérifiée
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e8cf3a] mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié, afficher l'écran de connexion
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentification requise</h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour accéder à cette page.
          </p>
          <a
            href="/login"
            className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-500 transition-all inline-block"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-600 mb-4">Accès Refusé</h1>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const approveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      toast.success('Utilisateur approuvé avec succès');
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'approbation');
    }
  };

  const openRejectModal = (userId) => {
    setSelectedUserId(userId);
    setModalReason('');
    setShowRejectModal(true);
  };

  const openSuspendModal = (userId) => {
    setSelectedUserId(userId);
    setModalReason('');
    setShowSuspendModal(true);
  };

  const rejectUser = async () => {
    if (!modalReason.trim()) {
      toast.error('Veuillez entrer une raison');
      return;
    }

    try {
      await adminAPI.rejectUser(selectedUserId, { reason: modalReason });
      toast.success('Utilisateur refusé avec succès');
      setShowRejectModal(false);
      setModalReason('');
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du refus');
    }
  };

  const suspendUser = async () => {
    if (!modalReason.trim()) {
      toast.error('Veuillez entrer une raison');
      return;
    }

    try {
      await adminAPI.suspendUser(selectedUserId, { reason: modalReason });
      toast.success('Utilisateur suspendu avec succès');
      setShowSuspendModal(false);
      setModalReason('');
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suspension');
    }
  };

  const activateUser = async (userId) => {
    try {
      await adminAPI.activateUser(userId);
      toast.success('Utilisateur réactivé avec succès');
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la réactivation');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'En attente' },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approuvé' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Refusé' },
      SUSPENDED: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, label: 'Suspendu' }
    };
    
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      ADMIN: { color: 'bg-purple-100 text-purple-800', label: '👑 Admin' },
      SELLER: { color: 'bg-blue-100 text-blue-800', label: '💼 Vendeur' },
      BUYER: { color: 'bg-gray-100 text-gray-800', label: '🛒 Acheteur' }
    };
    
    const config = roleConfig[role] || roleConfig.BUYER;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                Panel d'Administration
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Gestion des utilisateurs et modération de la plateforme
              </p>
            </div>
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="sm:inline">Actualiser</span>
            </button>
          </div>
        </div>

        {/* Warning Banner for Missing Endpoints */}
        {endpointsMissing && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6 animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">Fonctionnalités en développement</h3>
                <p className="text-sm text-yellow-800">
                  Les endpoints admin (<code className="bg-yellow-100 px-2 py-0.5 rounded">/api/admin/stats</code>,
                  <code className="bg-yellow-100 px-2 py-0.5 rounded ml-1">/api/admin/users</code>) ne sont pas encore implémentés sur le backend.
                  Cette page affichera des données une fois les endpoints créés.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation par onglets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
              { id: 'pending', label: 'En attente', icon: AlertTriangle, count: pendingUsers.length },
              { id: 'users', label: 'Tous les utilisateurs', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 border-b-2 font-medium transition-all whitespace-nowrap text-sm md:text-base ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {tab.count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 md:py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Contenu des onglets */}
          <div className="p-4 md:p-6">
            {/* Tableau de bord */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{stats.stats?.totalUsers || 0}</div>
                        <div className="text-xs md:text-sm text-gray-600">Utilisateurs total</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.stats?.pendingUsers || 0} en attente
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{stats.stats?.totalProducts || 0}</div>
                        <div className="text-xs md:text-sm text-gray-600">Produits</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{stats.stats?.totalOrders || 0}</div>
                        <div className="text-xs md:text-sm text-gray-600">Commandes</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                          {(stats.stats?.totalRevenue || 0).toLocaleString()} F
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">Chiffre d'affaires</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Utilisateurs récents */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Utilisateurs récents</h3>
                  <div className="space-y-2 md:space-y-3">
                    {stats.recentUsers?.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm md:text-base truncate">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600 truncate">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pl-10 sm:pl-0">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Utilisateurs en attente */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur en attente</h3>
                    <p className="text-gray-600">Tous les utilisateurs ont été traités.</p>
                  </div>
                ) : (
                  pendingUsers.map((user) => (
                    <div key={user.id} className="bg-white border border-yellow-200 rounded-2xl p-4 md:p-6 shadow-sm">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-3 md:gap-4 flex-1">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <UserX className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 text-sm md:text-base truncate">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600 space-y-1 mt-1">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1">
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                  {user.phone || 'Non renseigné'}
                                </span>
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3">
                          <div className="sm:order-first">
                            {getRoleBadge(user.role)}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveUser(user.id)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1 md:gap-2 bg-green-600 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-green-700 transition-colors text-sm md:text-base"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Approuver</span>
                            </button>
                            <button
                              onClick={() => openRejectModal(user.id)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1 md:gap-2 bg-red-600 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-red-700 transition-colors text-sm md:text-base"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Refuser</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tous les utilisateurs */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {/* Barre de recherche */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Liste des utilisateurs */}
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-3 md:gap-4 flex-1">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            user.role === 'ADMIN' ? 'bg-purple-100' :
                            user.role === 'SELLER' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {user.role === 'ADMIN' ? <Crown className="w-5 h-5 md:w-6 md:h-6 text-purple-600" /> :
                             user.role === 'SELLER' ? <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /> :
                             <Users className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 text-sm md:text-base truncate">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600 space-y-1 mt-1">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1">
                                {user.phone && (
                                  <span className="flex items-center gap-1 whitespace-nowrap">
                                    <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                    {user.phone}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3">
                          <div className="flex gap-2 sm:order-first">
                            {getRoleBadge(user.role)}
                            {getStatusBadge(user.status)}
                          </div>

                          <div className="flex gap-2">
                            {user.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => approveUser(user.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Approuver"
                                >
                                  <UserCheck className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                <button
                                  onClick={() => openRejectModal(user.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Refuser"
                                >
                                  <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                              </>
                            )}
                            {user.status === 'APPROVED' && (
                              <button
                                onClick={() => openSuspendModal(user.id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Suspendre"
                              >
                                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            )}
                            {(user.status === 'REJECTED' || user.status === 'SUSPENDED') && (
                              <button
                                onClick={() => activateUser(user.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Réactiver"
                              >
                                <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de refus */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-md w-full transform animate-fadeInScale">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Refuser l'utilisateur</h3>
                  <p className="text-xs md:text-sm text-gray-600">Veuillez indiquer la raison du refus</p>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Raison du refus *
              </label>
              <textarea
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder="Expliquez pourquoi vous refusez cet utilisateur..."
                className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all text-sm md:text-base"
                rows={4}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Cette raison sera envoyée à l'utilisateur par email.
              </p>
            </div>

            <div className="p-4 md:p-6 bg-gray-50 rounded-b-2xl md:rounded-b-3xl flex flex-col sm:flex-row gap-2 md:gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setModalReason('');
                }}
                className="flex-1 px-4 py-2 md:py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm md:text-base"
              >
                Annuler
              </button>
              <button
                onClick={rejectUser}
                disabled={!modalReason.trim()}
                className="flex-1 px-4 py-2 md:py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm md:text-base"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suspension */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-md w-full transform animate-fadeInScale">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Suspendre l'utilisateur</h3>
                  <p className="text-xs md:text-sm text-gray-600">Veuillez indiquer la raison de la suspension</p>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Raison de la suspension *
              </label>
              <textarea
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder="Expliquez pourquoi vous suspendez cet utilisateur..."
                className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all text-sm md:text-base"
                rows={4}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                L'utilisateur sera informé et ne pourra plus accéder à la plateforme.
              </p>
            </div>

            <div className="p-4 md:p-6 bg-gray-50 rounded-b-2xl md:rounded-b-3xl flex flex-col sm:flex-row gap-2 md:gap-3">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setModalReason('');
                }}
                className="flex-1 px-4 py-2 md:py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm md:text-base"
              >
                Annuler
              </button>
              <button
                onClick={suspendUser}
                disabled={!modalReason.trim()}
                className="flex-1 px-4 py-2 md:py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm md:text-base"
              >
                Confirmer la suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}