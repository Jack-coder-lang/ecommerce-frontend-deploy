// Hook pour la validation de formulaire en temps réel
import { useState, useCallback } from 'react';

export const useFormValidation = (validateFn) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Valider tout le formulaire
  const validate = useCallback((data) => {
    const validation = validateFn(data);
    setErrors(validation.errors);
    return validation.isValid;
  }, [validateFn]);

  // Valider un champ spécifique
  const validateField = useCallback((fieldName, value, allData) => {
    const validation = validateFn(allData);
    const fieldError = validation.errors[fieldName];

    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldError || null
    }));

    return !fieldError;
  }, [validateFn]);

  // Marquer un champ comme "touché"
  const touchField = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  // Réinitialiser les erreurs
  const resetErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  // Vérifier si un champ a une erreur et a été touché
  const getFieldError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : null;
  }, [errors, touched]);

  return {
    errors,
    touched,
    validate,
    validateField,
    touchField,
    resetErrors,
    getFieldError,
    hasErrors: Object.keys(errors).length > 0
  };
};

export default useFormValidation;
