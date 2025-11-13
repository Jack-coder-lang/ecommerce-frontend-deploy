// frontend/src/pages/seller/NewProduct.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function NewProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Électronique',
    images: [''],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: formData.images.filter(img => img.trim() !== ''),
      };

      await productsAPI.create(data);
      toast.success('Produit créé');
      navigate('/seller/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          to="/seller/products"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour aux produits</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <h1 className="text-2xl font-semibold mb-6">Nouveau produit</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="iPhone 14 Pro Max"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée du produit..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (FCFA) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="250000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Électronique">Électronique</option>
                <option value="Mode">Mode</option>
                <option value="Maison">Maison</option>
                <option value="Sport">Sport</option>
                <option value="Gaming">Gaming</option>
                <option value="Livres">Livres</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                value={formData.images[0]}
                onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Exemple: https://images.unsplash.com/photo-...
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/seller/products')}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gray-800 text-white py-2.5 rounded-md hover:bg-gray-900 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}