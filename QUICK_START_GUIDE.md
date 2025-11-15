# Guide de Démarrage Rapide - Formulaire Amélioré

## 🚀 Démarrage en 3 Étapes

### 1. Configuration (Optionnel - pour l'upload d'images)

Créez ou mettez à jour `.env` à la racine du projet :

```bash
# Service d'Upload d'Images ImgBB (Gratuit)
VITE_IMGBB_API_KEY=votre_cle_api

# Obtenir une clé gratuite : https://api.imgbb.com/
```

### 2. Démarrage du Serveur

```bash
npm run dev
```

### 3. Tester le Formulaire

1. Naviguez vers: `http://localhost:5173/seller/products/new`
2. Connectez-vous en tant que vendeur
3. Testez les nouvelles fonctionnalités !

---

## ✨ Nouvelles Fonctionnalités - Utilisation

### 📝 Validation en Temps Réel

**Comment ça marche:**
1. Remplissez un champ (ex: nom du produit)
2. Cliquez en dehors du champ
3. ✅ Si valide: bordure verte
4. ❌ Si invalide: bordure rouge + message d'erreur

**Exemple:**
```
Nom du produit *
[_____________]  ← Tapez "AB" puis cliquez ailleurs
⚠️ Le nom doit contenir au moins 3 caractères
```

---

### 💾 Auto-Save (Sauvegarde Automatique)

**Comment ça marche:**
1. Commencez à remplir le formulaire
2. Attendez 2 secondes
3. ✅ Données sauvegardées automatiquement
4. Fermez/rafraîchissez la page
5. Revenez → Message de restauration

**Indicateur:**
```
💡 Votre brouillon est automatiquement sauvegardé toutes les 2 secondes
```

**Pour effacer le brouillon:**
- Créez le produit avec succès (auto-effacé)
- Ou refusez la restauration au retour

---

### 📸 Upload d'Images

**2 Méthodes:**

**Méthode 1 - URL (comme avant):**
```
URL de l'image 1
[https://example.com/image.jpg___________]
```

**Méthode 2 - Upload Fichier (nouveau):**
```
URL de l'image 1
[_________________________] [📤] [❌] [🖼️]
                             ↑
                    Cliquez ici pour uploader
```

**Pendant l'upload:**
```
[████████░░░░░░░░] 60%
```

**Formats supportés:** JPG, PNG, GIF, WebP (max 32 MB)

---

### 🚚 Frais de Livraison Automatiques

**Comment ça marche:**
1. Entrez le poids du produit
2. Entrez les dimensions (optionnel)
3. Le système suggère les frais automatiquement dans la console
4. Vous pouvez les modifier manuellement si nécessaire

**Calcul:**
```
Base: 1000 FCFA
+ Poids > 1kg: +1000 FCFA
+ Poids > 5kg: +2000 FCFA
+ Poids > 10kg: +3000 FCFA
+ Volume > 50L: +1000 FCFA
+ Volume > 100L: +2000 FCFA
Max: 10000 FCFA
```

---

### ⏳ États de Chargement

**Bouton dynamique:**

**État Normal:**
```
┌─────────────────────┐
│ 📦 Créer le produit │
└─────────────────────┘
```

**Pendant Upload:**
```
┌─────────────────────┐
│ 📤 Upload en cours..│ (pulsing)
└─────────────────────┘
```

**Pendant Création:**
```
┌─────────────────────┐
│ ⏳ Création en cours│ (spinner)
└─────────────────────┘
```

---

### 🛡️ Protection des Données

**Scénario:**
1. Remplissez quelques champs
2. Cliquez sur "Annuler"
3. ⚠️ Message de confirmation:

```
┌────────────────────────────────────┐
│ Vous avez des modifications non    │
│ enregistrées. Voulez-vous vraiment │
│ quitter ?                          │
│                                    │
│    [Annuler]  [OK]                 │
└────────────────────────────────────┘
```

4. **OK** = Quitter (données sauvegardées via auto-save)
5. **Annuler** = Rester sur la page

---

### 📋 Résumé des Erreurs

**Avant soumission:**

Si vous avez des erreurs, un résumé s'affiche en bas :

```
┌──────────────────────────────────────┐
│ ⚠️ Erreurs de validation            │
│                                      │
│ • Le nom doit contenir au moins     │
│   3 caractères                      │
│ • La description doit contenir au   │
│   moins 10 caractères               │
│ • Au moins une image est requise    │
└──────────────────────────────────────┘
```

**Cliquez sur "Créer le produit" pour voir ce résumé**

---

## 🎯 Workflow Recommandé

### Pour Créer un Produit

```
1. Nom & Description
   ├─ Remplissez le nom (min 3 caractères)
   ├─ Ajoutez une description (min 10 caractères)
   └─ Sélectionnez la catégorie

2. Prix & Stock
   ├─ Entrez le prix en FCFA
   └─ Indiquez la quantité en stock

3. Images (IMPORTANT!)
   ├─ Option A: Entrez l'URL d'une image
   ├─ Option B: Uploadez un fichier (📤)
   ├─ Ajoutez plusieurs images (max 10)
   └─ Vérifiez l'aperçu 🖼️

4. Livraison (Optionnel)
   ├─ Poids (suggère les frais auto)
   ├─ Dimensions (L x l x H en cm)
   └─ Frais de livraison (suggérés)

5. Vérification
   ├─ Cliquez "👁️ Aperçu" en haut
   ├─ Vérifiez l'aperçu du produit
   └─ Corrigez les erreurs (bordures rouges)

6. Création
   ├─ Cliquez "📦 Créer le produit"
   ├─ Attendez la confirmation
   └─ Redirection automatique vers liste produits
```

---

## ⚠️ Points d'Attention

### Validation des Champs

| Champ | Règle | Exemple Valide | Exemple Invalide |
|-------|-------|----------------|------------------|
| **Nom** | 3-100 caractères | "iPhone 14 Pro" | "AB" ❌ |
| **Description** | 10-1000 caractères | "Téléphone neuf en boîte..." | "Bon" ❌ |
| **Prix** | > 0 FCFA | 50000 | -100 ❌ |
| **Stock** | Nombre entier ≥ 0 | 25 | 25.5 ❌ |
| **Images** | Min 1, Max 10 | [url1, url2] | [] ❌ |
| **Poids** | Optionnel, > 0 kg | 2.5 | -1 ❌ |

### Messages d'Erreur Courants

**"Le nom doit contenir au moins 3 caractères"**
→ Entrez un nom plus long

**"La description doit contenir au moins 10 caractères"**
→ Ajoutez plus de détails à la description

**"Au moins une image est requise"**
→ Ajoutez au moins une URL ou uploadez un fichier

**"Les frais de livraison semblent trop élevés"**
→ Vérifiez le montant (max recommandé: 10000 FCFA)

**"L'image X n'est pas une URL valide"**
→ Vérifiez le format de l'URL (doit commencer par http:// ou https://)

---

## 🔧 Dépannage Rapide

### Upload d'Images Ne Fonctionne Pas

**Problème:** Bouton upload ne fait rien

**Solutions:**
1. Vérifiez `.env` → `VITE_IMGBB_API_KEY`
2. Obtenez une clé sur https://api.imgbb.com/
3. Redémarrez le serveur: `npm run dev`

---

### Auto-Save Ne Fonctionne Pas

**Problème:** Brouillon non restauré

**Solutions:**
1. Vérifiez que localStorage est activé dans votre navigateur
2. Ouvrez la console → Cherchez "✅ Auto-save: new_product_draft"
3. Vérifiez le localStorage: DevTools → Application → Local Storage

---

### Validation Ne S'Affiche Pas

**Problème:** Pas d'erreur affichée

**Solutions:**
1. Assurez-vous de cliquer **en dehors** du champ
2. Le champ doit avoir été "touché" (blur event)
3. Vérifiez la console pour les erreurs JavaScript

---

### Images Ne Se Chargent Pas dans l'Aperçu

**Problème:** Image cassée dans l'aperçu

**Solutions:**
1. Vérifiez que l'URL est correcte et accessible
2. Vérifiez que l'image autorise CORS
3. Utilisez plutôt l'upload de fichier (📤)

---

## 📚 Raccourcis Clavier (À venir)

Fonctionnalités futures possibles:
- `Ctrl+S` → Sauvegarder brouillon
- `Ctrl+Enter` → Soumettre formulaire
- `Ctrl+Z` → Annuler dernière modification

---

## 💡 Conseils Pro

### Pour les Meilleures Images
1. Utilisez des images carrées (1:1 ratio)
2. Résolution recommandée: 800x800px minimum
3. Compressez vos images avant upload pour plus de rapidité
4. Utilisez des images sur fond blanc pour meilleur rendu

### Pour les Descriptions
1. Soyez précis et détaillé
2. Mentionnez les caractéristiques clés
3. Indiquez l'état du produit (neuf, occasion, etc.)
4. Ajoutez des informations sur la garantie si applicable

### Pour les Prix
1. Vérifiez les prix du marché
2. Incluez tous les frais dans le prix
3. Les frais de livraison sont séparés
4. Utilisez des prix ronds (ex: 50000 au lieu de 49999)

---

## 🎉 Conclusion

Votre formulaire de création de produit est maintenant **professionnel** et **fiable** !

**Vous avez accès à:**
- ✅ Validation en temps réel
- ✅ Sauvegarde automatique
- ✅ Upload d'images direct
- ✅ Calculs automatiques
- ✅ Protection des données
- ✅ Interface intuitive

**Besoin d'aide ?**
- Consultez `PRODUCT_FORM_IMPROVEMENTS.md` pour les détails techniques
- Consultez `BEFORE_AFTER_COMPARISON.md` pour voir les améliorations
- Vérifiez la console pour les logs et erreurs

**Bonne création de produits ! 🚀**
