import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Header from './components/Header';
import AuthHeader from './components/AuthHeader';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import OrderConfirmation from './pages/OrderConfirmation';
import PaymentMethodsPage from './pages/PaymentMethods';
import AdminAuth from './pages/AdminAuth';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Component to conditionally render header and footer
const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminPage = location.pathname.startsWith('/secret-fuji-admin');
  const showFooter = location.pathname === '/' && !isAdminPage;

  useEffect(() => {
    if (isAdminPage) {
      document.body.classList.add('admin-page-body');
    } else {
      document.body.classList.remove('admin-page-body');
    }
  }, [isAdminPage]);

  return (
    <div className={`app ${isAdminPage ? 'admin-app' : ''}`}>
      {!isAdminPage && (isAuthPage ? <AuthHeader /> : <Header />)}
      <main className={`main-content ${isAuthPage ? 'auth-main-content' : ''} ${isAdminPage ? 'admin-main-content' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/payment-methods" element={<PaymentMethodsPage />} />
          <Route path="/secret-fuji-admin" element={<AdminAuth />} />
          <Route path="/secret-fuji-admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {showFooter && !isAdminPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
