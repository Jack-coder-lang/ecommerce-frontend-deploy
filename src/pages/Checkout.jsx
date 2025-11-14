// frontend/src/pages/Checkout.jsx
// VERSION AVEC COULEURS DE LA MARQUE INTÉGRÉES
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import { ordersAPI, paymentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  MapPin, CreditCard, Package, ArrowLeft, Shield, Truck,
  User, Mail, Phone, Navigation, Home, ShoppingBag,
  Sparkles, CheckCircle, Lock, Gift, ChevronRight
} from 'lucide-react';

export default function Checkout() {
  const { cart, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const retryAttemptedRef = useRef(false); // Track if we've already retried

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: 'Abidjan',
    commune: '',
    instructions: '',
    paymentMethod: 'CASH',
  });

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset retry flag on new user-initiated submit
    if (!loading) {
      retryAttemptedRef.current = false;
    }

    setLoading(true);

    try {
      // Validation côté client
      if (!cart || !cart.items || cart.items.length === 0) {
        toast.error('Votre panier est vide');
        navigate('/cart');
        return;
      }

      // Vérifier que tous les produits ont un ID valide
      const invalidItems = cart.items.filter(item => !item.product?.id);
      if (invalidItems.length > 0) {
        toast.error('Certains produits dans votre panier sont invalides');
        console.error('Produits invalides:', invalidItems);
        return;
      }

      const shippingAddress = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        commune: formData.commune,
        instructions: formData.instructions.trim(),
      };

      const orderData = {
        shippingAddress,
        paymentMethod: formData.paymentMethod,
        items: cart.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price, // Ajouter le prix pour éviter les erreurs backend
        })),
      };

      console.log('📦 Données de commande envoyées:', orderData);

      // Créer la commande
      const response = await ordersAPI.create(orderData);
      const order = response.data.order;

      console.log('✅ Commande créée avec succès:', order);

      // Si paiement par CinetPay (MOBILE_MONEY ou CARD)
      if (formData.paymentMethod === 'MOBILE_MONEY' || formData.paymentMethod === 'CARD') {
        try {
          toast.loading('Initialisation du paiement...', { id: 'payment-init' });

          // Initialiser le paiement CinetPay
          const paymentResponse = await paymentAPI.initializeCinetPay({
            orderId: order.id,
            amount: Math.round(order.total), // Arrondir au franc près
            currency: 'XOF',
            channels: formData.paymentMethod === 'CARD' ? 'CREDIT_CARD' : 'MOBILE_MONEY',
            customer: {
              name: formData.lastName,
              surname: formData.firstName,
              email: formData.email,
              phone: formData.phone || '+225000000000',
              address: formData.address || 'Abidjan',
              city: formData.city || 'Abidjan',
              country: 'CI',
              state: 'CI',
              zipCode: '00225'
            }
          });

          toast.dismiss('payment-init');

          if (paymentResponse.data.success) {
            // Sauvegarder les IDs pour vérification au retour
            localStorage.setItem('pendingOrderId', order.id);
            localStorage.setItem('pendingTransactionId', paymentResponse.data.data.transaction_id);

            toast.success('Redirection vers le paiement...');

            // Redirection vers la page de paiement CinetPay
            setTimeout(() => {
              window.location.href = paymentResponse.data.data.payment_url;
            }, 500);
          } else {
            toast.error('Erreur lors de l\'initialisation du paiement');
            navigate(`/orders/${order.id}`);
          }
        } catch (paymentError) {
          toast.dismiss('payment-init');
          console.error('Erreur paiement CinetPay:', paymentError);

          // Handle 404 - CinetPay endpoint not implemented
          if (paymentError.response?.status === 404) {
            toast.error(
              '⚠️ Le paiement en ligne CinetPay n\'est pas encore disponible. Votre commande a été créée avec le statut "En attente". Veuillez payer en espèces à la livraison.',
              { duration: 8000 }
            );
          } else {
            toast.error('Erreur lors de l\'initialisation du paiement. Commande créée en attente.');
          }

          navigate(`/orders/${order.id}`);
        }
      } else {
        // Paiement en espèces (CASH)
        toast.success('🎉 Commande créée avec succès !');
        clearCart();
        navigate(`/orders/${order.id}`);
      }

    } catch (error) {
      console.error('❌ Erreur checkout:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      // 🔥 CORRECTION : Meilleure gestion d'erreurs avec retry logic pour 500
      if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Erreur serveur interne';

        // Afficher plus de détails dans la console pour le débogage
        console.error('📋 Détails de l\'erreur 500:', {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          responseData: error.response?.data,
        });

        // Retry once if this is the first attempt
        if (!retryAttemptedRef.current) {
          retryAttemptedRef.current = true;
          console.log('🔄 Nouvelle tentative après erreur 500...');
          toast.loading('Nouvelle tentative...', { id: 'retry-500' });

          // Wait 1.5 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Retry the submit
          toast.dismiss('retry-500');
          return handleSubmit(e);
        }

        // If retry also failed, show error
        toast.error(`Erreur serveur: ${errorMsg}. Veuillez réessayer plus tard ou contacter le support.`, {
          duration: 6000,
        });

        // Reset retry flag for next attempt
        retryAttemptedRef.current = false;
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Données de commande invalides';
        toast.error(errorMsg);
      } else if (error.response?.status === 404) {
        toast.error('Service de commande non disponible. Veuillez contacter le support.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error('Serveur inaccessible. Vérifiez votre connexion internet.');
      } else {
        toast.error('Erreur inattendue lors de la commande. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const communes = [
    'Abobo', 'Adjamé', 'Attécoubé', 'Cocody', 'Koumassi',
    'Marcory', 'Plateau', 'Port-Bouët', 'Treichville', 'Yopougon',
    'Bingerville', 'Songon', 'Anyama'
  ];

  const getPaymentMethodIcon = (method) => {
    const icons = {
      CASH: CreditCard,
      MOBILE_MONEY: Phone,
      CARD: CreditCard,
    };
    return icons[method] || CreditCard;
  };

  const getPaymentMethodDescription = (method) => {
    const descriptions = {
      CASH: 'Payez en espèces lors de la réception de votre commande',
      MOBILE_MONEY: 'Orange Money, MTN Money, Moov Money via CinetPay',
      CARD: 'Paiement sécurisé par carte Visa ou Mastercard via CinetPay',
    };
    return descriptions[method] || '';
  };

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
          <Link to="/cart" className="flex items-center gap-1 hover:text-brand-cyan transition-colors">
            <ShoppingBag className="w-4 h-4" />
            Panier
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Checkout</span>
        </nav>

        {/* EN-TÊTE */}
        <section className="mb-8 animate-slideInUp">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-brand-cyan-light px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-brand-cyan" />
              <span className="text-sm font-semibold text-brand-cyan">Finalisation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Finaliser votre <span className="text-gradient-brand">Commande</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Complétez vos informations pour finaliser votre commande en toute sécurité
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORMULAIRE */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations de livraison */}
              <section className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
                <div className="card-brand">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 gradient-brand-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-brand-black" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Informations de livraison</h2>
                      <p className="text-gray-600">Où souhaitez-vous recevoir votre commande ?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Téléphone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          required
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
                          placeholder="+225 XX XX XX XX XX"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Adresse complète *
                    </label>
                    <div className="relative">
                      <Navigation className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
                        placeholder="Rue, quartier, numéro de villa..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Ville *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Abidjan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Commune *
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all appearance-none bg-white"
                        value={formData.commune}
                        onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                      >
                        <option value="">Sélectionner votre commune</option>
                        {communes.map(commune => (
                          <option key={commune} value={commune}>{commune}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Instructions de livraison
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all resize-none"
                      placeholder="Points de repère, code de portail, étage, instructions spéciales..."
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    />
                  </div>
                </div>
              </section>

              {/* Mode de paiement */}
              <section className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
                <div className="card-brand">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 gradient-brand-primary rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-brand-black" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Mode de paiement</h2>
                      <p className="text-gray-600">Choisissez comment vous souhaitez payer</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { value: 'CASH', label: 'Paiement à la livraison', icon: CreditCard },
                      { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: Phone },
                      { value: 'CARD', label: 'Carte bancaire', icon: CreditCard },
                    ].map((method) => {
                      const MethodIcon = method.icon;
                      return (
                        <label
                          key={method.value}
                          className={`flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all group ${
                            formData.paymentMethod === method.value
                              ? 'border-brand-cyan bg-brand-cyan-light/20 shadow-brand'
                              : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={formData.paymentMethod === method.value}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="mr-4 mt-1 transform scale-125"
                          />
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-xl ${
                              formData.paymentMethod === method.value
                                ? 'bg-brand-cyan text-white'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                            }`}>
                              <MethodIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-lg">{method.label}</p>
                              <p className="text-gray-600 mt-1">
                                {getPaymentMethodDescription(method.value)}
                              </p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Garanties de sécurité */}
                  <div className="mt-6 p-4 bg-brand-green-light rounded-xl">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-brand-green" />
                      <div>
                        <p className="font-semibold text-brand-green-dark">Paiement 100% sécurisé</p>
                        <p className="text-sm text-brand-green-dark/80">
                          Vos informations de paiement sont cryptées et protégées
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* BOUTON DE CONFIRMATION */}
              <section className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary shine text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        <span>Traitement de votre commande...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-6 h-6" />
                        <span>Confirmer la commande</span>
                        <span className="text-xl">•</span>
                        <span className="font-bold">{total.toLocaleString()} F</span>
                      </>
                    )}
                  </div>
                </button>

                <p className="text-center text-gray-600 mt-4 text-sm flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Vos données sont sécurisées et ne seront jamais partagées
                </p>
              </section>
            </form>
          </div>

          {/* RÉSUMÉ DE LA COMMANDE */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* RÉSUMÉ */}
              <section className="animate-fadeIn" style={{ animationDelay: '150ms' }}>
                <div className="card-brand">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 gradient-brand-primary rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-brand-black" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Récapitulatif</h2>
                  </div>

                  {/* Articles */}
                  <div className="space-y-4 mb-6">
                    {cart?.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-full h-full p-3 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Qté: {item.quantity}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-brand-yellow">
                            {(item.product.price * item.quantity).toLocaleString()} F
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Détails du prix */}
                  <div className="space-y-3">
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
                </div>
              </section>

              {/* GARANTIES */}
              <section className="animate-fadeIn" style={{ animationDelay: '250ms' }}>
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
                      <Package className="w-5 h-5 text-brand-yellow" />
                      <span className="text-sm text-gray-700">Retour gratuit sous 30 jours</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-brand-pink" />
                      <span className="text-sm text-gray-700">Support client 24h/24</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* BOUTON RETOUR */}
              <section className="animate-fadeIn" style={{ animationDelay: '350ms' }}>
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:shadow-md hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour au panier
                </button>
              </section>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ANIMATIONS ET STYLES PERSONNALISÉS */
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        
        .text-gradient-brand {
          background: linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .gradient-brand-primary {
          background: linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 201, 255, 0.3);
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 201, 255, 0.4);
        }
        
        .card-brand {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .shadow-brand {
          box-shadow: 0 8px 30px rgba(0, 201, 255, 0.15);
        }
        
        .shine {
          position: relative;
          overflow: hidden;
        }
        
        .shine::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transition: left 0.5s;
        }
        
        .shine:hover::before {
          left: 100%;
        }
        
        /* COULEURS DE LA MARQUE */
        .bg-brand-cyan-light {
          background-color: rgba(0, 201, 255, 0.1);
        }
        
        .text-brand-cyan {
          color: #00C9FF;
        }
        
        .text-brand-yellow {
          color: #FFD700;
        }
        
        .text-brand-green {
          color: #92FE9D;
        }
        
        .text-brand-pink {
          color: #FF6B9D;
        }
        
        .text-brand-black {
          color: #1A1A1A;
        }
        
        .bg-brand-green-light {
          background-color: rgba(146, 254, 157, 0.1);
        }
        
        .text-brand-green-dark {
          color: #00A86B;
        }
        
        /* ANIMATIONS CSS */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        /* RESPONSIVE */
        @media (max-width: 768px) {
          .card-brand {
            padding: 1.5rem;
            border-radius: 16px;
          }
          
          .text-4xl {
            font-size: 2rem;
          }
          
          .text-5xl {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
}