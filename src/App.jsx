// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSocket } from './hooks/useSocket';
import { useNotificationPolling } from './hooks/useNotificationPolling';

// Layouts
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Notifications from './pages/Notifications';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import StyleGuide from './pages/StyleGuide';
import AdminPanel from './pages/AdminPanel';

// Pages Vendeur
import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/Products';
import NewProduct from './pages/seller/NewProduct';
import SellerOrders from './pages/seller/Orders';
import SellerOrderDetail from './pages/seller/OrderDetail';
import SellerAnalytics from './pages/seller/Analytics';

// Nouvelles Pages
import PreordersPage from './pages/PreordersPage';
import InventoryPage from './pages/InventoryPage';
import CommissionsPage from './pages/CommissionsPage';
import TicketsPage from './pages/TicketsPage';
import BarcodeScanPage from './pages/BarcodeScanPage';

export default function App() {
  console.log('📱 App component rendu');

  try {
    useSocket();
  } catch (error) {
    console.error('❌ Erreur dans useSocket:', error);
  }

  // Polling des notifications (alternative à Socket.IO pour Vercel)
  useNotificationPolling();

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/forgot-password" element={<div className="min-h-screen flex items-center justify-center">Page mot de passe oublié - En construction</div>} />
            
            {/* Routes utilisateur */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/style-guide" element={<StyleGuide />} />
            
            {/* Nouvelles Routes */}
            <Route path="/preorders" element={<PreordersPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/scan" element={<BarcodeScanPage />} />
            
            {/* Routes Vendeur */}
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/products/new" element={<NewProduct />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/orders/:orderId" element={<SellerOrderDetail />} />
            <Route path="/seller/analytics" element={<SellerAnalytics />} />
            <Route path="/seller/inventory" element={<InventoryPage />} />
            <Route path="/seller/commissions" element={<CommissionsPage />} />
            
            {/* Route Admin */}
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
          },
        }}
      />
    </BrowserRouter>
  );
}