import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types/product';
import {
  getProducts,
  createProduct,
  updateProduct,
  toggleProductActive,
  getProductCategories,
} from '../api/productsApi';
import { extractError } from '../utils/extractError';

const EMPTY_FORM = {
  name: '',
  sku: '',
  category: '',
  unit: '',
  currentStock: '0',
  minStock: '0',
  costPrice: '0',
  salePrice: '0',
  isActive: true,
  notes: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggleError, setToggleError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    setError('');
    getProducts({
      search: search.trim() || undefined,
      category: categoryFilter || undefined,
      isActive: isActiveFilter === '' ? undefined : isActiveFilter === 'true',
      lowStockOnly: lowStockOnly || undefined,
    })
      .then(({ data }) => setProducts(data))
      .catch(() => setError('Failed to load products. Check that the backend is running.'))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    getProductCategories()
      .then(({ data }) => setCategories(data))
      .catch(() => {/* categories are optional — silently ignore */});
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, isActiveFilter, lowStockOnly]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      sku: product.sku ?? '',
      category: product.category ?? '',
      unit: product.unit,
      currentStock: String(product.currentStock),
      minStock: String(product.minStock),
      costPrice: String(product.costPrice),
      salePrice: String(product.salePrice),
      isActive: product.isActive,
      notes: product.notes ?? '',
    });
    setEditingId(product.id);
    setFormError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingId === null) {
        const payload: CreateProductRequest = {
          name: form.name,
          sku: form.sku.trim() || null,
          category: form.category.trim() || null,
          unit: form.unit,
          currentStock: parseFloat(form.currentStock) || 0,
          minStock: parseFloat(form.minStock) || 0,
          costPrice: parseFloat(form.costPrice) || 0,
          salePrice: parseFloat(form.salePrice) || 0,
          isActive: form.isActive,
          notes: form.notes.trim() || null,
        };
        await createProduct(payload);
      } else {
        const payload: UpdateProductRequest = {
          name: form.name,
          sku: form.sku.trim() || null,
          category: form.category.trim() || null,
          unit: form.unit,
          currentStock: parseFloat(form.currentStock) || 0,
          minStock: parseFloat(form.minStock) || 0,
          costPrice: parseFloat(form.costPrice) || 0,
          salePrice: parseFloat(form.salePrice) || 0,
          isActive: form.isActive,
          notes: form.notes.trim() || null,
        };
        await updateProduct(editingId, payload);
      }
      cancelForm();
      fetchProducts();
      fetchCategories();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    setToggleError('');
    try {
      const { data } = await toggleProductActive(product.id);
      setProducts(prev => prev.map(p => p.id === data.id ? data : p));
    } catch (err) {
      setToggleError(extractError(err));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setIsActiveFilter('');
    setLowStockOnly(false);
  };

  const hasFilters = search || categoryFilter || isActiveFilter || lowStockOnly;

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        {!showForm && (
          <button className="btn-indigo" onClick={openCreate}>Add Product</button>
        )}
      </div>

      {showForm && (
        <div className="form-panel">
          <h3>{editingId === null ? 'Add Product' : 'Edit Product'}</h3>
          {formError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="pd-name">Name *</label>
                <input
                  id="pd-name"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  maxLength={150}
                  placeholder="e.g. Espresso"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pd-sku">SKU</label>
                <input
                  id="pd-sku"
                  type="text"
                  value={form.sku}
                  onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                  maxLength={80}
                  placeholder="e.g. ESP-001"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pd-category">Category</label>
                <input
                  id="pd-category"
                  type="text"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  maxLength={100}
                  placeholder="e.g. Drinks"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pd-unit">Unit *</label>
                <input
                  id="pd-unit"
                  type="text"
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  required
                  maxLength={30}
                  placeholder="e.g. cup, kg, pcs"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pd-stock">Current Stock</label>
                <input
                  id="pd-stock"
                  type="number"
                  value={form.currentStock}
                  onChange={e => setForm(f => ({ ...f, currentStock: e.target.value }))}
                  min={0}
                  step={0.0001}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pd-minstock">Min Stock</label>
                <input
                  id="pd-minstock"
                  type="number"
                  value={form.minStock}
                  onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))}
                  min={0}
                  step={0.0001}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pd-cost">Cost Price</label>
                <input
                  id="pd-cost"
                  type="number"
                  value={form.costPrice}
                  onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))}
                  min={0}
                  step={0.01}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pd-sale">Sale Price</label>
                <input
                  id="pd-sale"
                  type="number"
                  value={form.salePrice}
                  onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))}
                  min={0}
                  step={0.01}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="pd-notes">Notes</label>
                <textarea
                  id="pd-notes"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  maxLength={1000}
                  rows={2}
                  placeholder="Optional notes"
                />
              </div>
              <div className="form-check">
                <input
                  id="pd-isactive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                />
                <label htmlFor="pd-isactive">Active</label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-indigo" disabled={formLoading}>
                {formLoading ? 'Saving…' : (editingId === null ? 'Create' : 'Save Changes')}
              </button>
              <button type="button" className="btn-outline" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filters">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Name, SKU, category…"
          />
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={isActiveFilter} onChange={e => setIsActiveFilter(e.target.value)}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="filter-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', paddingTop: '1.4rem' }}>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={e => setLowStockOnly(e.target.checked)}
              style={{ width: '1rem', height: '1rem', accentColor: '#6366f1' }}
            />
            Low Stock Only
          </label>
        </div>
        {hasFilters && (
          <button className="btn-clear" onClick={clearFilters}>Clear</button>
        )}
      </div>

      {toggleError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{toggleError}</div>
      )}

      {loading && <div className="state-message">Loading products…</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && products.length === 0 && (
        <div className="state-message">No products found.</div>
      )}
      {!loading && !error && products.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Stock</th>
                <th>Min</th>
                <th>Cost</th>
                <th>Sale</th>
                <th>Status</th>
                <th>Stock Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td className="col-id">{product.id}</td>
                  <td>{product.name}</td>
                  <td style={{ color: '#64748b' }}>{product.sku ?? '—'}</td>
                  <td style={{ color: '#64748b' }}>{product.category ?? '—'}</td>
                  <td>{product.unit}</td>
                  <td>{product.currentStock}</td>
                  <td style={{ color: '#64748b' }}>{product.minStock}</td>
                  <td>{product.costPrice.toFixed(2)}</td>
                  <td>{product.salePrice.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {product.isLowStock
                      ? <span className="status-badge status-pending">Low Stock</span>
                      : <span className="status-badge status-confirmed">OK</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-xs edit" onClick={() => openEdit(product)}>Edit</button>
                      <button
                        className={`btn-xs ${product.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleActive(product)}
                      >
                        {product.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
