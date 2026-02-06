import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingProduct, setUpdatingProduct] = useState(null);
    const { cartItems, addToCart, removeFromCart } = useCart();

    // Filter states
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('min_price') || '',
        maxPrice: searchParams.get('max_price') || '',
        inStock: searchParams.get('in_stock') === 'true',
        sort: searchParams.get('sort') || ''
    });

    const query = searchParams.get('q') || '';

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [searchParams]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('shop/api/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.append('search', query);
            if (filters.category) params.append('category', filters.category);
            if (filters.minPrice) params.append('min_price', filters.minPrice);
            if (filters.maxPrice) params.append('max_price', filters.maxPrice);
            if (filters.inStock) params.append('in_stock', 'true');
            if (filters.sort) params.append('sort', filters.sort);

            const response = await api.get(`shop/api/products/?${params.toString()}`);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
        setLoading(false);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Update URL params
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key === 'minPrice' ? 'min_price' :
                key === 'maxPrice' ? 'max_price' :
                    key === 'inStock' ? 'in_stock' : key, value);
        } else {
            params.delete(key === 'minPrice' ? 'min_price' :
                key === 'maxPrice' ? 'max_price' :
                    key === 'inStock' ? 'in_stock' : key);
        }
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            sort: ''
        });
        setSearchParams(query ? { q: query } : {});
    };

    const handleAddToCart = async (productId) => {
        setUpdatingProduct(productId);
        await addToCart(productId);
        setUpdatingProduct(null);
    };

    const handleRemoveFromCart = async (productId) => {
        setUpdatingProduct(productId);
        await removeFromCart(productId);
        setUpdatingProduct(null);
    };

    return (
        <div className="container-fluid py-4" style={{ maxWidth: '1800px', margin: '0 auto' }}>
            <div className="row g-4">
                {/* Filter Sidebar */}
                <div className="col-lg-3">
                    <div className="card border-0 shadow sticky-top" style={{ borderRadius: '20px', top: '24px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0">
                                    <i className="bi bi-funnel me-2" style={{ color: '#667eea' }}></i>
                                    Filters
                                </h5>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={clearFilters}
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-4">
                                <h6 className="fw-semibold mb-3">Category</h6>
                                <select
                                    className="form-select"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    style={{ borderRadius: '10px' }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="mb-4">
                                <h6 className="fw-semibold mb-3">Price Range</h6>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            style={{ borderRadius: '10px' }}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            style={{ borderRadius: '10px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* In Stock */}
                            <div className="mb-4">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="inStock"
                                        checked={filters.inStock}
                                        onChange={(e) => handleFilterChange('inStock', e.target.checked ? 'true' : '')}
                                    />
                                    <label className="form-check-label" htmlFor="inStock">
                                        In Stock Only
                                    </label>
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <h6 className="fw-semibold mb-3">Sort By</h6>
                                <select
                                    className="form-select"
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                    style={{ borderRadius: '10px' }}
                                >
                                    <option value="">Default</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="name">Name: A-Z</option>
                                    <option value="newest">Newest First</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="col-lg-9">
                    {/* Results Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h4 className="fw-bold mb-1">
                                {query ? `Search results for "${query}"` : 'All Products'}
                            </h4>
                            <p className="text-muted mb-0">{products.length} products found</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="d-flex justify-content-center py-5">
                            <div className="spinner-border" style={{ color: '#667eea' }} role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-search" style={{ fontSize: '4rem', color: '#ddd' }}></i>
                            <h4 className="mt-3">No products found</h4>
                            <p className="text-muted">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {products.map(product => (
                                <div className="col-sm-6 col-lg-4" key={product.id}>
                                    <div
                                        className="card h-100 border-0 shadow"
                                        style={{
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.2)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                        }}
                                    >
                                        <Link to={`/product/${product.slug}`} className="text-decoration-none">
                                            <div style={{ position: 'relative', overflow: 'hidden' }}>
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        className="card-img-top"
                                                        alt={product.name}
                                                        style={{ height: '220px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="d-flex justify-content-center align-items-center"
                                                        style={{
                                                            height: '220px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                        }}
                                                    >
                                                        <i className="bi bi-image text-white" style={{ fontSize: '3rem' }}></i>
                                                    </div>
                                                )}
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        right: '12px',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: 'white',
                                                        padding: '6px 14px',
                                                        borderRadius: '50px',
                                                        fontWeight: '700',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    ${product.price}
                                                </div>
                                            </div>
                                        </Link>

                                        <div className="card-body p-4">
                                            <Link to={`/product/${product.slug}`} className="text-decoration-none">
                                                <h6 className="card-title fw-bold mb-3" style={{ color: '#1a1a2e', fontSize: '1.1rem' }}>
                                                    {product.name}
                                                </h6>
                                            </Link>
                                            <div className="d-grid">
                                                {cartItems[product.id] ? (
                                                    <div
                                                        className="d-flex align-items-center justify-content-center"
                                                        style={{ background: '#f1f3f5', borderRadius: '50px', padding: '6px' }}
                                                    >
                                                        <button
                                                            className="btn rounded-circle"
                                                            style={{
                                                                width: '38px',
                                                                height: '38px',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                color: 'white',
                                                                border: 'none'
                                                            }}
                                                            onClick={() => handleRemoveFromCart(product.id)}
                                                            disabled={updatingProduct === product.id}
                                                        >
                                                            <i className="bi bi-dash-lg"></i>
                                                        </button>
                                                        <span className="px-3 fw-bold">{cartItems[product.id]}</span>
                                                        <button
                                                            className="btn rounded-circle"
                                                            style={{
                                                                width: '38px',
                                                                height: '38px',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                color: 'white',
                                                                border: 'none'
                                                            }}
                                                            onClick={() => handleAddToCart(product.id)}
                                                            disabled={updatingProduct === product.id}
                                                        >
                                                            <i className="bi bi-plus-lg"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="btn py-2"
                                                        onClick={() => handleAddToCart(product.id)}
                                                        disabled={updatingProduct === product.id}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50px',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        {updatingProduct === product.id ? (
                                                            <span className="spinner-border spinner-border-sm"></span>
                                                        ) : (
                                                            <><i className="bi bi-cart-plus me-2"></i>Add to Cart</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
