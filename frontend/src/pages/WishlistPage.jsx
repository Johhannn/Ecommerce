import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState({ items: [], count: 0 });
    const [loading, setLoading] = useState(true);
    const [updatingProduct, setUpdatingProduct] = useState(null);
    const { cartItems, addToCart } = useCart();
    const { removeFromWishlist, refreshWishlist } = useWishlist();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await api.get('shop/api/wishlist/');
            setWishlist(response.data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
        setLoading(false);
    };

    const handleRemove = async (productId) => {
        setUpdatingProduct(productId);
        const success = await removeFromWishlist(productId);
        if (success) {
            setWishlist(prev => ({
                ...prev,
                items: prev.items.filter(item => item.product.id !== productId),
                count: prev.count - 1
            }));
        }
        setUpdatingProduct(null);
    };

    const handleAddToCart = async (productId) => {
        setUpdatingProduct(productId);
        await addToCart(productId);
        setUpdatingProduct(null);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border" style={{ color: '#667eea', width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5" style={{ maxWidth: '1200px' }}>
            {/* Header */}
            <div className="d-flex align-items-center mb-5">
                <Link to="/" className="btn btn-outline-secondary rounded-circle me-3" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-arrow-left"></i>
                </Link>
                <h1 className="fw-bold mb-0" style={{ fontSize: '40px' }}>
                    <i className="bi bi-heart me-3" style={{ color: '#e74c3c' }}></i>
                    My Wishlist
                    {wishlist.count > 0 && (
                        <span className="badge ms-3" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontSize: '20px'
                        }}>
                            {wishlist.count} items
                        </span>
                    )}
                </h1>
            </div>

            {wishlist.items.length === 0 ? (
                <div className="text-center py-5">
                    <div
                        className="d-inline-flex justify-content-center align-items-center mb-4"
                        style={{
                            width: '160px',
                            height: '160px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                        }}
                    >
                        <i className="bi bi-heart" style={{ fontSize: '4rem', color: '#e74c3c' }}></i>
                    </div>
                    <h2 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>Your wishlist is empty</h2>
                    <p className="text-muted mb-4 fs-5">Start adding products you love!</p>
                    <Link
                        to="/"
                        className="btn btn-lg px-5 py-3"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            fontWeight: '600',
                            fontSize: '1.2rem'
                        }}
                    >
                        <i className="bi bi-shop me-2"></i>
                        Explore Products
                    </Link>
                </div>
            ) : (
                <div className="row g-4">
                    {wishlist.items.map((item) => (
                        <div key={item.id} className="col-md-6 col-lg-4">
                            <div
                                className="card h-100 border-0 shadow"
                                style={{
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                }}
                            >
                                {/* Remove button */}
                                <button
                                    className="btn btn-light position-absolute d-flex align-items-center justify-content-center"
                                    style={{
                                        top: '12px',
                                        right: '12px',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        zIndex: 10,
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                    }}
                                    onClick={() => handleRemove(item.product.id)}
                                    disabled={updatingProduct === item.product.id}
                                >
                                    {updatingProduct === item.product.id ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <i className="bi bi-heart-fill" style={{ color: '#e74c3c', fontSize: '18px' }}></i>
                                    )}
                                </button>

                                <Link to={`/product/${item.product.slug}`} className="text-decoration-none">
                                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                                        {item.product.image ? (
                                            <img
                                                src={item.product.image}
                                                className="card-img-top"
                                                alt={item.product.name}
                                                style={{ height: '220px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div
                                                className="d-flex justify-content-center align-items-center"
                                                style={{
                                                    height: '220px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                }}
                                            >
                                                <i className="bi bi-image text-white" style={{ fontSize: '3rem' }}></i>
                                            </div>
                                        )}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '12px',
                                                left: '12px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                padding: '6px 14px',
                                                borderRadius: '50px',
                                                fontWeight: '700',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            ${item.product.price}
                                        </div>
                                    </div>
                                </Link>

                                <div className="card-body p-4">
                                    <Link to={`/product/${item.product.slug}`} className="text-decoration-none">
                                        <h6 className="card-title fw-bold mb-2" style={{ color: '#1a1a2e', fontSize: '1.1rem' }}>
                                            {item.product.name}
                                        </h6>
                                    </Link>
                                    <p className="text-muted small mb-3">
                                        <i className="bi bi-folder me-1"></i>
                                        {item.product.category}
                                    </p>

                                    <div className="d-grid">
                                        {!item.product.available || item.product.stock === 0 ? (
                                            <button className="btn py-2" disabled style={{
                                                background: '#e9ecef',
                                                color: '#6c757d',
                                                borderRadius: '50px',
                                                fontWeight: '600'
                                            }}>
                                                Out of Stock
                                            </button>
                                        ) : cartItems[item.product.id] ? (
                                            <Link
                                                to="/cart"
                                                className="btn py-2"
                                                style={{
                                                    background: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50px',
                                                    fontWeight: '600',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                <i className="bi bi-check-circle me-2"></i>In Cart
                                            </Link>
                                        ) : (
                                            <button
                                                className="btn py-2"
                                                onClick={() => handleAddToCart(item.product.id)}
                                                disabled={updatingProduct === item.product.id}
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {updatingProduct === item.product.id ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <><i className="bi bi-cart-plus me-2"></i>Add to Cart</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
