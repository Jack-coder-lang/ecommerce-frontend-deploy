// frontend/src/pages/seller/Products.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { Plus, Edit, Trash2, Package, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
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

  // Fonction pour déterminer le niveau de stock
  const getStockStatus = (stock) => {
    if (stock === 0) {
      return {
        level: 'out',
        label: 'Rupture de stock',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: AlertTriangle,
        iconColor: 'text-red-600'
      };
    } else if (stock <= 10) {
      return {
        level: 'low',
        label: 'Stock faible',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: AlertCircle,
        iconColor: 'text-orange-600'
      };
    } else if (stock <= 30) {
      return {
        level: 'medium',
        label: 'Stock moyen',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: AlertCircle,
        iconColor: 'text-yellow-600'
      };
    } else {
      return {
        level: 'good',
        label: 'Stock bon',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-800 border-t-transparent"></div>
      </div>
    );
  }

  // Calculer les statistiques de stock
  const stockStats = products.reduce((acc, product) => {
    const status = getStockStatus(product.stock);
    acc[status.level] = (acc[status.level] || 0) + 1;
    return acc;
  }, {});

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

        {/* Alertes de stock */}
        {products.length > 0 && (stockStats.out > 0 || stockStats.low > 0) && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {stockStats.out > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-semibold text-red-800">Rupture de stock</p>
                    <p className="text-sm text-red-700">
                      {stockStats.out} produit{stockStats.out > 1 ? 's' : ''} en rupture de stock
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stockStats.low > 0 && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <p className="font-semibold text-orange-800">Stock faible</p>
                    <p className="text-sm text-orange-700">
                      {stockStats.low} produit{stockStats.low > 1 ? 's' : ''} avec un stock faible (≤10)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              const StockIcon = stockStatus.icon;

              return (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 relative">
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

                    {/* Badge de stock en haut à droite */}
                    {stockStatus.level !== 'good' && (
                      <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full border ${stockStatus.color} flex items-center space-x-1.5 shadow-md`}>
                        <StockIcon className={`w-4 h-4 ${stockStatus.iconColor}`} />
                        <span className="text-xs font-semibold">{stockStatus.label}</span>
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
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          stockStatus.level === 'out' ? 'text-red-600' :
                          stockStatus.level === 'low' ? 'text-orange-600' :
                          stockStatus.level === 'medium' ? 'text-yellow-700' :
                          'text-green-600'
                        }`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>

                    {/* Barre de progression du stock */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            stockStatus.level === 'out' ? 'bg-red-500' :
                            stockStatus.level === 'low' ? 'bg-orange-500' :
                            stockStatus.level === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                        ></div>
                      </div>
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
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                        title="Supprimer le produit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}