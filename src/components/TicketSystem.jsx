import { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ticketAPI } from '../services/api';

export default function TicketSystem() {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const response = await ticketAPI.getAll();
    setTickets(response.data.tickets);
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      await ticketAPI.create(newTicket);
      setNewTicket({ title: '', description: '' });
      fetchTickets();
      toast.success('Ticket créé avec succès');
    } catch (error) {
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

  return (
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
        <button type="submit" className="btn-primary">
          Créer le Ticket
        </button>
      </form>

      {/* Liste des tickets */}
      <div className="space-y-3">
        {tickets.map(ticket => (
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
        ))}
      </div>
    </div>
  );
}