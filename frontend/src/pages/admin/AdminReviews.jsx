import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [updating, setUpdating] = useState(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            let url = 'shop/api/admin/reviews/?';
            if (search) url += `search=${search}&`;
            if (filterStatus !== 'all') url += `status=${filterStatus}&`;

            const response = await api.get(url);
            setReviews(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchReviews();
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, filterStatus]);

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            setUpdating(id);
            await api.put(`shop/api/admin/reviews/${id}/`);
            // Optimistic update
            setReviews(reviews.map(r => r.id === id ? { ...r, status: !currentStatus } : r));
            setUpdating(null);
        } catch (error) {
            console.error("Error updating review:", error);
            setUpdating(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;

        try {
            setUpdating(id);
            await api.delete(`shop/api/admin/reviews/${id}/`);
            setReviews(reviews.filter(r => r.id !== id));
            setUpdating(null);
        } catch (error) {
            console.error("Error deleting review:", error);
            setUpdating(null);
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark">Review Management</h2>
                <div className="d-flex gap-3">
                    <select
                        className="form-select border-0 shadow-sm"
                        style={{ width: '150px', borderRadius: '12px' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Hidden</option>
                    </select>
                    <div className="position-relative">
                        <input
                            type="text"
                            className="form-control border-0 shadow-sm ps-5"
                            placeholder="Search reviews..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ borderRadius: '12px', minWidth: '300px' }}
                        />
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="py-4 ps-4 border-0">Product</th>
                                <th className="py-4 border-0">User</th>
                                <th className="py-4 border-0">Rating & Review</th>
                                <th className="py-4 border-0">Date</th>
                                <th className="py-4 border-0">Status</th>
                                <th className="py-4 pe-4 border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="text-muted">
                                            <i className="bi bi-chat-square-text mb-3 d-block" style={{ fontSize: '2rem' }}></i>
                                            No reviews found matching your criteria
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reviews.map(review => (
                                    <tr key={review.id} style={{ fontSize: '15px' }}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{review.product_name || `Product #${review.product}`}</div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-2"
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                {review.user_name || 'Anonymous'}
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '400px' }}>
                                            <div className="d-flex align-items-center mb-1">
                                                <StarRating rating={review.rating} size="14px" />
                                                <strong className="ms-2">{review.subject}</strong>
                                            </div>
                                            <div className="text-muted text-truncate" title={review.review}>
                                                {review.review}
                                            </div>
                                        </td>
                                        <td className="text-muted">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge rounded-pill px-3 py-2 ${review.status ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}
                                                style={{
                                                    background: review.status ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                                                }}
                                            >
                                                {review.status ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="pe-4 text-end">
                                            <button
                                                className={`btn btn-sm me-2 ${review.status ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                onClick={() => handleToggleStatus(review.id, review.status)}
                                                disabled={updating === review.id}
                                                style={{ borderRadius: '8px' }}
                                                title={review.status ? "Hide Review" : "Show Review"}
                                            >
                                                {updating === review.id ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <i className={`bi ${review.status ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                                )}
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(review.id)}
                                                disabled={updating === review.id}
                                                style={{ borderRadius: '8px' }}
                                                title="Delete Review"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReviews;
