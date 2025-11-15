// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: 'koffi@abidjan.ci',
    password: '123456',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Tentative de connexion avec:', formData.email);
      const result = await login(formData);
      console.log('✅ Connexion réussie, résultat:', result);

      toast.success('Connexion réussie ! 🎉');

      setTimeout(() => {
        const user = result.user || JSON.parse(localStorage.getItem('user') || '{}');
        console.log('👤 User après login:', user);
        console.log('🔑 Token stocké:', localStorage.getItem('token'));

        // Redirection selon le rôle
        if (user.role === 'ADMIN') {
          console.log('🎯 Redirection vers /admin');
          navigate('/admin');
        } else if (user.role === 'SELLER') {
          console.log('🎯 Redirection vers /seller/dashboard');
          navigate('/seller/dashboard');
        } else {
          console.log('🎯 Redirection vers /');
          navigate('/');
        }
      }, 500);

    } catch (error) {
      console.error('Login error:', error);
      // Mode démo si l'API n'est pas disponible
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        // Simulation de connexion réussie pour le démo
        const demoUser = {
          id: 1,
          email: formData.email,
          name: 'Utilisateur Demo',
          role: 'USER'
        };
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('token', 'demo-token');
        toast.success('Mode démo - Connexion réussie ! 🎉');
        navigate('/');
      } else {
        toast.error(error.response?.data?.message || 'Email ou mot de passe incorrect');
      }
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

      <div className="max-w-md w-full relative z-10 animate-fadeInScale">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-brand-primary rounded-full mb-6 shadow-brand">
            <Sparkles className="w-10 h-10 text-brand-black" />
          </div>
          <h2 className="text-4xl font-bold text-gradient-brand mb-2">Connexion</h2>
          <p className="text-gray-600 text-lg">Accédez à votre compte</p>
        </div>

        <div className="card-brand shadow-brand-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-brand-black mb-3">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-cyan" />
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

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-bold text-brand-black mb-3">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-pink" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
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
            </div>

            {/* Mot de passe oublié */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-brand-yellow rounded focus:ring-brand-yellow"
                />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-brand-cyan hover:text-brand-pink font-semibold transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full btn-primary shine text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-black border-t-transparent"></div>
                  Connexion en cours...
                </span>
              ) : (
                'Se connecter'
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

          {/* Lien inscription */}
          <div className="text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="text-brand-pink hover:text-brand-magenta font-bold transition-colors"
              >
                Inscrivez-vous gratuitement
              </Link>
            </p>
          </div>
        </div>

        {/* Info de test */}
        <div className="mt-6 p-4 bg-brand-cyan-light rounded-xl border-2 border-brand-cyan/30">
          <p className="text-sm text-brand-cyan font-semibold text-center">
            💡 Compte de test : koffi@abidjan.ci / 123456
          </p>
        </div>
      </div>
    </div>
  );
}