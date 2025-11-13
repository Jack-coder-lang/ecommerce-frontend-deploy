import { useState, useEffect } from 'react';
import { Bell, Calendar, Users, TrendingUp } from 'lucide-react';
import { preorderAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function PreorderSystem({ product }) {
  const [preorders, setPreorders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const createPreorder = async (quantity) => {
    try {
      const response = await preorderAPI.create({
        productId: product.id,
        quantity,
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      });
      toast.success('Précommandé ! Vous serez notifié à la disponibilité');
    } catch (error) {
      toast.error('Erreur lors de la précommande');
    }
  };

  return (
    <div className="card-brand p-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6 text-brand-cyan" />
        <h3 className="text-xl font-bold">Précommander ce produit</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-4 bg-brand-cyan-light rounded-xl">
          <Users className="w-8 h-8 text-brand-cyan mx-auto mb-2" />
          <div className="text-2xl font-bold">{preorders.length}</div>
          <div className="text-sm text-gray-600">Précommandes</div>
        </div>
        <div className="text-center p-4 bg-brand-yellow-light rounded-xl">
          <TrendingUp className="w-8 h-8 text-brand-yellow mx-auto mb-2" />
          <div className="text-2xl font-bold">87%</div>
          <div className="text-sm text-gray-600">Taux de conversion</div>
        </div>
      </div>

      <button 
        onClick={() => createPreorder(1)}
        className="w-full btn-primary"
      >
        <Bell className="w-5 h-5 inline mr-2" />
        Précommander - Disponible dans 7 jours
      </button>
    </div>
  );
}