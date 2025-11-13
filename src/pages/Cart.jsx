// frontend/src/pages/Cart.jsx
// VERSION AVEC COULEURS DE LA MARQUE INTÉGRÉES
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles,
  Truck, Shield, Gift, CheckCircle, Home, Package,
  CreditCard, Heart, ChevronRight, RotateCcw
} from 'lucide-react';

export default function Cart() {
  const { cart, total, loading, fetchCart, updateCartItem, removeFromCart, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [removingItems, setRemovingItems] = useState(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const handleUpdateQuantity = async (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, newQuantity);
      toast.success('Quantité mise à jour', { icon: '🔄' });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemove = async (itemId) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
      toast.success('Article retiré du panier', { icon: '🗑️' });
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vider votre panier ?')) return;
    
    try {
      await clearCart();
      toast.success('Panier vidé', { icon: '🧹' });
    } catch (error) {
      toast.error('Erreur lors du vidage du panier');
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center animate-fadeInScale">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#e8cf3a] border-t-transparent mx-auto"></div>
            <ShoppingBag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-brand-yellow animate-pulse" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Chargement de votre panier...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center animate-fadeInScale max-w-md mx-auto px-4">
          <div className="w-32 h-32 gradient-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-brand-black" />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 text-lg mb-8">
            Explorez nos collections et découvrez des produits exceptionnels
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/')} 
              className="btn-primary shine group"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Découvrir les produits
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <Link
              to="/products"
              className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:shadow-md hover:border-gray-400 transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Voir le catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* FIL D'ARIANE */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8 animate-slideInUp">
          <Link to="/" className="flex items-center gap-1 hover:text-brand-cyan transition-colors">
            <Home className="w-4 h-4" />
            Accueil
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Mon panier</span>
        </nav>

        {/* EN-TÊTE */}
        <section className="mb-8 animate-slideInUp">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-yellow-light px-4 py-2 rounded-full mb-4">
                <ShoppingBag className="w-5 h-5 text-brand-yellow" />
                <span className="text-sm font-semibold text-brand-yellow">Vos achats</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Mon <span className="text-gradient-brand">Panier</span>
              </h1>
              <p className="text-gray-600 text-lg">
                {cart.items.length} article{cart.items.length > 1 ? 's' : ''} • Total: {total.toLocaleString()} F
              </p>
            </div>

            <button
              onClick={handleClearCart}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:shadow-md hover:border-brand-pink hover:text-brand-pink transition-all flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Vider le panier
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* LISTE DES ARTICLES */}
          <div className="xl:col-span-3 space-y-6">
            {cart.items.map((item, index) => (
              <div 
                key={item.id} 
                className="card-brand card-hover group animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Image */}
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Badge stock */}
                    {item.product.stock < 10 && item.product.stock > 0 && (
                      <div className="absolute -top-2 -left-2 bg-brand-yellow text-brand-black text-xs font-bold px-2 py-1 rounded-full shadow-brand">
                        {item.product.stock} restant{item.product.stock > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Informations produit */}
                  <div className="flex-grow">
                    <Link 
                      to={`/products/${item.product.id}`}
                      className="block mb-2 group-hover:text-brand-cyan transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 mb-3 flex items-center gap-1">
                      <span>Vendeur:</span>
                      <span className="font-medium">
                        {item.product.seller.firstName} {item.product.seller.lastName}
                      </span>
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Contrôle de quantité */}
                        <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingItems.has(item.id) ? (
                              <div className="animate-spin rounded-full w-4 h-4 border-2 border-gray-600 border-t-transparent"></div>
                            ) : (
                              <Minus className="w-4 h-4 text-gray-700" />
                            )}
                          </button>
                          
                          <span className="w-8 text-center font-bold text-gray-900 text-lg">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            disabled={item.quantity >= item.product.stock || updatingItems.has(item.id)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingItems.has(item.id) ? (
                              <div className="animate-spin rounded-full w-4 h-4 border-2 border-gray-600 border-t-transparent"></div>
                            ) : (
                              <Plus className="w-4 h-4 text-gray-700" />
                            )}
                          </button>
                        </div>

                        {/* Prix unitaire */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-brand-yellow">
                            {item.product.price.toLocaleString()} F
                          </p>
                          <p className="text-sm text-gray-600">unitaire</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Prix total */}
                        <div className="text-right mr-4">
                          <p className="text-2xl font-bold text-gray-900">
                            {(item.product.price * item.quantity).toLocaleString()} F
                          </p>
                          <p className="text-sm text-gray-600">total</p>
                        </div>

                        {/* Bouton supprimer */}
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={removingItems.has(item.id)}
                          className="p-3 text-gray-600 hover:bg-brand-pink-light hover:text-brand-pink rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group/delete"
                        >
                          {removingItems.has(item.id) ? (
                            <div className="animate-spin rounded-full w-5 h-5 border-2 border-brand-pink border-t-transparent"></div>
                          ) : (
                            <Trash2 className="w-5 h-5 group-hover/delete:scale-110 transition-transform" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RÉSUMÉ & ACTIONS */}
          <div className="xl:col-span-1 space-y-6">
            {/* RÉSUMÉ DE LA COMMANDE */}
            <section className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <div className="card-brand sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 gradient-brand-primary rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-brand-black" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Résumé</h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-semibold text-gray-900">{total.toLocaleString()} F</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-semibold text-brand-green flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Gratuite
                    </span>
                  </div>

                  <hr className="border-gray-300" />

                  <div className="flex justify-between items-center py-2">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold text-brand-yellow">{total.toLocaleString()} F</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary shine text-lg py-4 group"
                >
                  <span>Passer la commande</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-center text-gray-600 mt-4 text-sm flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Paiement 100% sécurisé
                </p>
              </div>
            </section>

            {/* GARANTIES */}
            <section className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
              <div className="card-brand">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-green" />
                  Nos garanties
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-green" />
                    <span className="text-sm text-gray-700">Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-brand-cyan" />
                    <span className="text-sm text-gray-700">Livraison gratuite</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-5 h-5 text-brand-yellow" />
                    <span className="text-sm text-gray-700">Retour gratuit sous 30 jours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-brand-pink" />
                    <span className="text-sm text-gray-700">Support client 24h/24</span>
                  </div>
                </div>
              </div>
            </section>

            {/* CONTINUER LES ACHATS */}
            <section className="animate-fadeIn" style={{ animationDelay: '400ms' }}>
              <div className="card-brand text-center">
                <h3 className="font-bold text-gray-900 mb-3">Continuer vos achats</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Découvrez plus de produits exceptionnels
                </p>
                <Link
                  to="/products"
                  className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:shadow-md hover:border-brand-cyan hover:text-brand-cyan transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Explorer le catalogue
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}