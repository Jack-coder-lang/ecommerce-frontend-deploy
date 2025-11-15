# 🔧 Fix CORS - Configuration Backend

## Problème
```
Access to XMLHttpRequest at 'https://ecommerce-backend-deploy.vercel.app/api/products'
from origin 'https://www.charms-ci.com' has been blocked by CORS policy
```

## Solution : Configurer CORS sur Vercel Backend

### Étape 1 : Vérifier votre fichier backend (index.js ou server.js)

Cherchez la configuration CORS existante et remplacez-la par :

```javascript
const cors = require('cors');
const express = require('express');
const app = express();

// ✅ Configuration CORS complète
const allowedOrigins = [
  'http://localhost:5173',           // Dev local
  'http://localhost:3000',
  'https://www.charms-ci.com',       // ⭐ Votre domaine de production
  'https://charms-ci.com',           // Sans www aussi
  'https://ecommerce-frontend-deploy.vercel.app', // Vercel preview
];

app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS bloqué pour:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ⚠️ Important : Placer AVANT les routes
app.use(express.json());

// ... vos routes
```

### Étape 2 : Configuration Vercel (vercel.json)

Si vous avez un fichier `vercel.json` dans le backend, ajoutez :

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "https://www.charms-ci.com" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,PATCH,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "X-Requested-With, Content-Type, Authorization" }
      ]
    }
  ]
}
```

### Étape 3 : Variables d'environnement Vercel

Dans le dashboard Vercel de votre **backend** :
1. Allez dans **Settings → Environment Variables**
2. Ajoutez :
   ```
   FRONTEND_URL=https://www.charms-ci.com
   ALLOWED_ORIGINS=https://www.charms-ci.com,https://charms-ci.com,http://localhost:5173
   ```

3. Utilisez dans le code :
   ```javascript
   const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
     'http://localhost:5173',
     'https://www.charms-ci.com'
   ];
   ```

### Étape 4 : Redéployer le Backend

```bash
cd ecommerce-backend-deploy
git add .
git commit -m "Fix: Configure CORS for production domain"
git push
```

Vercel va automatiquement redéployer.

---

## 🔴 Problème 2 : Socket.IO ne fonctionne pas sur Vercel

**Raison :** Vercel utilise des fonctions serverless qui ne supportent **pas** WebSockets persistants.

### Solutions Alternatives

#### Option A : Utiliser un autre hébergeur pour le backend (Recommandé)

**Hébergeurs supportant WebSockets :**
- ✅ **Render.com** (gratuit, supporte Socket.IO)
- ✅ **Railway.app** (gratuit, supporte Socket.IO)
- ✅ **Heroku** (payant mais fiable)
- ✅ **DigitalOcean App Platform**

**Si vous migrez vers Render :**
```bash
# Backend sur Render
VITE_API_URL=https://votre-backend.onrender.com/api
```

#### Option B : Désactiver Socket.IO et utiliser le Polling HTTP

Si vous devez rester sur Vercel, remplacez Socket.IO par du polling :

**Frontend : `src/hooks/useNotificationPolling.js` (créer)**
```javascript
import { useEffect } from 'react';
import { useAuthStore } from '../store';
import { notificationsAPI } from '../services/api';

export const useNotificationPolling = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Polling toutes les 30 secondes
    const interval = setInterval(async () => {
      try {
        const response = await notificationsAPI.getUnreadCount();
        window.dispatchEvent(
          new CustomEvent('notification-update', {
            detail: { count: response.data.count }
          })
        );
      } catch (error) {
        console.error('Erreur polling notifications:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);
};
```

**Dans `App.jsx` :**
```javascript
import { useNotificationPolling } from './hooks/useNotificationPolling';

function App() {
  useNotificationPolling(); // Au lieu de useSocket()

  return (
    // ... votre app
  );
}
```

#### Option C : Héberger Socket.IO séparément

Garder le backend REST sur Vercel, mais héberger Socket.IO sur Render :

```javascript
// Backend Socket.IO sur Render (serveur séparé)
const io = require('socket.io')(3001, {
  cors: {
    origin: 'https://www.charms-ci.com',
    credentials: true
  }
});

// Frontend se connecte à ce serveur Socket.IO
const SOCKET_URL = 'https://votre-socketio.onrender.com';
```

---

## ✅ Vérification Rapide

### Test CORS :
```bash
curl -H "Origin: https://www.charms-ci.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -X OPTIONS \
  https://ecommerce-backend-deploy.vercel.app/api/products -v
```

Vous devriez voir :
```
< Access-Control-Allow-Origin: https://www.charms-ci.com
< Access-Control-Allow-Methods: GET,POST,PUT,DELETE
```

### Test API produits :
```bash
curl https://ecommerce-backend-deploy.vercel.app/api/products
```

Devrait retourner du JSON, pas une erreur CORS.

---

## 🎯 Recommandation Finale

**Meilleure solution :**
1. **Migrer le backend vers Render.com** (gratuit, supporte Socket.IO)
2. Configurer CORS correctement sur Render
3. Mettre à jour `VITE_API_URL` dans Vercel frontend

**Alternative temporaire :**
1. Fixer CORS sur Vercel backend (voir Étape 1-3)
2. Utiliser polling HTTP au lieu de Socket.IO
3. Migrer plus tard vers Render quand vous aurez le temps
