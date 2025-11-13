// frontend/src/pages/seller/Products.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getSellerProducts();
      setProducts(response.data.products || []);
    } catch (error) {
      toast.error('Erreur chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    
    try {
      await productsAPI.delete(id);
      toast.success('Produit supprimé');
      fetchProducts();
    } catch (error) {
      toast.error('Erreur suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-800 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Mes produits</h1>
          <Link 
            to="/seller/products/new" 
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-md flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau produit</span>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Aucun produit</p>
            <Link 
              to="/seller/products/new" 
              className="inline-block bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-md transition-colors"
            >
              Créer votre premier produit
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-semibold">
                      {product.price.toLocaleString()} F
                    </span>
                    <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Link 
                      to={`/products/${product.id}`}
                      className="flex-1 text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Voir
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}