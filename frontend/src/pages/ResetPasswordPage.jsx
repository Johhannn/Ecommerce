import React, { useState } from 'react';
import api from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setLoading(true);

        try {
            await api.post(`api/auth/password-reset-confirm/${uid}/${token}/`, { password });
            setMessage({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Error resetting password:', error);
            setMessage({ type: 'error', text: 'Invalid or expired link. Please try again.' });
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4 fw-bold" style={{ color: '#1a1a2e' }}>Reset Password</h2>

                            {message.text && (
                                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                                    {message.text}
                                    <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label text-muted small text-uppercase fw-bold">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength="8"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label text-muted small text-uppercase fw-bold">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength="8"
                                    />
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg fw-bold text-uppercase"
                                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Resetting...' : 'Set New Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
