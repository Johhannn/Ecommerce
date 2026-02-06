import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null);

    // Filters & Pagination State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        // Debounce search to avoid too many API calls
        const timer = setTimeout(() => {
            fetchOrders();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, statusFilter, currentPage]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('custom-admin/orders/', {
                params: {
                    search: search,
                    status: statusFilter,
                    page: currentPage
                }
            });
            // New API structure returns { orders, total_pages, current_page }
            setOrders(response.data.orders);
            setTotalPages(response.data.total_pages);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to load orders.");
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            await api.patch(`custom-admin/orders/${orderId}/`, { status: newStatus });
            // Update local state without refetching
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0" style={{ fontSize: '28px' }}>Order Management</h2>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={fetchOrders} style={{ fontSize: '16px' }}>
                        <i className="bi bi-arrow-clockwise me-2"></i> Refresh
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="input-group input-group-lg">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="bi bi-search text-muted fs-4"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Search by Order ID or Customer Name..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                    style={{ fontSize: '20px', padding: '15px' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select form-select-lg"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                style={{ fontSize: '20px', padding: '15px' }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-5 text-center fs-3">Loading orders...</div>
            ) : error ? (
                <div className="p-5 text-center text-danger fs-3">{error}</div>
            ) : (
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle" style={{ fontSize: '20px' }}>
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4" style={{ padding: '25px', fontSize: '22px' }}>Order ID</th>
                                        <th style={{ padding: '25px', fontSize: '22px' }}>Customer</th>
                                        <th style={{ padding: '25px', fontSize: '22px' }}>Date</th>
                                        <th style={{ padding: '25px', fontSize: '22px' }}>Items</th>
                                        <th style={{ padding: '25px', fontSize: '22px' }}>Amount</th>
                                        <th style={{ padding: '25px', fontSize: '22px' }}>Status</th>
                                        <th style={{ padding: '25px', fontSize: '22px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td className="ps-4 fw-bold" style={{ padding: '20px' }}>
                                                #{order.id}
                                                <div className="text-muted fw-normal mt-1" style={{ fontSize: '14px' }} title="Transaction ID">
                                                    {order.order_id}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <div className="fw-bold">{order.user}</div>
                                            </td>
                                            <td className="text-dark" style={{ padding: '20px' }}>
                                                {new Date(order.created_at).toLocaleDateString()}
                                                <div className="text-secondary mt-1" style={{ fontSize: '16px' }}>
                                                    {new Date(order.created_at).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <span className="badge bg-light text-dark border p-2" style={{ fontSize: '16px' }}>
                                                    {order.items_count} items
                                                </span>
                                            </td>
                                            <td className="fw-bold" style={{ padding: '20px' }}>₹{parseFloat(order.amount).toLocaleString('en-IN')}</td>
                                            <td style={{ padding: '20px' }}>
                                                <span className={`badge rounded-pill p-3 ${order.status === 'paid' || order.status === 'delivered' ? 'bg-success' :
                                                    order.status === 'shipped' ? 'bg-info text-dark' :
                                                        order.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'
                                                    }`} style={{ fontSize: '16px', minWidth: '120px' }}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-light border dropdown-toggle p-3"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        disabled={updating === order.id}
                                                        style={{ fontSize: '18px' }}
                                                    >
                                                        {updating === order.id ? 'Updating...' : 'Update Status'}
                                                    </button>
                                                    <ul className="dropdown-menu shadow">
                                                        <li><button className="dropdown-item py-2 px-4 fs-5" onClick={() => handleStatusChange(order.id, 'pending')}>Pending</button></li>
                                                        <li><button className="dropdown-item py-2 px-4 fs-5" onClick={() => handleStatusChange(order.id, 'paid')}>Paid</button></li>
                                                        <li><button className="dropdown-item py-2 px-4 fs-5" onClick={() => handleStatusChange(order.id, 'shipped')}>Shipped</button></li>
                                                        <li><button className="dropdown-item py-2 px-4 fs-5" onClick={() => handleStatusChange(order.id, 'delivered')}>Delivered</button></li>
                                                        <li><button className="dropdown-item py-2 px-4 fs-5 text-danger" onClick={() => handleStatusChange(order.id, 'cancelled')}>Cancelled</button></li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted fs-4">No orders found matching your filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-between align-items-center p-4 border-top">
                                <span className="text-muted fs-5">Page {currentPage} of {totalPages}</span>
                                <nav>
                                    <ul className="pagination pagination-lg mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                                        </li>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
