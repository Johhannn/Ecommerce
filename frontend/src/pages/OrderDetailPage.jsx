import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        try {
            const response = await api.get(`cart/api/orders/${orderId}/`);
            setOrder(response.data);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Order not found or you do not have permission to view it.');
        }
        setLoading(false);
    };

    const handlePrintInvoice = async (e) => {
        e.preventDefault();
        try {
            const response = await api.get(`cart/invoice/${order.id}/`, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error("Error downloading invoice", error);
            alert("Failed to load invoice. Please try again.");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    if (error) {
        return (
            <div className="container py-5 text-center">
                <i className="bi bi-exclamation-circle" style={{ fontSize: '5rem', color: '#dc3545' }}></i>
                <h2 className="mt-4">{error}</h2>
                <Link to="/orders" className="btn btn-primary mt-3">Back to Orders</Link>
            </div>
        );
    }

    return (
        <div className="container py-5" style={{ maxWidth: '1000px' }}>
            {/* Header */}
            <div className="d-flex align-items-center mb-4">
                <Link to="/orders" className="btn btn-outline-secondary rounded-circle me-3" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-arrow-left"></i>
                </Link>
                <div>
                    <h1 className="fw-bold mb-0" style={{ fontSize: '32px' }}>
                        Order Details
                    </h1>
                    <p className="text-muted mb-0">Order #{order.order_id.slice(-8)}</p>
                </div>
            </div>

            {/* Order Summary Card */}
            <div className="card border-0 shadow mb-4" style={{ borderRadius: '20px' }}>
                <div
                    className="card-header py-4 px-4"
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '20px 20px 0 0',
                        border: 'none'
                    }}
                >
                    <div className="row text-white">
                        <div className="col-md-4">
                            <small className="opacity-75">Order Date</small>
                            <p className="mb-0 fw-semibold">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="col-md-4">
                            <small className="opacity-75">Total Amount</small>
                            <p className="mb-0 fw-bold fs-4">₹{parseFloat(order.amount).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="col-md-4">
                            <small className="opacity-75">Payment Status</small>
                            <p className="mb-0">
                                <span className="badge bg-success px-3 py-2" style={{ fontSize: '14px' }}>
                                    <i className="bi bi-check-circle me-1"></i> Paid
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="card-body p-4">
                    <div className="row">
                        <div className="col-md-6">
                            <p className="mb-1 text-muted"><small>Order ID</small></p>
                            <p className="fw-semibold">{order.order_id}</p>
                        </div>
                        <div className="col-md-6">
                            <p className="mb-1 text-muted"><small>Payment ID</small></p>
                            <p className="fw-semibold">{order.payment?.payment_id || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="card border-0 shadow" style={{ borderRadius: '20px' }}>
                <div className="card-header bg-white py-4 px-4" style={{ borderRadius: '20px 20px 0 0', borderBottom: '1px solid #e9ecef' }}>
                    <h5 className="mb-0 fw-bold">
                        <i className="bi bi-box-seam me-2" style={{ color: '#667eea' }}></i>
                        Order Items ({order.items?.length || 0})
                    </h5>
                </div>
                <div className="card-body p-0">
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                            <div
                                key={item.id}
                                className="d-flex align-items-center p-4"
                                style={{
                                    borderBottom: index < order.items.length - 1 ? '1px solid #e9ecef' : 'none'
                                }}
                            >
                                <div
                                    className="flex-shrink-0 me-4"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        background: '#f8f9fa'
                                    }}
                                >
                                    {item.product_image ? (
                                        <img
                                            src={item.product_image}
                                            alt={item.product_name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            className="d-flex justify-content-center align-items-center h-100"
                                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                                        >
                                            <i className="bi bi-image text-white" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="fw-bold mb-1">{item.product_name}</h6>
                                    <p className="text-muted mb-0 small">
                                        ₹{parseFloat(item.product_price).toLocaleString('en-IN')} × {item.quantity}
                                    </p>
                                </div>
                                <div className="text-end">
                                    <span className="fw-bold fs-5" style={{ color: '#667eea' }}>
                                        ₹{parseFloat(item.subtotal).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-5 text-center text-muted">
                            <p>No items found for this order</p>
                            <small>Items from orders placed before this update may not be available</small>
                        </div>
                    )}
                </div>

                {/* Order Total */}
                <div className="card-footer bg-light p-4" style={{ borderRadius: '0 0 20px 20px' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold fs-5">Total</span>
                        <span className="fw-bold fs-4" style={{ color: '#667eea' }}>
                            ₹{parseFloat(order.amount).toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 d-flex gap-3">
                <Link to="/orders" className="btn btn-outline-secondary px-4 py-2">
                    <i className="bi bi-arrow-left me-2"></i>Back to Orders
                </Link>
                <a
                    href="#"
                    onClick={handlePrintInvoice}
                    className="btn btn-outline-primary px-4 py-2"
                >
                    <i className="bi bi-printer me-2"></i>Print Invoice
                </a>
                <Link to="/" className="btn px-4 py-2" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none'
                }}>
                    <i className="bi bi-shop me-2"></i>Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderDetailPage;
