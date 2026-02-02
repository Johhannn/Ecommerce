import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const LoginModal = () => {
    const { showLoginModal, closeLoginModal } = useCart();

    if (!showLoginModal) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 9998
                }}
                onClick={closeLoginModal}
            ></div>

            {/* Modal */}
            <div
                className="position-fixed top-50 start-50 translate-middle"
                style={{
                    zIndex: 9999,
                    width: '90%',
                    maxWidth: '450px'
                }}
            >
                <div
                    className="card border-0 shadow-lg"
                    style={{
                        borderRadius: '24px',
                        background: 'white',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div
                        className="text-center p-5 pb-4"
                        style={{
                            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                        }}
                    >
                        <div
                            className="d-inline-flex justify-content-center align-items-center mb-4"
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '2px solid rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            <i
                                className="bi bi-person-lock"
                                style={{
                                    fontSize: '36px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}
                            ></i>
                        </div>
                        <h3
                            className="text-white fw-bold mb-2"
                            style={{ fontSize: '28px' }}
                        >
                            Login Required
                        </h3>
                        <p
                            className="mb-0"
                            style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px' }}
                        >
                            Please sign in to add items to your cart
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-5 text-center">
                        <p
                            className="text-muted mb-4"
                            style={{ fontSize: '18px' }}
                        >
                            Create an account or sign in to start shopping and save your items.
                        </p>

                        <div className="d-flex flex-column gap-3">
                            <Link
                                to="/login"
                                className="btn py-3"
                                onClick={closeLoginModal}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)'
                                }}
                            >
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="btn py-3"
                                onClick={closeLoginModal}
                                style={{
                                    background: 'transparent',
                                    color: '#667eea',
                                    border: '2px solid #667eea',
                                    borderRadius: '12px',
                                    fontSize: '20px',
                                    fontWeight: '600'
                                }}
                            >
                                <i className="bi bi-person-plus me-2"></i>
                                Create Account
                            </Link>
                        </div>

                        <button
                            className="btn btn-link text-muted mt-4 text-decoration-none"
                            onClick={closeLoginModal}
                            style={{ fontSize: '16px' }}
                        >
                            Continue Browsing
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginModal;
