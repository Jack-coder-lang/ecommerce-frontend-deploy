import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Truck } from 'lucide-react';
import { useAuthStore } from '../store';
import { inventoryAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const { user } = useAuthStore();
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [replenishmentForecast, setReplenishmentForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        if (user?.role === 'SELLER') {
          const [lowStockResponse, forecastResponse] = await Promise.all([
            inventoryAPI.getLowStock(),
            inventoryAPI.getForecast()
          ]);
          setLowStockAlerts(lowStockResponse.data);
          setReplenishmentForecast(forecastResponse.data);
        }
      } catch (error) {
        console.error('Erreur chargement inventaire:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [user]);

  if (user?.role !== 'SELLER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Accès réservé</h2>
          <p className="text-gray-600">Cette page est réservée aux vendeurs.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-brand-pink" />
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Stocks</h1>
        </div>

        <div className="space-y-6">
          {/* Alertes Stock Bas */}
          <div className="card-brand">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-brand-pink" />
              <h3 className="text-xl font-bold">Alertes Stock Bas</h3>
            </div>
            
            <div className="space-y-3">
              {lowStockAlerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune alerte de stock bas</p>
              ) : (
                lowStockAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="font-semibold">{alert.productName}</div>
                        <div className="text-sm text-red-600">
                          Stock: {alert.currentStock} - Seuil: {alert.threshold}
                        </div>
                      </div>
                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      Urgent
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Prévision Réapprovisionnement */}
          <div className="card-brand">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-brand-green" />
              <h3 className="text-xl font-bold">Prévision Réapprovisionnement</h3>
            </div>
            
            <div className="space-y-3">
              {replenishmentForecast.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune prévision disponible</p>
              ) : (
                replenishmentForecast.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-semibold">{item.productName}</div>
                        <div className="text-sm text-green-600">
                          Recommandé: {item.recommendedQuantity} unités
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">J+{item.daysUntilStockout}</div>
                      <div className="text-sm text-gray-500">jours restants</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}