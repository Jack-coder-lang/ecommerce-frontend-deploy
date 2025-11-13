// frontend/src/pages/Contact.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    // Simuler l'envoi
    setTimeout(() => {
      toast.success('Message envoyé avec succès ! Nous vous répondrons bientôt.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            Contactez-nous
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Une question, une suggestion ou besoin d'aide ? 
            Notre équipe est là pour vous répondre.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* INFORMATIONS DE CONTACT */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                  <p className="text-sm text-gray-600">
                    Cocody, Abidjan<br />
                    Côte d'Ivoire
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 mb-6">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                  <p className="text-sm text-gray-600">
                    +225 07 77 12 34 56
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-sm text-gray-600">
                    contact@eshop.ci
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 text-white rounded-lg p-6">
              <h3 className="font-semibold mb-2">Horaires d'ouverture</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Lundi - Vendredi: 8h - 18h</p>
                <p>Samedi: 9h - 17h</p>
                <p>Dimanche: Fermé</p>
              </div>
            </div>
          </div>

          {/* FORMULAIRE DE CONTACT */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Envoyez-nous un message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Question sur une commande"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Votre message..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  <span>{sending ? 'Envoi en cours...' : 'Envoyer le message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}