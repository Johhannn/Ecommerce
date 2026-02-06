import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const AddressBookPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        address_type: 'home',
        is_default: false
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('shop/api/addresses/');
            setAddresses(response.data);
        } catch (err) {
            console.error('Error fetching addresses:', err);
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'India',
            address_type: 'home',
            is_default: false
        });
        setEditingAddress(null);
        setShowForm(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (editingAddress) {
                await api.put(`shop/api/addresses/${editingAddress.id}/`, formData);
            } else {
                await api.post('shop/api/addresses/', formData);
            }
            fetchAddresses();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save address');
        }
        setSubmitting(false);
    };

    const handleEdit = (address) => {
        setFormData(address);
        setEditingAddress(address);
        setShowForm(true);
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            await api.delete(`shop/api/addresses/${addressId}/`);
            fetchAddresses();
        } catch (err) {
            console.error('Error deleting address:', err);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await api.post(`shop/api/addresses/${addressId}/set-default/`);
            fetchAddresses();
        } catch (err) {
            console.error('Error setting default:', err);
        }
    };

    const getAddressTypeIcon = (type) => {
        switch (type) {
            case 'home': return 'bi-house-fill';
            case 'work': return 'bi-building';
            default: return 'bi-geo-alt-fill';
        }
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

    return (
        <div className="container py-5" style={{ maxWidth: '1000px' }}>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-5">
                <div className="d-flex align-items-center">
                    <Link to="/" className="btn btn-outline-secondary rounded-circle me-3" style={{ width: '48px', height: '48px' }}>
                        <i className="bi bi-arrow-left"></i>
                    </Link>
                    <h1 className="fw-bold mb-0" style={{ fontSize: '36px' }}>
                        <i className="bi bi-geo-alt me-3" style={{ color: '#667eea' }}></i>
                        Address Book
                    </h1>
                </div>
                {!showForm && (
                    <button
                        className="btn px-4 py-2"
                        onClick={() => setShowForm(true)}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            fontWeight: '600'
                        }}
                    >
                        <i className="bi bi-plus-lg me-2"></i>Add Address
                    </button>
                )}
            </div>

            {/* Address Form */}
            {showForm && (
                <div className="card border-0 shadow mb-4" style={{ borderRadius: '20px' }}>
                    <div className="card-header bg-white py-4 px-4" style={{ borderRadius: '20px 20px 0 0', borderBottom: '1px solid #e9ecef' }}>
                        <h5 className="mb-0 fw-bold">
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h5>
                    </div>
                    <div className="card-body p-4">
                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone Number *</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Address Line 1 *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="address_line1"
                                        value={formData.address_line1}
                                        onChange={handleInputChange}
                                        placeholder="House/Flat No., Building Name, Street"
                                        required
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Address Line 2</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="address_line2"
                                        value={formData.address_line2}
                                        onChange={handleInputChange}
                                        placeholder="Landmark, Area (Optional)"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">City *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">State *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Postal Code *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Country</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Address Type</label>
                                    <select
                                        className="form-select"
                                        name="address_type"
                                        value={formData.address_type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="home">Home</option>
                                        <option value="work">Work</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="is_default"
                                            name="is_default"
                                            checked={formData.is_default}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label" htmlFor="is_default">
                                            Set as default address
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 d-flex gap-3">
                                <button
                                    type="submit"
                                    className="btn px-4 py-2"
                                    disabled={submitting}
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {submitting ? (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    ) : (
                                        <i className="bi bi-check-lg me-2"></i>
                                    )}
                                    {editingAddress ? 'Update Address' : 'Save Address'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary px-4 py-2"
                                    onClick={resetForm}
                                    style={{ borderRadius: '50px' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Address List */}
            {addresses.length === 0 && !showForm ? (
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
                        <i className="bi bi-geo-alt" style={{ fontSize: '4rem', color: '#667eea' }}></i>
                    </div>
                    <h2 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>No addresses saved</h2>
                    <p className="text-muted mb-4 fs-5">Add addresses for faster checkout!</p>
                    <button
                        className="btn btn-lg px-5 py-3"
                        onClick={() => setShowForm(true)}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            fontWeight: '600'
                        }}
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        Add Your First Address
                    </button>
                </div>
            ) : (
                <div className="row g-4">
                    {addresses.map((address) => (
                        <div key={address.id} className="col-md-6">
                            <div
                                className="card h-100 border-0 shadow"
                                style={{
                                    borderRadius: '16px',
                                    border: address.is_default ? '2px solid #667eea' : 'none'
                                }}
                            >
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center">
                                            <div
                                                className="rounded-circle d-flex justify-content-center align-items-center me-3"
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    background: address.is_default ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f2ff'
                                                }}
                                            >
                                                <i
                                                    className={`bi ${getAddressTypeIcon(address.address_type)}`}
                                                    style={{ color: address.is_default ? 'white' : '#667eea' }}
                                                ></i>
                                            </div>
                                            <div>
                                                <span className="fw-bold text-capitalize">{address.address_type}</span>
                                                {address.is_default && (
                                                    <span className="badge bg-primary ms-2" style={{ fontSize: '10px' }}>Default</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="dropdown">
                                            <button
                                                className="btn btn-sm btn-light rounded-circle"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="bi bi-three-dots-vertical"></i>
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end">
                                                <li>
                                                    <button className="dropdown-item" onClick={() => handleEdit(address)}>
                                                        <i className="bi bi-pencil me-2"></i>Edit
                                                    </button>
                                                </li>
                                                {!address.is_default && (
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => handleSetDefault(address.id)}>
                                                            <i className="bi bi-star me-2"></i>Set as Default
                                                        </button>
                                                    </li>
                                                )}
                                                <li><hr className="dropdown-divider" /></li>
                                                <li>
                                                    <button className="dropdown-item text-danger" onClick={() => handleDelete(address.id)}>
                                                        <i className="bi bi-trash me-2"></i>Delete
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <h6 className="fw-bold mb-1">{address.name}</h6>
                                    <p className="text-muted mb-2 small">
                                        <i className="bi bi-telephone me-1"></i>{address.phone}
                                    </p>
                                    <p className="mb-0 small">
                                        {address.address_line1}
                                        {address.address_line2 && <>, {address.address_line2}</>}
                                        <br />
                                        {address.city}, {address.state} - {address.postal_code}
                                        <br />
                                        {address.country}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressBookPage;
