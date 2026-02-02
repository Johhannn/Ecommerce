import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingProduct, setUpdatingProduct] = useState(null);
    const { slug } = useParams();
    const { cartItems, addToCart, removeFromCart } = useCart();

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = 'shop/api/products/';
                if (slug) {
                    url += `?category=${slug}`;
                }
                const response = await api.get(url);
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products", error);
            }
            setLoading(false);
        };

        fetchProducts();
    }, [slug]);

    const handleAddToCart = async (productId) => {
        setUpdatingProduct(productId);
        await addToCart(productId);
        setUpdatingProduct(null);
    };

    const handleRemoveFromCart = async (productId) => {
        setUpdatingProduct(productId);
        await removeFromCart(productId);
        setUpdatingProduct(null);
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: '70vh' }}
            >
                <div
                    className="spinner-border"
                    style={{ width: '4rem', height: '4rem', color: '#667eea' }}
                    role="status"
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="container-fluid py-5 px-4"
            style={{
                maxWidth: '1800px',
                margin: '0 auto',
                minHeight: '80vh'
            }}
        >
            {/* Page Header */}
            <div className="text-center mb-5">
                <h1
                    className="fw-bold mb-3"
                    style={{
                        fontSize: '3rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}
                >
                    {slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'All Products'}
                </h1>
                <p className="text-muted" style={{ fontSize: '1.3rem' }}>
                    {products.length} products available
                </p>
            </div>

            {/* Products Grid */}
            <div className="row g-4">
                {products.map(product => (
                    <div className="col-sm-6 col-lg-4 col-xl-3" key={product.id}>
                        <div
                            className="card h-100 border-0 shadow"
                            style={{
                                borderRadius: '20px',
                                overflow: 'hidden',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                background: '#fff'
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
                            <Link to={`/product/${product.slug}`} className="text-decoration-none">
                                <div style={{ position: 'relative', overflow: 'hidden' }}>
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            className="card-img-top"
                                            alt={product.name}
                                            style={{
                                                height: '280px',
                                                objectFit: 'cover',
                                                transition: 'transform 0.3s ease'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="d-flex justify-content-center align-items-center"
                                            style={{
                                                height: '280px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            }}
                                        >
                                            <i className="bi bi-image text-white" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                    )}
                                    {/* Price Badge */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '15px',
                                            right: '15px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '50px',
                                            fontWeight: '700',
                                            fontSize: '1.2rem',
                                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                                        }}
                                    >
                                        ${product.price}
                                    </div>
                                </div>
                            </Link>

                            <div className="card-body p-4">
                                <Link to={`/product/${product.slug}`} className="text-decoration-none">
                                    <h5
                                        className="card-title fw-bold mb-3"
                                        style={{
                                            fontSize: '1.4rem',
                                            color: '#1a1a2e',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {product.name}
                                    </h5>
                                </Link>

                                <div className="d-grid">
                                    {cartItems[product.id] ? (
                                        // Quantity Controls
                                        <div
                                            className="d-flex align-items-center justify-content-center"
                                            style={{
                                                background: '#f1f3f5',
                                                borderRadius: '50px',
                                                padding: '8px'
                                            }}
                                        >
                                            <button
                                                className="btn rounded-circle d-flex justify-content-center align-items-center"
                                                style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontSize: '1.5rem'
                                                }}
                                                onClick={() => handleRemoveFromCart(product.id)}
                                                disabled={updatingProduct === product.id}
                                            >
                                                <i className="bi bi-dash-lg"></i>
                                            </button>
                                            <span
                                                className="px-4 fw-bold"
                                                style={{
                                                    fontSize: '1.3rem',
                                                    minWidth: '60px',
                                                    textAlign: 'center',
                                                    color: '#1a1a2e'
                                                }}
                                            >
                                                {updatingProduct === product.id ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    cartItems[product.id]
                                                )}
                                            </span>
                                            <button
                                                className="btn rounded-circle d-flex justify-content-center align-items-center"
                                                style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontSize: '1.5rem'
                                                }}
                                                onClick={() => handleAddToCart(product.id)}
                                                disabled={updatingProduct === product.id}
                                            >
                                                <i className="bi bi-plus-lg"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        // Add to Cart Button
                                        <button
                                            className="btn py-3"
                                            onClick={() => handleAddToCart(product.id)}
                                            disabled={updatingProduct === product.id}
                                            style={{
                                                background: updatingProduct === product.id
                                                    ? '#ccc'
                                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {updatingProduct === product.id ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-cart-plus me-2"></i>
                                                    Add to Cart
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {products.length === 0 && !loading && (
                <div className="text-center py-5">
                    <div
                        className="d-inline-flex justify-content-center align-items-center mb-4"
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                        }}
                    >
                        <i className="bi bi-box-seam" style={{ fontSize: '4rem', color: '#667eea' }}></i>
                    </div>
                    <h2 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>No products found</h2>
                    <p className="text-muted mb-4" style={{ fontSize: '1.2rem' }}>
                        Try browsing a different category
                    </p>
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
                        <i className="bi bi-arrow-left me-2"></i>
                        View All Products
                    </Link>
                </div>
            )}
        </div>
    );
};

export default HomePage;
