// Dans CheckoutPage.jsx
import BiometricPayment from '../components/BiometricPayment';

// Ajouter dans le retour JSX
<BiometricPayment 
  amount={totalAmount}
  onSuccess={() => {
    toast.success('Paiement réussi !');
    // Rediriger vers confirmation
  }}
  onError={(error) => {
    toast.error(`Erreur de paiement: ${error}`);
  }}
/>