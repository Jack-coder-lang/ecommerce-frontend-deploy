// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, UserCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'BUYER',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success('Inscription réussie ! 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur d\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Blobs animés */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-[#e8cf3a] rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-[#bd1762] rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-[#1aa2af] rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10 animate-fadeInScale">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-brand-primary rounded-full mb-6 shadow-brand">
            <Sparkles className="w-10 h-10 text-brand-black" />
          </div>
          <h2 className="text-4xl font-bold text-gradient-brand mb-2">Inscription</h2>
          <p className="text-gray-600 text-lg">Créez votre compte en quelques clics</p>
        </div>

        <div className="card-brand shadow-brand-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prénom et Nom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-brand-black mb-3">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-cyan" />
                  <input
                    type="text"
                    required
                    className="input-brand pl-12"
                    placeholder="Jean"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-black mb-3">
                  Nom
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-pink" />
                  <input
                    type="text"
                    required
                    className="input-brand pl-12"
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-brand-black mb-3">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-green" />
                <input
                  type="email"
                  required
                  className="input-brand pl-12"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-bold text-brand-black mb-3">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                <input
                  type="tel"
                  className="input-brand pl-12"
                  placeholder="+225 XX XX XX XX XX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-bold text-brand-black mb-3">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-magenta" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="input-brand pl-12 pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-pink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Minimum 6 caractères
              </p>
            </div>

            {/* Type de compte */}
            <div>
              <label className="block text-sm font-bold text-brand-black mb-3">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    formData.role === 'BUYER'
                      ? 'border-brand-cyan bg-brand-cyan-light'
                      : 'border-gray-200 hover:border-brand-cyan hover:bg-brand-cyan-light/50'
                  }`}
                >
                  <UserCircle className={`w-8 h-8 mx-auto mb-2 ${
                    formData.role === 'BUYER' ? 'text-brand-cyan' : 'text-gray-400'
                  }`} />
                  <div className={`font-bold ${
                    formData.role === 'BUYER' ? 'text-brand-cyan' : 'text-gray-600'
                  }`}>
                    Acheteur
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Parcourir et acheter
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    formData.role === 'SELLER'
                      ? 'border-brand-pink bg-brand-pink-light'
                      : 'border-gray-200 hover:border-brand-pink hover:bg-brand-pink-light/50'
                  }`}
                >
                  <User className={`w-8 h-8 mx-auto mb-2 ${
                    formData.role === 'SELLER' ? 'text-brand-pink' : 'text-gray-400'
                  }`} />
                  <div className={`font-bold ${
                    formData.role === 'SELLER' ? 'text-brand-pink' : 'text-gray-600'
                  }`}>
                    Vendeur
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Vendre mes produits
                  </div>
                </button>
              </div>
            </div>

            {/* Conditions d'utilisation */}
            <div className="flex items-start gap-3 p-4 bg-brand-yellow-light rounded-xl border border-brand-yellow/30">
              <input 
                type="checkbox" 
                required
                className="w-5 h-5 text-brand-yellow rounded focus:ring-brand-yellow mt-0.5"
              />
              <label className="text-sm text-gray-700">
                J'accepte les{' '}
                <Link to="/terms" className="text-brand-cyan hover:text-brand-pink font-semibold">
                  conditions d'utilisation
                </Link>
                {' '}et la{' '}
                <Link to="/privacy" className="text-brand-cyan hover:text-brand-pink font-semibold">
                  politique de confidentialité
                </Link>
              </label>
            </div>

            {/* Bouton d'inscription */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full btn-primary shine text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-black border-t-transparent"></div>
                  Inscription en cours...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-yellow/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">OU</span>
            </div>
          </div>

          {/* Lien connexion */}
          <div className="text-center">
            <p className="text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link 
                to="/login" 
                className="text-brand-pink hover:text-brand-magenta font-bold transition-colors"
              >
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}