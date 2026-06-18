import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Customer } from '../types/customer';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  unarchiveCustomer,
} from '../api/customersApi';
import { extractError } from '../utils/extractError';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  notes: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    setError('');
    getCustomers({
      name: nameFilter.trim() || undefined,
      email: emailFilter.trim() || undefined,
      phone: phoneFilter.trim() || undefined,
      includeArchived: includeArchived || undefined,
    })
      .then(({ data }) => setCustomers(data))
      .catch(() => setError('Failed to load customers. Check that the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [nameFilter, emailFilter, phoneFilter, includeArchived]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (customer: Customer) => {
    setForm({
      fullName: customer.fullName,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      notes: customer.notes ?? '',
    });
    setEditingId(customer.id);
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
    const fullName = form.fullName.trim();
    if (!fullName) {
      setFormError('Full Name is required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    const payload = {
      fullName,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      if (editingId === null) {
        await createCustomer(payload);
      } else {
        await updateCustomer(editingId, payload);
      }
      cancelForm();
      fetchCustomers();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleArchive = async (customer: Customer) => {
    setActionError('');
    try {
      const { data } = await archiveCustomer(customer.id);
      if (!includeArchived) {
        setCustomers(prev => prev.filter(c => c.id !== data.id));
      } else {
        setCustomers(prev => prev.map(c => c.id === data.id ? data : c));
      }
    } catch (err) {
      setActionError(extractError(err));
    }
  };

  const handleUnarchive = async (customer: Customer) => {
    setActionError('');
    try {
      const { data } = await unarchiveCustomer(customer.id);
      setCustomers(prev => prev.map(c => c.id === data.id ? data : c));
    } catch (err) {
      setActionError(extractError(err));
    }
  };

  const hasFilters = !!(nameFilter || emailFilter || phoneFilter || includeArchived);

  const clearFilters = () => {
    setNameFilter('');
    setEmailFilter('');
    setPhoneFilter('');
    setIncludeArchived(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
            Manage customer records, contact details, notes, and archive status.
          </p>
        </div>
        {!showForm && (
          <button className="btn-indigo" onClick={openCreate}>Add Customer</button>
        )}
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="filter-name">Name</label>
          <input
            id="filter-name"
            type="text"
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
            placeholder="Search name…"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-email">Email</label>
          <input
            id="filter-email"
            type="text"
            value={emailFilter}
            onChange={e => setEmailFilter(e.target.value)}
            placeholder="Search email…"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-phone">Phone</label>
          <input
            id="filter-phone"
            type="text"
            value={phoneFilter}
            onChange={e => setPhoneFilter(e.target.value)}
            placeholder="Search phone…"
          />
        </div>
        <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={e => setIncludeArchived(e.target.checked)}
            />
            Include archived
          </label>
        </div>
        {hasFilters && (
          <button className="btn-clear" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {showForm && (
        <div className="form-panel">
          <h3>{editingId === null ? 'Add Customer' : 'Edit Customer'}</h3>
          {formError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="c-fullname">Full Name *</label>
                <input
                  id="c-fullname"
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  required
                  maxLength={150}
                />
              </div>
              <div className="form-group">
                <label htmlFor="c-email">Email</label>
                <input
                  id="c-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  maxLength={200}
                />
              </div>
              <div className="form-group">
                <label htmlFor="c-phone">Phone</label>
                <input
                  id="c-phone"
                  type="text"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  maxLength={30}
                />
              </div>
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="form-group">
                <label htmlFor="c-notes">Notes</label>
                <textarea
                  id="c-notes"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  maxLength={2000}
                  rows={4}
                />
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

      {actionError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionError}</span>
          <button
            onClick={() => setActionError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: '0 0.25rem' }}
            aria-label="Dismiss error"
          >✕</button>
        </div>
      )}

      {loading && <div className="state-message">Loading customers…</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && customers.length === 0 && (
        <div className="state-message">No customers found.</div>
      )}
      {!loading && !error && customers.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td className="col-id">{c.id}</td>
                  <td>{c.fullName}</td>
                  <td>{c.email ?? '—'}</td>
                  <td>{c.phone ?? '—'}</td>
                  <td>
                    <span className={`status-badge ${c.isArchived ? 'status-cancelled' : 'status-confirmed'}`}>
                      {c.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td>{c.updatedAt.split('T')[0]}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-xs edit" onClick={() => openEdit(c)}>Edit</button>
                      {c.isArchived ? (
                        <button className="btn-xs activate" onClick={() => handleUnarchive(c)}>Unarchive</button>
                      ) : (
                        <button className="btn-xs deactivate" onClick={() => handleArchive(c)}>Archive</button>
                      )}
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
