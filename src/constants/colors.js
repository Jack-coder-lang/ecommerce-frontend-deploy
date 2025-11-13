// frontend/src/constants/colors.js
export const BRAND_COLORS = {
  primary: {
    yellow: '#e8cf3a',
    gold: '#f6cc0a',
    black: '#212020',
    pink: '#bd1762',
    green: '#6ba456',
    cyan: '#1aa2af',
    magenta: '#a62a63',
    lime: '#5db03e',
    gray: '#5a595a',
  },
  
  light: {
    yellow: 'rgba(232, 207, 58, 0.1)',
    gold: 'rgba(246, 204, 10, 0.1)',
    pink: 'rgba(189, 23, 98, 0.1)',
    green: 'rgba(107, 164, 86, 0.1)',
    cyan: 'rgba(26, 162, 175, 0.1)',
    magenta: 'rgba(166, 42, 99, 0.1)',
  },

  gradients: {
    primary: 'from-[#e8cf3a] to-[#f6cc0a]',
    accent: 'from-[#bd1762] to-[#a62a63]',
    fresh: 'from-[#6ba456] to-[#5db03e]',
    cool: 'from-[#1aa2af] to-[#6ba456]',
    dark: 'from-[#212020] via-[#5a595a] to-[#212020]',
    rainbow: 'from-[#e8cf3a] via-[#1aa2af] to-[#bd1762]',
    sunset: 'from-[#e8cf3a] via-[#bd1762] to-[#f6cc0a]',
  },

  css: {
    primary: 'var(--brand-yellow)',
    secondary: 'var(--brand-gold)',
    dark: 'var(--brand-black)',
    accent: 'var(--brand-pink)',
    success: 'var(--brand-green)',
    info: 'var(--brand-cyan)',
  }
};

// Couleurs pour les attributs de produits (conservez vos couleurs existantes + ajoutez celles de la marque)
export const PRODUCT_COLORS = {
  // Couleurs de la marque
  'Jaune': '#e8cf3a',
  'Or': '#f6cc0a',
  'Noir': '#212020',
  'Rose': '#bd1762',
  'Vert': '#6ba456',
  'Cyan': '#1aa2af',
  'Magenta': '#a62a63',
  'Vert Lime': '#5db03e',
  'Gris': '#5a595a',
  
  // Couleurs standards
  'Blanc': '#FFFFFF',
  'Rouge': '#EF4444',
  'Bleu': '#3B82F6',
  'Violet': '#8B5CF6',
  'Orange': '#F97316',
  'Marron': '#92400E',
  'Beige': '#D4A574',
  'Transparent': '#E5E7EB',
};

// Catégories avec les couleurs de la marque
export const CATEGORIES = [
  { 
    value: 'CLOTHING', 
    label: 'Vêtements', 
    icon: '👕', 
    gradient: 'from-[#e8cf3a] to-[#f6cc0a]',
    color: '#e8cf3a',
    desc: 'Mode & Style' 
  },
  { 
    value: 'SHOES', 
    label: 'Chaussures', 
    icon: '👟', 
    gradient: 'from-[#6ba456] to-[#5db03e]',
    color: '#6ba456',
    desc: 'Confort & Tendance' 
  },
  { 
    value: 'BAGS', 
    label: 'Sacs', 
    icon: '👜', 
    gradient: 'from-[#bd1762] to-[#a62a63]',
    color: '#bd1762',
    desc: 'Élégance' 
  },
  { 
    value: 'CONTAINERS', 
    label: 'Contenants', 
    icon: '🥤', 
    gradient: 'from-[#1aa2af] to-[#6ba456]',
    color: '#1aa2af',
    desc: 'Pratique' 
  },
  { 
    value: 'ACCESSORIES', 
    label: 'Accessoires', 
    icon: '⌚', 
    gradient: 'from-[#a62a63] to-[#bd1762]',
    color: '#a62a63',
    desc: 'Détails parfaits' 
  },
];

export default BRAND_COLORS;