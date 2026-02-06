import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ price: '', stock: '' });

    // Filters & Pagination State
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', slug: '', price: '', stock: '', description: '', category_id: '' });
    const [imageFile, setImageFile] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, categoryFilter, currentPage]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('shop/api/categories/');
            setCategories(response.data);
        } catch (e) {
            console.error("Failed to load categories");
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('custom-admin/products/', {
                params: {
                    search: search,
                    category: categoryFilter,
                    page: currentPage
                }
            });
            setProducts(response.data.products);
            setTotalPages(response.data.total_pages);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products:", error);
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(newProduct).forEach(key => formData.append(key, newProduct[key]));
        if (imageFile) formData.append('image', imageFile);

        try {
            await api.post('custom-admin/products/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowAddModal(false);
            setNewProduct({ name: '', slug: '', price: '', stock: '', description: '', category_id: '' });
            setImageFile(null);
            fetchProducts(); // Refresh list
        } catch (error) {
            console.error("Error creating product", error);
            alert("Failed to create product");
        }
    };

    const handleEditClick = (product) => {
        setEditingId(product.id);
        setEditForm({ price: product.price, stock: product.stock });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSave = async (id) => {
        try {
            await api.patch(`custom-admin/products/${id}/`, editForm);

            // Update local state
            setProducts(products.map(p =>
                p.id === id ? { ...p, price: editForm.price, stock: editForm.stock } : p
            ));

            setEditingId(null);
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
        try {
            await api.delete(`custom-admin/products/${id}/`);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product");
        }
    };

    if (loading) return <div className="p-5 text-center">Loading inventory...</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0" style={{ fontSize: '28px' }}>Inventory Management</h2>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ fontSize: '16px' }}>
                    <i className="bi bi-plus-lg me-2"></i> Add Product
                </button>
            </div>

            {/* Add Product Modal (Simple Inline Overlay for now) */}
            {showAddModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Product</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCreateProduct}>
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input type="text" className="form-control" required
                                            value={newProduct.name}
                                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Slug</label>
                                        <input type="text" className="form-control" required
                                            value={newProduct.slug}
                                            onChange={e => setNewProduct({ ...newProduct, slug: e.target.value })}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label">Price</label>
                                            <input type="number" className="form-control" required
                                                value={newProduct.price}
                                                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="form-label">Stock</label>
                                            <input type="number" className="form-control" required
                                                value={newProduct.stock}
                                                onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Category</label>
                                        <select className="form-select" required
                                            value={newProduct.category_id}
                                            onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}
                                        >
                                            <option value="">Select Category...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-control" rows="2"
                                            value={newProduct.description}
                                            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Image</label>
                                        <input type="file" className="form-control"
                                            onChange={e => setImageFile(e.target.files[0])}
                                        />
                                    </div>
                                    <div className="text-end">
                                        <button type="button" className="btn btn-secondary me-2" onClick={() => setShowAddModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Create Product</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                    placeholder="Search by Product Name, ID, or Slug..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                    style={{ fontSize: '20px', padding: '15px' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select form-select-lg"
                                value={categoryFilter}
                                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                                style={{ fontSize: '20px', padding: '15px' }}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '20px' }}>
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4" style={{ padding: '25px', fontSize: '22px' }}>Product</th>
                                    <th style={{ padding: '25px', fontSize: '22px' }}>Category</th>
                                    <th style={{ padding: '25px', fontSize: '22px' }}>Price</th>
                                    <th style={{ padding: '25px', fontSize: '22px' }}>Stock</th>
                                    <th style={{ padding: '25px', fontSize: '22px' }}>Status</th>
                                    <th className="text-end pe-4" style={{ padding: '20px', fontSize: '22px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td className="ps-4" style={{ padding: '20px' }}>
                                            <div className="d-flex align-items-center">
                                                {product.image ? (
                                                    <img
                                                        src={product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`}
                                                        alt={product.name}
                                                        className="rounded me-3 border"
                                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80?text=No+Img'; }}
                                                    />
                                                ) : (
                                                    <div className="rounded me-3 bg-secondary d-flex align-items-center justify-content-center text-white" style={{ width: '80px', height: '80px' }}>
                                                        <i className="bi bi-image"></i>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="fw-bold fs-5">{product.name}</div>
                                                    <div className="text-secondary" style={{ fontSize: '16px' }}>ID: #{product.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px' }}>{product.category}</td>
                                        <td style={{ padding: '20px' }}>
                                            {editingId === product.id ? (
                                                <input
                                                    type="number"
                                                    className="form-control form-control-lg"
                                                    value={editForm.price}
                                                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                    style={{ width: '140px', fontSize: '20px' }}
                                                />
                                            ) : (
                                                <span className="fw-bold">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            {editingId === product.id ? (
                                                <input
                                                    type="number"
                                                    className="form-control form-control-lg"
                                                    value={editForm.stock}
                                                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                                                    style={{ width: '100px', fontSize: '20px' }}
                                                />
                                            ) : (
                                                <span className={product.stock < 5 ? 'text-danger fw-bold' : ''}>
                                                    {product.stock}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            {product.stock === 0 ? (
                                                <span className="badge bg-danger p-2 fs-6">Out of Stock</span>
                                            ) : product.stock < 5 ? (
                                                <span className="badge bg-warning text-dark p-2 fs-6">Low Stock</span>
                                            ) : (
                                                <span className="badge bg-success p-2 fs-6">In Stock</span>
                                            )}
                                        </td>
                                        <td className="text-end pe-4" style={{ padding: '20px' }}>
                                            {editingId === product.id ? (
                                                <div className="btn-group">
                                                    <button className="btn btn-success p-2" onClick={() => handleSave(product.id)}>
                                                        <i className="bi bi-check-lg fs-5"></i>
                                                    </button>
                                                    <button className="btn btn-outline-secondary p-2" onClick={handleCancelEdit}>
                                                        <i className="bi bi-x-lg fs-5"></i>
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn btn-outline-primary p-2"
                                                        onClick={() => handleEditClick(product)}
                                                        style={{ fontSize: '18px' }}
                                                    >
                                                        <i className="bi bi-pencil me-1"></i> Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger p-2 ms-2"
                                                        onClick={() => handleDelete(product.id)}
                                                        style={{ fontSize: '18px' }}
                                                    >
                                                        <i className="bi bi-trash me-1"></i> Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted fs-4">No products found.</td>
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
        </div >
    );
};

export default AdminProducts;
