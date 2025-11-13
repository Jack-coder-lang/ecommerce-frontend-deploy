// frontend/src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';
import { useSocket } from '../hooks/useSocket';
import { ShoppingCart, User, LogOut, Package, Bell, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import logo from '../assets/logo.png';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const navigate = useNavigate();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // En production Vercel, pas de Socket.IO, donc utiliser isAuthenticated
  const isConnected = socket?.connected || isAuthenticated;

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleNotificationUpdate = () => {
      fetchUnreadCount();
    };

    window.addEventListener('notification-update', handleNotificationUpdate);
    return () => {
      window.removeEventListener('notification-update', handleNotificationUpdate);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Erreur compteur notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md border-b-4 border-brand-yellow sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src={logo}  
              alt="Logo"  
              className="h-24 mt-8 ml-14 w-auto object-contain"
            />
          </Link>

          {/* NAVIGATION DESKTOP */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-brand-cyan font-semibold text-lg transition-colors relative group"
            >
              Accueil
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-cyan transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-brand-pink font-semibold text-lg transition-colors relative group"
            >
              Produits
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-pink transition-all group-hover:w-full"></span>
            </Link>
            {isAuthenticated && user?.role === 'SELLER' && (
              <Link 
                to="/seller/dashboard" 
                className="text-gray-700 hover:text-brand-gold font-semibold text-lg transition-colors relative group"
              >
                Dashboard Vendeur
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold transition-all group-hover:w-full"></span>
              </Link>
            )}
          </nav>

          {/* ACTIONS DESKTOP */}
          <div className="hidden md:flex items-center space-x-3">
            {/* INDICATEUR SOCKET.IO */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-brand-yellow-light rounded-full border border-brand-yellow/30">
                <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-brand-green animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-semibold text-brand-black">
                  {isConnected ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            )}

            {isAuthenticated ? (
              <>
                {/* NOTIFICATIONS */}
                <Link
                  to="/notifications"
                  className="relative p-2.5 text-gray-700 hover:text-brand-pink hover:bg-brand-pink-light rounded-lg transition-all group"
                  title="Notifications"
                >
                  <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* PANIER */}
                <Link
                  to="/cart"
                  className="relative p-2.5 text-gray-700 hover:text-brand-cyan hover:bg-brand-cyan-light rounded-lg transition-all group"
                  title="Panier"
                >
                  <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-brand">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* COMMANDES */}
                <Link
                  to="/orders"
                  className="p-2.5 text-gray-700 hover:text-brand-green hover:bg-brand-green-light rounded-lg transition-all group"
                  title="Commandes"
                >
                  <Package className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </Link>

                {/* PROFIL */}
                <Link
                  to="/profile"
                  className="p-2.5 text-gray-700 hover:text-brand-yellow hover:bg-brand-yellow-light rounded-lg transition-all group"
                  title="Profil"
                >
                  <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </Link>

                {/* DÉCONNEXION */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-gray-700 hover:text-brand-pink hover:bg-brand-pink-light rounded-lg transition-all group"
                  title="Déconnexion"
                >
                  <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-brand-cyan font-semibold transition-colors px-4 py-2"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn-primary shine"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* MENU MOBILE BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-brand-yellow-light rounded-lg transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* MENU MOBILE */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 animate-slideInDown">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-gray-700 hover:bg-brand-yellow-light hover:text-brand-cyan rounded-lg font-semibold transition-all"
              >
                Accueil
              </Link>
              <Link 
                to="/products" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-gray-700 hover:bg-brand-yellow-light hover:text-brand-pink rounded-lg font-semibold transition-all"
              >
                Produits
              </Link>
              {isAuthenticated && user?.role === 'SELLER' && (
                <Link 
                  to="/seller/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-700 hover:bg-brand-yellow-light hover:text-brand-gold rounded-lg font-semibold transition-all"
                >
                  Dashboard Vendeur
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <hr className="my-2 border-brand-yellow/30" />
                  <Link 
                    to="/notifications" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-gray-700 hover:bg-brand-pink-light hover:text-brand-pink rounded-lg font-semibold transition-all flex items-center justify-between"
                  >
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-brand-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link 
                    to="/cart" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-gray-700 hover:bg-brand-cyan-light hover:text-brand-cyan rounded-lg font-semibold transition-all flex items-center justify-between"
                  >
                    <span>Panier</span>
                    {itemCount > 0 && (
                      <span className="bg-brand-gold text-brand-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                  <Link 
                    to="/orders" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-gray-700 hover:bg-brand-green-light hover:text-brand-green rounded-lg font-semibold transition-all"
                  >
                    Commandes
                  </Link>
                  <Link 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-gray-700 hover:bg-brand-yellow-light hover:text-brand-yellow rounded-lg font-semibold transition-all"
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 text-left text-brand-pink hover:bg-brand-pink-light rounded-lg font-semibold transition-all"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2 border-brand-yellow/30" />
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-gray-700 hover:bg-brand-cyan-light hover:text-brand-cyan rounded-lg font-semibold transition-all"
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="mx-4 btn-primary shine text-center"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}