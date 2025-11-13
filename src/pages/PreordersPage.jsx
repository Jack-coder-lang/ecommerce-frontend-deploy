import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Package, Bell, Clock } from 'lucide-react';
import { useAuthStore } from '../store';
import { preorderAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function PreordersPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreorders = async () => {
      try {
        if (isAuthenticated) {
          const response = await preorderAPI.getUserPreorders();
          setPreorders(response.data);
        }
      } catch (error) {
        console.error('Erreur chargement précommandes:', error);
        toast.error('Erreur lors du chargement des précommandes');
      } finally {
        setLoading(false);
      }
    };

    fetchPreorders();
  }, [isAuthenticated]);

  // Notifications temps réel
  useEffect(() => {
    const handlePreorderNotification = (data) => {
      toast.success(
        <div>
          <div className="font-semibold">Votre précommande est disponible !</div>
          <div>{data.productName} est maintenant en stock</div>
          <button 
            onClick={() => window.location.href = `/product/${data.productId}`}
            className="mt-2 text-sm underline"
          >
            Finaliser l'achat
          </button>
        </div>,
        { duration: 10000 }
      );
    };

    if (window.socket) {
      window.socket.on('preorder-available', handlePreorderNotification);
    }

    return () => {
      if (window.socket) {
        window.socket.off('preorder-available', handlePreorderNotification);
      }
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Connectez-vous</h2>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour voir vos précommandes</p>
          <Link to="/login" className="btn-primary">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Chargement des précommandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="w-8 h-8 text-brand-cyan" />
          <h1 className="text-3xl font-bold text-gray-900">Mes Précommandes</h1>
        </div>

        <div className="grid gap-6">
          {preorders.length === 0 ? (
            <div className="card-brand text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune précommande</h3>
              <p className="text-gray-600 mb-6">Vous n'avez pas encore de précommandes.</p>
              <Link to="/products" className="btn-primary">
                Découvrir les produits
              </Link>
            </div>
          ) : (
            preorders.map(preorder => (
              <div key={preorder.id} className="card-brand">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {preorder.product.images?.[0] && (
                        <img
                          src={preorder.product.images[0]}
                          alt={preorder.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{preorder.product.name}</h3>
                      <p className="text-gray-600">Quantité: {preorder.quantity}</p>
                      <p className="text-sm text-brand-cyan flex items-center gap-1">
                        <Bell className="w-4 h-4" />
                        Disponible le {new Date(preorder.expectedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-yellow">
                      {(preorder.product.price * preorder.quantity).toLocaleString()} F
                    </p>
                    <div className="flex items-center gap-1 text-sm text-orange-600 mt-1">
                      <Clock className="w-4 h-4" />
                      En attente
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}