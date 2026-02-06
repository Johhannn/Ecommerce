import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }
            setLoading(true);
            try {
                const response = await api.get(`shop/api/products/search-suggestions/?q=${query}`);
                setSuggestions(response.data);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
            setLoading(false);
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (slug) => {
        navigate(`/product/${slug}`);
        setShowSuggestions(false);
        setQuery('');
    };

    return (
        <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <form onSubmit={handleSearch}>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search products..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        style={{
                            borderRadius: '50px 0 0 50px',
                            border: '2px solid #e9ecef',
                            padding: '12px 20px',
                            fontSize: '16px'
                        }}
                    />
                    <button
                        type="submit"
                        className="btn"
                        style={{
                            borderRadius: '0 50px 50px 0',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '12px 20px',
                            border: 'none'
                        }}
                    >
                        <i className="bi bi-search"></i>
                    </button>
                </div>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && (query.length >= 2) && (
                <div
                    className="position-absolute w-100 bg-white shadow-lg"
                    style={{
                        top: '100%',
                        left: 0,
                        zIndex: 1000,
                        borderRadius: '16px',
                        marginTop: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e9ecef'
                    }}
                >
                    {loading ? (
                        <div className="p-3 text-center text-muted">
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Searching...
                        </div>
                    ) : suggestions.length > 0 ? (
                        <>
                            {suggestions.map((item) => (
                                <div
                                    key={item.id}
                                    className="d-flex align-items-center p-3"
                                    style={{
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f0f0f0',
                                        transition: 'background 0.2s'
                                    }}
                                    onClick={() => handleSuggestionClick(item.slug)}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <div
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            background: '#f0f0f0',
                                            flexShrink: 0
                                        }}
                                    >
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center h-100">
                                                <i className="bi bi-image text-muted"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ms-3 flex-grow-1">
                                        <div className="fw-semibold">{item.name}</div>
                                        <div style={{ color: '#667eea', fontWeight: '600' }}>${item.price}</div>
                                    </div>
                                </div>
                            ))}
                            <div
                                className="p-3 text-center"
                                style={{ background: '#f8f9fa', cursor: 'pointer' }}
                                onClick={handleSearch}
                            >
                                <span style={{ color: '#667eea', fontWeight: '600' }}>
                                    See all results for "{query}"
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="p-3 text-center text-muted">
                            No products found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
