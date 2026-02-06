import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

const DashboardOverview = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [pieData, setPieData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, chartRes] = await Promise.all([
                api.get('custom-admin/stats/'),
                api.get('custom-admin/chart-data/')
            ]);

            setStats(statsRes.data);

            // Line Chart Code
            setChartData({
                labels: chartRes.data.labels,
                datasets: [
                    {
                        label: 'Revenue (₹)',
                        data: chartRes.data.revenue,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        tension: 0.4,
                        fill: true,
                    }
                ]
            });

            // Pie Chart Code
            if (chartRes.data.pie_labels && chartRes.data.pie_data) {
                setPieData({
                    labels: chartRes.data.pie_labels,
                    datasets: [
                        {
                            label: '# of Orders',
                            data: chartRes.data.pie_data,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.7)',
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)',
                                'rgba(255, 159, 64, 0.7)',
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                });
            }

            setLoading(false);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard data.");
            setLoading(false);
        }
    };



    if (loading) return <div className="p-5 text-center">Loading dashboard...</div>;
    if (error) return <div className="p-5 text-center text-danger">{error}</div>;

    return (
        <div>
            <h2 className="fw-bold mb-4" style={{ fontSize: '32px' }}>Dashboard Overview</h2>

            {/* KPI Cards */}
            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <div className="d-flex align-items-center mb-3">
                            <div className="rounded-circle bg-light p-3 me-3">
                                <i className="bi bi-currency-dollar text-success" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <div className="text-secondary fw-bold" style={{ fontSize: '18px' }}>Total Revenue</div>
                        </div>
                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px' }}>₹{stats.total_revenue.toLocaleString('en-IN')}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <div className="d-flex align-items-center mb-3">
                            <div className="rounded-circle bg-light p-3 me-3">
                                <i className="bi bi-cart text-primary" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <div className="text-secondary fw-bold" style={{ fontSize: '18px' }}>Total Orders</div>
                        </div>
                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px' }}>{stats.total_orders}</h3>
                        <div className="text-warning mt-1" style={{ fontSize: '16px', fontWeight: '500' }}>{stats.pending_orders} Pending</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <div className="d-flex align-items-center mb-3">
                            <div className="rounded-circle bg-light p-3 me-3">
                                <i className="bi bi-people text-info" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <div className="text-secondary fw-bold" style={{ fontSize: '18px' }}>Customers</div>
                        </div>
                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px' }}>{stats.total_customers}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 h-100" style={stats.low_stock_count > 0 ? { borderLeft: '5px solid #dc3545' } : {}}>
                        <div className="d-flex align-items-center mb-3">
                            <div className="rounded-circle bg-light p-3 me-3">
                                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <div className="text-secondary fw-bold" style={{ fontSize: '18px' }}>Low Stock</div>
                        </div>
                        <h3 className="fw-bold mb-0 text-danger" style={{ fontSize: '28px' }}>{stats.low_stock_count}</h3>
                        <div className="text-secondary mt-1" style={{ fontSize: '16px' }}>Items alert</div>
                    </div>
                </div>
            </div>

            {/* Row 2: Review Stats & More */}
            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <div className="d-flex align-items-center mb-3">
                            <div className="rounded-circle bg-light p-3 me-3">
                                <i className="bi bi-star-fill text-warning" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <div className="text-secondary fw-bold" style={{ fontSize: '18px' }}>Product Reviews</div>
                        </div>
                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px' }}>{stats.total_reviews}</h3>
                        <div className="text-secondary mt-1" style={{ fontSize: '16px' }}>Avg Rating: {stats.avg_rating} <i className="bi bi-star-fill text-warning small"></i></div>
                    </div>
                </div>
                {/* Placeholder for future stats (e.g. users online) */}
                <div className="col-md-9">
                    {/* Empty space or additional banners */}
                </div>
            </div>

            {/* Charts Section */}
            <div className="row mb-5">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <h5 className="fw-bold mb-4" style={{ fontSize: '24px' }}>Revenue Trend (Last 30 Days)</h5>
                        <div style={{ height: '400px' }}>
                            {chartData ? (
                                <Line
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: { beginAtZero: true }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                    Loading chart data...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <h5 className="fw-bold mb-4" style={{ fontSize: '24px' }}>Order Status</h5>
                        <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                            {pieData ? (
                                <Pie
                                    data={pieData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom'
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="text-muted d-flex align-items-center justify-content-center h-100">No Data</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0 fw-bold" style={{ fontSize: '24px' }}>Recent Orders</h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle" style={{ fontSize: '18px' }}>
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4" style={{ padding: '20px' }}>Order ID</th>
                                    <th style={{ padding: '20px' }}>Customer</th>
                                    <th style={{ padding: '20px' }}>Amount</th>
                                    <th style={{ padding: '20px' }}>Status</th>
                                    <th style={{ padding: '20px' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent_orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="ps-4 fw-medium">#{order.id}</td>
                                        <td>{order.user}</td>
                                        <td>₹{parseFloat(order.amount).toLocaleString('en-IN')}</td>
                                        <td>
                                            <span className={`badge rounded-pill ${order.status === 'paid' ? 'bg-success' :
                                                order.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="text-dark small" style={{ fontSize: '16px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {stats.recent_orders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">No recent orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
