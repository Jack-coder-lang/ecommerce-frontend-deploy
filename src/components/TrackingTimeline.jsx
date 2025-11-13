// Composant de suivi de colis en temps réel
import { useState, useEffect } from 'react';
import {
  Package, Clock, CheckCircle, Truck, MapPin, Box,
  Calendar, User, Phone, AlertCircle, Navigation
} from 'lucide-react';

export default function TrackingTimeline({ order, onRefresh }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);

  // Auto-refresh countdown
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefresh?.();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  const getTrackingSteps = () => {
    const steps = [
      {
        key: 'PENDING',
        label: 'Commande reçue',
        description: 'Votre commande a été enregistrée avec succès',
        icon: Package,
        color: 'blue',
        timestamp: order?.createdAt,
      },
      {
        key: 'PROCESSING',
        label: 'En préparation',
        description: 'Votre commande est en cours de traitement',
        icon: Box,
        color: 'yellow',
        timestamp: order?.statusHistory?.find(h => h.status === 'PROCESSING')?.createdAt,
      },
      {
        key: 'SHIPPED',
        label: 'Expédiée',
        description: 'Votre colis est en route',
        icon: Truck,
        color: 'purple',
        timestamp: order?.statusHistory?.find(h => h.status === 'SHIPPED')?.createdAt,
      },
      {
        key: 'DELIVERED',
        label: 'Livrée',
        description: 'Votre commande a été livrée',
        icon: CheckCircle,
        color: 'green',
        timestamp: order?.statusHistory?.find(h => h.status === 'DELIVERED')?.createdAt,
      },
    ];

    const currentIndex = steps.findIndex(step => step.key === order?.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      current: index === currentIndex,
      upcoming: index > currentIndex,
    }));
  };

  const getEstimatedDelivery = () => {
    if (order?.status === 'DELIVERED') return null;

    const orderDate = new Date(order?.createdAt);
    const estimatedDate = new Date(orderDate);

    // Estimation: 3-5 jours ouvrables
    const daysToAdd = order?.status === 'SHIPPED' ? 2 : 5;
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);

    return estimatedDate;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', ring: 'ring-blue-500' },
      PROCESSING: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', ring: 'ring-yellow-500' },
      SHIPPED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', ring: 'ring-purple-500' },
      DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', ring: 'ring-green-500' },
      CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', ring: 'ring-red-500' },
    };
    return colors[status] || colors.PENDING;
  };

  const steps = getTrackingSteps();
  const estimatedDelivery = getEstimatedDelivery();
  const statusColor = getStatusColor(order?.status);

  if (order?.status === 'CANCELLED') {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-red-900 mb-2">Commande annulée</h3>
        <p className="text-red-700">
          Cette commande a été annulée le{' '}
          {new Date(order.updatedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statut actuel */}
      <div className={`${statusColor.bg} border-2 ${statusColor.border} rounded-2xl p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 ${statusColor.bg} rounded-xl flex items-center justify-center ring-4 ${statusColor.ring} ring-opacity-20`}>
                {steps.find(s => s.current)?.icon && (
                  <div className="animate-pulse">
                    {(() => {
                      const Icon = steps.find(s => s.current)?.icon;
                      return <Icon className={`w-6 h-6 ${statusColor.text}`} />;
                    })()}
                  </div>
                )}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${statusColor.text}`}>
                  {steps.find(s => s.current)?.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {steps.find(s => s.current)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Auto-refresh toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                autoRefresh
                  ? 'bg-white text-gray-700 border-2 border-gray-300'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {autoRefresh ? (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Auto ({countdown}s)
                </span>
              ) : (
                'Manuel'
              )}
            </button>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Livraison estimée */}
        {estimatedDelivery && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Livraison estimée:{' '}
              <span className={`${statusColor.text} font-bold`}>
                {estimatedDelivery.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Timeline détaillée */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-gray-700" />
          Suivi détaillé
        </h4>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.key} className="relative">
                {/* Ligne de connexion */}
                {!isLast && (
                  <div
                    className={`absolute left-6 top-12 w-0.5 h-full -ml-px ${
                      step.completed || step.current
                        ? 'bg-gradient-to-b from-gray-800 to-gray-400'
                        : 'bg-gray-200'
                    }`}
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Icône */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      step.completed
                        ? 'bg-gray-800 shadow-lg scale-110'
                        : step.current
                        ? `${statusColor.bg} ring-4 ${statusColor.ring} ring-opacity-30 animate-pulse`
                        : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        step.completed
                          ? 'text-white'
                          : step.current
                          ? statusColor.text
                          : 'text-gray-400'
                      }`}
                    />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5
                          className={`font-semibold text-lg ${
                            step.completed || step.current ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </h5>
                        <p
                          className={`text-sm mt-1 ${
                            step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                          }`}
                        >
                          {step.description}
                        </p>

                        {/* Timestamp */}
                        {step.timestamp && (
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {new Date(step.timestamp).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Badge de statut */}
                      {step.completed && (
                        <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          Terminé
                        </span>
                      )}
                      {step.current && (
                        <span className={`${statusColor.bg} ${statusColor.text} text-xs px-3 py-1 rounded-full font-semibold`}>
                          En cours
                        </span>
                      )}
                      {step.upcoming && (
                        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-semibold">
                          À venir
                        </span>
                      )}
                    </div>

                    {/* Informations supplémentaires pour l'étape actuelle */}
                    {step.current && order?.trackingInfo && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="space-y-2 text-sm">
                          {order.trackingInfo.carrier && (
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">
                                Transporteur: <strong>{order.trackingInfo.carrier}</strong>
                              </span>
                            </div>
                          )}
                          {order.trackingInfo.trackingNumber && (
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">
                                N° suivi: <strong>{order.trackingInfo.trackingNumber}</strong>
                              </span>
                            </div>
                          )}
                          {order.trackingInfo.currentLocation && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">
                                Position: <strong>{order.trackingInfo.currentLocation}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informations de contact */}
      <div className="bg-gradient-to-br from-brand-cyan-light to-brand-yellow-light border-2 border-brand-cyan rounded-2xl p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Besoin d'aide ?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Service client</p>
              <p className="font-semibold text-gray-900">+225 01 02 03 04 05</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-brand-pink" />
            </div>
            <div>
              <p className="text-xs text-gray-600">N° de commande</p>
              <p className="font-semibold text-gray-900">#{order?.orderNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
