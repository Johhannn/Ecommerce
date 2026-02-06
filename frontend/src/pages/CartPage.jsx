import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingItem, setUpdatingItem] = useState(null);
    const { addToCart, removeFromCart, fullRemoveFromCart, fetchCart: refreshGlobalCart } = useCart();

    const fetchCart = async () => {
        try {
            const response = await api.get('cart/api/');
            setCart(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching cart", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleIncrement = async (productId) => {
        setUpdatingItem(productId);
        try {
            await addToCart(productId); // Use context function to update global state
            await fetchCart(); // Update local cart display
        } catch (error) {
            console.error(error);
        }
        setUpdatingItem(null);
    };

    const handleDecrement = async (productId) => {
        setUpdatingItem(productId);
        try {
            await removeFromCart(productId); // Use context function to update global state
            await fetchCart(); // Update local cart display
        } catch (error) {
            console.error(error);
        }
        setUpdatingItem(null);
    };

    const handleRemove = async (productId) => {
        setUpdatingItem(productId);
        try {
            await fullRemoveFromCart(productId); // Use context function to update global state
            await fetchCart(); // Update local cart display
        } catch (error) {
            console.error(error);
        }
        setUpdatingItem(null);
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
                <div
                    className="d-flex justify-content-center align-items-center mb-4"
                    style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                    }}
                >
                    <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#667eea' }}></i>
                </div>
                <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>Your cart is empty</h1>
                <p className="text-muted mb-4 fs-5">Looks like you haven't added anything to your cart yet.</p>
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
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4 px-lg-5 py-5" style={{ maxWidth: '1800px', margin: '0 auto' }}>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-5">
                <h1 className="fw-bold mb-0" style={{ fontSize: '48px' }}>
                    <i className="bi bi-cart3 me-3" style={{ color: '#667eea', fontSize: '48px' }}></i>
                    Shopping Cart
                </h1>
                <span
                    className="badge rounded-pill px-5 py-3"
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '22px'
                    }}
                >
                    {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'}
                </span>
            </div>

            <div className="row g-5">
                {/* Cart Items */}
                <div className="col-12 col-xl-8">
                    <div
                        className="card border-0 shadow"
                        style={{ borderRadius: '24px', overflow: 'hidden' }}
                    >
                        <div className="card-body p-0">
                            {/* Table Header */}
                            <div
                                className="d-none d-md-flex px-4 py-4"
                                style={{
                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                    borderBottom: '1px solid #dee2e6'
                                }}
                            >
                                <div style={{ width: '45%', fontSize: '20px' }} className="fw-semibold text-muted">Product</div>
                                <div style={{ width: '25%', fontSize: '20px' }} className="fw-semibold text-muted text-center">Quantity</div>
                                <div style={{ width: '20%', fontSize: '20px' }} className="fw-semibold text-muted text-center">Subtotal</div>
                                <div style={{ width: '10%' }}></div>
                            </div>

                            {/* Cart Items */}
                            {cart.items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="px-4 py-4"
                                    style={{
                                        borderBottom: index < cart.items.length - 1 ? '1px solid #e9ecef' : 'none',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                                        {/* Product Image & Info */}
                                        <div className="d-flex align-items-center gap-4" style={{ width: '45%', minWidth: '250px' }}>
                                            <div
                                                className="overflow-hidden flex-shrink-0"
                                                style={{
                                                    width: '150px',
                                                    height: '150px',
                                                    borderRadius: '16px',
                                                    background: '#f8f9fa',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                                }}
                                            >
                                                {item.product.image ? (
                                                    <img
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="d-flex justify-content-center align-items-center h-100"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                        }}
                                                    >
                                                        <i className="bi bi-image text-white" style={{ fontSize: '2.5rem' }}></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/product/${item.product.slug}`}
                                                    className="text-decoration-none"
                                                >
                                                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '26px' }}>
                                                        {item.product.name}
                                                    </h5>
                                                </Link>
                                                <p className="text-muted mb-0" style={{ fontSize: '20px' }}>
                                                    ${item.product.price} each
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div style={{ width: '25%' }} className="d-flex justify-content-center">
                                            <div
                                                className="d-flex align-items-center"
                                                style={{
                                                    background: '#f1f3f5',
                                                    borderRadius: '50px',
                                                    padding: '8px 12px'
                                                }}
                                            >
                                                <button
                                                    className="btn btn-light rounded-circle d-flex justify-content-center align-items-center"
                                                    style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        border: 'none',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                    onClick={() => handleDecrement(item.product.id)}
                                                    disabled={updatingItem === item.product.id}
                                                >
                                                    <i className="bi bi-dash-lg"></i>
                                                </button>
                                                <span
                                                    className="px-4 fw-bold"
                                                    style={{
                                                        minWidth: '70px',
                                                        textAlign: 'center',
                                                        fontSize: '26px'
                                                    }}
                                                >
                                                    {updatingItem === item.product.id ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        item.quantity
                                                    )}
                                                </span>
                                                <button
                                                    className="btn btn-light rounded-circle d-flex justify-content-center align-items-center"
                                                    style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        border: 'none',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                    onClick={() => handleIncrement(item.product.id)}
                                                    disabled={updatingItem === item.product.id}
                                                >
                                                    <i className="bi bi-plus-lg"></i>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subtotal */}
                                        <div style={{ width: '20%' }} className="text-center">
                                            <span
                                                className="fw-bold"
                                                style={{ fontSize: '26px', color: '#667eea' }}
                                            >
                                                ${item.sub_total}
                                            </span>
                                        </div>

                                        {/* Remove Button */}
                                        <div style={{ width: '10%' }} className="text-center">
                                            <button
                                                className="btn btn-outline-danger rounded-circle d-flex justify-content-center align-items-center mx-auto"
                                                style={{ width: '48px', height: '48px' }}
                                                onClick={() => handleRemove(item.product.id)}
                                                disabled={updatingItem === item.product.id}
                                                title="Remove item"
                                            >
                                                <i className="bi bi-trash" style={{ fontSize: '1.2rem' }}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="col-12 col-xl-4">
                    <div
                        className="card border-0 shadow sticky-top"
                        style={{ borderRadius: '24px', top: '24px' }}
                    >
                        <div className="card-body p-5">
                            <h4 className="fw-bold mb-4" style={{ fontSize: '32px' }}>Order Summary</h4>

                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted" style={{ fontSize: '20px' }}>Subtotal ({cart.item_count} items)</span>
                                <span style={{ fontSize: '20px' }}>${cart.grand_total}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted" style={{ fontSize: '20px' }}>Shipping</span>
                                <span className="text-success fw-semibold" style={{ fontSize: '20px' }}>Free</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted" style={{ fontSize: '20px' }}>Tax</span>
                                <span style={{ fontSize: '20px' }}>$0.00</span>
                            </div>

                            <hr className="my-4" />

                            <div className="d-flex justify-content-between mb-4">
                                <span className="fw-bold" style={{ fontSize: '26px' }}>Total</span>
                                <span className="fw-bold" style={{ fontSize: '26px', color: '#667eea' }}>
                                    ${cart.grand_total}
                                </span>
                            </div>

                            <Link
                                to="/checkout"
                                className="btn btn-lg w-100 py-3 mb-3"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontWeight: '600',
                                    fontSize: '22px',
                                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
                                    textDecoration: 'none'
                                }}
                            >
                                <i className="bi bi-credit-card me-2" style={{ fontSize: '22px' }}></i>
                                Proceed to Checkout
                            </Link>

                            <Link
                                to="/"
                                className="btn btn-outline-secondary w-100 py-3"
                                style={{ borderRadius: '50px', fontSize: '20px' }}
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Continue Shopping
                            </Link>

                            {/* Secure Payment Badge */}
                            <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #e9ecef' }}>
                                <div className="d-flex justify-content-center align-items-center gap-2 text-muted">
                                    <i className="bi bi-shield-check" style={{ color: '#28a745', fontSize: '18px' }}></i>
                                    <span style={{ fontSize: '16px' }}>Secure SSL Encrypted Payment</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
