import { useEffect, useState } from 'react';
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
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, pendingRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getPendingUsers()
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setPendingUsers(pendingRes.data.users || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      toast.success('Utilisateur approuvé avec succès');
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'approbation');
    }
  };

  const rejectUser = async (userId, reason) => {
    if (!reason) {
      reason = prompt('Raison du refus :');
      if (!reason) return;
    }

    try {
      await adminAPI.rejectUser(userId, { reason });
      toast.success('Utilisateur refusé avec succès');
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du refus');
    }
  };

  const suspendUser = async (userId) => {
    const reason = prompt('Raison de la suspension :');
    if (!reason) return;

    try {
      await adminAPI.suspendUser(userId, { reason });
      toast.success('Utilisateur suspendu avec succès');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Panel d'Administration
              </h1>
              <p className="text-gray-600">
                Gestion des utilisateurs et modération de la plateforme
              </p>
            </div>
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
              { id: 'pending', label: 'En attente', icon: AlertTriangle, count: pendingUsers.length },
              { id: 'users', label: 'Tous les utilisateurs', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {/* Tableau de bord */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{stats.stats?.totalUsers || 0}</div>
                        <div className="text-sm text-gray-600">Utilisateurs total</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.stats?.pendingUsers || 0} en attente
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{stats.stats?.totalProducts || 0}</div>
                        <div className="text-sm text-gray-600">Produits</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{stats.stats?.totalOrders || 0}</div>
                        <div className="text-sm text-gray-600">Commandes</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {(stats.stats?.totalRevenue || 0).toLocaleString()} F
                        </div>
                        <div className="text-sm text-gray-600">Chiffre d'affaires</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Utilisateurs récents */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisateurs récents</h3>
                  <div className="space-y-3">
                    {stats.recentUsers?.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
                    <div key={user.id} className="bg-white border border-yellow-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <UserX className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {user.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {user.phone || 'Non renseigné'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getRoleBadge(user.role)}
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveUser(user.id)}
                              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                              Approuver
                            </button>
                            <button
                              onClick={() => rejectUser(user.id)}
                              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Refuser
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
                    <div key={user.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            user.role === 'ADMIN' ? 'bg-purple-100' :
                            user.role === 'SELLER' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {user.role === 'ADMIN' ? <Crown className="w-6 h-6 text-purple-600" /> :
                             user.role === 'SELLER' ? <Package className="w-6 h-6 text-blue-600" /> :
                             <Users className="w-6 h-6 text-gray-600" />}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {user.email}
                              </span>
                              {user.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {user.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.status)}
                          
                          <div className="flex gap-2">
                            {user.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => approveUser(user.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Approuver"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => rejectUser(user.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Refuser"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {user.status === 'APPROVED' && (
                              <button
                                onClick={() => suspendUser(user.id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Suspendre"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            )}
                            {(user.status === 'REJECTED' || user.status === 'SUSPENDED') && (
                              <button
                                onClick={() => activateUser(user.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Réactiver"
                              >
                                <RefreshCw className="w-4 h-4" />
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
    </div>
  );
}