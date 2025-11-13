// frontend/src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Inscription réussie ! 🎉');
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-br from-[#212020] to-[#5a595a] text-gray-300 relative overflow-hidden">
      {/* Blobs décoratifs */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#e8cf3a] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#bd1762] rounded-full filter blur-3xl"></div>
      </div>

      {/* NEWSLETTER */}
      <div className="border-b border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-brand-yellow/20 px-4 py-2 rounded-full mb-3">
                <Sparkles className="w-5 h-5 text-brand-gold" />
                <span className="text-sm font-semibold text-brand-yellow">Offres Exclusives</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                Restez informé
              </h3>
              <p className="text-white/70 text-lg">
                Inscrivez-vous à notre newsletter et recevez nos meilleures offres
              </p>
            </div>
            <form onSubmit={handleSubmit} className="w-full md:w-auto">
              <div className="flex gap-2">
                <div className="relative flex-grow md:w-96">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="Votre email"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary shine flex items-center gap-2 px-8"
                >
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">S'inscrire</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* LIENS */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* À PROPOS */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={logo}  
                alt="Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              Votre marketplace de confiance en Côte d'Ivoire. Des produits de qualité, livrés rapidement.
            </p>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-brand-yellow hover:text-brand-black transition-all hover:scale-110 border border-white/20"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-brand-cyan hover:text-white transition-all hover:scale-110 border border-white/20"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-brand-pink hover:text-white transition-all hover:scale-110 border border-white/20"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* LIENS RAPIDES */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-yellow rounded-full"></span>
              Liens rapides
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-white/70 hover:text-brand-yellow transition-colors flex items-center gap-2 group"
                >
                  <span className="w-0 h-0.5 bg-brand-yellow transition-all group-hover:w-4"></span>
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="text-white/70 hover:text-brand-yellow transition-colors flex items-center gap-2 group"
                >
                  <span className="w-0 h-0.5 bg-brand-yellow transition-all group-hover:w-4"></span>
                  Produits
                </Link>
              </li>
              <li>
                <Link 
                  to="/cart" 
                  className="text-white/70 hover:text-brand-yellow transition-colors flex items-center gap-2 group"
                >
                  <span className="w-0 h-0.5 bg-brand-yellow transition-all group-hover:w-4"></span>
                  Panier
                </Link>
              </li>
              <li>
                <Link 
                  to="/orders" 
                  className="text-white/70 hover:text-brand-yellow transition-colors flex items-center gap-2 group"
                >
                  <span className="w-0 h-0.5 bg-brand-yellow transition-all group-hover:w-4"></span>
                  Mes commandes
                </Link>
              </li>
            </ul>
          </div>

          {/* VENDEURS */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-pink rounded-full"></span>
              Pour les vendeurs
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/seller/dashboard" 
                  className="text-white/70 hover:text-brand-pink transition-colors flex items-center gap-2 group"
                >
                  <span className="w-0 h-0.5 bg-brand-pink transition-all group-hover:w-4"></span>
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link 
                  to="/seller/products" 
                  className="text-white/70 hover:text-brand-pink transition-colors flex items-center gap-2 group"
                >
                  <span className="w-0 h-0.5 bg-brand-pink transition-all group-hover:w-4"></span>
                  Mes produits
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-white/70 hover:text-brand-pink transition-colors flex items-center gap-2 group"
                >
                  <span className="w-0 h-0.5 bg-brand-pink transition-all group-hover:w-4"></span>
                  Devenir vendeur
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-cyan rounded-full"></span>
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-white/70 hover:text-brand-cyan transition-colors">
                <MapPin className="w-5 h-5 text-brand-cyan mt-1 flex-shrink-0" />
                <span>Cocody, Abidjan<br />Côte d'Ivoire</span>
              </li>
              <li className="flex items-center space-x-3 text-white/70 hover:text-brand-cyan transition-colors">
                <Phone className="w-5 h-5 text-brand-cyan flex-shrink-0" />
                <span>+225 07 77 12 34 56</span>
              </li>
              <li className="flex items-center space-x-3 text-white/70 hover:text-brand-cyan transition-colors">
                <Mail className="w-5 h-5 text-brand-cyan flex-shrink-0" />
                <span>contact@clam's.ci</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50 text-center md:text-left">
              © {new Date().getFullYear()} <span className="text-brand-yellow font-semibold">Charm's-ci</span>. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <Link to="/privacy" className="hover:text-brand-yellow transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="hover:text-brand-yellow transition-colors">
                Conditions
              </Link>
              <Link to="/help" className="hover:text-brand-yellow transition-colors">
                Aide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}