import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('accounts/login/', { username, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            navigate('/');
            window.location.reload();
        } catch (err) {
            setError('Invalid username or password');
            console.error("Login Error", err);
        }
        setLoading(false);
    };

    return (
        <div
            className="min-vh-100 d-flex align-items-center justify-content-center py-5"
            style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            }}
        >
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-11 col-md-8 col-lg-5">
                        {/* Logo/Brand */}
                        <div className="text-center mb-5">
                            <Link to="/" className="text-decoration-none">
                                <h1
                                    className="fw-bold mb-2"
                                    style={{
                                        fontSize: '48px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    <i className="bi bi-shop me-3"></i>
                                    J J Mall
                                </h1>
                            </Link>
                            <p className="text-white-50" style={{ fontSize: '20px' }}>
                                Welcome back! Please sign in to continue.
                            </p>
                        </div>

                        {/* Login Card */}
                        <div
                            className="card border-0 shadow-lg"
                            style={{
                                borderRadius: '24px',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div className="card-body p-5">
                                <h2
                                    className="fw-bold text-center mb-4"
                                    style={{ fontSize: '32px', color: '#1a1a2e' }}
                                >
                                    Sign In
                                </h2>

                                {error && (
                                    <div
                                        className="alert d-flex align-items-center mb-4"
                                        style={{
                                            background: 'rgba(220, 53, 69, 0.1)',
                                            border: '1px solid rgba(220, 53, 69, 0.3)',
                                            borderRadius: '12px',
                                            color: '#dc3545',
                                            fontSize: '18px'
                                        }}
                                    >
                                        <i className="bi bi-exclamation-circle me-2" style={{ fontSize: '20px' }}></i>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label
                                            className="form-label fw-semibold"
                                            style={{ fontSize: '18px', color: '#1a1a2e' }}
                                        >
                                            <i className="bi bi-person me-2" style={{ color: '#667eea' }}></i>
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="Enter your username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            style={{
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '18px',
                                                border: '2px solid #e9ecef',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label
                                            className="form-label fw-semibold"
                                            style={{ fontSize: '18px', color: '#1a1a2e' }}
                                        >
                                            <i className="bi bi-lock me-2" style={{ color: '#667eea' }}></i>
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            style={{
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '18px',
                                                border: '2px solid #e9ecef',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                        />
                                    </div>

                                    <div className="d-flex justify-content-end mb-3">
                                        <Link to="/forgot-password" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn w-100 py-3 mb-4"
                                        disabled={loading}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '22px',
                                            fontWeight: '600',
                                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                                Sign In
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center">
                                    <p style={{ fontSize: '18px', color: '#6c757d' }}>
                                        Don't have an account?{' '}
                                        <Link
                                            to="/register"
                                            className="fw-semibold text-decoration-none"
                                            style={{
                                                color: '#667eea',
                                                transition: 'color 0.3s ease'
                                            }}
                                        >
                                            Create Account
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Back to Home */}
                        <div className="text-center mt-4">
                            <Link
                                to="/"
                                className="text-white-50 text-decoration-none d-inline-flex align-items-center"
                                style={{ fontSize: '18px' }}
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
