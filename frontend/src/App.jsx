import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';

// Lazy Load Pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('./pages/OrderDetailPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
const AddressBookPage = React.lazy(() => import('./pages/AddressBookPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));

// Admin Pages
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const DashboardOverview = React.lazy(() => import('./pages/admin/DashboardOverview'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminReviews = React.lazy(() => import('./pages/admin/AdminReviews'));

// Loading Fallback
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Customer Routes (with Navbar and Container) */}
              <Route element={
                <>
                  <Navbar />
                  <LoginModal />
                  <div className="container-fluid px-5 mt-4">
                    <Outlet />
                  </div>
                </>
              }>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:slug" element={<HomePage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:orderId" element={<OrderDetailPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/addresses" element={<AddressBookPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Admin Routes (Standalone Layout) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardOverview />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="reviews" element={<AdminReviews />} />
              </Route>
            </Routes>
          </Suspense>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
