# 📬 Guide de Gestion des Notifications

## Vue d'ensemble

Votre application e-commerce dispose d'un système de notifications complet qui fonctionne **avec et sans Socket.IO**. Sur Vercel (production), le système utilise automatiquement le **polling** pour vérifier les nouvelles notifications.

---

## 🔄 Système Actuel

### 1. **Polling Automatique** (Compatible Vercel)

Le système vérifie automatiquement les nouvelles notifications toutes les **30 secondes**.

**Fichier**: `src/hooks/useNotificationPolling.js`

```javascript
// Utilisé automatiquement dans App.jsx
useNotificationPolling(); // Intervalle par défaut: 30s

// Ou avec un intervalle personnalisé
useNotificationPolling(60000); // Toutes les 60 secondes
```

**Fonctionnalités**:
- ✅ Détection automatique des nouvelles notifications
- ✅ Affichage de toasts avec icônes selon le type
- ✅ Limite de 3 notifications affichées simultanément
- ✅ Message récapitulatif si plus de 3 notifications
- ✅ Mise à jour du badge de compteur dans le Header
- ✅ Logs détaillés dans la console

### 2. **Socket.IO** (Uniquement en développement local)

Socket.IO est **automatiquement désactivé** sur Vercel car les fonctions serverless ne supportent pas les WebSockets persistantes.

**Fichier**: `src/hooks/useSocket.js` (lignes 12-18)

---

## 📋 Fonctionnalités Disponibles

### Dans le Frontend

#### **1. Voir toutes les notifications**
Page: `/notifications`

Fonctionnalités:
- Liste complète des notifications
- Filtres: Toutes / Non lues / Lues
- Recherche par mot-clé
- Marquer comme lu (individuel ou en masse)
- Supprimer (individuel ou toutes les lues)
- Statistiques (Total / Non lues / Lues)

#### **2. API Frontend**

```javascript
import { notificationsAPI } from './services/api';

// Récupérer toutes les notifications
const response = await notificationsAPI.getAll({ limit: 10 });

// Compter les non lues
const count = await notificationsAPI.getUnreadCount();

// Marquer comme lue
await notificationsAPI.markAsRead(notificationId);

// Tout marquer comme lu
await notificationsAPI.markAllAsRead();

// Supprimer une notification
await notificationsAPI.delete(notificationId);

// Supprimer toutes les notifications lues
await notificationsAPI.deleteAllRead();
```

---

## 🛠️ Créer des Notifications (Backend)

### Méthode Standard (Via Prisma)

```javascript
// Dans n'importe quel controller backend
await prisma.notification.create({
  data: {
    userId: user.id,
    title: 'Nouvelle commande',
    message: `Votre commande #${orderNumber} a été confirmée`,
    type: 'ORDER',
    priority: 'MEDIUM',
    link: `/orders/${orderId}`,
  }
});
```

### Types de Notifications Disponibles

| Type | Icône | Utilisation |
|------|-------|-------------|
| `ORDER` | 📦 | Commandes (création, mise à jour) |
| `ORDER_CREATED` | 🎉 | Nouvelle commande créée |
| `ORDER_UPDATE` | 📦 | Statut de commande modifié |
| `PAYMENT` | 💰 | Paiements généraux |
| `PAYMENT_SUCCESS` | 💰 | Paiement réussi |
| `PAYMENT_FAILED` | ❌ | Paiement échoué |
| `PRODUCT` | 🛍️ | Produits généraux |
| `PRODUCT_SOLD` | 🛒 | Produit vendu |
| `MESSAGE` | 💬 | Messages/Chat |
| `SECURITY` | 🔒 | Sécurité/Compte |
| `SYSTEM` | 🔔 | Notifications système |
| `PROMOTION` | 🎁 | Promotions/Offres |
| `COMMUNITY` | 👥 | Communauté/Social |
| `SUCCESS` | ✅ | Succès général |
| `ERROR` | ❌ | Erreurs |
| `WARNING` | ⚠️ | Avertissements |
| `INFO` | ℹ️ | Informations |

### Priorités

- `HIGH` - Bordure rouge (urgent)
- `MEDIUM` - Bordure jaune (normal)
- `LOW` - Bordure verte (faible priorité)

---

## 📝 Exemples d'Utilisation Backend

### Exemple 1: Notification de Commande

```javascript
// routes/order.routes.js ou controllers/order.controller.js
const createOrder = async (req, res) => {
  // ... création de la commande

  // Créer une notification
  await prisma.notification.create({
    data: {
      userId: req.user.id,
      title: 'Commande confirmée !',
      message: `Votre commande #${order.orderNumber} d'un montant de ${order.totalAmount} F a été confirmée`,
      type: 'ORDER_CREATED',
      priority: 'HIGH',
      link: `/orders/${order.id}`,
    }
  });

  // Notification pour le vendeur
  await prisma.notification.create({
    data: {
      userId: seller.id,
      title: 'Nouvelle vente !',
      message: `Vous avez reçu une commande #${order.orderNumber}`,
      type: 'PRODUCT_SOLD',
      priority: 'HIGH',
      link: `/seller/orders/${order.id}`,
    }
  });
};
```

### Exemple 2: Notification de Paiement

```javascript
// Webhook CinetPay ou autre
const handlePayment = async (req, res) => {
  const { status, orderId } = req.body;

  if (status === 'PAID') {
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: 'Paiement réussi',
        message: `Votre paiement pour la commande #${order.orderNumber} a été accepté`,
        type: 'PAYMENT_SUCCESS',
        priority: 'HIGH',
        link: `/orders/${orderId}`,
      }
    });
  } else {
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: 'Paiement échoué',
        message: `Le paiement pour la commande #${order.orderNumber} a échoué. Veuillez réessayer.`,
        type: 'PAYMENT_FAILED',
        priority: 'HIGH',
        link: `/orders/${orderId}`,
      }
    });
  }
};
```

### Exemple 3: Notification Admin (Approbation Utilisateur)

```javascript
// routes/admin.routes.js
const approveUser = async (req, res) => {
  const { userId } = req.params;

  // Mettre à jour le statut
  await prisma.user.update({
    where: { id: userId },
    data: { status: 'APPROVED' }
  });

  // Envoyer une notification
  await prisma.notification.create({
    data: {
      userId: userId,
      title: 'Compte approuvé !',
      message: 'Votre compte a été approuvé par l\'administrateur. Vous pouvez maintenant accéder à toutes les fonctionnalités.',
      type: 'SECURITY',
      priority: 'HIGH',
      link: '/profile',
    }
  });
};

const rejectUser = async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  await prisma.user.update({
    where: { id: userId },
    data: { status: 'REJECTED' }
  });

  await prisma.notification.create({
    data: {
      userId: userId,
      title: 'Compte refusé',
      message: `Votre compte a été refusé. Raison: ${reason}`,
      type: 'SECURITY',
      priority: 'HIGH',
    }
  });
};
```

---

## 🎨 Personnalisation

### Modifier l'Intervalle de Polling

**Fichier**: `src/App.jsx`

```javascript
// Par défaut: 30 secondes
useNotificationPolling();

// Personnalisé: 60 secondes
useNotificationPolling(60000);

// Plus rapide: 15 secondes (plus de requêtes API)
useNotificationPolling(15000);
```

### Ajouter de Nouveaux Types de Notifications

1. **Ajouter l'icône dans le hook**:

```javascript
// src/hooks/useNotificationPolling.js (ligne 48)
const icons = {
  // ... types existants
  MY_NEW_TYPE: '🎯', // Votre nouvelle icône
};
```

2. **Utiliser dans le backend**:

```javascript
await prisma.notification.create({
  data: {
    type: 'MY_NEW_TYPE',
    // ... autres champs
  }
});
```

---

## ⚡ Optimisations

### 1. **Limiter les Notifications Affichées**

Actuellement configuré pour afficher **max 3 toasts** simultanément.

**Fichier**: `src/hooks/useNotificationPolling.js` (ligne 47)

```javascript
newNotifications.reverse().slice(0, 3).forEach(...)
```

### 2. **Ajuster la Durée d'Affichage**

```javascript
toast(notif.message, {
  duration: 6000, // 6 secondes (modifiable)
  icon: icons[notif.type],
});
```

---

## 🔍 Débogage

### Logs dans la Console

Le système affiche automatiquement des logs:

```
🔄 Polling des notifications activé (intervalle: 30s)
📬 Polling notifications initialisé
🔔 2 nouvelle(s) notification(s) détectée(s)
🛑 Polling des notifications désactivé
```

### Vérifier si le Polling Fonctionne

1. Ouvrez la console du navigateur (F12)
2. Cherchez: `🔄 Polling des notifications activé`
3. Créez une notification depuis le backend
4. Attendez max 30 secondes
5. Vous devriez voir: `🔔 X nouvelle(s) notification(s) détectée(s)`

---

## 🚀 Déploiement

### Sur Vercel

✅ **Rien à faire !** Le système de polling est déjà configuré pour fonctionner automatiquement.

Socket.IO est désactivé sur Vercel via cette vérification:

```javascript
const isVercelProduction = import.meta.env.VITE_API_URL?.includes('vercel.app');
if (isVercelProduction) {
  console.log('ℹ️ Socket.IO désactivé (Vercel serverless)');
  return;
}
```

---

## 📊 Résumé des Fichiers

| Fichier | Rôle |
|---------|------|
| `src/hooks/useNotificationPolling.js` | Hook de polling (vérifie les nouvelles notifications) |
| `src/hooks/useSocket.js` | Socket.IO (désactivé sur Vercel) |
| `src/pages/Notifications.jsx` | Page d'affichage des notifications |
| `src/services/api.js` | API frontend pour les notifications |
| `src/components/Header.jsx` | Badge de compteur de notifications |
| `src/App.jsx` | Initialisation du polling |

---

## ❓ Questions Fréquentes

### **Q: Les notifications fonctionnent-elles sur Vercel ?**
✅ Oui ! Le système de polling fonctionne parfaitement sur Vercel.

### **Q: Puis-je utiliser Socket.IO sur Vercel ?**
❌ Non, Vercel ne supporte pas les WebSockets persistantes. Utilisez le polling ou un service externe (Pusher, Ably).

### **Q: Comment réduire le nombre de requêtes API ?**
Augmentez l'intervalle de polling: `useNotificationPolling(60000)` (60 secondes au lieu de 30).

### **Q: Les notifications sont-elles persistantes ?**
✅ Oui ! Elles sont stockées en base de données et restent disponibles même après rechargement.

### **Q: Comment désactiver les toasts ?**
Commentez les lignes 47-73 dans `src/hooks/useNotificationPolling.js`.

---

## 🎯 Prochaines Étapes

1. ✅ **Système de polling opérationnel**
2. ✅ **API complète pour gérer les notifications**
3. ✅ **Page de visualisation avec filtres**
4. 🔜 **Notifications push (PWA)**
5. 🔜 **Notifications par email**
6. 🔜 **Préférences utilisateur (activer/désactiver par type)**

---

Créé le: 2025-01-13
Auteur: Claude Code Assistant
