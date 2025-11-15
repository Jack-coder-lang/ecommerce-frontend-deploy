# 🧪 Test de Création de Produit - Guide Pas à Pas

## 🎯 Objectif

Tester la création de produit et identifier l'erreur exacte avec l'erreur 500.

---

## 📋 Préparation

### 1. Ouvrir la Console du Navigateur

```
Windows/Linux: F12 ou Ctrl+Shift+I
Mac: Cmd+Option+I
```

Aller dans l'onglet **Console**

---

### 2. Se Connecter en tant que Vendeur

1. Aller sur `http://localhost:5174/login`
2. Se connecter avec un compte vendeur
3. Vérifier dans la console:

```javascript
// Copier-coller dans la console:
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('Role:', user?.role);
console.log('User ID:', user?._id || user?.id);
```

**Résultat attendu:**
```
User: { _id: "...", name: "...", role: "SELLER" }
Role: SELLER
User ID: 65abc123...
```

✅ **Si vous voyez ceci** → Vous êtes connecté correctement
❌ **Si role n'est pas SELLER** → Connectez-vous avec un compte vendeur

---

## 🧪 Test 1: Produit Minimal (Test de Base)

### Étape 1: Aller sur le Formulaire

```
http://localhost:5174/seller/products/new
```

### Étape 2: Remplir le Formulaire Minimal

| Champ | Valeur |
|-------|--------|
| **Nom** | Test Produit Minimal |
| **Description** | Ceci est une description de test avec plus de 10 caractères pour passer la validation |
| **Prix** | 1000 |
| **Stock** | 5 |
| **Catégorie** | ELECTRONICS |
| **Image 1** | https://via.placeholder.com/400 |
| **Frais de livraison** | 1000 |

**Laissez vides:** Poids, Dimensions

### Étape 3: Soumettre

1. Cliquer sur "Créer le produit"
2. Regarder la console immédiatement

### Étape 4: Vérifier les Logs Console

Vous devriez voir:

```
📤 Données envoyées au backend: {
  "name": "Test Produit Minimal",
  "description": "Ceci est une description...",
  "price": 1000,
  "stock": 5,
  "category": "ELECTRONICS",
  "images": ["https://via.placeholder.com/400"],
  "shippingFee": 1000
}
```

**Et soit:**

✅ **Succès:**
```
✅ Réponse du backend: { product: {...}, message: "..." }
→ PRODUIT CRÉÉ! Le formulaire fonctionne!
```

❌ **Erreur:**
```
❌ Erreur complète: Error: Request failed...
❌ Réponse serveur: { message: "...", error: "..." }
❌ Status: 500
```

---

## 📸 Test 2: Analyser l'Erreur Exacte

### Si Erreur 500:

**Copier EXACTEMENT tout ce qui est dans la console:**

```
❌ Réponse serveur: { ... }
```

**Messages d'erreur courants:**

#### Message: "Product validation failed: sellerId is required"
```
→ Le backend attend un sellerId
→ Solution: Vérifier si le backend utilise le token pour extraire le sellerId
→ Ou: Ajouter manuellement sellerId dans les données
```

#### Message: "Cannot read property '_id' of null"
```
→ Le backend ne trouve pas l'utilisateur via le token
→ Solution: Vérifier que le token est valide
→ Se reconnecter pour obtenir un nouveau token
```

#### Message: "Category 'ELECTRONICS' is not valid"
```
→ Le backend utilise peut-être des catégories différentes
→ Solution: Vérifier les catégories acceptées
```

#### Message: "Cast to Number failed for value..."
```
→ Un champ numérique contient une valeur invalide
→ Solution: Vérifier prix, stock, shippingFee
```

---

## 🔍 Test 3: Vérifier le Token et Headers

### Dans la Console:

```javascript
// 1. Vérifier le token
const token = localStorage.getItem('token');
console.log('Token présent:', !!token);
console.log('Token (premiers 20 chars):', token?.substring(0, 20));

// 2. Vérifier l'utilisateur
const user = JSON.parse(localStorage.getItem('user'));
console.log('User complet:', user);

// 3. Tester manuellement la création
async function testCreateProduct() {
  const data = {
    name: "Test Manual",
    description: "Description de test avec au moins 10 caractères",
    price: 1000,
    stock: 1,
    category: "ELECTRONICS",
    images: ["https://via.placeholder.com/400"],
    shippingFee: 1000
  };

  try {
    const response = await fetch('https://ecommerce-backend-deploy.vercel.app/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Résultat:', result);

    if (!response.ok) {
      console.error('❌ Erreur:', result);
    } else {
      console.log('✅ Succès:', result);
    }
  } catch (error) {
    console.error('❌ Erreur complète:', error);
  }
}

// Exécuter le test
testCreateProduct();
```

**Résultats possibles:**

✅ **200-201:** Succès! Le backend accepte les données
❌ **401:** Token invalide ou expiré → Se reconnecter
❌ **403:** Pas les permissions → Vérifier le rôle
❌ **500:** Erreur serveur → Voir le message d'erreur

---

## 🛠️ Test 4: Solutions selon l'Erreur

### Erreur: "sellerId is required"

**Solution:**

Modifier `src/pages/seller/NewProduct.jsx` ligne ~113:

```javascript
const user = JSON.parse(localStorage.getItem('user'));

const data = {
  name: formData.name.trim(),
  description: formData.description.trim(),
  price: parseFloat(formData.price),
  stock: parseInt(formData.stock),
  category: formData.category,
  images: formData.images.filter(img => img.trim() !== ''),
  shippingFee: parseFloat(formData.shippingFee) || 1000,

  // 🔥 AJOUTER CETTE LIGNE:
  seller: user?._id || user?.id,

  // OU selon le schéma backend:
  // sellerId: user?._id || user?.id,

  ...(formData.weight && { weight: parseFloat(formData.weight) }),
  ...(formData.dimensions.length && {
    dimensions: {
      length: parseFloat(formData.dimensions.length),
      width: parseFloat(formData.dimensions.width),
      height: parseFloat(formData.dimensions.height)
    }
  })
};
```

---

### Erreur: Token Invalide/Expiré

**Solution:**

1. Se déconnecter
2. Se reconnecter
3. Réessayer

**Ou via console:**

```javascript
// Forcer la reconnexion
localStorage.removeItem('token');
localStorage.removeItem('user');
window.location.href = '/login';
```

---

### Erreur: Catégorie Invalide

**Solution:**

Vérifier les catégories acceptées par le backend.

Dans la console:

```javascript
// Tester avec chaque catégorie
const categories = [
  'ELECTRONICS', 'CLOTHING', 'SHOES', 'BAGS',
  'ACCESSORIES', 'CONTAINERS', 'FOOD', 'BOOKS',
  'SPORTS', 'HOME', 'BEAUTY', 'TOYS'
];

console.log('Catégories à tester:', categories);

// Ou vérifier une catégorie spécifique
async function testCategory(category) {
  const data = {
    name: "Test",
    description: "Test description",
    price: 1000,
    stock: 1,
    category: category,
    images: ["https://via.placeholder.com/400"],
    shippingFee: 1000
  };

  const token = localStorage.getItem('token');

  try {
    const response = await fetch('https://ecommerce-backend-deploy.vercel.app/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log(`Catégorie ${category}:`, response.status, result);
  } catch (error) {
    console.error(`Erreur ${category}:`, error);
  }
}

// Tester
testCategory('ELECTRONICS');
```

---

## 📊 Résultats Attendus

### ✅ Si Tout Fonctionne:

```
Console:
📤 Données envoyées au backend: { ... }
✅ Réponse du backend: { product: { ... }, message: "Produit créé" }

Navigation:
→ Redirection automatique vers /seller/products
→ Toast vert: "✅ Produit créé avec succès !"
```

### ❌ Si Erreur 500:

```
Console:
📤 Données envoyées au backend: { ... }
❌ Erreur complète: Error { ... }
❌ Réponse serveur: { message: "...", error: "..." }
❌ Status: 500
🔥 ERREUR SERVEUR 500 - Vérifiez les logs du backend

Toast rouge:
"[Message d'erreur du serveur]"
```

---

## 🎯 Action Finale

**Une fois que vous avez les logs:**

1. **Copier le contenu de "❌ Réponse serveur:"**
2. **Identifier le message d'erreur exact**
3. **Appliquer la solution correspondante**

**Exemples:**

| Message d'Erreur | Solution |
|------------------|----------|
| "sellerId is required" | Ajouter `seller` ou `sellerId` dans data |
| "Token invalid" | Se reconnecter |
| "Category not valid" | Vérifier enum des catégories backend |
| "Cast to Number failed" | Vérifier que prix/stock sont des nombres |
| "Images validation failed" | Vérifier format des URLs images |

---

## 🔧 Test Rapide en Une Commande

**Copier-coller dans la console du navigateur:**

```javascript
(async function quickTest() {
  console.log('🧪 TEST DE CRÉATION DE PRODUIT');
  console.log('================================');

  // 1. Vérifier authentification
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  console.log('✓ Token présent:', !!token);
  console.log('✓ User:', user?.name);
  console.log('✓ Role:', user?.role);
  console.log('✓ User ID:', user?._id || user?.id);

  if (!token || !user) {
    console.error('❌ ERREUR: Vous devez être connecté');
    return;
  }

  if (user.role !== 'SELLER' && user.role !== 'seller') {
    console.error('❌ ERREUR: Vous devez être vendeur');
    return;
  }

  // 2. Tester création
  console.log('\n🚀 Test de création...');

  const testData = {
    name: "Test Produit " + Date.now(),
    description: "Description de test avec au moins 10 caractères",
    price: 1000,
    stock: 1,
    category: "ELECTRONICS",
    images: ["https://via.placeholder.com/400"],
    shippingFee: 1000
  };

  console.log('📤 Données:', testData);

  try {
    const response = await fetch('https://ecommerce-backend-deploy.vercel.app/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    console.log('\n📥 Résultat:');
    console.log('Status:', response.status);
    console.log('Réponse:', result);

    if (response.ok) {
      console.log('✅ SUCCESS! Le produit a été créé!');
      console.log('Produit ID:', result.product?._id);
    } else {
      console.error('❌ ERREUR:', result.message || result.error);
      console.error('Détails:', result);
    }
  } catch (error) {
    console.error('❌ ERREUR RÉSEAU:', error);
  }

  console.log('\n================================');
})();
```

---

## 📝 Rapport à Partager

Si vous avez besoin d'aide, partagez ces informations:

```
=== RAPPORT DE TEST ===

1. Données envoyées:
[Copier le contenu de "📤 Données envoyées au backend"]

2. Erreur reçue:
[Copier le contenu de "❌ Réponse serveur"]

3. Status HTTP:
[Copier le status]

4. User info:
Role: [votre rôle]
ID: [votre user ID]

=== FIN DU RAPPORT ===
```

---

**Testez maintenant et partagez les résultats ! 🚀**
