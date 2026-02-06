import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import SearchBar from './SearchBar';

const Navbar = () => {
    const [categories, setCategories] = useState([]);
    const { itemCount } = useCart();
    const { wishlistCount } = useWishlist();
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    // Decode JWT to get username
    const decodeToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        // Fetch Categories
        const fetchCategories = async () => {
            try {
                const response = await api.get('shop/api/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };

        // Get username from token
        if (token && token !== 'null' && token !== 'undefined') {
            const decoded = decodeToken(token);
            if (decoded && decoded.username) {
                setUsername(decoded.username);
            } else if (decoded && decoded.user_id) {
                setUsername('User');
            }
        } else {
            setUsername('');
        }

        fetchCategories();
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setToken(null);
        setUsername('');
        navigate('/login');
    };

    return (
        <nav
            className="navbar navbar-expand-lg shadow-sm"
            style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                padding: '1.5rem 0'
            }}
        >
            <div className="container-fluid px-5">
                <Link
                    className="navbar-brand fw-bold"
                    to="/"
                    style={{
                        fontSize: '2.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}
                >
                    J J Mall
                </Link>
                <button
                    className="navbar-toggler border-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    {/* Search Bar */}
                    <div className="mx-lg-4 my-3 my-lg-0" style={{ flex: '1', maxWidth: '500px' }}>
                        <SearchBar />
                    </div>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle text-white px-4 py-2"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                style={{ fontSize: '32px' }}
                            >
                                <i className="bi bi-grid me-2" style={{ fontSize: '32px' }}></i>
                                Categories
                            </a>
                            <ul className="dropdown-menu dropdown-menu-dark" style={{ minWidth: '200px' }}>
                                <li>
                                    <Link className="dropdown-item py-3" style={{ fontSize: '1.2rem' }} to="/">
                                        <i className="bi bi-box-seam me-2"></i>All Products
                                    </Link>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                {categories.map(cat => (
                                    <li key={cat.id}>
                                        <Link className="dropdown-item py-3" style={{ fontSize: '1.2rem' }} to={`/category/${cat.slug}`}>
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li className="nav-item">
                            <Link
                                className="nav-link text-white px-4 py-2 d-flex align-items-center"
                                to="/cart"
                                style={{ fontSize: '32px' }}
                            >
                                <i className="bi bi-cart3 me-2" style={{ fontSize: '32px' }}></i>
                                Cart
                                {itemCount > 0 && (
                                    <span
                                        className="badge rounded-pill ms-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            fontSize: '20px',
                                            padding: '0.5em 0.8em'
                                        }}
                                    >
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className="nav-link text-white px-4 py-2 d-flex align-items-center"
                                to="/wishlist"
                                style={{ fontSize: '32px' }}
                            >
                                <i className="bi bi-heart me-2" style={{ fontSize: '32px', color: '#e74c3c' }}></i>
                                Wishlist
                                {wishlistCount > 0 && (
                                    <span
                                        className="badge rounded-pill ms-2"
                                        style={{
                                            background: '#e74c3c',
                                            fontSize: '20px',
                                            padding: '0.5em 0.8em'
                                        }}
                                    >
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                        </li>
                    </ul>
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item" id="auth-links">
                            {token ? (
                                <div className="dropdown">
                                    <button
                                        className="btn px-4 py-3 text-white dropdown-toggle d-flex align-items-center"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        style={{
                                            fontSize: '24px',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '50px'
                                        }}
                                    >
                                        <i className="bi bi-person-circle me-2" style={{ fontSize: '28px' }}></i>
                                        {username || 'User'}
                                    </button>
                                    <ul
                                        className="dropdown-menu dropdown-menu-end shadow-lg"
                                        style={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            padding: '10px',
                                            minWidth: '220px',
                                            marginTop: '10px',
                                            zIndex: 9999
                                        }}
                                    >
                                        <li>
                                            <div
                                                className="dropdown-item-text px-3 py-2 text-muted"
                                                style={{ fontSize: '16px' }}
                                            >
                                                Signed in as
                                            </div>
                                            <div
                                                className="dropdown-item-text px-3 pb-2 fw-bold"
                                                style={{ fontSize: '20px', color: '#1a1a2e' }}
                                            >
                                                {username || 'User'}
                                            </div>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <Link
                                                className="dropdown-item py-3 px-3 d-flex align-items-center"
                                                to="/orders"
                                                style={{ fontSize: '18px', borderRadius: '10px' }}
                                            >
                                                <i className="bi bi-bag me-3" style={{ fontSize: '20px', color: '#667eea' }}></i>
                                                My Orders
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                className="dropdown-item py-3 px-3 d-flex align-items-center"
                                                to="/addresses"
                                                style={{ fontSize: '18px', borderRadius: '10px' }}
                                            >
                                                <i className="bi bi-geo-alt me-3" style={{ fontSize: '20px', color: '#667eea' }}></i>
                                                Address Book
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                className="dropdown-item py-3 px-3 d-flex align-items-center"
                                                to="/profile"
                                                style={{ fontSize: '18px', borderRadius: '10px' }}
                                            >
                                                <i className="bi bi-gear me-3" style={{ fontSize: '20px', color: '#667eea' }}></i>
                                                Settings
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button
                                                className="dropdown-item py-3 px-3 d-flex align-items-center text-danger"
                                                onClick={handleLogout}
                                                style={{ fontSize: '18px', borderRadius: '10px' }}
                                            >
                                                <i className="bi bi-box-arrow-right me-3" style={{ fontSize: '20px' }}></i>
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center gap-3">
                                    <Link
                                        className="btn px-5 py-3 text-white"
                                        to="/login"
                                        style={{
                                            fontSize: '24px',
                                            background: 'transparent',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            borderRadius: '50px'
                                        }}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        className="btn px-5 py-3 text-white"
                                        to="/register"
                                        style={{
                                            fontSize: '24px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '50px'
                                        }}
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
