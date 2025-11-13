import { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useAuthStore } from '../store';
import { ticketAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const { isAuthenticated } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        if (isAuthenticated) {
          const response = await ticketAPI.getAll();
          setTickets(response.data);
        }
      } catch (error) {
        console.error('Erreur chargement tickets:', error);
        toast.error('Erreur lors du chargement des tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated]);

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      const response = await ticketAPI.create(newTicket);
      setTickets([response.data, ...tickets]);
      setNewTicket({ title: '', description: '' });
      toast.success('Ticket créé avec succès');
    } catch (error) {
      console.error('Erreur création ticket:', error);
      toast.error('Erreur lors de la création du ticket');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Connectez-vous</h2>
          <p className="text-gray-600">Vous devez être connecté pour accéder au support.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Chargement des tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Support & Tickets</h1>
        
        <div className="card-brand p-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-brand-cyan" />
            <h3 className="text-xl font-bold">Système de Tickets</h3>
          </div>

          {/* Formulaire nouveau ticket */}
          <form onSubmit={createTicket} className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Titre du ticket"
              value={newTicket.title}
              onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
              className="input-brand"
              required
            />
            <textarea
              placeholder="Description du problème"
              value={newTicket.description}
              onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
              className="input-brand h-24"
              required
            />
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" />
              Créer le Ticket
            </button>
          </form>

          {/* Liste des tickets */}
          <div className="space-y-3">
            <h4 className="font-semibold mb-3">Mes Tickets</h4>
            {tickets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun ticket créé</p>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="p-4 border border-gray-200 rounded-lg hover:border-brand-cyan transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <span className="font-semibold">{ticket.title}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status === 'open' ? 'Ouvert' : 
                       ticket.status === 'in_progress' ? 'En cours' : 'Résolu'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>#{ticket.id}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
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