import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(null); // null = loading
    const [loading, setLoading] = useState(true);

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        try {
            const response = await api.get('accounts/profile/');
            if (response.data.is_staff || response.data.is_superuser) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        } catch (error) {
            console.error("Failed to verify admin status", error);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Verifying privileges...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="text-center p-5 card border-0 shadow-sm" style={{ maxWidth: '400px' }}>
                    <div className="mb-4">
                        <i className="bi bi-shield-lock text-danger" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h2 className="fw-bold mb-3">Access Denied</h2>
                    <p className="text-muted mb-4">
                        You do not have permission to access the Admin Dashboard.
                        This area is restricted to administrators only.
                    </p>
                    <Link to="/" className="btn btn-primary w-100">
                        <i className="bi bi-arrow-left me-2"></i> Return to Store
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
            {/* Sidebar */}
            <div className="bg-white shadow-sm" style={{ width: '250px', flexShrink: 0 }}>
                <div className="p-4 border-bottom">
                    <h5 className="fw-bold mb-0" style={{ color: '#667eea', fontSize: '24px' }}>Admin Panel</h5>
                </div>
                <div className="p-3">
                    <ul className="nav flex-column gap-2">
                        <li className="nav-item">
                            <Link
                                to="/admin/dashboard"
                                className={`nav-link ${isActive('/admin/dashboard') ? 'active fw-bold' : ''}`}
                                style={isActive('/admin/dashboard') ? { color: '#667eea', backgroundColor: '#eef2ff', borderRadius: '8px', fontSize: '18px' } : { color: '#343a40', fontWeight: '500', fontSize: '18px' }}
                            >
                                <i className="bi bi-speedometer2 me-2"></i> Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                to="/admin/orders"
                                className={`nav-link ${isActive('/admin/orders') ? 'active fw-bold' : ''}`}
                                style={isActive('/admin/orders') ? { color: '#667eea', backgroundColor: '#eef2ff', borderRadius: '8px', fontSize: '18px' } : { color: '#343a40', fontWeight: '500', fontSize: '18px' }}
                            >
                                <i className="bi bi-cart-check me-2"></i> Orders
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                to="/admin/products"
                                className={`nav-link ${isActive('/admin/products') ? 'active fw-bold' : ''}`}
                                style={isActive('/admin/products') ? { color: '#667eea', backgroundColor: '#eef2ff', borderRadius: '8px', fontSize: '18px' } : { color: '#343a40', fontWeight: '500', fontSize: '18px' }}
                            >
                                <i className="bi bi-box-seam me-2"></i> Products
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                to="/admin/reviews"
                                className={`nav-link ${isActive('/admin/reviews') ? 'active fw-bold' : ''}`}
                                style={isActive('/admin/reviews') ? { color: '#667eea', backgroundColor: '#eef2ff', borderRadius: '8px', fontSize: '18px' } : { color: '#343a40', fontWeight: '500', fontSize: '18px' }}
                            >
                                <i className="bi bi-star me-2"></i> Reviews
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                to="/"
                                className="nav-link text-muted"
                                style={{ fontSize: '18px' }}
                            >
                                <i className="bi bi-shop me-2"></i> View Store
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 p-4">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
