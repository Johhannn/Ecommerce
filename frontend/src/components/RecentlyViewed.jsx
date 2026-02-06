import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RecentlyViewed = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('recently_viewed')) || [];
        setProducts(stored);
    }, []);

    if (products.length === 0) return null;

    return (
        <div className="mt-5 pb-5 border-top pt-5">
            <h2 className="fw-bold mb-4 text-center" style={{ color: '#1a1a2e', fontSize: '2.5rem' }}>Recently Viewed</h2>
            <div className="row g-4">
                {products.map(product => (
                    <div className="col-sm-6 col-lg-3" key={product.id}>
                        <div
                            className="card h-100 border-0 shadow-sm"
                            style={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                transition: 'transform 0.3s ease',
                                background: '#fff'
                            }}
                        >
                            <Link to={`/product/${product.slug}`} className="text-decoration-none">
                                <div style={{ position: 'relative', overflow: 'hidden' }}>
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            className="card-img-top"
                                            alt={product.name}
                                            style={{
                                                height: '200px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="d-flex justify-content-center align-items-center"
                                            style={{
                                                height: '200px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            }}
                                        >
                                            <i className="bi bi-image text-white" style={{ fontSize: '3rem' }}></i>
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="card-body p-3 text-center">
                                <Link to={`/product/${product.slug}`} className="text-decoration-none">
                                    <h6
                                        className="card-title fw-bold mb-2 text-dark"
                                        style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {product.name}
                                    </h6>
                                </Link>
                                <div className="fw-bold text-primary">
                                    ${product.price}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;
