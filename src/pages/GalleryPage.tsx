import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import type { GalleryItem, CreateGalleryItemRequest, UpdateGalleryItemRequest } from '../types/gallery';
import type { GalleryFilters } from '../api/galleryApi';
import {
  getAllGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  toggleGalleryItemActive,
  uploadImage,
} from '../api/galleryApi';

const BACKEND_BASE = 'http://localhost:5299';

function resolveImageUrl(url: string): string {
  if (!url.trim()) return '';
  if (url.startsWith('/')) return BACKEND_BASE + url;
  return url;
}

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === 'object') {
      if ('message' in data && typeof (data as { message: unknown }).message === 'string') {
        return (data as { message: string }).message;
      }
      if ('errors' in data) {
        const msgs = Object.values(
          (data as { errors: Record<string, string[]> }).errors
        ).flat();
        if (msgs.length > 0) return msgs.join(' ');
      }
    }
  }
  return 'An unexpected error occurred.';
}

const EMPTY_FORM = {
  title: '',
  description: '',
  imageUrl: '',
  category: '',
  displayOrder: '0',
  isActive: true,
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = () => {
    setLoading(true);
    setError('');
    const filters: GalleryFilters = {};
    if (categoryFilter.trim()) filters.category = categoryFilter.trim();
    if (activeFilter !== '') filters.isActive = activeFilter === 'true';

    getAllGalleryItems(filters)
      .then(({ data }) => setItems(data))
      .catch(() => setError('Failed to load gallery items. Check that the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [categoryFilter, activeFilter]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (item: GalleryItem) => {
    setForm({
      title: item.title,
      description: item.description ?? '',
      imageUrl: item.imageUrl,
      category: item.category ?? '',
      displayOrder: String(item.displayOrder),
      isActive: item.isActive,
    });
    setEditingId(item.id);
    setFormError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image file size must not exceed 5 MB.');
      return;
    }

    setUploadLoading(true);
    setFormError('');

    try {
      const { data } = await uploadImage(file);
      setForm(f => ({ ...f, imageUrl: data.url }));
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingId === null) {
        const payload: CreateGalleryItemRequest = {
          title: form.title,
          description: form.description.trim() || null,
          imageUrl: form.imageUrl.trim(),
          category: form.category.trim() || null,
          displayOrder: parseInt(form.displayOrder, 10) || 0,
        };
        const { data } = await createGalleryItem(payload);
        setItems(prev => [data, ...prev]);
      } else {
        const payload: UpdateGalleryItemRequest = {
          title: form.title,
          description: form.description.trim() || null,
          imageUrl: form.imageUrl.trim(),
          category: form.category.trim() || null,
          isActive: form.isActive,
          displayOrder: parseInt(form.displayOrder, 10) || 0,
        };
        const { data } = await updateGalleryItem(editingId, payload);
        setItems(prev => prev.map(i => i.id === data.id ? data : i));
      }
      cancelForm();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (item: GalleryItem) => {
    try {
      const { data } = await toggleGalleryItemActive(item.id);
      setItems(prev => prev.map(i => i.id === data.id ? data : i));
    } catch {
      // table stays unchanged on failure
    }
  };

  const hasFilters = !!(categoryFilter || activeFilter);

  const clearFilters = () => {
    setCategoryFilter('');
    setActiveFilter('');
  };

  const previewUrl = resolveImageUrl(form.imageUrl);

  return (
    <div>
      <div className="page-header">
        <h2>Gallery</h2>
        {!showForm && (
          <button className="btn-indigo" onClick={openCreate}>Add Item</button>
        )}
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="filter-category">Category</label>
          <input
            id="filter-category"
            type="text"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            placeholder="e.g. interior"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-active">Status</label>
          <select
            id="filter-active"
            value={activeFilter}
            onChange={e => setActiveFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        {hasFilters && (
          <button className="btn-clear" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {showForm && (
        <div className="form-panel">
          <h3>{editingId === null ? 'Add Gallery Item' : 'Edit Gallery Item'}</h3>
          {formError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="gallery-title">Title *</label>
                <input
                  id="gallery-title"
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  maxLength={200}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="gallery-image-url">Image URL *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    id="gallery-image-url"
                    type="text"
                    value={form.imageUrl}
                    onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    required
                    maxLength={500}
                    placeholder="https://... or use Upload Image"
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem', padding: '0.35rem 0.875rem', flexShrink: 0 }}
                    disabled={uploadLoading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadLoading ? 'Uploading…' : 'Upload Image'}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="preview"
                    style={{ marginTop: '0.5rem', maxHeight: '80px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>
              <div className="form-group">
                <label htmlFor="gallery-category">Category</label>
                <input
                  id="gallery-category"
                  type="text"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label htmlFor="gallery-order">Display Order</label>
                <input
                  id="gallery-order"
                  type="number"
                  value={form.displayOrder}
                  onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))}
                />
              </div>
              {editingId !== null && (
                <div className="form-check">
                  <input
                    id="gallery-active"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  />
                  <label htmlFor="gallery-active">Active</label>
                </div>
              )}
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="form-group">
                <label htmlFor="gallery-description">Description</label>
                <textarea
                  id="gallery-description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  maxLength={1000}
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-indigo" disabled={formLoading || uploadLoading}>
                {formLoading ? 'Saving…' : (editingId === null ? 'Create' : 'Save Changes')}
              </button>
              <button type="button" className="btn-outline" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="state-message">Loading gallery items…</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="state-message">No gallery items found.</div>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="col-id">{item.id}</td>
                  <td>
                    {item.imageUrl ? (
                      <img
                        src={resolveImageUrl(item.imageUrl)}
                        alt={item.title}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : '—'}
                  </td>
                  <td>{item.title}</td>
                  <td>{item.category ?? '—'}</td>
                  <td>{item.displayOrder}</td>
                  <td>
                    <span className={`status-badge ${item.isActive ? 'status-confirmed' : 'status-pending'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-xs edit" onClick={() => openEdit(item)}>Edit</button>
                      <button
                        className={`btn-xs ${item.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleActive(item)}
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
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
