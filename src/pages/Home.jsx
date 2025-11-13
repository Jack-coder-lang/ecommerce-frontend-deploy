// frontend/src/pages/Home.jsx
// VERSION MOBILE RESPONSIVE AVEC COULEURS DE LA MARQUE INTÉGRÉES
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCartStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../constants/colors';
import {
  ShoppingCart, Star, Package, TrendingUp, Zap, Award, Heart,
  ArrowRight, Sparkles, Gift, Truck, Shield, Clock, Users, 
  ChevronRight, CheckCircle, Tag, MessageCircle, Play
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set(JSON.parse(localStorage.getItem('favorites') || '[]')));

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      const products = response.data.products || [];

      // Produits en vedette (avec stock et bien notés)
      const featured = products
        .filter(p => p.stock > 0 && (p.averageRating || 0) >= 4)
        .slice(0, 8);
      setFeaturedProducts(featured);

      // Nouveaux produits (les plus récents)
      const newest = [...products]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);
      setNewProducts(newest);

      // Produits les mieux notés
      const topRated = [...products]
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, 4);
      setTopRatedProducts(topRated);

    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, productName) => {
    try {
      await addToCart(productId, 1);
      toast.success(`${productName} ajouté au panier`, { icon: '🛒' });
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
      toast.success('Retiré des favoris', { icon: '💔' });
    } else {
      newFavorites.add(productId);
      toast.success('Ajouté aux favoris', { icon: '❤️' });
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center safe-top safe-bottom">
        <div className="text-center animate-fadeInScale">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-4 border-[#e8cf3a] border-t-transparent mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 text-brand-yellow animate-pulse" />
          </div>
          <p className="text-lg md:text-xl font-semibold text-gray-700">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* HERO SECTION AVEC COULEURS DE MARQUE - RESPONSIVE */}
      <section className="gradient-brand-rainbow relative overflow-hidden">
        {/* Blobs animés avec couleurs de marque */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 md:w-96 md:h-96 bg-[#e8cf3a] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 md:w-96 md:h-96 bg-[#bd1762] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 md:w-96 md:h-96 bg-[#1aa2af] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-16 md:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Texte */}
            <div className="text-white animate-slideInUp text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 md:mb-6">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
                <span className="text-xs md:text-sm font-semibold">Nouveauté 2025</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
                Découvrez notre
                <span className="block text-gradient-brand">Collection Exclusive</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed">
                Des produits de qualité exceptionnelle, sélectionnés avec soin pour vous offrir le meilleur.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/products')}
                  className="btn-primary shine group min-h-[50px] text-sm md:text-base"
                >
                  <span>Découvrir</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 inline ml-2 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="px-6 py-3 md:px-8 md:py-4 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-all border-2 border-white/30 hover:border-white/50 text-sm md:text-base min-h-[50px]">
                  <Play className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
                  Voir la vidéo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{featuredProducts.length}+</div>
                  <div className="text-xs md:text-sm text-white/80">Produits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">5000+</div>
                  <div className="text-xs md:text-sm text-white/80">Clients satisfaits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">4.9</div>
                  <div className="text-xs md:text-sm text-white/80">Note moyenne</div>
                </div>
              </div>
            </div>

            {/* Image / Produit vedette */}
            <div className="relative animate-fadeIn animation-delay-300 mt-8 lg:mt-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e8cf3a]/20 to-[#bd1762]/20 rounded-2xl md:rounded-3xl blur-3xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop"
                  alt="Produit vedette"
                  className="relative rounded-2xl md:rounded-3xl shadow-2xl w-full"
                />
                
                {/* Badge flottant */}
                <div className="absolute top-4 right-4 md:top-6 md:right-6 glass-brand p-3 md:p-4 rounded-xl md:rounded-2xl shadow-brand">
                  <div className="flex items-center gap-2 text-white">
                    <Zap className="w-4 h-4 md:w-6 md:h-6 text-brand-gold" />
                    <div>
                      <div className="text-lg md:text-2xl font-bold">-30%</div>
                      <div className="text-xs">Offre limitée</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* AVANTAGES - AVEC COULEURS DE MARQUE - RESPONSIVE */}
      <section className="py-12 md:py-16 bg-white safe-top">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[
              { icon: Truck, title: 'Livraison Rapide', desc: 'Expédition sous 24h', color: 'cyan' },
              { icon: Shield, title: 'Paiement Sécurisé', desc: '100% protégé', color: 'green' },
              { icon: Gift, title: 'Offres Exclusives', desc: 'Réductions régulières', color: 'pink' },
              { icon: Users, title: 'Support 24/7', desc: 'Toujours à votre écoute', color: 'yellow' },
            ].map((item, index) => (
              <div
                key={index}
                className="card-brand card-hover text-center group animate-fadeIn p-4 md:p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl gradient-brand-primary flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 md:w-8 md:h-8 text-brand-black" />
                </div>
                <h3 className="font-bold text-sm md:text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-xs md:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATÉGORIES - AVEC COULEURS DE MARQUE - RESPONSIVE */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12 animate-slideInUp">
            <div className="inline-flex items-center gap-2 bg-brand-yellow-light px-3 py-1 md:px-4 md:py-2 rounded-full mb-3 md:mb-4">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
              <span className="text-xs md:text-sm font-semibold text-brand-black">Nos Collections</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              Explorez par <span className="text-gradient-brand">Catégorie</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
              Trouvez exactement ce que vous cherchez dans nos collections soigneusement organisées
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {CATEGORIES.map((cat, index) => (
              <button
                key={cat.value}
                onClick={() => navigate(`/products?cat=${cat.value}`)}
                className={`card-brand card-hover text-center group relative overflow-hidden animate-fadeIn p-4 md:p-6`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative z-10">
                  <div className="text-4xl md:text-6xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-sm md:text-lg text-gray-900 mb-2 group-hover:text-brand-cyan transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">{cat.desc}</p>
                  
                  <div className="inline-flex items-center gap-1 text-brand-cyan font-medium text-xs md:text-sm">
                    <span>Explorer</span>
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUITS EN VEDETTE - AVEC COULEURS DE MARQUE - RESPONSIVE */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12 animate-slideInUp">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-pink-light px-3 py-1 md:px-4 md:py-2 rounded-full mb-3 md:mb-4">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-brand-pink" />
                <span className="text-xs md:text-sm font-semibold text-brand-pink">Sélection Premium</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Produits <span className="text-gradient-brand">en Vedette</span>
              </h2>
            </div>

            <Link
              to="/products"
              className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 gradient-brand-primary text-brand-black rounded-lg font-semibold hover:shadow-brand transition-all group text-sm md:text-base"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={toggleFavorite}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BANNIÈRE PROMOTIONNELLE - AVEC COULEURS DE MARQUE - RESPONSIVE */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-[#212020] to-[#5a595a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-[#e8cf3a] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 md:w-72 md:h-72 bg-[#bd1762] rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-white animate-slideInUp text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-brand-yellow/20 px-3 py-1 md:px-4 md:py-2 rounded-full mb-4 md:mb-6">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
                <span className="text-xs md:text-sm font-semibold">Offre Spéciale</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
                Jusqu'à <span className="text-brand-gold">50% de réduction</span>
              </h2>

              <p className="text-lg md:text-xl text-white/80 mb-6 md:mb-8">
                Profitez de nos offres exceptionnelles sur une sélection de produits. Offre limitée dans le temps !
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 md:px-6 md:py-3">
                    <div className="text-2xl md:text-3xl font-bold">23</div>
                    <div className="text-xs text-white/60">Heures</div>
                  </div>
                </div>
                <div className="text-xl md:text-2xl text-brand-gold">:</div>
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 md:px-6 md:py-3">
                    <div className="text-2xl md:text-3xl font-bold">45</div>
                    <div className="text-xs text-white/60">Minutes</div>
                  </div>
                </div>
                <div className="text-xl md:text-2xl text-brand-gold">:</div>
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 md:px-6 md:py-3">
                    <div className="text-2xl md:text-3xl font-bold">12</div>
                    <div className="text-xs text-white/60">Secondes</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/products')}
                className="btn-primary shine text-sm md:text-base min-h-[50px]"
              >
                Profiter de l'offre
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 inline ml-2" />
              </button>
            </div>

            <div className="relative animate-fadeIn animation-delay-300 mt-8 lg:mt-0">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop"
                alt="Promotion"
                className="rounded-2xl md:rounded-3xl shadow-2xl w-full"
              />
              
              <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 glass-brand p-4 md:p-6 rounded-xl md:rounded-2xl shadow-brand-lg">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 gradient-brand-primary rounded-full flex items-center justify-center">
                    <Gift className="w-6 h-6 md:w-8 md:h-8 text-brand-black" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-white">-50%</div>
                    <div className="text-xs md:text-sm text-white/80">Sur tous les articles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOUVEAUX PRODUITS - AVEC COULEURS DE MARQUE - RESPONSIVE */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12 animate-slideInUp">
            <div className="inline-flex items-center gap-2 bg-brand-cyan-light px-3 py-1 md:px-4 md:py-2 rounded-full mb-3 md:mb-4">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-brand-cyan" />
              <span className="text-xs md:text-sm font-semibold text-brand-cyan">Nouveautés</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Derniers <span className="text-gradient-brand">Arrivages</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-4">
              Découvrez nos tout nouveaux produits, fraîchement ajoutés à notre collection
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {newProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={toggleFavorite}
                index={index}
                isNew
              />
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES - AVEC COULEURS DE MARQUE - RESPONSIVE */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12 animate-slideInUp">
            <div className="inline-flex items-center gap-2 bg-brand-green-light px-3 py-1 md:px-4 md:py-2 rounded-full mb-3 md:mb-4">
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-brand-green" />
              <span className="text-xs md:text-sm font-semibold text-brand-green">Témoignages</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Ce que disent nos <span className="text-gradient-brand">Clients</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: 'Marie Kouassi',
                role: 'Cliente fidèle',
                avatar: 'https://i.pravatar.cc/150?img=1',
                rating: 5,
                text: 'Excellent service ! Produits de qualité et livraison rapide. Je recommande vivement !',
              },
              {
                name: 'Jean-Pierre Yao',
                role: 'Acheteur régulier',
                avatar: 'https://i.pravatar.cc/150?img=2',
                rating: 5,
                text: 'Une très belle découverte. Les prix sont compétitifs et le service client est au top.',
              },
              {
                name: 'Aminata Diallo',
                role: 'Nouvelle cliente',
                avatar: 'https://i.pravatar.cc/150?img=3',
                rating: 5,
                text: 'Je suis ravie de mes achats. Le site est facile à utiliser et les produits correspondent exactement à la description.',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="card-brand card-hover animate-fadeIn p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-brand-gold fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed italic text-sm md:text-base">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm md:text-base">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER - AVEC COULEURS DE MARQUE - RESPONSIVE */}
      <section className="py-12 md:py-20 gradient-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-slideInUp">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 md:mb-6">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-brand-black" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-black mb-3 md:mb-4">
              Restez Informé !
            </h2>

            <p className="text-lg md:text-xl text-brand-black/80 mb-6 md:mb-8">
              Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives et les dernières nouveautés
            </p>

            <form className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 md:px-6 md:py-4 rounded-xl border-2 border-brand-black/20 focus:border-brand-black focus:outline-none text-base md:text-lg"
              />
              <button
                type="submit"
                className="px-6 py-3 md:px-8 md:py-4 bg-brand-black text-white rounded-xl font-semibold hover:bg-brand-gray transition-all shadow-lg hover:shadow-xl text-sm md:text-base min-h-[50px]"
              >
                S'inscrire
              </button>
            </form>

            <p className="text-xs md:text-sm text-brand-black/60 mt-3 md:mt-4">
              🔒 Vos données sont protégées et ne seront jamais partagées
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Composant ProductCard avec couleurs de marque - RESPONSIVE
function ProductCard({ product, onAddToCart, isFavorite, onToggleFavorite, index, isNew }) {
  return (
    <div
      className="card-brand card-hover group animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-square bg-gray-100 rounded-t-xl overflow-hidden mb-3 md:mb-4">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1 md:gap-2">
          {isNew && (
            <span className="badge-primary shadow-brand text-xs">
              <Sparkles className="w-2 h-2 md:w-3 md:h-3 inline mr-1" />
              Nouveau
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge-danger shadow-brand-pink text-xs">Rupture</span>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <span className="bg-brand-yellow text-brand-black text-xs font-bold px-2 py-1 rounded-full shadow-brand">
              {product.stock} restants
            </span>
          )}
        </div>

        {/* Actions - Toujours visibles sur mobile */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleFavorite(product.id)}
            className={`p-1.5 md:p-2 rounded-full shadow-brand backdrop-blur-sm transition-all hover:scale-110 ${
              isFavorite
                ? 'bg-brand-pink text-white'
                : 'glass-brand hover:bg-brand-pink-light'
            }`}
          >
            <Heart className={`w-3 h-3 md:w-4 md:h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <Link
            to={`/products/${product.id}`}
            className="p-1.5 md:p-2 glass-brand rounded-full shadow-brand hover:bg-brand-cyan-light hover:scale-110 transition-all"
          >
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Link>
        </div>
      </div>

      <div className="px-2 md:px-3 pb-3 md:pb-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-sm md:text-base text-gray-900 hover:text-brand-cyan transition-colors line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Note */}
        <div className="flex items-center gap-1 mb-2 md:mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-2 h-2 md:w-3 md:h-3 ${
                i < Math.floor(product.averageRating || 0)
                  ? 'text-brand-gold fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-1 text-xs text-gray-600">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Prix */}
        <div className="mb-2 md:mb-3">
          <p className="text-lg md:text-2xl font-bold text-brand-yellow">
            {product.price.toLocaleString()} F
          </p>
          {product.shippingFee === 0 && (
            <p className="text-xs text-brand-green flex items-center gap-1 mt-1">
              <CheckCircle className="w-2 h-2 md:w-3 md:h-3" />
              Livraison gratuite
            </p>
          )}
        </div>

        {/* Bouton */}
        <button
          onClick={() => onAddToCart(product.id, product.name)}
          disabled={product.stock === 0}
          className={`w-full btn-primary text-xs md:text-sm py-2 md:py-3 min-h-[40px] ${
            product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'shine'
          }`}
        >
          <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2" />
          {product.stock === 0 ? 'Rupture' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}