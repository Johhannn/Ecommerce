import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const CheckoutPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [loadingCoupon, setLoadingCoupon] = useState(false);
    const [couponError, setCouponError] = useState(null);
    const navigate = useNavigate();
    const { fetchCart: refreshGlobalCart } = useCart();

    useEffect(() => {
        fetchCart();
        fetchAddresses();
        loadRazorpayScript();
    }, []);

    useEffect(() => {
        if (cart?.coupon) {
            setCouponCode(cart.coupon.code);
        }
    }, [cart]);

    const fetchCart = async () => {
        try {
            const response = await api.get('cart/api/');
            setCart(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching cart", error);
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await api.get('shop/api/addresses/');
            setAddresses(response.data);
            const defaultAddr = response.data.find(a => a.is_default);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else if (response.data.length > 0) setSelectedAddressId(response.data[0].id);
        } catch (error) {
            console.error("Error fetching addresses", error);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const handleApplyCoupon = async () => {
        setLoadingCoupon(true);
        setCouponError(null);
        try {
            await api.post('cart/api/apply-coupon/', { code: couponCode });
            await fetchCart(); // Refresh cart to get updated totals
            setCouponCode('');
        } catch (error) {
            console.error("Error applying coupon", error);
            setCouponError(error.response?.data?.error || 'Failed to apply coupon');
        } finally {
            setLoadingCoupon(false);
        }
    };

    const handleRemoveCoupon = async () => {
        setLoadingCoupon(true);
        try {
            await api.post('cart/api/remove-coupon/');
            await fetchCart(); // Refresh cart to remove discount
            setCouponCode('');
        } catch (error) {
            console.error("Error removing coupon", error);
        } finally {
            setLoadingCoupon(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!selectedAddressId) {
            alert('Please select a shipping address to proceed.');
            return;
        }

        setProcessing(true);
        try {
            // Step 1: Create order on backend
            const orderResponse = await api.post('cart/api/create-order/', {
                address_id: selectedAddressId
            });
            const orderData = orderResponse.data;

            // Step 2: Open Razorpay checkout
            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'EcoShop',
                description: 'Order Payment',
                order_id: orderData.order_id,
                handler: async function (response) {
                    // Step 3: Verify payment on backend
                    try {
                        const verifyResponse = await api.post('cart/api/verify-payment/', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        setPaymentSuccess(true);
                        setPaymentDetails({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id
                        });
                        refreshGlobalCart();
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed. Please contact support.');
                    }
                    setProcessing(false);
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#667eea'
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to initiate payment. Please try again.');
            setProcessing(false);
        }
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

    if (paymentSuccess) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div
                            className="card border-0 shadow text-center p-5"
                            style={{ borderRadius: '24px' }}
                        >
                            <div
                                className="mx-auto mb-4 d-flex justify-content-center align-items-center"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                }}
                            >
                                <i className="bi bi-check-lg text-white" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem', color: '#28a745' }}>
                                Payment Successful!
                            </h1>
                            <p className="text-muted fs-5 mb-4">
                                Thank you for your purchase! A confirmation email has been sent to your registered email address.
                            </p>
                            <div
                                className="mb-4 p-4"
                                style={{
                                    background: '#f8f9fa',
                                    borderRadius: '16px'
                                }}
                            >
                                <p className="mb-2">
                                    <strong>Order ID:</strong> <span className="text-muted">{paymentDetails?.orderId}</span>
                                </p>
                                <p className="mb-0">
                                    <strong>Payment ID:</strong> <span className="text-muted">{paymentDetails?.paymentId}</span>
                                </p>
                            </div>
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
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
                <div
                    className="d-flex justify-content-center align-items-center mb-4"
                    style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                    }}
                >
                    <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#667eea' }}></i>
                </div>
                <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>Your cart is empty</h1>
                <p className="text-muted mb-4 fs-5">Add some items to proceed with checkout.</p>
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
        );
    }

    return (
        <div className="container py-5" style={{ maxWidth: '1200px' }}>
            {/* Header */}
            <div className="d-flex align-items-center mb-5">
                <Link to="/cart" className="btn btn-outline-secondary rounded-circle me-3" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-arrow-left"></i>
                </Link>
                <h1 className="fw-bold mb-0" style={{ fontSize: '40px' }}>
                    <i className="bi bi-credit-card me-3" style={{ color: '#667eea' }}></i>
                    Checkout
                </h1>
            </div>

            <div className="row g-5">
                {/* Order Summary */}
                <div className="col-lg-7">
                    <div
                        className="card border-0 shadow"
                        style={{ borderRadius: '24px', overflow: 'hidden' }}
                    >
                        <div
                            className="card-header py-4 px-4"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none'
                            }}
                        >
                            <h4 className="mb-0 text-white fw-bold" style={{ fontSize: '24px' }}>
                                <i className="bi bi-bag-check me-2"></i>
                                Order Summary
                            </h4>
                        </div>
                        <div className="card-body p-4">
                            {cart.items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="d-flex align-items-center py-3"
                                    style={{
                                        borderBottom: index < cart.items.length - 1 ? '1px solid #e9ecef' : 'none'
                                    }}
                                >
                                    <div
                                        className="overflow-hidden flex-shrink-0 me-3"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '12px',
                                            background: '#f8f9fa'
                                        }}
                                    >
                                        {item.product.image ? (
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
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
                                        <h6 className="fw-bold mb-1" style={{ fontSize: '18px' }}>{item.product.name}</h6>
                                        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                            Qty: {item.quantity} × ${item.product.price}
                                        </p>
                                    </div>
                                    <div className="text-end">
                                        <span className="fw-bold" style={{ fontSize: '18px', color: '#667eea' }}>
                                            ${item.sub_total}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="col-lg-5">
                    <div
                        className="card border-0 shadow sticky-top"
                        style={{ borderRadius: '24px', top: '24px' }}
                    >
                        <div className="card-body p-5">
                            <h4 className="fw-bold mb-4" style={{ fontSize: '28px' }}>Payment Details</h4>

                            {/* Address Selection */}
                            <div className="mb-4">
                                <h5 className="fw-bold mb-3" style={{ fontSize: '20px' }}>Shipping Address</h5>
                                {loadingAddresses ? (
                                    <div className="text-center py-3">
                                        <span className="spinner-border spinner-border-sm text-primary"></span> Loading addresses...
                                    </div>
                                ) : addresses.length > 0 ? (
                                    <div className="d-flex flex-column gap-3 mb-3">
                                        {addresses.map(addr => (
                                            <div
                                                key={addr.id}
                                                className={`p-3 border rounded-3 cursor-pointer ${selectedAddressId === addr.id ? 'border-primary bg-light' : ''}`}
                                                style={{
                                                    borderWidth: selectedAddressId === addr.id ? '2px' : '1px',
                                                    borderColor: selectedAddressId === addr.id ? '#667eea' : '#dee2e6',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                            >
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="shippingAddress"
                                                        checked={selectedAddressId === addr.id}
                                                        onChange={() => setSelectedAddressId(addr.id)}
                                                        style={{ accentColor: '#667eea' }}
                                                    />
                                                    <label className="form-check-label w-100">
                                                        <span className="fw-bold">{addr.name}</span> <span className="badge bg-secondary ms-2">{addr.address_type}</span>
                                                        <br />
                                                        <small className="text-muted">
                                                            {addr.address_line1}, {addr.address_line2 ? addr.address_line2 + ', ' : ''}
                                                            {addr.city}, {addr.state} - {addr.postal_code}
                                                        </small>
                                                        <br />
                                                        <small className="text-muted"><i className="bi bi-telephone me-1"></i>{addr.phone}</small>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                        <Link to="/addresses" className="btn btn-outline-primary btn-sm w-100 mt-2">
                                            <i className="bi bi-plus-lg me-1"></i> Manage / Add Addresses
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="alert alert-warning text-center">
                                        <p className="mb-2">No shipping address found.</p>
                                        <Link to="/addresses" className="btn btn-primary btn-sm">
                                            <i className="bi bi-plus-lg me-1"></i> Add Address
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Coupon Code Section */}
                            <div className="mb-4">
                                <h5 className="fw-bold mb-3" style={{ fontSize: '18px' }}>Promo Code</h5>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={!!cart.coupon}
                                    />
                                    {cart.coupon ? (
                                        <button
                                            className="btn btn-danger"
                                            onClick={handleRemoveCoupon}
                                            disabled={loadingCoupon}
                                        >
                                            {loadingCoupon ? 'Removing...' : 'Remove'}
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={handleApplyCoupon}
                                            disabled={loadingCoupon || !couponCode}
                                        >
                                            {loadingCoupon ? 'Applying...' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                                {couponError && <p className="text-danger small">{couponError}</p>}
                                {cart.coupon && (
                                    <div className="alert alert-success d-flex align-items-center py-2 px-3">
                                        <i className="bi bi-tag-fill me-2"></i>
                                        <span>Code <strong>{cart.coupon.code}</strong> applied!</span>
                                    </div>
                                )}
                            </div>

                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted" style={{ fontSize: '18px' }}>Subtotal</span>
                                <span style={{ fontSize: '18px' }}>${cart.sub_total || cart.grand_total}</span>
                            </div>
                            {cart.discount_amount > 0 && (
                                <div className="d-flex justify-content-between mb-3 text-success">
                                    <span className="fw-semibold" style={{ fontSize: '18px' }}>Discount ({cart.coupon?.discount}%)</span>
                                    <span className="fw-semibold" style={{ fontSize: '18px' }}>-${cart.discount_amount}</span>
                                </div>
                            )}
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted" style={{ fontSize: '18px' }}>Shipping</span>
                                <span className="text-success fw-semibold" style={{ fontSize: '18px' }}>Free</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted" style={{ fontSize: '18px' }}>Tax</span>
                                <span style={{ fontSize: '18px' }}>$0.00</span>
                            </div>

                            <hr className="my-4" />

                            <div className="d-flex justify-content-between mb-4">
                                <span className="fw-bold" style={{ fontSize: '24px' }}>Total</span>
                                <span className="fw-bold" style={{ fontSize: '24px', color: '#667eea' }}>
                                    ${cart.grand_total}
                                </span>
                            </div>

                            <button
                                className="btn btn-lg w-100 py-3 mb-3"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontWeight: '600',
                                    fontSize: '20px',
                                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)'
                                }}
                                onClick={handlePayment}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-shield-check me-2" style={{ fontSize: '20px' }}></i>
                                        Pay with Razorpay
                                    </>
                                )}
                            </button>

                            <div className="text-center mt-4">
                                <div className="d-flex justify-content-center align-items-center gap-2 text-muted mb-2">
                                    <i className="bi bi-lock-fill" style={{ color: '#28a745' }}></i>
                                    <span style={{ fontSize: '14px' }}>Secured by Razorpay</span>
                                </div>
                                <div className="d-flex justify-content-center gap-3">
                                    <i className="bi bi-credit-card" style={{ fontSize: '28px', color: '#6c757d' }}></i>
                                    <i className="bi bi-phone" style={{ fontSize: '28px', color: '#6c757d' }}></i>
                                    <i className="bi bi-bank" style={{ fontSize: '28px', color: '#6c757d' }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CheckoutPage;
