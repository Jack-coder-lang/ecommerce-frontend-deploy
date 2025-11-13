// frontend/src/pages/StyleGuide.jsx
import React, { useState } from 'react';
import { BRAND_COLORS, CATEGORIES } from '../constants/colors';
import {
  Heart, Star, ShoppingCart, Eye, Zap, Gift, Bell, Check,
  AlertCircle, Info, Package, Truck, Award, Users
} from 'lucide-react';

export default function StyleGuide() {
  const [selectedTab, setSelectedTab] = useState('buttons');

  const tabs = [
    { id: 'buttons', label: '🔘 Boutons' },
    { id: 'inputs', label: '📝 Inputs' },
    { id: 'cards', label: '🎴 Cards' },
    { id: 'badges', label: '🏷️ Badges' },
    { id: 'gradients', label: '🌈 Gradients' },
    { id: 'animations', label: '✨ Animations' },
    { id: 'typography', label: '📝 Typographie' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-gradient-brand text-5xl font-bold mb-4">
            Guide de Style
          </h1>
          <p className="text-xl text-gray-600">
            Tous les composants et styles de notre marque
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === tab.id
                  ? 'gradient-brand-primary text-[#212020]'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {selectedTab === 'buttons' && <ButtonsSection />}
          {selectedTab === 'inputs' && <InputsSection />}
          {selectedTab === 'cards' && <CardsSection />}
          {selectedTab === 'badges' && <BadgesSection />}
          {selectedTab === 'gradients' && <GradientsSection />}
          {selectedTab === 'animations' && <AnimationsSection />}
          {selectedTab === 'typography' && <TypographySection />}
        </div>
      </div>
    </div>
  );
}

// Section Boutons
function ButtonsSection() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Boutons" />
      
      <div className="card-brand">
        <h3 className="text-xl font-bold mb-4">Boutons Principaux</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary">
            <ShoppingCart className="w-5 h-5 inline mr-2" />
            Bouton Primary
          </button>
          <button className="btn-secondary">
            Bouton Secondary
          </button>
          <button className="btn-accent">
            <Heart className="w-5 h-5 inline mr-2" />
            Bouton Accent
          </button>
          <button className="btn-success">
            <Check className="w-5 h-5 inline mr-2" />
            Bouton Success
          </button>
          <button className="btn-info">
            <Info className="w-5 h-5 inline mr-2" />
            Bouton Info
          </button>
          <button className="btn-outline">
            Bouton Outline
          </button>
        </div>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-4">États des Boutons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary">Normal</button>
          <button className="btn-primary" disabled>Disabled</button>
          <button className="btn-primary shine">Avec Shine Effect</button>
        </div>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-4">Tailles</h3>
        <div className="flex flex-wrap items-center gap-4">
          <button className="btn-primary text-sm px-4 py-2">Petit</button>
          <button className="btn-primary">Moyen</button>
          <button className="btn-primary text-lg px-8 py-4">Grand</button>
        </div>
      </div>
    </div>
  );
}

// Section Inputs
function InputsSection() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Inputs & Forms" />
      
      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Inputs Standard</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Input Standard</label>
            <input type="text" className="input-field" placeholder="Entrez du texte..." />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Input avec Style de Marque</label>
            <input type="text" className="input-brand" placeholder="Rechercher..." />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" className="input-brand" placeholder="votre@email.com" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mot de passe</label>
            <input type="password" className="input-brand" placeholder="••••••••" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Textarea</label>
            <textarea className="input-brand" rows="4" placeholder="Votre message..."></textarea>
          </div>
        </div>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Select & Checkbox</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select</label>
            <select className="input-brand">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="check1" 
              className="w-5 h-5 text-[#e8cf3a] rounded focus:ring-[#e8cf3a]" 
            />
            <label htmlFor="check1" className="text-sm font-medium">
              J'accepte les conditions
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="radio" 
              id="radio1" 
              name="radio" 
              className="w-5 h-5 text-[#e8cf3a] focus:ring-[#e8cf3a]" 
            />
            <label htmlFor="radio1" className="text-sm font-medium">
              Option Radio 1
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Section Cards
function CardsSection() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Cards" />
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-bold text-lg mb-2">Card Standard</h3>
          <p className="text-gray-600">Une card simple avec style par défaut</p>
        </div>
        
        <div className="card-brand">
          <h3 className="font-bold text-lg mb-2">Card Marque</h3>
          <p className="text-gray-600">Card avec bordure de marque</p>
        </div>
        
        <div className="card card-hover">
          <h3 className="font-bold text-lg mb-2">Card Interactive</h3>
          <p className="text-gray-600">Survole-moi pour voir l'effet!</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-2">Glass Effect</h3>
          <p className="text-gray-600">Effet verre translucide</p>
        </div>
        
        <div className="glass-brand p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-2">Glass Brand</h3>
          <p className="text-gray-600">Effet verre avec couleur de marque</p>
        </div>
      </div>

      <div className="card-brand">
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          <Package className="w-16 h-16 text-gray-400" />
        </div>
        <span className="badge-primary mb-2">NOUVEAU</span>
        <h3 className="font-bold text-xl mb-2">Card Produit Complète</h3>
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-[#f6cc0a] fill-current" />
          ))}
          <span className="text-sm text-gray-600 ml-2">4.8 (120 avis)</span>
        </div>
        <p className="text-2xl font-bold text-brand-yellow mb-4">29,990 F</p>
        <button className="btn-primary w-full">
          <ShoppingCart className="w-5 h-5 inline mr-2" />
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}

// Section Badges
function BadgesSection() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Badges & Tags" />
      
      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Badges de Base</h3>
        <div className="flex flex-wrap gap-3">
          <span className="badge-primary">Primary</span>
          <span className="badge-success">Success</span>
          <span className="badge-danger">Danger</span>
          <span className="badge-info">Info</span>
          <span className="badge-warning">Warning</span>
        </div>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Badges avec Icônes</h3>
        <div className="flex flex-wrap gap-3">
          <span className="badge-primary">
            <Zap className="w-3 h-3 inline mr-1" />
            Flash Deal
          </span>
          <span className="badge-success">
            <Check className="w-3 h-3 inline mr-1" />
            En Stock
          </span>
          <span className="badge-danger">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Rupture
          </span>
          <span className="badge-info">
            <Truck className="w-3 h-3 inline mr-1" />
            Livraison Gratuite
          </span>
          <span className="badge bg-brand-pink text-white">
            <Heart className="w-3 h-3 inline mr-1" />
            Favoris
          </span>
          <span className="badge bg-brand-cyan text-white">
            <Award className="w-3 h-3 inline mr-1" />
            Top Noté
          </span>
        </div>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Tags de Catégories</h3>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map(cat => (
            <span 
              key={cat.value}
              className={`badge bg-gradient-to-r ${cat.gradient} text-white`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Section Gradients
function GradientsSection() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Gradients de Marque" />
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="gradient-brand-primary p-8 rounded-xl text-center">
          <h3 className="text-2xl font-bold text-[#212020] mb-2">Primary</h3>
          <p className="text-[#212020]/80">Jaune → Or</p>
        </div>
        
        <div className="gradient-brand-accent p-8 rounded-xl text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Accent</h3>
          <p className="text-white/80">Rose → Magenta</p>
        </div>
        
        <div className="gradient-brand-fresh p-8 rounded-xl text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Fresh</h3>
          <p className="text-white/80">Vert → Lime</p>
        </div>
        
        <div className="gradient-brand-cool p-8 rounded-xl text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Cool</h3>
          <p className="text-white/80">Cyan → Vert</p>
        </div>
        
        <div className="gradient-brand-dark p-8 rounded-xl text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Dark</h3>
          <p className="text-white/80">Noir → Gris → Noir</p>
        </div>
        
        <div className="gradient-brand-rainbow p-8 rounded-xl text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Rainbow</h3>
          <p className="text-white/80">Jaune → Cyan → Rose</p>
        </div>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Ombres Personnalisées</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="shadow-brand bg-white p-6 rounded-xl text-center">
            <div className="w-12 h-12 gradient-brand-primary rounded-full mx-auto mb-3"></div>
            <p className="font-medium">Ombre Jaune</p>
          </div>
          
          <div className="shadow-brand-pink bg-white p-6 rounded-xl text-center">
            <div className="w-12 h-12 bg-brand-pink rounded-full mx-auto mb-3"></div>
            <p className="font-medium">Ombre Rose</p>
          </div>
          
          <div className="shadow-brand-green bg-white p-6 rounded-xl text-center">
            <div className="w-12 h-12 bg-brand-green rounded-full mx-auto mb-3"></div>
            <p className="font-medium">Ombre Verte</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Section Animations
function AnimationsSection() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Animations" />
      
      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Entrées Animées</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="animate-slideInLeft bg-brand-yellow-light p-4 rounded-lg text-center">
            Slide In Left
          </div>
          <div className="animate-slideInRight bg-brand-pink-light p-4 rounded-lg text-center">
            Slide In Right
          </div>
          <div className="animate-slideInUp bg-brand-green-light p-4 rounded-lg text-center">
            Slide In Up
          </div>
          <div className="animate-slideInDown bg-brand-cyan-light p-4 rounded-lg text-center">
            Slide In Down
          </div>
        </div>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Effets Spéciaux</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="animate-pulse-brand gradient-brand-primary p-6 rounded-xl text-center text-[#212020] font-bold">
            Pulse Brand
          </div>
          <div className="animate-bounce-subtle bg-brand-pink text-white p-6 rounded-xl text-center font-bold">
            Bounce Subtle
          </div>
          <div className="animate-wiggle bg-brand-green text-white p-6 rounded-xl text-center font-bold">
            Wiggle
          </div>
        </div>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Effet Shimmer</h3>
        <div className="animate-shimmer gradient-brand-primary p-8 rounded-xl text-center text-[#212020]">
          <p className="text-2xl font-bold">Effet de Brillance</p>
        </div>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Avec Délais</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="animate-fadeIn animation-delay-100 bg-white p-4 rounded-lg shadow text-center">
            Délai 100ms
          </div>
          <div className="animate-fadeIn animation-delay-300 bg-white p-4 rounded-lg shadow text-center">
            Délai 300ms
          </div>
          <div className="animate-fadeIn animation-delay-500 bg-white p-4 rounded-lg shadow text-center">
            Délai 500ms
          </div>
        </div>
      </div>
    </div>
  );
}

// Section Typography
function TypographySection() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Typographie" />
      
      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Texte avec Gradient</h3>
        <h1 className="text-gradient-brand text-5xl font-bold mb-4">
          Titre avec Gradient de Marque
        </h1>
        <h2 className="text-gradient-accent text-4xl font-bold mb-4">
          Titre avec Gradient Accent
        </h2>
        <h3 className="text-gradient-fresh text-3xl font-bold">
          Titre avec Gradient Vert
        </h3>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Tailles de Texte</h3>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold">Heading 1 - 5xl</h1>
          <h2 className="text-4xl font-bold">Heading 2 - 4xl</h2>
          <h3 className="text-3xl font-bold">Heading 3 - 3xl</h3>
          <h4 className="text-2xl font-bold">Heading 4 - 2xl</h4>
          <h5 className="text-xl font-bold">Heading 5 - xl</h5>
          <p className="text-base">Paragraphe standard - base</p>
          <p className="text-sm">Petit texte - sm</p>
          <p className="text-xs">Très petit texte - xs</p>
        </div>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Texte Responsive</h3>
        <p className="text-responsive mb-4">
          Ce texte s'adapte à la taille de l'écran
        </p>
        <h2 className="text-responsive-lg mb-4">
          Grand titre responsive
        </h2>
        <h1 className="text-responsive-xl">
          Très grand titre responsive
        </h1>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Line Clamp</h3>
        <p className="line-clamp-1 mb-4 bg-gray-50 p-3 rounded">
          Ce texte est limité à une ligne et sera tronqué avec des points de suspension si trop long pour tenir sur une seule ligne.
        </p>
        <p className="line-clamp-2 mb-4 bg-gray-50 p-3 rounded">
          Ce texte est limité à deux lignes et sera tronqué avec des points de suspension. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </p>
        <p className="line-clamp-3 bg-gray-50 p-3 rounded">
          Ce texte est limité à trois lignes. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, voluptates! Voluptatum, quas. Lorem ipsum dolor sit amet.
        </p>
      </div>

      <div className="card-brand">
        <h3 className="text-xl font-bold mb-6">Couleurs de Texte</h3>
        <div className="space-y-2">
          <p className="text-brand-yellow text-xl font-bold">Texte Jaune</p>
          <p className="text-brand-gold text-xl font-bold">Texte Or</p>
          <p className="text-brand-pink text-xl font-bold">Texte Rose</p>
          <p className="text-brand-green text-xl font-bold">Texte Vert</p>
          <p className="text-brand-cyan text-xl font-bold">Texte Cyan</p>
          <p className="text-brand-magenta text-xl font-bold">Texte Magenta</p>
          <p className="text-brand-black text-xl font-bold">Texte Noir</p>
        </div>
      </div>
    </div>
  );
}

// Composant SectionTitle
function SectionTitle({ title }) {
  return (
    <h2 className="text-3xl font-bold text-gradient-brand mb-6">{title}</h2>
  );
}