import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const ProductPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { cartItems, addToCart, removeFromCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`shop/api/products/${slug}/`);
                setProduct(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching product", error);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const handleAddToCart = async () => {
        setUpdating(true);
        await addToCart(product.id);
        setUpdating(false);
    };

    const handleRemoveFromCart = async () => {
        setUpdating(true);
        await removeFromCart(product.id);
        setUpdating(false);
    };

    const cartQuantity = product ? (cartItems[product.id] || 0) : 0;

    if (loading) return (
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

    if (!product) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <div
                className="d-flex justify-content-center align-items-center mb-4"
                style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                }}
            >
                <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: '#667eea' }}></i>
            </div>
            <h2 className="fw-bold mb-3" style={{ fontSize: '32px' }}>Product not found</h2>
            <Link
                to="/"
                className="btn px-5 py-3"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '20px',
                    fontWeight: '600'
                }}
            >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Home
            </Link>
        </div>
    );

    return (
        <div
            className="container-fluid py-5 px-4"
            style={{ maxWidth: '1600px', margin: '0 auto' }}
        >
            <div className="row g-5">
                {/* Product Image */}
                <div className="col-lg-6">
                    <div
                        className="card border-0 shadow-lg overflow-hidden"
                        style={{ borderRadius: '24px' }}
                    >
                        {product.image ? (
                            <img
                                src={product.image}
                                className="card-img-top"
                                alt={product.name}
                                style={{ objectFit: 'cover', height: '550px' }}
                            />
                        ) : (
                            <div
                                className="d-flex justify-content-center align-items-center"
                                style={{
                                    height: '550px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                }}
                            >
                                <i className="bi bi-image" style={{ fontSize: '6rem' }}></i>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Details */}
                <div className="col-lg-6">
                    {/* Breadcrumb */}
                    <nav aria-label="breadcrumb" className="mb-4">
                        <ol className="breadcrumb" style={{ fontSize: '18px' }}>
                            <li className="breadcrumb-item">
                                <Link to="/" className="text-decoration-none" style={{ color: '#667eea' }}>
                                    <i className="bi bi-house me-1"></i>Home
                                </Link>
                            </li>
                            {product.category && (
                                <li className="breadcrumb-item">
                                    <Link
                                        to={`/category/${product.category.slug}`}
                                        className="text-decoration-none"
                                        style={{ color: '#667eea' }}
                                    >
                                        {product.category.name}
                                    </Link>
                                </li>
                            )}
                            <li className="breadcrumb-item active" style={{ color: '#6c757d' }}>
                                {product.name}
                            </li>
                        </ol>
                    </nav>

                    {/* Product Name */}
                    <h1
                        className="fw-bold mb-4"
                        style={{
                            fontSize: '42px',
                            color: '#1a1a2e',
                            lineHeight: '1.2'
                        }}
                    >
                        {product.name}
                    </h1>

                    {/* Price & Stock Badge */}
                    <div className="d-flex align-items-center gap-4 mb-4">
                        <span
                            className="fw-bold"
                            style={{
                                fontSize: '38px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            ${product.price}
                        </span>
                        {product.stock > 0 && product.stock <= 5 && (
                            <span
                                className="badge px-3 py-2"
                                style={{
                                    background: 'rgba(255, 193, 7, 0.2)',
                                    color: '#856404',
                                    fontSize: '16px',
                                    borderRadius: '50px'
                                }}
                            >
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                Only {product.stock} left!
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p
                        className="text-muted mb-4"
                        style={{
                            fontSize: '20px',
                            lineHeight: '1.8'
                        }}
                    >
                        {product.description || 'No description available for this product.'}
                    </p>

                    {/* Status Badges */}
                    <div className="d-flex gap-3 mb-5">
                        <span
                            className="badge px-4 py-2"
                            style={{
                                background: product.available
                                    ? 'rgba(40, 167, 69, 0.15)'
                                    : 'rgba(220, 53, 69, 0.15)',
                                color: product.available ? '#28a745' : '#dc3545',
                                fontSize: '18px',
                                borderRadius: '50px'
                            }}
                        >
                            <i className={`bi ${product.available ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                            {product.available ? 'In Stock' : 'Out of Stock'}
                        </span>
                        {product.category && (
                            <span
                                className="badge px-4 py-2"
                                style={{
                                    background: 'rgba(102, 126, 234, 0.15)',
                                    color: '#667eea',
                                    fontSize: '18px',
                                    borderRadius: '50px'
                                }}
                            >
                                <i className="bi bi-tag me-2"></i>
                                {product.category.name}
                            </span>
                        )}
                    </div>

                    {/* Add to Cart Section */}
                    {product.stock <= 0 ? (
                        <div
                            className="alert d-flex align-items-center gap-3"
                            style={{
                                background: 'rgba(220, 53, 69, 0.1)',
                                border: '1px solid rgba(220, 53, 69, 0.3)',
                                borderRadius: '16px',
                                color: '#dc3545',
                                fontSize: '20px',
                                padding: '20px'
                            }}
                        >
                            <i className="bi bi-exclamation-triangle" style={{ fontSize: '24px' }}></i>
                            <span>This product is currently out of stock</span>
                        </div>
                    ) : cartQuantity === 0 ? (
                        <button
                            type="button"
                            className="btn px-5 py-4"
                            onClick={handleAddToCart}
                            disabled={updating}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                fontSize: '24px',
                                fontWeight: '600',
                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {updating ? (
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
                    ) : (
                        <div className="d-flex align-items-center gap-4 flex-wrap">
                            {/* Quantity Controls */}
                            <div
                                className="d-flex align-items-center"
                                style={{
                                    background: '#f1f3f5',
                                    borderRadius: '50px',
                                    padding: '10px'
                                }}
                            >
                                <button
                                    className="btn rounded-circle d-flex justify-content-center align-items-center"
                                    style={{
                                        width: '55px',
                                        height: '55px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '24px'
                                    }}
                                    onClick={handleRemoveFromCart}
                                    disabled={updating}
                                >
                                    <i className="bi bi-dash-lg"></i>
                                </button>
                                <span
                                    className="px-5 fw-bold"
                                    style={{
                                        fontSize: '28px',
                                        minWidth: '80px',
                                        textAlign: 'center',
                                        color: '#1a1a2e'
                                    }}
                                >
                                    {updating ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        cartQuantity
                                    )}
                                </span>
                                <button
                                    className="btn rounded-circle d-flex justify-content-center align-items-center"
                                    style={{
                                        width: '55px',
                                        height: '55px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '24px'
                                    }}
                                    onClick={handleAddToCart}
                                    disabled={updating || cartQuantity >= product.stock}
                                >
                                    <i className="bi bi-plus-lg"></i>
                                </button>
                            </div>

                            {/* View Cart Button */}
                            <button
                                className="btn px-5 py-3"
                                onClick={() => navigate('/cart')}
                                style={{
                                    background: 'transparent',
                                    border: '2px solid #667eea',
                                    color: '#667eea',
                                    borderRadius: '50px',
                                    fontSize: '20px',
                                    fontWeight: '600'
                                }}
                            >
                                <i className="bi bi-cart me-2"></i>
                                View Cart
                            </button>
                        </div>
                    )}

                    {/* Product Info Cards */}
                    <div className="row g-3 mt-5">
                        <div className="col-6 col-md-4">
                            <div
                                className="text-center p-4"
                                style={{
                                    background: '#f8f9fa',
                                    borderRadius: '16px'
                                }}
                            >
                                <i className="bi bi-truck" style={{ fontSize: '32px', color: '#667eea' }}></i>
                                <p className="mb-0 mt-2" style={{ fontSize: '16px', color: '#6c757d' }}>Free Shipping</p>
                            </div>
                        </div>
                        <div className="col-6 col-md-4">
                            <div
                                className="text-center p-4"
                                style={{
                                    background: '#f8f9fa',
                                    borderRadius: '16px'
                                }}
                            >
                                <i className="bi bi-shield-check" style={{ fontSize: '32px', color: '#667eea' }}></i>
                                <p className="mb-0 mt-2" style={{ fontSize: '16px', color: '#6c757d' }}>Secure Payment</p>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div
                                className="text-center p-4"
                                style={{
                                    background: '#f8f9fa',
                                    borderRadius: '16px'
                                }}
                            >
                                <i className="bi bi-arrow-repeat" style={{ fontSize: '32px', color: '#667eea' }}></i>
                                <p className="mb-0 mt-2" style={{ fontSize: '16px', color: '#6c757d' }}>Easy Returns</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
