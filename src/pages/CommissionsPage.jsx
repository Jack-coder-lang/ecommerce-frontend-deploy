import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, PieChart } from 'lucide-react';
import { useAuthStore } from '../store';
import { commissionAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function CommissionsPage() {
  const { user } = useAuthStore();
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissionsData = async () => {
      try {
        if (user?.role === 'SELLER') {
          const [commissionsResponse, statsResponse] = await Promise.all([
            commissionAPI.getAll(),
            commissionAPI.getStats()
          ]);
          setCommissions(commissionsResponse.data);
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Erreur chargement commissions:', error);
        toast.error('Erreur lors du chargement des commissions');
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionsData();
  }, [user]);

  if (user?.role !== 'SELLER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
          <DollarSign className="w-16 h-16 text-gray-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Chargement des commissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Commissions</h1>
        
        <div className="card-brand p-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-6 h-6 text-brand-green" />
            <h3 className="text-xl font-bold">Système de Commissions</h3>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-brand-green-light rounded-xl">
              <TrendingUp className="w-6 h-6 text-brand-green mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalCommissions?.toLocaleString()} F</div>
              <div className="text-sm text-gray-600">Commissions totales</div>
            </div>
            <div className="text-center p-4 bg-brand-cyan-light rounded-xl">
              <Users className="w-6 h-6 text-brand-cyan mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.activeAffiliates}</div>
              <div className="text-sm text-gray-600">Affiliés actifs</div>
            </div>
          </div>

          {/* Liste des commissions */}
          <div className="space-y-3">
            <h4 className="font-semibold mb-3">Commissions récentes</h4>
            {commissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune commission enregistrée</p>
            ) : (
              commissions.map(commission => (
                <div key={commission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold">{commission.affiliateName}</div>
                    <div className="text-sm text-gray-600">{commission.productName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-green">
                      +{commission.amount.toLocaleString()} F
                    </div>
                    <div className="text-sm text-gray-500">{commission.rate}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}