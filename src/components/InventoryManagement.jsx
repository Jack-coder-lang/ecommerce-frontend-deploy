import { useState, useEffect } from 'react';
import { AlertTriangle, Truck, TrendingUp, Package } from 'lucide-react';
import { inventoryAPI } from '../services/api';

export default function InventoryManagement() {
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [replenishmentForecast, setReplenishmentForecast] = useState([]);

  useEffect(() => {
    fetchLowStockAlerts();
    fetchReplenishmentForecast();
  }, []);

  const fetchLowStockAlerts = async () => {
    const response = await inventoryAPI.getLowStock();
    setLowStockAlerts(response.data.alerts);
  };

  const fetchReplenishmentForecast = async () => {
    const response = await inventoryAPI.getForecast();
    setReplenishmentForecast(response.data.forecast);
  };

  return (
    <div className="space-y-6">
      {/* Alertes Stock Bas */}
      <div className="card-brand">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-brand-pink" />
          <h3 className="text-xl font-bold">Alertes Stock Bas</h3>
        </div>
        
        <div className="space-y-3">
          {lowStockAlerts.map(alert => (
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
          ))}
        </div>
      </div>

      {/* Prévision Réapprovisionnement */}
      <div className="card-brand">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-brand-green" />
          <h3 className="text-xl font-bold">Prévision Réapprovisionnement</h3>
        </div>
        
        <div className="space-y-3">
          {replenishmentForecast.map(item => (
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
          ))}
        </div>
      </div>
    </div>
  );
}   