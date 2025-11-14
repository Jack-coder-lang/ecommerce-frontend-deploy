# Frontend Errors Analysis & Solutions

## Date: 2025-11-14

## Critical Issues Identified

### 1. EXCESSIVE NOTIFICATION POLLING (HIGH Priority)

**Problem:**
- Hundreds of `/notifications` API calls happening continuously
- Application is making notification requests almost every second instead of every 30 seconds
- This causes:
  - High server load
  - Unnecessary data usage
  - Poor performance
  - Potential rate limiting issues

**Root Cause:**
The `useNotificationPolling` hook in `App.jsx` is re-initializing on every render because:
1. The hook has dependencies `[isAuthenticated, token, interval]` (line 110)
2. Every time these change, the interval is cleared and restarted
3. The `token` object might be getting recreated on each render, causing constant restarts
4. Additionally, the hook dispatches `notification-update` events which trigger Header to fetch unread count

**Solution:**
- Increase polling interval from 30 seconds to 60 seconds (less aggressive)
- Add proper cleanup and prevent multiple intervals from running
- Use `useRef` to track if polling is already active
- Memoize the token to prevent unnecessary re-renders

---

### 2. MISSING BACKEND ENDPOINTS (HIGH Priority)

**Problem:**
Multiple 404 errors indicating missing backend endpoints:

#### Admin Endpoints:
- `GET /api/admin/stats` → 404
- `GET /api/admin/users` → 404
- `GET /api/admin/users/pending` → 404

#### Payment Endpoint:
- `POST /api/payments/cinetpay/initialize` → 404

**Impact:**
- Admin panel is completely broken
- CinetPay payment integration doesn't work
- Users cannot pay via Mobile Money or Card

**Solution:**
**BACKEND FIXES REQUIRED:**
1. Implement missing admin routes in backend
2. Implement CinetPay payment initialization endpoint
3. Ensure proper route registration

**FRONTEND TEMPORARY FIX:**
- Add error boundaries to Admin panel
- Gracefully handle missing endpoints
- Show user-friendly error messages instead of console errors

---

### 3. INITIAL CHECKOUT 500 ERROR (MEDIUM Priority)

**Problem:**
- First checkout attempt returns 500 error: `POST /api/orders` → 500
- Subsequent attempts work correctly
- Error message: "Erreur serveur: [error details]"

**Possible Causes:**
- Database connection timeout on first request
- Backend cold start (Vercel serverless)
- Invalid data format on first attempt
- Race condition with cart synchronization

**Solution:**
- Add retry logic for 500 errors (1 automatic retry)
- Better error messages to help debug
- Backend: Add better logging for 500 errors

---

## Implementation Plan

### Step 1: Fix Notification Polling (URGENT)
File: `src/hooks/useNotificationPolling.js`
- Increase interval to 60 seconds
- Add ref to prevent multiple intervals
- Add better cleanup logic
- Prevent hook from restarting unnecessarily

### Step 2: Fix Admin Panel Error Handling
File: `src/pages/AdminPanel.jsx` (need to review)
- Add loading states
- Add error boundaries
- Show "Feature not available" message when endpoints return 404
- Prevent continuous retry on 404 errors

### Step 3: Fix Payment Integration
File: `src/pages/Checkout.jsx`
- Add better error handling for CinetPay 404
- Show clear message: "CinetPay integration not yet available"
- Fallback to cash payment

### Step 4: Add Checkout Retry Logic
File: `src/pages/Checkout.jsx`
- Add automatic retry for 500 errors (once)
- Add exponential backoff
- Better error reporting

---

## Priority Order

1. **CRITICAL**: Fix notification polling (causing performance issues NOW)
2. **HIGH**: Add error handling for missing endpoints (better UX)
3. **MEDIUM**: Add checkout retry logic
4. **BACKEND**: Implement missing endpoints (separate task)

---

## Backend Changes Required

Create a separate backend task to implement:

1. **Admin Routes** (`backend/routes/admin.js`):
   ```javascript
   GET  /api/admin/stats           // Admin statistics
   GET  /api/admin/users           // Get all users
   GET  /api/admin/users/pending   // Get pending users
   PUT  /api/admin/users/:id/approve
   PUT  /api/admin/users/:id/reject
   ```

2. **CinetPay Payment** (`backend/routes/payments.js`):
   ```javascript
   POST /api/payments/cinetpay/initialize
   GET  /api/payments/cinetpay/check/:transactionId
   POST /api/payments/cinetpay/notify   // Webhook
   ```

---

## Testing Checklist

After implementing fixes:

- [ ] Verify notification polling happens only once per 60 seconds
- [ ] Verify no excessive API calls in console
- [ ] Admin panel shows graceful error instead of 404s
- [ ] Checkout shows clear message when CinetPay unavailable
- [ ] 500 errors are retried once automatically
- [ ] All user-facing errors have clear, actionable messages
