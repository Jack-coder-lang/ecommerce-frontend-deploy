# Guide d'Implémentation Backend - Suivi en Temps Réel

## Vue d'ensemble

Le frontend est maintenant prêt à recevoir des mises à jour de suivi en temps réel via Socket.IO. Ce document explique comment implémenter la partie backend pour activer cette fonctionnalité.

## Événements Socket.IO Attendus

### 1. `order-status-update`

**Déjà implémenté** - Émis lorsque le statut d'une commande change.

**Payload attendu:**
```javascript
{
  orderId: "uuid",
  orderNumber: "ORD-12345",
  status: "SHIPPED", // PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED
  timestamp: "2025-01-15T10:30:00Z"
}
```

**Quand émettre:**
- Lorsqu'un vendeur change le statut d'une commande
- Lorsqu'un admin met à jour une commande
- Lors de changements de statut automatiques

**Code backend exemple (Node.js):**
```javascript
// Dans votre service de commandes
const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status: newStatus },
    { new: true }
  );

  // Émettre l'événement Socket.IO au client
  const buyerId = order.buyer.toString();
  io.to(`user:${buyerId}`).emit('order-status-update', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    timestamp: new Date().toISOString()
  });

  return order;
};
```

---

### 2. `tracking-update` ⭐ NOUVEAU

**Émis lorsque la position du colis change** (GPS, changement de centre de tri, etc.)

**Payload attendu:**
```javascript
{
  orderId: "uuid",
  orderNumber: "ORD-12345",
  trackingInfo: {
    carrier: "DHL Express",
    trackingNumber: "DHL123456789",
    currentLocation: "Centre de tri - Abidjan",
    lastUpdate: "2025-01-15T10:30:00Z",
    estimatedDelivery: "2025-01-17T18:00:00Z"
  }
}
```

**Quand émettre:**
- Lorsque le transporteur fournit une mise à jour de localisation
- Lors de scans aux points de passage (centre de tri, agence, etc.)
- Lorsque le livreur est en route vers le client

**Code backend exemple:**
```javascript
// Webhook reçu du transporteur ou mise à jour manuelle
const updateTracking = async (orderId, trackingData) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      'trackingInfo.currentLocation': trackingData.currentLocation,
      'trackingInfo.lastUpdate': new Date(),
      'trackingInfo.estimatedDelivery': trackingData.estimatedDelivery
    },
    { new: true }
  );

  // Émettre l'événement Socket.IO
  const buyerId = order.buyer.toString();
  io.to(`user:${buyerId}`).emit('tracking-update', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    trackingInfo: order.trackingInfo
  });

  return order;
};
```

---

## Structure de Données Backend Requise

### Modèle Order (ajouts nécessaires)

```javascript
const orderSchema = new mongoose.Schema({
  // ... champs existants

  // ⭐ Ajouter ces champs pour le suivi
  trackingInfo: {
    carrier: {
      type: String,
      default: null
    },
    trackingNumber: {
      type: String,
      default: null
    },
    currentLocation: {
      type: String,
      default: null
    },
    lastUpdate: {
      type: Date,
      default: null
    },
    estimatedDelivery: {
      type: Date,
      default: null
    }
  },

  // Historique des changements de statut
  statusHistory: [{
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String
  }]
});
```

---

## Routes API à Ajouter/Modifier

### 1. Mettre à jour les informations de suivi

```javascript
// PUT /api/orders/:orderId/tracking
router.put('/:orderId/tracking', authenticateSeller, async (req, res) => {
  try {
    const { carrier, trackingNumber, currentLocation, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier que le vendeur est propriétaire des produits
    const isOwner = order.items.some(item =>
      item.product.seller.toString() === req.user.id
    );

    if (!isOwner && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Mettre à jour les infos de suivi
    order.trackingInfo = {
      carrier: carrier || order.trackingInfo?.carrier,
      trackingNumber: trackingNumber || order.trackingInfo?.trackingNumber,
      currentLocation,
      lastUpdate: new Date(),
      estimatedDelivery: estimatedDelivery || order.trackingInfo?.estimatedDelivery
    };

    await order.save();

    // Émettre Socket.IO
    io.to(`user:${order.buyer}`).emit('tracking-update', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      trackingInfo: order.trackingInfo
    });

    res.json({
      message: 'Informations de suivi mises à jour',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

### 2. Modifier le changement de statut pour alimenter l'historique

```javascript
// PATCH /api/orders/:orderId/status
router.patch('/:orderId/status', authenticateSeller, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier autorisation...

    // Mettre à jour le statut
    order.status = status;

    // Ajouter à l'historique
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id,
      note
    });

    await order.save();

    // Émettre Socket.IO
    io.to(`user:${order.buyer}`).emit('order-status-update', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: 'Statut mis à jour',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

---

## Intégration avec Transporteurs

### Option 1: Webhooks de transporteurs

Beaucoup de transporteurs (DHL, FedEx, UPS) offrent des webhooks pour notifier les changements de statut.

```javascript
// POST /api/webhooks/carrier/:carrier
router.post('/webhooks/carrier/:carrier', async (req, res) => {
  try {
    const { carrier } = req.params;
    const payload = req.body;

    // Vérifier la signature du webhook (important pour la sécurité)
    // ...

    // Parser selon le format du transporteur
    let trackingData;
    switch (carrier) {
      case 'dhl':
        trackingData = parseDHLWebhook(payload);
        break;
      case 'fedex':
        trackingData = parseFedExWebhook(payload);
        break;
      // ... autres transporteurs
    }

    // Trouver la commande par numéro de suivi
    const order = await Order.findOne({
      'trackingInfo.trackingNumber': trackingData.trackingNumber
    });

    if (order) {
      await updateTracking(order._id, trackingData);
    }

    res.json({ message: 'Webhook traité' });
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(500).json({ message: error.message });
  }
});
```

### Option 2: Polling API des transporteurs

Si pas de webhooks, interroger périodiquement l'API du transporteur.

```javascript
// Tâche CRON toutes les 15 minutes
const updateAllActiveTracking = async () => {
  const activeOrders = await Order.find({
    status: { $in: ['PROCESSING', 'SHIPPED'] },
    'trackingInfo.trackingNumber': { $ne: null }
  });

  for (const order of activeOrders) {
    try {
      const trackingData = await fetchCarrierAPI(
        order.trackingInfo.carrier,
        order.trackingInfo.trackingNumber
      );

      await updateTracking(order._id, trackingData);
    } catch (error) {
      console.error(`Erreur suivi commande ${order.orderNumber}:`, error);
    }
  }
};

// Lancer toutes les 15 minutes
setInterval(updateAllActiveTracking, 15 * 60 * 1000);
```

---

## Interface Vendeur

Ajouter dans le dashboard vendeur une interface pour saisir/mettre à jour les infos de suivi:

```javascript
// Page: /seller/orders/:orderId/tracking

const TrackingForm = () => {
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="carrier"
        placeholder="Transporteur (ex: DHL Express)"
      />
      <input
        name="trackingNumber"
        placeholder="Numéro de suivi"
      />
      <input
        name="currentLocation"
        placeholder="Position actuelle"
      />
      <input
        type="datetime-local"
        name="estimatedDelivery"
      />
      <button type="submit">Mettre à jour le suivi</button>
    </form>
  );
};
```

---

## Testez l'Implémentation

### 1. Tester manuellement avec Socket.IO

```javascript
// Dans la console du navigateur (page commande ouverte)
// Simuler une mise à jour depuis le backend

// Depuis le backend, exécutez:
io.to(`user:${buyerId}`).emit('tracking-update', {
  orderId: "...",
  orderNumber: "ORD-12345",
  trackingInfo: {
    carrier: "DHL Express",
    trackingNumber: "DHL123456789",
    currentLocation: "En livraison - Cocody",
    lastUpdate: new Date().toISOString()
  }
});
```

### 2. Vérifier les événements

Dans la console du frontend, vous devriez voir:
```
🔌 Connexion Socket.IO à: https://...
✅ Socket.IO connecté
📍 Mise à jour position: { orderId: "...", ... }
🔄 Rechargement automatique suite à mise à jour de position
```

---

## Résumé des Étapes

### Frontend ✅ (Déjà fait)
- ✅ Composant TrackingTimeline
- ✅ Écoute des événements Socket.IO
- ✅ Auto-refresh sur mise à jour
- ✅ Toast notifications

### Backend 🔧 (À implémenter)
1. Ajouter `trackingInfo` et `statusHistory` au modèle Order
2. Créer route `PUT /api/orders/:orderId/tracking`
3. Modifier route de changement de statut pour alimenter l'historique
4. Émettre événements Socket.IO `tracking-update`
5. (Optionnel) Intégrer webhooks/API transporteurs
6. Créer interface vendeur pour saisir les infos de suivi

---

## Support

Pour toute question sur l'implémentation backend, consultez:
- Documentation Socket.IO: https://socket.io/docs/
- Code frontend: `src/hooks/useSocket.js`, `src/components/TrackingTimeline.jsx`
