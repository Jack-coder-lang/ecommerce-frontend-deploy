# Guide d'intégration CinetPay - Frontend React

## ✅ Étape 1: API déjà configurée

Les méthodes CinetPay ont déjà été ajoutées dans `src/services/api.js`:
- `paymentAPI.initializeCinetPay(data)`
- `paymentAPI.checkCinetPayStatus(transactionId)`
- `paymentAPI.getPayments(params)`

## 📝 Étape 2: Modifier le Checkout

### Ajouter l'import en haut de `src/pages/Checkout.jsx`:

```javascript
import { paymentAPI } from '../services/api';
```

### Remplacer la fonction `handleSubmit` (ligne ~38):

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const shippingAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      commune: formData.commune,
      instructions: formData.instructions,
    };

    const orderData = {
      shippingAddress,
      paymentMethod: formData.paymentMethod,
      items: cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    // Créer la commande
    const response = await ordersAPI.create(orderData);
    const order = response.data.order;

    // Si paiement CinetPay (MOBILE_MONEY ou CARD)
    if (formData.paymentMethod === 'MOBILE_MONEY' || formData.paymentMethod === 'CARD') {
      try {
        const paymentResponse = await paymentAPI.initializeCinetPay({
          orderId: order.id,
          amount: Math.round(order.total),
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

        if (paymentResponse.data.success) {
          localStorage.setItem('pendingOrderId', order.id);
          localStorage.setItem('pendingTransactionId', paymentResponse.data.data.transaction_id);

          // Redirection vers CinetPay
          window.location.href = paymentResponse.data.data.payment_url;
        }
      } catch (paymentError) {
        console.error('Erreur CinetPay:', paymentError);
        toast.error('Erreur paiement. Commande en attente.');
        navigate(`/orders/${order.id}`);
      }
    } else {
      // Paiement en espèces
      toast.success('Commande créée avec succès !');
      clearCart();
      navigate(`/orders/${order.id}`);
    }

  } catch (error) {
    console.error('Erreur checkout:', error);
    toast.error('Erreur lors de la commande');
  } finally {
    setLoading(false);
  }
};
```

## 🎯 Résumé des modifications Checkout

**Ligne à modifier**: ~38 (fonction `handleSubmit`)

**Ce qui change**:
1. Après création de la commande, vérifier la méthode de paiement
2. Si MOBILE_MONEY ou CARD → Appeler `paymentAPI.initializeCinetPay()`
3. Sauvegarder orderId et transactionId dans localStorage
4. Rediriger vers `payment_url` de CinetPay
5. Si CASH → Comportement normal (navigation vers commande)

## 📱 Comportement utilisateur

1. Utilisateur remplit le formulaire checkout
2. Sélectionne "Mobile Money" ou "Carte bancaire"
3. Clique sur "Passer la commande"
4. → Commande créée dans votre système
5. → Redirection automatique vers CinetPay
6. → Utilisateur paie sur CinetPay
7. → CinetPay renvoie vers votre site
8. → Votre backend reçoit la notification
9. → Statut de commande mis à jour automatiquement

## ⚠️ Points importants

1. **Montant**: Doit être arrondi (pas de décimales pour XOF)
   ```javascript
   amount: Math.round(order.total)
   ```

2. **Téléphone**: Format international recommandé
   ```javascript
   phone: formData.phone || '+225000000000'
   ```

3. **Return URL**: Déjà configuré dans le backend
   - Il redirigera vers votre frontend automatiquement

4. **Channels**:
   - `MOBILE_MONEY` = Orange Money, MTN, Moov, etc.
   - `CREDIT_CARD` = Visa, Mastercard
   - `ALL` = Tous les moyens

## 🧪 Test

### Scénario de test:
1. Ajoutez des produits au panier
2. Allez au checkout
3. Remplissez les informations
4. Sélectionnez "Mobile Money"
5. Cliquez "Passer la commande"
6. → Vous êtes redirigé vers CinetPay
7. Effectuez le paiement test
8. → Vous revenez sur votre site
9. Vérifiez la commande dans `/orders`

### Montants de test:
- Minimum: 100 XOF
- Multiple de 5 requis
- Exemple: 1000, 5000, 10000 XOF

## 📊 Vérifications après paiement

Le webhook backend met automatiquement à jour:
- ✅ `paymentStatus`: PENDING → PAID
- ✅ `status`: PENDING → PROCESSING
- ✅ Notification envoyée à l'utilisateur

Vous pouvez vérifier dans:
- La page `/orders` (liste des commandes)
- La page `/orders/:id` (détail de la commande)

## 🎨 Personnalisation

### Modifier les labels des méthodes de paiement:

Dans `Checkout.jsx`, ligne ~102:

```javascript
const getPaymentMethodDescription = (method) => {
  const descriptions = {
    CASH: 'Payez en espèces à la livraison',
    MOBILE_MONEY: 'Orange Money, MTN, Moov via CinetPay',
    CARD: 'Visa, Mastercard via CinetPay',
  };
  return descriptions[method] || '';
};
```

## 🐛 Dépannage

### Erreur "Paiement non initialisé"
→ Vérifiez les clés API dans le backend (.env)

### Redirection ne fonctionne pas
→ Vérifiez la console navigateur pour les erreurs
→ Vérifiez que `payment_url` est retourné

### Paiement réussi mais commande non mise à jour
→ Vérifiez le webhook backend
→ Vérifiez les logs serveur

## 📞 Support

- Backend: Voir `CINETPAY_QUICKSTART.md` et `CINETPAY_INTEGRATION_GUIDE.md`
- Frontend: Ce guide
- CinetPay docs: https://docs.cinetpay.com

---

✅ **Modification unique requise**: Remplacer la fonction `handleSubmit` dans `Checkout.jsx`

C'est tout ! Le reste est géré automatiquement par le backend.
