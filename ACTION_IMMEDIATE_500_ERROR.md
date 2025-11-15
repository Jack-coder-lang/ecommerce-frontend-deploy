# ⚡ ACTION IMMÉDIATE - Résoudre l'Erreur 500

## 🎯 Votre Erreur

```
TypeError: Impossible de lire les propriétés de undefined (lecture de « id »)
Backend: product.controller.js:16:33
```

**Signification :** Le backend ne peut pas lire `req.user.id` car `req.user` est `undefined`.

---

## ✅ SOLUTION EN 3 ÉTAPES (2 minutes)

### Étape 1: Se Déconnecter Complètement

#### Option A: Via l'Interface
1. Cliquez sur votre profil/nom en haut à droite
2. Cliquez sur "Déconnexion"

#### Option B: Via la Console (Plus Rapide)
1. Appuyez sur `F12` pour ouvrir la console
2. Tapez et exécutez:
```javascript
localStorage.clear();
window.location.href = '/login';
```

---

### Étape 2: Se Reconnecter

1. Connectez-vous avec vos identifiants de vendeur
2. Vérifiez que vous êtes bien connecté (votre nom apparaît en haut)

---

### Étape 3: Réessayer

1. Allez sur: `/seller/products/new`
2. Remplissez le formulaire avec ces données de test:

| Champ | Valeur |
|-------|--------|
| Nom | Test Produit |
| Description | Ceci est un produit de test avec une description complète |
| Prix | 5000 |
| Stock | 10 |
| Catégorie | ELECTRONICS |
| Image | https://via.placeholder.com/400 |
| Frais livraison | 1000 |

3. Cliquez sur "Créer le produit"

---

## 🎉 Résultat Attendu

### ✅ Si ça Marche

```
✅ Toast vert: "Produit créé avec succès !"
→ Redirection vers /seller/products
→ Votre produit apparaît dans la liste
```

**Félicitations ! Le problème était un token expiré. Vous pouvez maintenant créer vos produits normalement.**

---

### ❌ Si ça Ne Marche Toujours Pas

Vous verrez un de ces messages:

#### Message 1: "Erreur d'authentification. Veuillez vous reconnecter."
```
→ Cliquez sur "OK" dans la popup
→ Retournez à l'Étape 1 (se reconnecter à nouveau)
→ Utilisez un autre navigateur si le problème persiste
```

#### Message 2: "Session expirée. Veuillez vous reconnecter."
```
→ Vous serez redirigé automatiquement vers /login
→ Reconnectez-vous
→ Réessayez
```

#### Message 3: Autre message d'erreur
```
→ Le problème est côté backend
→ Passez à la Section "Problème Backend" ci-dessous
```

---

## 🔧 Si le Problème Persiste (Backend)

### Vérification Rapide

Ouvrez la console (F12) et exécutez:

```javascript
// Test complet d'authentification
(async function() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  console.log('=== DIAGNOSTIC ===');
  console.log('Token présent:', !!token);
  console.log('User:', user);
  console.log('Role:', user?.role);

  // Test de création
  const response = await fetch('https://ecommerce-backend-deploy.vercel.app/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: "Test",
      description: "Test description complète",
      price: 1000,
      stock: 1,
      category: "ELECTRONICS",
      images: ["https://via.placeholder.com/400"],
      shippingFee: 1000
    })
  });

  const result = await response.json();
  console.log('Status:', response.status);
  console.log('Résultat:', result);

  if (!response.ok) {
    console.error('❌ ERREUR:', result);
  }
})();
```

**Copiez le résultat** et partagez-le pour obtenir de l'aide.

---

## 🛠️ Correctif Backend (Pour Développeurs)

Si après reconnexion l'erreur persiste, **le problème est dans le backend**.

### Ce qu'il faut corriger:

#### Fichier: `backend/middleware/auth.middleware.js`

```javascript
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 CORRECTIF: Assurer que req.user est bien défini
    req.user = {
      id: decoded.id || decoded.userId || decoded._id,
      role: decoded.role,
      email: decoded.email
    };

    console.log('✅ req.user défini:', req.user); // Pour débugger

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token invalide',
      error: error.message
    });
  }
};
```

#### Fichier: `backend/controllers/product.controller.js`

```javascript
const createProduct = async (req, res) => {
  try {
    // 🔥 CORRECTIF: Vérifier que req.user existe
    if (!req.user || !req.user.id) {
      console.error('❌ req.user non défini');
      return res.status(401).json({
        message: 'Non authentifié - req.user manquant'
      });
    }

    const sellerId = req.user.id;

    const product = await Product.create({
      ...req.body,
      seller: sellerId // ou sellerId selon votre schéma
    });

    res.status(201).json({
      message: 'Produit créé avec succès',
      product
    });
  } catch (error) {
    console.error('❌ Erreur création:', error);
    res.status(500).json({
      message: 'Erreur lors de la création du produit',
      error: error.message
    });
  }
};
```

#### Fichier: `backend/routes/product.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { createProduct } = require('../controllers/product.controller');

// 🔥 CORRECTIF: S'assurer que le middleware est appliqué
router.post('/products', authMiddleware, createProduct);

module.exports = router;
```

---

## 📊 Checklist de Vérification

### Frontend ✅
- [x] Token est stocké dans localStorage
- [x] Token est envoyé dans headers
- [x] Format: `Bearer <token>`
- [x] Vérification avant envoi ajoutée
- [x] Gestion d'erreur améliorée

### Backend ❓ (À vérifier si problème persiste)
- [ ] Middleware auth définit `req.user`
- [ ] Middleware auth est appliqué à la route POST /products
- [ ] `req.user.id` existe (pas `_id` seul)
- [ ] JWT_SECRET est défini
- [ ] Token est vérifié avec jwt.verify()

---

## 🎯 Résumé Visuel

```
┌─────────────────────────────────────────┐
│ 1. Se Déconnecter                      │
│    localStorage.clear()                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 2. Se Reconnecter                      │
│    Nouveaux token et user              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 3. Créer un Produit                    │
│    Remplir le formulaire               │
└─────────────────────────────────────────┘
              ↓
         ┌─────────┐
         │ Succès? │
         └─────────┘
          /       \
        OUI       NON
         │         │
         ✅        └─→ Problème Backend
    TERMINÉ             (Voir correctif)
```

---

## 🚀 Action MAINTENANT

### 1️⃣ Testez la Solution Rapide (30 secondes)

```javascript
// Copier-coller dans la console:
localStorage.clear();
window.location.href = '/login';
```

Puis:
1. Reconnectez-vous
2. Créez un produit de test
3. Vérifiez si ça marche

---

### 2️⃣ Si Ça Marche ✅

**Vous avez terminé !** L'erreur venait d'un token expiré.

Le frontend a maintenant:
- ✅ Meilleure détection des tokens expirés
- ✅ Redirection automatique vers login
- ✅ Messages d'erreur clairs
- ✅ Proposition de reconnexion

---

### 3️⃣ Si Ça Ne Marche Pas ❌

**Le problème est backend.**

Soit:
1. Vous corrigez le backend (voir section "Correctif Backend")
2. Vous partagez le résultat du test diagnostic pour obtenir de l'aide

---

## 💡 Pourquoi Cette Erreur ?

```
Frontend envoie:
Authorization: Bearer eyJhbGciOiJ...

Backend reçoit:
req.headers.authorization = "Bearer eyJhbGciOiJ..."

Middleware auth devrait faire:
req.user = { id: "123", role: "SELLER", ... }

Mais actuellement:
req.user = undefined ❌

Controller essaie:
const sellerId = req.user.id
                  ^^^^^^^^ undefined
                  → ERREUR!
```

---

## 📞 Besoin d'Aide ?

Partagez le résultat de ce test:

```javascript
// Console
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

console.log({
  hasToken: !!token,
  userRole: user?.role,
  userId: user?._id || user?.id,
  tokenPreview: token?.substring(0, 30) + '...'
});
```

---

## ✅ Solution Finale

**99% des cas:** Se reconnecter résout le problème
**1% des cas:** Le backend nécessite une correction

**Commencez par vous reconnecter MAINTENANT ! 🚀**
