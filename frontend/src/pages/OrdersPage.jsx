import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('cart/api/orders/');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
        setLoading(false);
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
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
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
                    <i className="bi bi-bag-check me-3" style={{ color: '#667eea' }}></i>
                    My Orders
                </h1>
            </div>

            {orders.length === 0 ? (
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
                        <i className="bi bi-bag-x" style={{ fontSize: '4rem', color: '#667eea' }}></i>
                    </div>
                    <h2 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>No orders yet</h2>
                    <p className="text-muted mb-4 fs-5">Start shopping to see your orders here!</p>
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
            ) : (
                <div className="row g-4">
                    {orders.map((order) => (
                        <div key={order.id} className="col-12">
                            <div
                                className="card border-0 shadow"
                                style={{ borderRadius: '20px', overflow: 'hidden' }}
                            >
                                <div
                                    className="card-header py-3 px-4 d-flex justify-content-between align-items-center"
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }}
                                >
                                    <div className="text-white">
                                        <span className="fw-bold" style={{ fontSize: '18px' }}>Order #{order.order_id.slice(-8)}</span>
                                    </div>
                                    <span
                                        className="badge px-3 py-2"
                                        style={{
                                            background: order.status === 'paid' ? '#28a745' : '#ffc107',
                                            fontSize: '14px',
                                            borderRadius: '50px'
                                        }}
                                    >
                                        {order.status === 'paid' ? (
                                            <><i className="bi bi-check-circle me-1"></i> Paid</>
                                        ) : (
                                            order.status
                                        )}
                                    </span>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="rounded-circle d-flex justify-content-center align-items-center me-3"
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        background: '#f0f2ff'
                                                    }}
                                                >
                                                    <i className="bi bi-calendar3" style={{ fontSize: '20px', color: '#667eea' }}></i>
                                                </div>
                                                <div>
                                                    <small className="text-muted">Order Date</small>
                                                    <p className="mb-0 fw-semibold">{formatDate(order.created_at)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="rounded-circle d-flex justify-content-center align-items-center me-3"
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        background: '#e8f5e9'
                                                    }}
                                                >
                                                    <i className="bi bi-currency-rupee" style={{ fontSize: '20px', color: '#28a745' }}></i>
                                                </div>
                                                <div>
                                                    <small className="text-muted">Amount Paid</small>
                                                    <p className="mb-0 fw-bold" style={{ fontSize: '1.2rem', color: '#28a745' }}>
                                                        ₹{parseFloat(order.amount).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="rounded-circle d-flex justify-content-center align-items-center me-3"
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        background: '#fff3e0'
                                                    }}
                                                >
                                                    <i className="bi bi-box-seam" style={{ fontSize: '20px', color: '#ff9800' }}></i>
                                                </div>
                                                <div>
                                                    <small className="text-muted">Items</small>
                                                    <p className="mb-0 fw-semibold">
                                                        {order.item_count || 0} {order.item_count === 1 ? 'item' : 'items'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer bg-light d-flex justify-content-between align-items-center py-3 px-4">
                                    <small className="text-muted">
                                        Payment ID: {order.payment?.payment_id?.slice(-12) || 'N/A'}
                                    </small>
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="btn px-4 py-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        View Details <i className="bi bi-arrow-right ms-2"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
