// App.jsx — Main router
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Customer pages
import HomePage from './pages/customer/HomePage';
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import PaymentSuccessPage from './pages/customer/PaymentSuccessPage';
import PaymentFailedPage from './pages/customer/PaymentFailedPage';
import InvoicePage from './pages/customer/InvoicePage';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminDeliveryBoys from './pages/admin/AdminDeliveryBoys';
import AdminSettings from './pages/admin/AdminSettings';

// Delivery pages
import DeliveryLogin from './pages/delivery/DeliveryLogin';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

const ProtectedAdmin = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

const ProtectedDelivery = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'delivery') return <Navigate to="/delivery/login" replace />;
  return children;
};

const ProtectedCustomer = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/order/:id/track" element={<OrderTrackingPage />} />

      {/* Customer */}
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/failed" element={<PaymentFailedPage />} />
      <Route path="/invoice/:id" element={<InvoicePage />} />
      <Route path="/orders" element={<ProtectedCustomer><OrderHistoryPage /></ProtectedCustomer>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
      <Route path="/admin/orders" element={<ProtectedAdmin><AdminOrders /></ProtectedAdmin>} />
      <Route path="/admin/menu" element={<ProtectedAdmin><AdminMenu /></ProtectedAdmin>} />
      <Route path="/admin/coupons" element={<ProtectedAdmin><AdminCoupons /></ProtectedAdmin>} />
      <Route path="/admin/delivery-boys" element={<ProtectedAdmin><AdminDeliveryBoys /></ProtectedAdmin>} />
      <Route path="/admin/settings" element={<ProtectedAdmin><AdminSettings /></ProtectedAdmin>} />

      {/* Delivery */}
      <Route path="/delivery/login" element={<DeliveryLogin />} />
      <Route path="/delivery/dashboard" element={<ProtectedDelivery><DeliveryDashboard /></ProtectedDelivery>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px', borderRadius: '8px' },
              success: { style: { background: '#fdf6ec', border: '1px solid #c8501a', color: '#1a0f05' } },
              error: { style: { background: '#fff5f5', border: '1px solid #ef4444', color: '#7f1d1d' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
