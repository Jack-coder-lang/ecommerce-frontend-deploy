import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('🚀 main.jsx chargé');

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
  console.error('❌ Erreur globale:', event.error);
  if (event.error?.name === 'AbortError') {
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rejetée:', event.reason);
  if (event.reason?.name === 'AbortError') {
    event.preventDefault();
  }
});

// Service Worker PWA est maintenant géré automatiquement par vite-plugin-pwa
// Le plugin injecte automatiquement le script registerSW.js dans index.html

console.log('🔍 Recherche de l\'élément root...');
const rootElement = document.getElementById('root');
console.log('📍 Élément root trouvé:', rootElement);

if (!rootElement) {
  console.error('❌ Élément root non trouvé!');
} else {
  try {
    console.log('🎨 Création du root React...');
    const root = ReactDOM.createRoot(rootElement);
    console.log('✅ Root créé, rendu de l\'app...');

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('✅ App rendue avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du rendu:', error);
  }
}