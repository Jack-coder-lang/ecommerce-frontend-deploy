// frontend/src/pages/AllProducts.jsx
// VERSION AVEC COULEURS DE LA MARQUE INTÉGRÉES
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCartStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { CATEGORIES, PRODUCT_COLORS } from '../constants/colors';
import { 
  ShoppingCart, Star, Search, Package, X, SlidersHorizontal, Heart, Eye, Filter,
  TrendingUp, Sparkles, Clock, Share2, Download, Grid3x3, List, Bell,
  ChevronLeft, ChevronRight, Zap, Tag, Award, CheckCircle, AlertCircle, 
  RefreshCw, ExternalLink, MessageCircle, History, Bookmark
} from 'lucide-react';

const COLORS = PRODUCT_COLORS;

export default function AllProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // États principaux
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Recherche et filtres
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  
  // UI States
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [favorites, setFavorites] = useState(new Set(JSON.parse(localStorage.getItem('favorites') || '[]')));
  const [viewMode, setViewMode] = useState(localStorage.getItem('viewMode') || 'grid');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(localStorage.getItem('itemsPerPage')) || 12);
  const [compareList, setCompareList] = useState(new Set(JSON.parse(localStorage.getItem('compareList') || '[]')));
  const [showQuickView, setShowQuickView] = useState(null);
  const [showShareModal, setShowShareModal] = useState(null);
  
  const searchRef = useRef(null);
  const addToCart = useCartStore((state) => state.addToCart);

  // Sync with URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (category) params.set('cat', category);
    if (sortBy !== 'createdAt') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    setSearchParams(params);
  }, [search, category, sortBy, sortOrder]);

  // Sauvegarder les préférences
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
    localStorage.setItem('compareList', JSON.stringify([...compareList]));
    localStorage.setItem('viewMode', viewMode);
    localStorage.setItem('itemsPerPage', itemsPerPage);
  }, [favorites, compareList, viewMode, itemsPerPage]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, search, category, sortBy, sortOrder, priceRange, selectedColor, selectedSize, inStockOnly, freeShippingOnly, minRating]);

  useEffect(() => {
    if (search.length > 1) {
      const suggestions = products
        .filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 8);
      setSearchSuggestions(suggestions);
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
    }
  }, [search, products]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data.products || []);
      toast.success('Produits chargés', { icon: '✨' });
    } catch (error) {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      setRefreshing(true);
      const response = await productsAPI.getAll();
      setProducts(response.data.products || []);
      toast.success('Produits actualisés', { icon: '🔄' });
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.categoryLabel?.toLowerCase().includes(searchLower) ||
        p.attributes?.color?.toLowerCase().includes(searchLower) ||
        p.attributes?.size?.toLowerCase().includes(searchLower)
      );
    }

    if (category) filtered = filtered.filter(p => p.category === category);
    if (selectedColor) filtered = filtered.filter(p => p.attributes?.color === selectedColor);
    if (selectedSize) filtered = filtered.filter(p => p.attributes?.size === selectedSize);
    if (priceRange.min) filtered = filtered.filter(p => p.price >= parseFloat(priceRange.min));
    if (priceRange.max) filtered = filtered.filter(p => p.price <= parseFloat(priceRange.max));
    if (inStockOnly) filtered = filtered.filter(p => p.stock > 0);
    if (freeShippingOnly) filtered = filtered.filter(p => p.shippingFee === 0);
    if (minRating > 0) filtered = filtered.filter(p => (p.averageRating || 0) >= minRating);

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'price': comparison = a.price - b.price; break;
        case 'name': comparison = a.name.localeCompare(b.name); break;
        case 'rating': comparison = (b.averageRating || 0) - (a.averageRating || 0); break;
        case 'popular': comparison = (b.reviewCount || 0) - (a.reviewCount || 0); break;
        case 'stock': comparison = b.stock - a.stock; break;
        case 'createdAt':
        default: comparison = new Date(b.createdAt) - new Date(a.createdAt); break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (productId, productName) => {
    try {
      await addToCart(productId, 1);
      toast.success(`${productName} ajouté au panier`, { icon: '🛒' });
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
      toast.success('Retiré des favoris', { icon: '💔' });
    } else {
      newFavorites.add(productId);
      toast.success('Ajouté aux favoris', { icon: '❤️' });
    }
    setFavorites(newFavorites);
  };

  const toggleCompare = (productId) => {
    const newCompareList = new Set(compareList);
    if (newCompareList.has(productId)) {
      newCompareList.delete(productId);
      toast.success('Retiré de la comparaison');
    } else {
      if (newCompareList.size >= 4) {
        toast.error('Maximum 4 produits à comparer');
        return;
      }
      newCompareList.add(productId);
      toast.success('Ajouté à la comparaison', { icon: '📊' });
    }
    setCompareList(newCompareList);
  };

  const shareProduct = async (product) => {
    const link = `${window.location.origin}/products/${product.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Lien copié dans le presse-papiers', { icon: '📋' });
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategory('');
    setSelectedColor('');
    setSelectedSize('');
    setPriceRange({ min: '', max: '' });
    setSortBy('createdAt');
    setSortOrder('desc');
    setInStockOnly(false);
    setFreeShippingOnly(false);
    setMinRating(0);
    setPage(1);
    toast.success('Filtres réinitialisés');
  };

  const availableColors = [...new Set(products.filter(p => p.attributes?.color).map(p => p.attributes.color))];
  const availableSizes = [...new Set(products.filter(p => p.attributes?.size).map(p => p.attributes.size))];

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const activeFiltersCount = [
    category, selectedColor, selectedSize, priceRange.min, priceRange.max,
    inStockOnly && 'stock', freeShippingOnly && 'shipping', minRating > 0 && 'rating'
  ].filter(Boolean).length;

  // Stats
  const stats = {
    total: products.length,
    filtered: filteredProducts.length,
    inStock: filteredProducts.filter(p => p.stock > 0).length,
    avgPrice: filteredProducts.length > 0
      ? (filteredProducts.reduce((sum, p) => sum + p.price, 0) / filteredProducts.length).toFixed(0)
      : 0,
    topRated: filteredProducts.filter(p => (p.averageRating || 0) >= 4).length,
    freeShipping: filteredProducts.filter(p => p.shippingFee === 0).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center animate-fadeInScale">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#e8cf3a] border-t-transparent mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-brand-yellow animate-pulse" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Chargement des produits...</p>
          <p className="text-sm text-gray-500 mt-2">Préparation de votre catalogue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* HEADER avec gradient de marque */}
      <div className="gradient-brand-rainbow relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-[#e8cf3a] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-[#bd1762] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#1aa2af] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6 animate-slideInUp">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-brand-gold animate-bounce-subtle" />
                <h1 className="text-4xl md:text-5xl font-bold text-white">Tous nos produits</h1>
              </div>
              <p className="text-white/90 text-lg">Découvrez notre collection complète de {products.length} produits</p>
            </div>
            
            {/* STATS */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 w-full md:w-auto animate-fadeIn animation-delay-200">
              <div className="glass p-3 rounded-xl text-center hover:scale-105 transition-all">
                <Package className="w-5 h-5 mx-auto mb-1 text-brand-yellow" />
                <p className="text-2xl font-bold text-white">{stats.filtered}</p>
                <p className="text-xs text-white/80">Résultats</p>
              </div>
              <div className="glass p-3 rounded-xl text-center hover:scale-105 transition-all">
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-brand-green" />
                <p className="text-2xl font-bold text-white">{stats.inStock}</p>
                <p className="text-xs text-white/80">En stock</p>
              </div>
              <div className="glass p-3 rounded-xl text-center hover:scale-105 transition-all">
                <Award className="w-5 h-5 mx-auto mb-1 text-brand-gold" />
                <p className="text-2xl font-bold text-white">{stats.topRated}</p>
                <p className="text-xs text-white/80">Top notes</p>
              </div>
              <div className="glass p-3 rounded-xl text-center hover:scale-105 transition-all">
                <Tag className="w-5 h-5 mx-auto mb-1 text-brand-pink" />
                <p className="text-2xl font-bold text-white">{stats.avgPrice}F</p>
                <p className="text-xs text-white/80">Prix moy.</p>
              </div>
              <div className="glass p-3 rounded-xl text-center hover:scale-105 transition-all">
                <Heart className="w-5 h-5 mx-auto mb-1 text-brand-pink" />
                <p className="text-2xl font-bold text-white">{favorites.size}</p>
                <p className="text-xs text-white/80">Favoris</p>
              </div>
              <div className="glass p-3 rounded-xl text-center hover:scale-105 transition-all">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-brand-cyan" />
                <p className="text-2xl font-bold text-white">{compareList.size}</p>
                <p className="text-xs text-white/80">Compare</p>
              </div>
            </div>
          </div>
          
          {/* RECHERCHE */}
          <div className="max-w-4xl mx-auto animate-slideInUp animation-delay-300" ref={searchRef}>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Search className="w-6 h-6 text-white/60" />
                {refreshing && <RefreshCw className="w-4 h-4 text-white/60 animate-spin" />}
              </div>
              
              <input
                type="text"
                placeholder="Rechercher par nom, couleur, taille..."
                className="w-full pl-16 pr-20 py-4 border-2 border-white/20 glass-brand text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow text-lg transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search.length > 1 && setShowSearchSuggestions(true)}
              />
              
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* SUGGESTIONS */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full mt-3 w-full card-brand shadow-brand-lg z-50 max-h-96 overflow-y-auto scrollbar-brand animate-slideInDown">
                  {searchSuggestions.map(product => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-brand-yellow-light border-b last:border-0 transition-colors"
                      onClick={() => setShowSearchSuggestions(false)}
                    >
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/80'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 hover:text-brand-cyan line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xl font-bold text-brand-yellow">
                          {product.price.toLocaleString()} F
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FILTRES CATÉGORIES */}
      <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <Filter className="w-5 h-5 text-brand-gray flex-shrink-0" />
            
            <button
              onClick={() => setCategory('')}
              className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                !category
                  ? 'gradient-brand-primary text-brand-black shadow-brand scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-brand-yellow-light hover:scale-105'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Tout</span>
              <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs font-bold">
                {products.length}
              </span>
            </button>
            
            {CATEGORIES.map(cat => {
              const count = products.filter(p => p.category === cat.value).length;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    category === cat.value
                      ? `bg-gradient-to-r ${cat.gradient} text-white shadow-brand scale-105`
                      : 'bg-gray-100 text-gray-700 hover:bg-brand-yellow-light hover:scale-105'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    category === cat.value ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAGS FILTRES ACTIFS */}
      {activeFiltersCount > 0 && (
        <div className="bg-brand-yellow-light border-b border-brand-yellow/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-brand-black font-medium">
                <Filter className="w-4 h-4" />
                <span>{activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''} :</span>
              </div>
              
              {category && (
                <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm border-2 border-brand-yellow">
                  {CATEGORIES.find(c => c.value === category)?.icon}
                  {CATEGORIES.find(c => c.value === category)?.label}
                  <button onClick={() => setCategory('')} className="hover:text-brand-pink">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              <button
                onClick={clearAllFilters}
                className="ml-auto text-sm text-brand-pink hover:text-brand-magenta font-medium underline"
              >
                Tout effacer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div className="container mx-auto px-4 py-8">
        {/* BARRE D'OUTILS */}
        <div className="card-brand shadow-brand p-4 mb-6 animate-slideInUp">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-primary"
              >
                <SlidersHorizontal className="w-5 h-5 inline mr-2" />
                Filtres avancés
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-white text-brand-pink px-2 py-0.5 rounded-full text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 bg-brand-yellow-light px-4 py-2 rounded-lg">
                <Package className="w-5 h-5 text-brand-cyan" />
                <span className="text-sm">
                  <span className="font-bold text-lg text-brand-black">{filteredProducts.length}</span> produit{filteredProducts.length > 1 ? 's' : ''}
                </span>
              </div>

              {compareList.size > 0 && (
                <Link
                  to="/compare"
                  className="flex items-center gap-2 px-4 py-2 bg-brand-cyan-light text-brand-cyan rounded-lg hover:bg-brand-cyan hover:text-white transition-colors border-2 border-brand-cyan/30 font-medium"
                >
                  <TrendingUp className="w-5 h-5" />
                  Comparer ({compareList.size})
                </Link>
              )}

              {favorites.size > 0 && (
                <Link
                  to="/favorites"
                  className="flex items-center gap-2 px-4 py-2 bg-brand-pink-light text-brand-pink rounded-lg hover:bg-brand-pink hover:text-white transition-colors border-2 border-brand-pink/30 font-medium"
                >
                  <Heart className="w-5 h-5" />
                  Favoris ({favorites.size})
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={refreshProducts}
                disabled={refreshing}
                className="p-2.5 bg-gray-100 hover:bg-brand-cyan-light text-gray-600 hover:text-brand-cyan rounded-lg transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="input-brand text-sm font-medium"
              >
                <option value="createdAt-desc">🆕 Plus récents</option>
                <option value="createdAt-asc">🕐 Plus anciens</option>
                <option value="price-asc">💰 Prix ↑</option>
                <option value="price-desc">💎 Prix ↓</option>
                <option value="name-asc">🔤 Nom A-Z</option>
                <option value="rating-desc">⭐ Meilleures notes</option>
                <option value="popular-desc">🔥 Plus populaires</option>
              </select>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="input-brand text-sm font-medium"
              >
                <option value={12}>12 / page</option>
                <option value={24}>24 / page</option>
                <option value={48}>48 / page</option>
              </select>

              <div className="flex border-2 border-brand-yellow rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 transition-all ${
                    viewMode === 'grid'
                      ? 'gradient-brand-primary text-brand-black'
                      : 'bg-white hover:bg-brand-yellow-light'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-3 transition-all ${
                    viewMode === 'list'
                      ? 'gradient-brand-primary text-brand-black'
                      : 'bg-white hover:bg-brand-yellow-light'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FILTRES AVANCÉS */}
        {showFilters && (
          <div className="card-brand shadow-brand-lg p-6 mb-6 animate-slideInDown">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gradient-brand flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filtres avancés
              </h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-brand-pink">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Prix */}
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-3">
                  <Tag className="w-4 h-4 inline mr-2 text-brand-cyan" />
                  Prix (FCFA)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    className="input-brand"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="input-brand"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  />
                </div>
              </div>

              {/* Couleur */}
              {availableColors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-brand-black mb-3">
                    <Sparkles className="w-4 h-4 inline mr-2 text-brand-yellow" />
                    Couleur
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="input-brand"
                  >
                    <option value="">Toutes les couleurs</option>
                    {availableColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Taille */}
              {availableSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-brand-black mb-3">
                    <Package className="w-4 h-4 inline mr-2 text-brand-green" />
                    Taille
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="input-brand"
                  >
                    <option value="">Toutes les tailles</option>
                    {availableSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-3">
                  <Star className="w-4 h-4 inline mr-2 text-brand-gold" />
                  Note minimale
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                        minRating === rating
                          ? 'border-brand-gold bg-brand-gold-light text-brand-black'
                          : 'border-gray-200 hover:border-brand-gold'
                      }`}
                    >
                      {rating === 0 ? 'Tout' : `${rating}+★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-3">
                  <CheckCircle className="w-4 h-4 inline mr-2 text-brand-green" />
                  Disponibilité
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-brand-yellow/30 rounded-lg hover:border-brand-yellow">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-5 h-5 text-brand-yellow rounded"
                  />
                  <span className="text-sm font-medium">En stock uniquement</span>
                </label>
              </div>

              {/* Livraison */}
              <div>
                <label className="block text-sm font-semibold text-brand-black mb-3">
                  <Package className="w-4 h-4 inline mr-2 text-brand-cyan" />
                  Livraison
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-brand-cyan/30 rounded-lg hover:border-brand-cyan">
                  <input
                    type="checkbox"
                    checked={freeShippingOnly}
                    onChange={(e) => setFreeShippingOnly(e.target.checked)}
                    className="w-5 h-5 text-brand-cyan rounded"
                  />
                  <span className="text-sm font-medium">Livraison gratuite</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* PRODUITS */}
        {paginatedProducts.length === 0 ? (
          <div className="card-brand shadow-brand p-16 text-center animate-fadeInScale">
            <Package className="w-20 h-20 text-brand-yellow mx-auto mb-6 animate-bounce-subtle" />
            <h3 className="text-2xl font-bold text-gradient-brand mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600 mb-6">Essayez d'ajuster vos filtres</p>
            <div className="flex gap-3 justify-center">
              <button onClick={clearAllFilters} className="btn-primary shine">
                Réinitialiser les filtres
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary">
                Retour à l'accueil
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {paginatedProducts.map((product, index) => (
                <div key={product.id} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    isFavorite={favorites.has(product.id)}
                    onToggleFavorite={toggleFavorite}
                    isInCompare={compareList.has(product.id)}
                    onToggleCompare={toggleCompare}
                    onShare={shareProduct}
                    onQuickView={() => setShowQuickView(product)}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-6 animate-fadeIn">
                <div className="text-sm text-gray-600 bg-brand-yellow-light px-4 py-2 rounded-lg">
                  Affichage de <span className="font-bold text-brand-black">{startIndex + 1}</span> à{' '}
                  <span className="font-bold text-brand-black">
                    {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                  </span>{' '}
                  sur <span className="font-bold text-brand-black">{filteredProducts.length}</span> produits
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPage(Math.max(1, page - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="px-4 py-2 border-2 border-brand-yellow rounded-lg hover:bg-brand-yellow-light disabled:opacity-40 transition-all font-medium flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 2 && pageNum <= page + 2)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`px-4 py-2 border-2 rounded-lg transition-all font-medium ${
                            page === pageNum
                              ? 'gradient-brand-primary text-brand-black border-transparent shadow-brand scale-110'
                              : 'border-brand-yellow/30 hover:bg-brand-yellow-light hover:border-brand-yellow'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => {
                      setPage(Math.min(totalPages, page + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === totalPages}
                    className="px-4 py-2 border-2 border-brand-yellow rounded-lg hover:bg-brand-yellow-light disabled:opacity-40 transition-all font-medium flex items-center gap-2"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      {showQuickView && (
        <QuickViewModal
          product={showQuickView}
          onClose={() => setShowQuickView(null)}
          onAddToCart={handleAddToCart}
          isFavorite={favorites.has(showQuickView.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}

// ProductCard avec couleurs de marque
function ProductCard({ product, onAddToCart, isFavorite, onToggleFavorite, isInCompare, onToggleCompare, onShare, onQuickView, viewMode }) {
  return (
    <div className="card-brand card-hover">
      <div className="relative aspect-square bg-gray-100 overflow-hidden rounded-t-xl">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Package className="w-20 h-20" />
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.stock === 0 && (
            <span className="badge-danger shadow-brand-pink">RUPTURE</span>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <span className="bg-brand-yellow text-brand-black text-xs font-bold px-3 py-1 rounded-full shadow-brand">
              {product.stock} restants
            </span>
          )}
          {product.shippingFee === 0 && (
            <span className="badge-success shadow-brand-green text-xs flex items-center gap-1">
              <Package className="w-3 h-3" />
              Gratuit
            </span>
          )}
          {(product.averageRating || 0) >= 4.5 && (
            <span className="bg-brand-gold text-brand-black text-xs font-bold px-2 py-1 rounded-full shadow-brand flex items-center gap-1">
              <Award className="w-3 h-3" />
              Top
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleFavorite(product.id)}
            className={`p-2.5 rounded-full shadow-brand backdrop-blur-sm transition-all hover:scale-110 ${
              isFavorite
                ? 'bg-brand-pink text-white'
                : 'glass-brand hover:bg-brand-pink-light'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={onQuickView}
            className="p-2.5 glass-brand rounded-full shadow-brand hover:bg-brand-cyan-light hover:scale-110 transition-all"
          >
            <Eye className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onShare(product)}
            className="p-2.5 glass-brand rounded-full shadow-brand hover:bg-brand-gold-light hover:scale-110 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onToggleCompare(product.id)}
            className={`p-2.5 rounded-full shadow-brand backdrop-blur-sm transition-all hover:scale-110 ${
              isInCompare
                ? 'bg-brand-cyan text-white'
                : 'glass-brand hover:bg-brand-cyan-light'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-lg text-gray-900 hover:text-brand-cyan transition-colors line-clamp-2 min-h-[3.5rem] mb-3">
            {product.name}
          </h3>
        </Link>

        {product.attributes && (
          <div className="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
            {product.attributes.color && (
              <div className="flex items-center gap-1.5 bg-brand-yellow-light px-2 py-1 rounded-lg border border-brand-yellow/30">
                <span
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: COLORS[product.attributes.color] || '#gray' }}
                />
                <span className="text-xs font-medium text-brand-black">
                  {product.attributes.color}
                </span>
              </div>
            )}
            {product.attributes.size && (
              <span className="bg-brand-cyan-light px-2 py-1 rounded-lg border border-brand-cyan/30 text-xs font-medium text-brand-cyan">
                📏 {product.attributes.size}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(product.averageRating || 0)
                  ? 'text-brand-gold fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-1 text-sm font-medium text-gray-700">
            {(product.averageRating || 0).toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({product.reviewCount || 0})
          </span>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold text-brand-yellow">
            {product.price.toLocaleString()} F
          </p>
          {product.shippingFee > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              + {product.shippingFee.toLocaleString()} F livraison
            </p>
          )}
        </div>

        <button
          onClick={() => onAddToCart(product.id, product.name)}
          disabled={product.stock === 0}
          className={`btn-primary w-full ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'shine'}`}
        >
          <ShoppingCart className="w-5 h-5 inline mr-2" />
          {product.stock === 0 ? 'Rupture' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}

// QuickViewModal avec couleurs de marque
function QuickViewModal({ product, onClose, onAddToCart, isFavorite, onToggleFavorite }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card-brand max-w-4xl w-full shadow-brand-lg animate-slideInUp">
        <div className="flex justify-between items-center p-6 border-b border-brand-yellow/20">
          <h3 className="text-2xl font-bold text-gradient-brand flex items-center gap-3">
            <Eye className="w-6 h-6" />
            Aperçu rapide
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-pink p-2 hover:bg-brand-pink-light rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.images?.[0] || 'https://via.placeholder.com/500'}
              alt={product.name}
              className="w-full aspect-square object-cover rounded-xl border-2 border-brand-yellow/20"
            />
          </div>

          <div className="flex flex-col">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h2>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.averageRating || 0)
                        ? 'text-brand-gold fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold">{(product.averageRating || 0).toFixed(1)}</span>
              <span className="text-gray-500">({product.reviewCount || 0} avis)</span>
            </div>

            <div className="mb-6 p-4 gradient-brand-primary rounded-xl">
              <p className="text-4xl font-bold text-brand-black mb-2">
                {product.price.toLocaleString()} FCFA
              </p>
              {product.shippingFee === 0 ? (
                <p className="text-brand-green font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Livraison gratuite
                </p>
              ) : (
                <p className="text-gray-600">
                  + {product.shippingFee.toLocaleString()} FCFA de livraison
                </p>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="mb-6">
              {product.stock > 0 ? (
                <p className="text-brand-green font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {product.stock} en stock
                </p>
              ) : (
                <p className="text-brand-pink font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Rupture de stock
                </p>
              )}
            </div>

            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-brand-black mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-brand-yellow-light hover:bg-brand-yellow text-brand-black rounded-lg font-bold"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-bold text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 bg-brand-yellow-light hover:bg-brand-yellow text-brand-black rounded-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => onToggleFavorite(product.id)}
                className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                  isFavorite
                    ? 'bg-brand-pink text-white'
                    : 'bg-brand-pink-light text-brand-pink hover:bg-brand-pink hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    onAddToCart(product.id, product.name);
                  }
                  onClose();
                }}
                disabled={product.stock === 0}
                className="flex-1 btn-primary shine disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                Ajouter au panier
              </button>
              
              <Link
                to={`/products/${product.id}`}
                onClick={onClose}
                className="px-6 py-4 bg-brand-cyan-light text-brand-cyan rounded-xl hover:bg-brand-cyan hover:text-white transition-all font-semibold"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}