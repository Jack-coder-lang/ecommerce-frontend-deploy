// VERSION COMPLÈTE CORRIGÉE - PROFILE.JSX
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  User, Mail, Phone, Lock, ShoppingBag, Package, 
  TrendingUp, Star, Save, Trash2, Eye, EyeOff, Shield,
  AlertTriangle, Calendar, ChevronRight, Home, Award, 
  Heart, Truck, CheckCircle
} from 'lucide-react';

export default function Profile() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  // Formulaire informations
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Formulaire mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Fonction ultra-sécurisée pour formater les dates
  const safeFormatDate = (dateString) => {
    if (!dateString || dateString === 'undefined' || dateString === 'null') {
      return 'Date inconnue';
    }
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Date invalide' : date.toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  // Récupération sécurisée de la date de création
  const getCreationDate = () => {
    const date = user?.createdAt || user?.created_at || user?.dateCreated || user?.registrationDate;
    return safeFormatDate(date);
  };

  // Fonction helper pour les valeurs numériques sécurisées
  const safeNumber = (value, defaultValue = 0) => {
    if (value === undefined || value === null) return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Fonction helper pour formater les montants
  const formatAmount = (amount) => {
    return safeNumber(amount).toLocaleString() + ' F';
  };

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      const response = await profileAPI.getStats();
      setStats(response.data?.stats || {});
    } catch (error) {
      console.error('Erreur stats:', error);
      setStats({});
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await profileAPI.update(formData);
      const updatedUser = response.data?.user || user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('✅ Profil mis à jour avec succès');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await profileAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('🔒 Mot de passe modifié avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt('🔒 Entrez votre mot de passe pour confirmer la suppression :');
    
    if (!password) return;

    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données seront définitivement effacées. Cette action est irréversible.')) {
      return;
    }

    try {
      await profileAPI.deleteAccount({ password });
      toast.success('👋 Compte supprimé avec succès');
      logout();
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Si l'utilisateur n'est pas chargé
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto mb-4"></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* FIL D'ARIANE */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8 animate-slideInUp">
          <Link to="/" className="flex items-center gap-1 hover:text-brand-cyan transition-colors">
            <Home className="w-4 h-4" />
            Accueil
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Mon profil</span>
        </nav>

        {/* EN-TÊTE DU PROFIL */}
        <section className="mb-8 animate-slideInUp">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 gradient-brand-primary rounded-2xl flex items-center justify-center">
                <User className="w-10 h-10 text-brand-black" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {user?.firstName || 'Utilisateur'} <span className="text-gradient-brand">{user?.lastName || ''}</span>
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email || 'Email non disponible'}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {/* LIGNE 234 CORRIGÉE */}
                    <span>Membre depuis {getCreationDate()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 ml-auto">
              <div className={`badge-primary text-sm ${
                user?.role === 'SELLER' ? 'bg-brand-cyan-light text-brand-cyan-dark' : 
                user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-brand-yellow-light text-brand-yellow-dark'
              }`}>
                {user?.role === 'SELLER' ? '👑 Vendeur Certifié' : 
                 user?.role === 'ADMIN' ? '👑 Administrateur' : '🛒 Acheteur'}
              </div>
              {user?.role === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  className="badge-primary text-sm bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                >
                  Panel Admin
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* STATISTIQUES */}
        {stats && (
          <section className="mb-8 animate-fadeIn">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {user?.role === 'BUYER' ? (
                <>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{safeNumber(stats.totalOrders)}</div>
                    <div className="text-sm text-gray-600">Commandes</div>
                  </div>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-2xl font-bold text-brand-yellow mb-1">{formatAmount(stats.totalSpent)}</div>
                    <div className="text-sm text-gray-600">Dépenses totales</div>
                  </div>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Star className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{safeNumber(stats.totalReviews)}</div>
                    <div className="text-sm text-gray-600">Avis donnés</div>
                  </div>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Heart className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{safeNumber(stats.favoriteProducts)}</div>
                    <div className="text-sm text-gray-600">Favoris</div>
                  </div>
                </>
              ) : user?.role === 'SELLER' ? (
                <>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{safeNumber(stats.totalProducts)}</div>
                    <div className="text-sm text-gray-600">Produits</div>
                  </div>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{safeNumber(stats.totalOrders)}</div>
                    <div className="text-sm text-gray-600">Commandes</div>
                  </div>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-2xl font-bold text-brand-yellow mb-1">{formatAmount(stats.totalRevenue)}</div>
                    <div className="text-sm text-gray-600">Revenus</div>
                  </div>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Award className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{safeNumber(stats.averageRating, 0).toFixed(1)}/5</div>
                    <div className="text-sm text-gray-600">Note moyenne</div>
                  </div>
                </>
              ) : (
                // Stats pour admin
                <>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{safeNumber(stats.totalUsers)}</div>
                    <div className="text-sm text-gray-600">Utilisateurs</div>
                  </div>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{safeNumber(stats.totalProducts)}</div>
                    <div className="text-sm text-gray-600">Produits</div>
                  </div>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{safeNumber(stats.totalOrders)}</div>
                    <div className="text-sm text-gray-600">Commandes</div>
                  </div>
                  <div className="card-brand text-center card-hover group">
                    <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-brand-black" />
                    </div>
                    <div className="text-2xl font-bold text-brand-yellow mb-1">{formatAmount(stats.totalRevenue)}</div>
                    <div className="text-sm text-gray-600">Chiffre d'affaires</div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ONGLETS */}
        <section className="animate-fadeIn">
          <div className="card-brand">
            {/* NAVIGATION DES ONGLETS */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-8">
                {[
                  { id: 'info', label: 'Informations personnelles', icon: User },
                  { id: 'security', label: 'Sécurité', icon: Shield },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                        activeTab === tab.id
                          ? 'border-brand-cyan text-brand-cyan'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <TabIcon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTENU DES ONGLETS */}
            <div className="max-w-2xl">
              {/* ONGLET INFORMATIONS PERSONNELLES */}
              {activeTab === 'info' && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Prénom *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Nom *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
                        placeholder="+225 XX XX XX XX XX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
                  </button>
                </form>
              )}

              {/* ONGLET SÉCURITÉ */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  {/* CHANGEMENT DE MOT DE PASSE */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Shield className="w-6 h-6 text-brand-cyan" />
                      Changer le mot de passe
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      {[
                        { 
                          label: 'Mot de passe actuel', 
                          field: 'currentPassword', 
                          value: passwordData.currentPassword,
                          required: true
                        },
                        { 
                          label: 'Nouveau mot de passe', 
                          field: 'newPassword', 
                          value: passwordData.newPassword,
                          required: true
                        },
                        { 
                          label: 'Confirmer le nouveau mot de passe', 
                          field: 'confirmPassword', 
                          value: passwordData.confirmPassword,
                          required: true
                        },
                      ].map(({ label, field, value, required }) => (
                        <div key={field}>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            {label} {required && '*'}
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPasswords[field] ? 'text' : 'password'}
                              required={required}
                              minLength={6}
                              className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
                              value={value}
                              onChange={(e) => setPasswordData({ ...passwordData, [field]: e.target.value })}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(field)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPasswords[field] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Lock className="w-5 h-5" />
                        {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
                      </button>
                    </form>
                  </div>

                  {/* ZONE DE DANGER */}
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6" />
                      Zone de danger
                    </h3>
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-900 mb-2">Suppression définitive du compte</h4>
                          <p className="text-red-700 text-sm">
                            Une fois votre compte supprimé, toutes vos données personnelles, commandes, 
                            et historiques seront définitivement effacés. Cette action est irréversible 
                            et ne peut pas être annulée.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                        Supprimer définitivement mon compte
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION GARANTIES */}
        <section className="mt-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Données sécurisées', desc: 'Vos informations sont cryptées et protégées' },
              { icon: CheckCircle, title: 'Compte vérifié', desc: 'Profil authentifié et sécurisé' },
              { icon: Truck, title: 'Support 24/7', desc: 'Assistance disponible à tout moment' },
            ].map((item, index) => (
              <div key={index} className="card-brand text-center card-hover group">
                <div className="w-12 h-12 gradient-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-brand-black" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}