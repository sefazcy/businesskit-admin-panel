import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '../types/service';
import { getAllServices, createService, updateService, toggleServiceActive } from '../api/servicesApi';

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
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
  slug: '',
  shortDescription: '',
  price: 0,
  durationMinutes: 0,
  isActive: true,
  displayOrder: 0,
  fullDescription: null as string | null,
  imageUrl: null as string | null,
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchServices = () => {
    setLoading(true);
    setError('');
    getAllServices()
      .then(({ data }) => setServices(data))
      .catch(() => setError('Failed to load services. Check that the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSlugManuallyEdited(false);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (service: Service) => {
    setForm({
      title: service.title,
      slug: service.slug,
      shortDescription: service.shortDescription ?? '',
      price: service.price,
      durationMinutes: service.durationMinutes,
      isActive: service.isActive,
      displayOrder: service.displayOrder,
      fullDescription: service.fullDescription,
      imageUrl: service.imageUrl,
    });
    setSlugManuallyEdited(true);
    setEditingId(service.id);
    setFormError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
    setSlugManuallyEdited(false);
  };

  const handleTitleChange = (value: string) => {
    setForm(f => ({
      ...f,
      title: value,
      slug: slugManuallyEdited ? f.slug : toSlug(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setForm(f => ({ ...f, slug: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingId === null) {
        const payload: CreateServiceRequest = {
          title: form.title,
          slug: form.slug,
          shortDescription: form.shortDescription || null,
          fullDescription: form.fullDescription,
          price: form.price,
          durationMinutes: form.durationMinutes,
          imageUrl: form.imageUrl,
          displayOrder: form.displayOrder,
        };
        await createService(payload);
      } else {
        const payload: UpdateServiceRequest = {
          title: form.title,
          slug: form.slug,
          shortDescription: form.shortDescription || null,
          fullDescription: form.fullDescription,
          price: form.price,
          durationMinutes: form.durationMinutes,
          imageUrl: form.imageUrl,
          isActive: form.isActive,
          displayOrder: form.displayOrder,
        };
        await updateService(editingId, payload);
      }
      cancelForm();
      fetchServices();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const { data } = await toggleServiceActive(service.id);
      setServices(prev => prev.map(s => s.id === data.id ? data : s));
    } catch {
      // table stays unchanged on failure
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Services</h2>
        {!showForm && (
          <button className="btn-indigo" onClick={openCreate}>Add Service</button>
        )}
      </div>

      {showForm && (
        <div className="form-panel">
          <h3>{editingId === null ? 'Add Service' : 'Edit Service'}</h3>
          {formError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="sv-title">Title *</label>
                <input
                  id="sv-title"
                  type="text"
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  required
                  maxLength={200}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sv-slug">Slug *</label>
                <input
                  id="sv-slug"
                  type="text"
                  value={form.slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  required
                  maxLength={200}
                  placeholder="e.g. haircut-and-beard"
                />
              </div>
              <div className="form-group">
                <label htmlFor="sv-desc">Short Description</label>
                <input
                  id="sv-desc"
                  type="text"
                  value={form.shortDescription}
                  onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                  maxLength={500}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sv-price">Price</label>
                <input
                  id="sv-price"
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  step={0.01}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sv-duration">Duration (minutes)</label>
                <input
                  id="sv-duration"
                  type="number"
                  value={form.durationMinutes}
                  onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) || 0 }))}
                  min={0}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sv-order">Display Order</label>
                <input
                  id="sv-order"
                  type="number"
                  value={form.displayOrder}
                  onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) || 0 }))}
                  min={0}
                />
              </div>
              {editingId !== null && (
                <div className="form-check">
                  <input
                    id="sv-isactive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  />
                  <label htmlFor="sv-isactive">Active</label>
                </div>
              )}
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

      {loading && <div className="state-message">Loading services…</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && services.length === 0 && (
        <div className="state-message">No services found.</div>
      )}
      {!loading && !error && services.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Slug</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Active</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id}>
                  <td className="col-id">{service.id}</td>
                  <td>{service.title}</td>
                  <td>{service.slug}</td>
                  <td>{service.price.toFixed(2)}</td>
                  <td>{service.durationMinutes} min</td>
                  <td>
                    <span className={`status-badge ${service.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{service.displayOrder}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-xs edit" onClick={() => openEdit(service)}>Edit</button>
                      <button
                        className={`btn-xs ${service.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleActive(service)}
                      >
                        {service.isActive ? 'Deactivate' : 'Activate'}
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
