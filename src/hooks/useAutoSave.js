// Hook pour l'auto-save en localStorage
import { useEffect, useRef } from 'react';

export const useAutoSave = (key, data, delay = 2000) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Nettoyer le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Créer un nouveau timeout pour sauvegarder
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`✅ Auto-save: ${key}`);
      } catch (error) {
        console.error('Erreur auto-save:', error);
      }
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, delay]);

  // Fonction pour récupérer les données sauvegardées
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Erreur lecture auto-save:', error);
      return null;
    }
  };

  // Fonction pour supprimer les données sauvegardées
  const clearSavedData = () => {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ Cleared auto-save: ${key}`);
    } catch (error) {
      console.error('Erreur suppression auto-save:', error);
    }
  };

  return { getSavedData, clearSavedData };
};

export default useAutoSave;
