// frontend/src/pages/seller/NewProduct.jsx - VERSION AMÉLIORÉE
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Package, DollarSign, Hash, Image as ImageIcon,
  Tag, Weight, Ruler, Truck, Plus, X, Eye, Upload, Save, AlertCircle
} from 'lucide-react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAutoSave } from '../../hooks/useAutoSave';
import { validateProductForm, calculateShippingFee } from '../../utils/productValidation';
import imageUploadService from '../../services/imageUploadService';

const AUTO_SAVE_KEY = 'new_product_draft';

export default function NewProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'ELECTRONICS',
    images: [''],
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    shippingFee: '1000'
  });

  // Validation en temps réel
  const {
    errors,
    touched,
    validateField,
    touchField,
    getFieldError,
    validate,
    resetErrors
  } = useFormValidation(validateProductForm);

  // Auto-save
  const { getSavedData, clearSavedData } = useAutoSave(AUTO_SAVE_KEY, formData, 2000);

  // Charger les données sauvegardées au montage
  useEffect(() => {
    const savedData = getSavedData();
    if (savedData) {
      const shouldRestore = window.confirm(
        'Un brouillon non sauvegardé a été trouvé. Voulez-vous le restaurer ?'
      );
      if (shouldRestore) {
        setFormData(savedData);
        toast.success('Brouillon restauré');
      } else {
        clearSavedData();
      }
    }
  }, []);

  // Calculer automatiquement les frais de livraison
  useEffect(() => {
    if (formData.weight || (formData.dimensions.length && formData.dimensions.width && formData.dimensions.height)) {
      const suggestedFee = calculateShippingFee(formData.weight, formData.dimensions);
      if (suggestedFee !== parseFloat(formData.shippingFee)) {
        // Suggérer mais ne pas forcer
        console.log('Frais de livraison suggérés:', suggestedFee);
      }
    }
  }, [formData.weight, formData.dimensions]);

  const categories = [
    { value: 'ELECTRONICS', label: 'Électronique', icon: '📱' },
    { value: 'CLOTHING', label: 'Vêtements', icon: '👕' },
    { value: 'SHOES', label: 'Chaussures', icon: '👟' },
    { value: 'BAGS', label: 'Sacs', icon: '👜' },
    { value: 'ACCESSORIES', label: 'Accessoires', icon: '⌚' },
    { value: 'CONTAINERS', label: 'Contenants', icon: '🥤' },
    { value: 'FOOD', label: 'Alimentation', icon: '🍎' },
    { value: 'BOOKS', label: 'Livres', icon: '📚' },
    { value: 'SPORTS', label: 'Sport', icon: '⚽' },
    { value: 'HOME', label: 'Maison', icon: '🏠' },
    { value: 'BEAUTY', label: 'Beauté', icon: '💄' },
    { value: 'TOYS', label: 'Jouets', icon: '🧸' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valider le formulaire complet
    const isValid = validate(formData);
    if (!isValid) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    // 🔥 VÉRIFICATION: Utilisateur connecté et authentifié
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
      toast.error('Vous devez être connecté. Redirection vers la page de connexion...');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (user.role !== 'SELLER' && user.role !== 'seller') {
      toast.error('Vous devez être vendeur pour créer un produit');
      setTimeout(() => navigate('/'), 1500);
      return;
    }

    setLoading(true);

    try {
      // Récupérer l'utilisateur connecté
      const user = JSON.parse(localStorage.getItem('user'));

      // Construire l'objet de données
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        images: formData.images.filter(img => img.trim() !== ''),
        shippingFee: parseFloat(formData.shippingFee) || 1000,

        // Ajouter les champs optionnels seulement s'ils sont définis
        ...(formData.weight && { weight: parseFloat(formData.weight) }),
        ...(formData.dimensions.length && formData.dimensions.width && formData.dimensions.height && {
          dimensions: {
            length: parseFloat(formData.dimensions.length),
            width: parseFloat(formData.dimensions.width),
            height: parseFloat(formData.dimensions.height)
          }
        })
      };

      // Validation supplémentaire
      if (data.images.length === 0) {
        toast.error('Ajoutez au moins une image');
        setLoading(false);
        return;
      }

      // Log des données envoyées pour debugging
      console.log('📤 Données envoyées au backend:', JSON.stringify(data, null, 2));

      const response = await productsAPI.create(data);
      console.log('✅ Réponse du backend:', response.data);

      toast.success('✅ Produit créé avec succès !');

      // Supprimer le brouillon après succès
      clearSavedData();

      navigate('/seller/products');
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      console.error('❌ Réponse serveur:', error.response?.data);
      console.error('❌ Status:', error.response?.status);

      // Extraire le message d'erreur le plus détaillé possible
      let errorMessage = 'Erreur lors de la création du produit';

      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage = errorData.message ||
                      errorData.error ||
                      errorData.details ||
                      JSON.stringify(errorData);
      } else if (error.message) {
        errorMessage = error.message;
      }

      // 🔥 GESTION SPÉCIFIQUE: Erreur d'authentification
      if (error.response?.status === 500 &&
          (errorMessage.includes('undefined') ||
           errorMessage.includes('user') ||
           errorMessage.includes('id'))) {

        console.error('🔥 ERREUR D\'AUTHENTIFICATION DÉTECTÉE');
        console.error('Le backend ne peut pas lire req.user - Token possiblement invalide');

        toast.error(
          'Erreur d\'authentification. Veuillez vous reconnecter.',
          { duration: 5000 }
        );

        // Proposer de se reconnecter
        setTimeout(() => {
          const shouldReconnect = window.confirm(
            'Votre session semble expirée. Voulez-vous vous reconnecter ?'
          );
          if (shouldReconnect) {
            localStorage.clear();
            navigate('/login');
          }
        }, 1000);

        return;
      }

      // 🔥 GESTION SPÉCIFIQUE: Token invalide/expiré
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 1500);
        return;
      }

      toast.error(errorMessage, { duration: 5000 });

      // Afficher une alerte avec les détails pour debugging
      if (error.response?.status === 500) {
        console.error('🔥 ERREUR SERVEUR 500 - Vérifiez les logs du backend');
        console.error('Données qui ont causé l\'erreur:', formData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'upload d'images via fichier
  const handleImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImages(true);
    setUploadProgress(0);

    try {
      const url = await imageUploadService.uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });

      const newImages = [...formData.images];
      newImages[index] = url;
      setFormData({ ...formData, images: newImages });

      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(error.message || 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  // Gestion du changement de champs avec validation
  const handleFieldChange = useCallback((field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Valider le champ si déjà touché
    if (touched[field]) {
      validateField(field, value, newFormData);
    }
  }, [formData, touched, validateField]);

  // Gestion du blur pour marquer comme touché et valider
  const handleFieldBlur = useCallback((field) => {
    touchField(field);
    validateField(field, formData[field], formData);
  }, [formData, touchField, validateField]);

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages.length > 0 ? newImages : [''] });
  };

  const updateImage = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Link
          to="/seller/products"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour aux produits</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Titre */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Nouveau produit
              </h1>
              <p className="text-gray-600 mt-2">Ajoutez un nouveau produit à votre catalogue</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">Aperçu</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Informations générales
              </h2>

              <div className="space-y-4">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="100"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      getFieldError('name')
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    onBlur={() => handleFieldBlur('name')}
                    placeholder="Ex: iPhone 14 Pro Max 256GB"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">{formData.name.length}/100 caractères</p>
                    {getFieldError('name') && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getFieldError('name')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={5}
                    maxLength="1000"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                      getFieldError('description')
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    onBlur={() => handleFieldBlur('description')}
                    placeholder="Décrivez votre produit en détail... (caractéristiques, état, etc.)"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">{formData.description.length}/1000 caractères</p>
                    {getFieldError('description') && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getFieldError('description')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Prix et Stock */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Prix et inventaire
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prix */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prix (FCFA) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        getFieldError('price')
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                      }`}
                      value={formData.price}
                      onChange={(e) => handleFieldChange('price', e.target.value)}
                      onBlur={() => handleFieldBlur('price')}
                      placeholder="10000"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">F</span>
                  </div>
                  {getFieldError('price') && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {getFieldError('price')}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantité en stock *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        getFieldError('stock')
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                      }`}
                      value={formData.stock}
                      onChange={(e) => handleFieldChange('stock', e.target.value)}
                      onBlur={() => handleFieldBlur('stock')}
                      placeholder="50"
                    />
                  </div>
                  {getFieldError('stock') && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {getFieldError('stock')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                Images du produit
              </h2>

              <div className="space-y-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="url"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                          value={image}
                          onChange={(e) => updateImage(index, e.target.value)}
                          placeholder={`URL de l'image ${index + 1}`}
                        />
                      </div>
                      <label className="p-3 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-xl transition-colors cursor-pointer flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, index)}
                          disabled={uploadingImages}
                        />
                      </label>
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="p-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      {image && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200">
                          <img src={image} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                    {uploadingImages && index === formData.images.length - 1 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-purple-600 h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                ))}
                {getFieldError('images') && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('images')}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={addImageField}
                disabled={formData.images.length >= 10}
                className="mt-3 w-full px-4 py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Ajouter une image {formData.images.length >= 10 ? '(Maximum atteint)' : ''}
              </button>

              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Utilisez des images de haute qualité (recommandé: 800x800px minimum)
                </p>
                <p className="flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Vous pouvez uploader directement vos images ou entrer une URL
                </p>
                <p className="flex items-center gap-1">
                  <Save className="w-3 h-3" />
                  Votre brouillon est automatiquement sauvegardé toutes les 2 secondes
                </p>
              </div>
            </div>

            {/* Détails de livraison */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                Informations de livraison
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Poids */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Poids (kg)
                  </label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="0.5"
                    />
                  </div>
                </div>

                {/* Frais de livraison */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Frais de livraison (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    value={formData.shippingFee}
                    onChange={(e) => setFormData({ ...formData, shippingFee: e.target.value })}
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Dimensions (cm) - Optionnel
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    value={formData.dimensions.length}
                    onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, length: e.target.value } })}
                    placeholder="Longueur"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    value={formData.dimensions.width}
                    onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, width: e.target.value } })}
                    placeholder="Largeur"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    value={formData.dimensions.height}
                    onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, height: e.target.value } })}
                    placeholder="Hauteur"
                  />
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (formData.name || formData.description || formData.price) {
                    const shouldLeave = window.confirm(
                      'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?'
                    );
                    if (shouldLeave) {
                      navigate('/seller/products');
                    }
                  } else {
                    navigate('/seller/products');
                  }
                }}
                disabled={loading}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Création en cours...
                  </span>
                ) : uploadingImages ? (
                  <span className="flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5 animate-pulse" />
                    Upload en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Package className="w-5 h-5" />
                    Créer le produit
                  </span>
                )}
              </button>
            </div>

            {/* Résumé des erreurs si présentes */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-2">Erreurs de validation</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Prévisualisation */}
        {showPreview && formData.name && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Aperçu du produit
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {formData.images[0] && (
                  <img
                    src={formData.images[0]}
                    alt={formData.name}
                    className="w-full h-64 object-cover rounded-xl"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x400?text=Image+non+disponible'}
                  />
                )}
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-2">{formData.name}</h4>
                <p className="text-3xl font-bold text-green-600 mb-4">{formData.price ? `${parseFloat(formData.price).toLocaleString()} F` : '---'}</p>
                <p className="text-gray-600 mb-4">{formData.description}</p>
                <div className="space-y-2 text-sm">
                  <p><strong>Stock:</strong> {formData.stock || '---'} unités</p>
                  <p><strong>Catégorie:</strong> {categories.find(c => c.value === formData.category)?.label}</p>
                  {formData.weight && <p><strong>Poids:</strong> {formData.weight} kg</p>}
                  <p><strong>Livraison:</strong> {formData.shippingFee ? `${parseFloat(formData.shippingFee).toLocaleString()} F` : 'Gratuite'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
