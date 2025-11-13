# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React-based e-commerce frontend built with Vite, connecting to a backend API deployed on Render. Features include:
- Multi-role system (buyer, seller, admin)
- Real-time notifications via Socket.IO
- Shopping cart and checkout flow
- Seller dashboard with analytics, inventory, and order management
- Advanced features: preorders, barcode scanning, commission tracking, ticket system

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### State Management - Zustand Stores

**Multiple store definitions exist - be careful when modifying:**

1. **src/store/index.js** - Main store file with complete implementations
   - `useAuthStore`: Authentication with localStorage persistence and Socket.IO integration
   - `useCartStore`: Cart management with API synchronization
   - `useNotificationStore`: Notification handling with unread count

2. **Individual store files** (src/store/authStore.js, cartStore.js, notificationStore.js) - Alternative/legacy implementations
   - Some use Zustand persist middleware, others use manual localStorage
   - When making auth/cart changes, check both locations for consistency

**Critical:** The app uses stores from `src/store/index.js` primarily, but components may import from individual store files. Always verify which store is being used.

### API Layer

**Dual API configurations exist:**

1. **src/services/api.js** - Comprehensive API with organized endpoints by domain:
   - Axios instance with auth interceptors
   - Structured exports: `authAPI`, `productsAPI`, `cartAPI`, `ordersAPI`, `notificationsAPI`, `analyticsAPI`, `preorderAPI`, `inventoryAPI`, `commissionAPI`, `ticketAPI`, `barcodeAPI`, `paymentAPI`, `adminAPI`
   - Auto-redirects to /login on 401 errors

2. **src/utils/api.js** - Simpler Axios instance with basic error handling

**Backend URL configuration:**
- Environment variable: `VITE_API_URL` (with `/api` suffix) or `VITE_API_BASE_URL` (base URL)
- Default fallback: `https://ecommerce-backend-q0r2.onrender.com/api`
- Development proxy configured in vite.config.js for `/api` → `http://localhost:5000`

### Socket.IO Real-Time Features

**Two Socket.IO implementations:**

1. **src/services/socket.js** - Singleton SocketService class
   - Manual connect/disconnect methods
   - Used in older parts of the app

2. **src/hooks/useSocket.js** - React hook (primary)
   - Auto-connects when user is authenticated
   - Handles events: `new-notification`, `order-status-update`, `payment-success`
   - Shows toast notifications for real-time events
   - Dispatches window events for cross-component updates

**Socket URL:** Derived from `VITE_API_BASE_URL` or `VITE_API_URL` (strips `/api`), fallback to production backend

### Routing Structure

**Public routes:**
- `/` - Home page
- `/products` - All products listing
- `/login`, `/register` - Authentication
- `/contact` - Contact page

**User routes:**
- `/profile` - User profile management
- `/cart`, `/checkout` - Shopping flow
- `/orders`, `/orders/:orderId` - Order history
- `/notifications` - Notification center
- `/preorders`, `/tickets`, `/scan` - Advanced features

**Seller routes** (prefix: `/seller/`):
- `/seller/dashboard` - Seller overview
- `/seller/products`, `/seller/products/new` - Product management
- `/seller/orders`, `/seller/orders/:orderId` - Order fulfillment
- `/seller/analytics` - Sales analytics with Chart.js
- `/seller/inventory` - Stock management
- `/seller/commissions` - Commission tracking

**Admin routes:**
- `/admin` - Admin panel for user management

### Component Organization

- **src/components/** - Shared components (Header, Footer, ErrorBoundary, specialized systems)
- **src/pages/** - Page-level components
  - **src/pages/seller/** - Seller-specific pages
- **src/hooks/** - Custom React hooks (useSocket)
- **src/services/** - API clients and Socket.IO service
- **src/store/** - Zustand state management
- **src/constants/** - Configuration constants and color palette
- **src/utils/** - Utility functions

### Styling

- **Tailwind CSS** for all styling
- Custom color scheme defined in src/constants/colors.js
- Yellow brand color (#e8cf3a) used throughout
- Responsive design with mobile-first approach

### Authentication Flow

1. Login/Register → API call returns `{ user, token }`
2. Token stored in localStorage
3. Zustand store updates with user data
4. Socket.IO connects automatically via useSocket hook
5. Axios interceptor adds `Authorization: Bearer ${token}` to all requests
6. 401 responses trigger auto-logout and redirect to /login

### Key Dependencies

- **react-router-dom** (v6) - Client-side routing
- **zustand** - Lightweight state management
- **axios** - HTTP client
- **socket.io-client** - Real-time WebSocket connection
- **react-hot-toast** - Toast notifications
- **chart.js** + **react-chartjs-2** - Analytics charts
- **lucide-react** - Icon library
- **html5-qrcode** - Barcode scanning
- **vite-plugin-pwa** - Progressive Web App support

## Important Notes

### API Endpoints
Always use the structured API exports from `src/services/api.js` rather than calling axios directly. Example:
```javascript
import { productsAPI } from '../services/api';
const response = await productsAPI.getAll({ category: 'electronics' });
```

### Store Usage
Import stores from `src/store/index.js` unless working with legacy components that use individual store files. Check existing component imports before refactoring.

### Real-time Updates
Use window events for cross-component communication:
- `window.dispatchEvent(new Event('notification-update'))` - Reload notifications
- `window.dispatchEvent(new Event('order-update'))` - Reload orders

### Error Handling
The app includes global error handlers in main.jsx that suppress AbortError events. API interceptors handle 401 errors automatically.

### Environment Variables
- Development: Uses .env file (not committed)
- Production: Set via hosting platform (Vercel/Netlify)
- Required: `VITE_API_URL` or `VITE_API_BASE_URL`

### PWA Configuration
vite-plugin-pwa handles service worker registration automatically. Manifest configured in vite.config.js with yellow theme color (#e8cf3a).
