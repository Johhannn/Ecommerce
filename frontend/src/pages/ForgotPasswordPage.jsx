import React, { useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            await api.post('accounts/password-reset-request/', { email });
            setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
        } catch (error) {
            console.error('Error sending reset email:', error);
            setMessage({ type: 'error', text: 'Failed to send reset email. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4 fw-bold" style={{ color: '#1a1a2e' }}>Forgot Password</h2>
                            <p className="text-center text-muted mb-4">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            {message.text && (
                                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                                    {message.text}
                                    <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="email" className="form-label text-muted small text-uppercase fw-bold">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control form-control-lg"
                                        id="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="d-grid mb-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg fw-bold text-uppercase"
                                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </div>
                            </form>

                            <div className="text-center">
                                <Link to="/login" className="text-decoration-none text-muted">
                                    <i className="bi bi-arrow-left me-2"></i>Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
