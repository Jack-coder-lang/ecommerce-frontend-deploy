// PaymentSuccess.jsx - Page de retour après paiement CinetPay
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import { useCartStore } from '../store';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader, Package, ArrowRight, Home } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const checkPayment = async () => {
      // Récupérer les paramètres de retour CinetPay
      const transactionId = searchParams.get('transaction_id') || searchParams.get('tid');
      const storedOrderId = localStorage.getItem('pendingOrderId');
      const storedTransactionId = localStorage.getItem('pendingTransactionId');

      if (!transactionId && !storedTransactionId) {
        setStatus('failed');
        toast.error('Transaction introuvable');
        setTimeout(() => navigate('/orders'), 3000);
        return;
      }

      const txId = transactionId || storedTransactionId;

      try {
        // Vérifier le statut du paiement
        const response = await paymentAPI.checkCinetPayStatus(txId);

        if (response.data.success && response.data.data.status === 'ACCEPTED') {
          setStatus('success');
          setPaymentInfo(response.data.data);
          setOrderId(storedOrderId);

          // Nettoyer le localStorage et le panier
          localStorage.removeItem('pendingOrderId');
          localStorage.removeItem('pendingTransactionId');
          clearCart();

          toast.success('Paiement réussi !');

          // Rediriger vers la commande après 3 secondes
          setTimeout(() => {
            if (storedOrderId) {
              navigate(`/orders/${storedOrderId}`);
            } else {
              navigate('/orders');
            }
          }, 3000);
        } else {
          setStatus('failed');
          toast.error('Paiement échoué ou en attente');
          setTimeout(() => navigate('/orders'), 3000);
        }
      } catch (error) {
        console.error('Erreur vérification paiement:', error);
        setStatus('failed');
        toast.error('Erreur lors de la vérification du paiement');
        setTimeout(() => navigate('/orders'), 3000);
      }
    };

    checkPayment();
  }, [searchParams, navigate, clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* LOADING STATE */}
        {status === 'loading' && (
          <div className="card-brand text-center animate-fadeIn">
            <div className="w-20 h-20 mx-auto mb-6 gradient-brand-primary rounded-full flex items-center justify-center">
              <Loader className="w-10 h-10 text-brand-black animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Vérification du paiement</h1>
            <p className="text-gray-600">Veuillez patienter...</p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="card-brand text-center animate-fadeIn">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement réussi !</h1>
            <p className="text-gray-600 mb-6">Votre paiement a été confirmé avec succès</p>

            {paymentInfo && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-gray-900">{paymentInfo.transaction_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-semibold text-brand-yellow">{paymentInfo.amount || 'N/A'} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Méthode:</span>
                    <span className="font-medium text-gray-900">{paymentInfo.payment_method || 'Mobile Money'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => orderId ? navigate(`/orders/${orderId}`) : navigate('/orders')}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                <span>Voir ma commande</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:shadow-md hover:border-gray-400 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                <span>Retour à l'accueil</span>
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">Redirection automatique dans 3 secondes...</p>
          </div>
        )}

        {/* FAILED STATE */}
        {status === 'failed' && (
          <div className="card-brand text-center animate-fadeIn">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement échoué</h1>
            <p className="text-gray-600 mb-6">Le paiement n'a pas pu être validé. Veuillez réessayer.</p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                <span>Voir mes commandes</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:shadow-md hover:border-gray-400 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                <span>Retour à l'accueil</span>
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">Redirection automatique dans 3 secondes...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .card-brand {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .gradient-brand-primary {
          background: linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%);
        }

        .btn-primary {
          background: linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 201, 255, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 201, 255, 0.4);
        }

        .text-brand-yellow {
          color: #FFD700;
        }

        .text-brand-black {
          color: #1A1A1A;
        }

        .text-brand-cyan {
          color: #00C9FF;
        }

        .bg-brand-cyan {
          background-color: #00C9FF;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}