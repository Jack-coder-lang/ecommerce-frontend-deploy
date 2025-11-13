// PaymentSuccess.jsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CinetPayService from '../services/CinetPayService';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const tid = searchParams.get('tid');

  useEffect(() => {
    if (tid) {
      CinetPayService.checkPaymentStatus(tid).then(res => {
        if (res.paid) {
          // Marque la commande comme payée dans ton backend
          fetch('/api/orders/confirm', {
            method: 'POST',
            body: JSON.stringify({ transactionId: tid }),
            headers: { 'Content-Type': 'application/json' },
          });
        }
      });
    }
  }, [tid]);

  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-green-600">Paiement réussi !</h1>
      <p>Transaction: {tid}</p>
    </div>
  );
}