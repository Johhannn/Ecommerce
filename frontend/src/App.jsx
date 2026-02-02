import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Router>
      <CartProvider>
        <Navbar />
        <LoginModal />
        <div className="container-fluid px-5 mt-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:slug" element={<HomePage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
