// Validation robuste pour les produits
export const validateProductForm = (formData) => {
  const errors = {};

  // Nom du produit
  if (!formData.name || formData.name.trim().length < 3) {
    errors.name = 'Le nom doit contenir au moins 3 caractères';
  }
  if (formData.name && formData.name.length > 100) {
    errors.name = 'Le nom ne peut pas dépasser 100 caractères';
  }

  // Description
  if (!formData.description || formData.description.trim().length < 10) {
    errors.description = 'La description doit contenir au moins 10 caractères';
  }
  if (formData.description && formData.description.length > 1000) {
    errors.description = 'La description ne peut pas dépasser 1000 caractères';
  }

  // Prix
  const price = parseFloat(formData.price);
  if (!formData.price || isNaN(price)) {
    errors.price = 'Le prix est requis';
  } else if (price < 0) {
    errors.price = 'Le prix ne peut pas être négatif';
  } else if (price > 100000000) {
    errors.price = 'Le prix est trop élevé';
  }

  // Stock
  const stock = parseInt(formData.stock);
  if (!formData.stock || isNaN(stock)) {
    errors.stock = 'Le stock est requis';
  } else if (stock < 0) {
    errors.stock = 'Le stock ne peut pas être négatif';
  } else if (!Number.isInteger(stock)) {
    errors.stock = 'Le stock doit être un nombre entier';
  }

  // Images
  const validImages = formData.images.filter(img => img && img.trim() !== '');
  if (validImages.length === 0) {
    errors.images = 'Au moins une image est requise';
  } else if (validImages.length > 10) {
    errors.images = 'Maximum 10 images autorisées';
  }

  // Validation des URLs d'images
  validImages.forEach((img, index) => {
    try {
      new URL(img);
    } catch {
      errors[`image_${index}`] = `L'image ${index + 1} n'est pas une URL valide`;
    }
  });

  // Poids (optionnel mais doit être valide si fourni)
  if (formData.weight && formData.weight !== '') {
    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight < 0) {
      errors.weight = 'Le poids doit être un nombre positif';
    } else if (weight > 1000) {
      errors.weight = 'Le poids semble trop élevé (max: 1000kg)';
    }
  }

  // Dimensions (toutes ou aucune)
  const { length, width, height } = formData.dimensions || {};
  const hasSomeDimensions = length || width || height;
  const hasAllDimensions = length && width && height;

  if (hasSomeDimensions && !hasAllDimensions) {
    errors.dimensions = 'Veuillez remplir toutes les dimensions ou aucune';
  }

  if (hasAllDimensions) {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const h = parseFloat(height);

    if (isNaN(l) || isNaN(w) || isNaN(h)) {
      errors.dimensions = 'Les dimensions doivent être des nombres';
    } else if (l <= 0 || w <= 0 || h <= 0) {
      errors.dimensions = 'Les dimensions doivent être positives';
    } else if (l > 1000 || w > 1000 || h > 1000) {
      errors.dimensions = 'Les dimensions semblent trop élevées (max: 1000cm)';
    }
  }

  // Frais de livraison
  if (formData.shippingFee && formData.shippingFee !== '') {
    const shippingFee = parseFloat(formData.shippingFee);
    if (isNaN(shippingFee) || shippingFee < 0) {
      errors.shippingFee = 'Les frais de livraison doivent être positifs';
    } else if (shippingFee > 100000) {
      errors.shippingFee = 'Les frais de livraison semblent trop élevés';
    }
  }

  // Tags (si présents)
  if (formData.tags && formData.tags.length > 20) {
    errors.tags = 'Maximum 20 tags autorisés';
  }

  // Variantes (si présentes)
  if (formData.variants && formData.variants.length > 0) {
    formData.variants.forEach((variant, index) => {
      if (!variant.name || variant.name.trim().length === 0) {
        errors[`variant_${index}_name`] = `Le nom de la variante ${index + 1} est requis`;
      }
      if (!variant.values || variant.values.length === 0) {
        errors[`variant_${index}_values`] = `Au moins une valeur est requise pour la variante ${index + 1}`;
      }
    });
  }

  // Promotion (si présente)
  if (formData.discount) {
    const discount = parseFloat(formData.discount);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      errors.discount = 'La réduction doit être entre 0 et 100%';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Suggestions de prix basées sur la catégorie
export const getPriceSuggestions = (category) => {
  const suggestions = {
    ELECTRONICS: { min: 10000, max: 1000000, suggested: 50000 },
    CLOTHING: { min: 2000, max: 50000, suggested: 10000 },
    SHOES: { min: 3000, max: 100000, suggested: 15000 },
    BAGS: { min: 5000, max: 150000, suggested: 25000 },
    ACCESSORIES: { min: 1000, max: 50000, suggested: 5000 },
    CONTAINERS: { min: 500, max: 20000, suggested: 3000 },
    FOOD: { min: 500, max: 50000, suggested: 5000 },
    BOOKS: { min: 2000, max: 30000, suggested: 8000 },
    SPORTS: { min: 3000, max: 200000, suggested: 20000 },
    HOME: { min: 5000, max: 500000, suggested: 30000 },
    BEAUTY: { min: 2000, max: 100000, suggested: 15000 },
    TOYS: { min: 2000, max: 100000, suggested: 10000 },
  };

  return suggestions[category] || { min: 1000, max: 1000000, suggested: 10000 };
};

// Suggestions de frais de livraison basées sur le poids et les dimensions
export const calculateShippingFee = (weight, dimensions) => {
  let fee = 1000; // Base

  // Ajustement par poids
  if (weight) {
    const w = parseFloat(weight);
    if (w > 10) fee += 3000;
    else if (w > 5) fee += 2000;
    else if (w > 1) fee += 1000;
  }

  // Ajustement par volume
  if (dimensions && dimensions.length && dimensions.width && dimensions.height) {
    const volume = parseFloat(dimensions.length) * parseFloat(dimensions.width) * parseFloat(dimensions.height);
    if (volume > 100000) fee += 2000; // > 100L
    else if (volume > 50000) fee += 1000; // > 50L
  }

  return Math.min(fee, 10000); // Max 10000 FCFA
};

// Génération de SKU unique
export const generateSKU = (name, category) => {
  const categoryCode = category ? category.substring(0, 3).toUpperCase() : 'PRD';
  const nameCode = name
    ? name
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, 'X')
    : 'XXX';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();

  return `${categoryCode}-${nameCode}-${timestamp}-${random}`;
};

// Validation d'un SKU
export const isValidSKU = (sku) => {
  return /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]+-[A-Z0-9]+$/.test(sku);
};
