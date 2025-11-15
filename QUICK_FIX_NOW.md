# 🚀 DÉBLOCAGE RAPIDE - 3 MINUTES

## 🎯 VOTRE PROBLÈME
Votre compte vendeur est **PENDING** - vous ne pouvez pas créer de produits.

## ✅ SOLUTION EN 3 CLICS

### 📌 ÉTAPE 1 - Créer Admin (30 secondes)
```
1. Ouvrir: http://localhost:5176/create-admin.html
2. Cliquer: "Créer le Compte Admin"
3. Attendre: Message "✅ Compte admin créé avec succès !"
4. Cliquer: "Aller à la page de connexion"
```

**Identifiants admin créés:**
- Email: `admin@ecommerce.com`
- Mot de passe: `admin123`

---

### 📌 ÉTAPE 2 - Approuver Vendeur (1 minute)
```
1. Se connecter avec admin@ecommerce.com / admin123
2. Aller sur: http://localhost:5176/admin
3. Trouver: kouassi@gmail.com (statut: PENDING)
4. Cliquer: Bouton "Approuver"
5. Vérifier: Statut devient "APPROVED" (vert)
6. Se déconnecter
```

---

### 📌 ÉTAPE 3 - Tester Vendeur (1 minute)
```
1. Se reconnecter avec kouassi@gmail.com
2. Aller sur: http://localhost:5176/seller/products/new
3. Remplir le formulaire
4. Cliquer: "Créer le produit"
5. Vérifier: Toast vert "Produit créé avec succès !"
```

---

## 🧪 TEST RAPIDE

**Données de test:**
```
Nom: Test Final
Description: Test après approbation
Prix: 10000
Stock: 5
Catégorie: ELECTRONICS
Image: https://via.placeholder.com/400
```

**Résultat attendu:**
```
✅ Toast vert: "Produit créé avec succès !"
✅ Redirection vers /seller/products
✅ Produit visible dans la liste
```

---

## 🚨 SI ÇA NE MARCHE PAS

### Problème: "Email déjà utilisé"
**Solution:** L'admin existe déjà, passez directement à l'Étape 2

### Problème: Toujours 404 sur API
**Solution:** Hard refresh → `Ctrl + Shift + R`

### Problème: Token invalide
**Solution:**
1. F12 → Application → Local Storage
2. Supprimer tous les items
3. Rafraîchir et reconnecter

---

## 📍 URLS IMPORTANTES

- **Créer admin:** http://localhost:5176/create-admin.html
- **Login:** http://localhost:5176/login
- **Admin panel:** http://localhost:5176/admin
- **Nouveau produit:** http://localhost:5176/seller/products/new

---

## ✅ VALIDATION

Après ces 3 étapes:
- [ ] Compte admin créé
- [ ] Vendeur approuvé
- [ ] Produit créé avec succès
- [ ] Aucune erreur 401/500

**Si tous cochés → SUCCÈS ! 🎉**

---

**TEMPS ESTIMÉ:** 3-5 minutes
**DIFFICULTÉ:** Facile

**PROCHAINE ACTION:** Ouvrir http://localhost:5176/create-admin.html maintenant ! 🚀
