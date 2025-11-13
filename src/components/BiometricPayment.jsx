import { useState, useEffect } from 'react';
import { Fingerprint, CreditCard, Loader } from 'lucide-react';
import { paymentAPI } from '../api';
import toast from 'react-hot-toast';

export default function BiometricPayment({ amount, onSuccess, onError }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkBiometricSupport = () => {
      return (
        window.ApplePaySession || 
        window.PaymentRequest ||
        (window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable)
      );
    };
    
    setIsSupported(checkBiometricSupport());
  }, []);

  const handleApplePay = async () => {
    if (!window.ApplePaySession) {
      onError('Apple Pay non supporté sur cet appareil');
      return;
    }

    if (!window.ApplePaySession.canMakePayments()) {
      onError('Apple Pay non configuré');
      return;
    }

    setIsProcessing(true);
    
    try {
      const session = new ApplePaySession(3, {
        countryCode: 'FR',
        currencyCode: 'XOF',
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'Votre Commande',
          amount: (amount / 100).toString() // Conversion en unités
        }
      });

      session.onvalidatemerchant = async (event) => {
        try {
          const response = await paymentAPI.createApplePaySession({
            validationURL: event.validationURL,
            domain: window.location.hostname
          });
          session.completeMerchantValidation(response.data);
        } catch (error) {
          session.abort();
          onError('Erreur de validation merchant');
        }
      };

      session.onpaymentauthorized = async (event) => {
        try {
          const response = await paymentAPI.processApplePay({
            token: event.payment.token,
            amount: amount,
            orderDetails: {
              // Détails de la commande
            }
          });

          session.completePayment(ApplePaySession.STATUS_SUCCESS);
          onSuccess(response.data);
        } catch (error) {
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          onError('Erreur de traitement du paiement');
        }
      };

      session.oncancel = () => {
        setIsProcessing(false);
        toast.info('Paiement annulé');
      };

      session.begin();
    } catch (error) {
      console.error('Erreur Apple Pay:', error);
      onError('Erreur lors de l\'initialisation du paiement');
      setIsProcessing(false);
    }
  };

  const handleGooglePay = async () => {
    // Implémentation similaire pour Google Pay
    toast.info('Google Pay - Implémentation en cours');
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-gray-100 rounded-lg">
        <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Paiement biométrique non supporté sur cet appareil</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleApplePay}
        disabled={isProcessing}
        className="w-full bg-black text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Fingerprint className="w-5 h-5" />
        )}
        {isProcessing ? 'Traitement...' : 'Payer avec Apple Pay'}
      </button>

      <button
        onClick={handleGooglePay}
        disabled={isProcessing}
        className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Fingerprint className="w-5 h-5" />
        Payer avec Google Pay
      </button>
    </div>
  );
}