import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types/product';
import type { StockMovement, StockMovementType, StockSummary } from '../types/stockMovement';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  toggleProductActive,
  getProductCategories,
} from '../api/productsApi';
import {
  createStockMovement,
  getProductStockMovements,
  getProductStockSummary,
} from '../api/stockMovementsApi';
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

const EMPTY_STOCK_FORM = {
  type: 'In' as StockMovementType,
  quantity: '',
  reason: '',
  notes: '',
};

function typeLabel(type: StockMovementType): string {
  if (type === 'In') return 'In (add to stock)';
  if (type === 'Out') return 'Out (remove from stock)';
  return 'Adjustment (set to final value)';
}

function movementBadgeClass(type: StockMovementType): string {
  if (type === 'In') return 'status-badge status-confirmed';
  if (type === 'Out') return 'status-badge status-cancelled';
  return 'status-badge status-completed';
}

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

  // Product create / edit form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Stock movement panel
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockForm, setStockForm] = useState(EMPTY_STOCK_FORM);
  const [stockFormError, setStockFormError] = useState('');
  const [stockFormLoading, setStockFormLoading] = useState(false);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stockMovementsLoading, setStockMovementsLoading] = useState(false);
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);

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

  const fetchStockData = (productId: number) => {
    setStockMovementsLoading(true);
    Promise.all([
      getProductStockMovements(productId),
      getProductStockSummary(productId),
    ])
      .then(([{ data: movements }, { data: summary }]) => {
        setStockMovements(movements);
        setStockSummary(summary);
      })
      .catch(() => {/* silently ignore — panel still usable without history */})
      .finally(() => setStockMovementsLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, isActiveFilter, lowStockOnly]);

  // ── Product create / edit ──────────────────────────────────────────

  const openCreate = () => {
    setStockProduct(null);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setStockProduct(null);
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
      // Keep stock panel header in sync
      if (stockProduct?.id === data.id) setStockProduct(data);
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

  // ── Stock movement panel ───────────────────────────────────────────

  const openStockPanel = (product: Product) => {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
    setStockProduct(product);
    setStockForm(EMPTY_STOCK_FORM);
    setStockFormError('');
    setStockMovements([]);
    setStockSummary(null);
    fetchStockData(product.id);
  };

  const closeStockPanel = () => {
    setStockProduct(null);
    setStockMovements([]);
    setStockSummary(null);
    setStockFormError('');
  };

  const handleStockSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;
    setStockFormLoading(true);
    setStockFormError('');

    try {
      await createStockMovement({
        productId: stockProduct.id,
        type: stockForm.type,
        quantity: parseFloat(stockForm.quantity) || 0,
        reason: stockForm.reason.trim() || null,
        notes: stockForm.notes.trim() || null,
      });

      // Refresh the product row in the table and in the panel header
      const { data: updated } = await getProduct(stockProduct.id);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      setStockProduct(updated);

      // Refresh history and summary
      fetchStockData(stockProduct.id);

      // Keep the type, clear the rest for quick consecutive entries
      setStockForm(f => ({ ...f, quantity: '', reason: '', notes: '' }));
    } catch (err) {
      setStockFormError(extractError(err));
    } finally {
      setStockFormLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        {!showForm && (
          <button className="btn-indigo" onClick={openCreate}>Add Product</button>
        )}
      </div>

      {/* ── Product create / edit form ─────────────────────────────── */}
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

      {/* ── Stock movement panel ───────────────────────────────────── */}
      {stockProduct && (
        <div className="form-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h3>Move Stock — {stockProduct.name}</h3>
            <button
              className="btn-outline"
              onClick={closeStockPanel}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8125rem' }}
            >
              Close
            </button>
          </div>

          {/* Current stock strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#475569', alignItems: 'center' }}>
            <span>
              Current Stock: <strong style={{ color: '#1e293b' }}>{stockProduct.currentStock} {stockProduct.unit}</strong>
            </span>
            <span>
              Min Stock: <strong style={{ color: '#1e293b' }}>{stockProduct.minStock}</strong>
            </span>
            {stockProduct.isLowStock && (
              <span className="status-badge status-pending">Low Stock</span>
            )}
            {stockProduct.sku && (
              <span style={{ color: '#94a3b8' }}>SKU: {stockProduct.sku}</span>
            )}
          </div>

          {/* Movement form */}
          {stockFormError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{stockFormError}</div>
          )}
          <form onSubmit={handleStockSubmit}>
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              <div className="form-group">
                <label htmlFor="sm-type">Type *</label>
                <select
                  id="sm-type"
                  value={stockForm.type}
                  onChange={e => setStockForm(f => ({ ...f, type: e.target.value as StockMovementType }))}
                >
                  <option value="In">In — add to stock</option>
                  <option value="Out">Out — remove from stock</option>
                  <option value="Adjustment">Adjustment — set to value</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="sm-qty">
                  {stockForm.type === 'Adjustment' ? 'New Stock Value *' : 'Quantity *'}
                </label>
                <input
                  id="sm-qty"
                  type="number"
                  value={stockForm.quantity}
                  onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))}
                  min={0}
                  step={0.0001}
                  required
                  placeholder={stockForm.type === 'Adjustment' ? 'Final stock level' : 'Amount to move'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sm-reason">Reason</label>
                <input
                  id="sm-reason"
                  type="text"
                  value={stockForm.reason}
                  onChange={e => setStockForm(f => ({ ...f, reason: e.target.value }))}
                  maxLength={150}
                  placeholder="e.g. Purchase, Waste, Count"
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="sm-notes">Notes</label>
                <textarea
                  id="sm-notes"
                  value={stockForm.notes}
                  onChange={e => setStockForm(f => ({ ...f, notes: e.target.value }))}
                  maxLength={1000}
                  rows={2}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            {stockForm.type === 'Adjustment' && (
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.75rem' }}>
                Adjustment sets stock directly to the value you enter, regardless of current stock.
              </p>
            )}
            <div className="form-actions">
              <button type="submit" className="btn-indigo" disabled={stockFormLoading}>
                {stockFormLoading ? 'Applying…' : `Apply ${typeLabel(stockForm.type)}`}
              </button>
            </div>
          </form>

          {/* Stock summary */}
          {stockSummary && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.625rem' }}>
                Stock Summary
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.875rem', color: '#475569' }}>
                <span>Total In: <strong style={{ color: '#166534' }}>+{stockSummary.totalIn}</strong></span>
                <span>Total Out: <strong style={{ color: '#991b1b' }}>−{stockSummary.totalOut}</strong></span>
                <span>Adjustments: <strong style={{ color: '#1e293b' }}>{stockSummary.adjustmentCount}</strong></span>
                {stockSummary.lastMovementAt && (
                  <span>Last movement: <strong style={{ color: '#1e293b' }}>{new Date(stockSummary.lastMovementAt).toLocaleString()}</strong></span>
                )}
              </div>
            </div>
          )}

          {/* Movement history */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.625rem' }}>
              Movement History
            </h4>
            {stockMovementsLoading && (
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading history…</div>
            )}
            {!stockMovementsLoading && stockMovements.length === 0 && (
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No movements recorded yet.</div>
            )}
            {!stockMovementsLoading && stockMovements.length > 0 && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Before</th>
                      <th>After</th>
                      <th>Reason</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockMovements.map(sm => (
                      <tr key={sm.id}>
                        <td>
                          <span className={movementBadgeClass(sm.type)}>{sm.type}</span>
                        </td>
                        <td>{sm.quantity}</td>
                        <td style={{ color: '#64748b' }}>{sm.previousStock}</td>
                        <td style={{ fontWeight: 500 }}>{sm.newStock}</td>
                        <td style={{ color: '#64748b' }}>{sm.reason ?? '—'}</td>
                        <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(sm.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Filters ───────────────────────────────────────────────── */}
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
                <tr
                  key={product.id}
                  style={stockProduct?.id === product.id ? { background: '#f5f3ff' } : undefined}
                >
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
                      <button className="btn-xs stock" onClick={() => openStockPanel(product)}>Stock</button>
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
