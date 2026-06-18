import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { StaffMember, CreateStaffMemberRequest, UpdateStaffMemberRequest } from '../types/staff';
import { getAllStaff, createStaff, updateStaff, toggleStaffActive } from '../api/staffApi';
import { extractError } from '../utils/extractError';

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const EMPTY_FORM = {
  fullName: '',
  slug: '',
  title: '',
  email: '',
  phone: '',
  isActive: true,
  displayOrder: '0',
  bio: null as string | null,
  photoUrl: null as string | null,
  instagramUrl: null as string | null,
  linkedInUrl: null as string | null,
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [toggleError, setToggleError] = useState('');

  const fetchStaff = () => {
    setLoading(true);
    setError('');
    getAllStaff()
      .then(({ data }) => setStaff(data))
      .catch(() => setError('Failed to load staff. Check that the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSlugManuallyEdited(false);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (member: StaffMember) => {
    setForm({
      fullName: member.fullName,
      slug: member.slug,
      title: member.title ?? '',
      email: member.email ?? '',
      phone: member.phone ?? '',
      isActive: member.isActive,
      displayOrder: String(member.displayOrder),
      bio: member.bio,
      photoUrl: member.photoUrl,
      instagramUrl: member.instagramUrl,
      linkedInUrl: member.linkedInUrl,
    });
    setSlugManuallyEdited(true);
    setEditingId(member.id);
    setFormError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
    setSlugManuallyEdited(false);
  };

  const handleFullNameChange = (value: string) => {
    setForm(f => ({
      ...f,
      fullName: value,
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

    const payload: CreateStaffMemberRequest = {
      fullName: form.fullName,
      slug: form.slug,
      title: form.title || null,
      bio: form.bio,
      photoUrl: form.photoUrl,
      email: form.email || null,
      phone: form.phone || null,
      instagramUrl: form.instagramUrl,
      linkedInUrl: form.linkedInUrl,
      isActive: form.isActive,
      displayOrder: parseInt(form.displayOrder, 10) || 0,
    };

    try {
      if (editingId === null) {
        await createStaff(payload);
      } else {
        const updatePayload: UpdateStaffMemberRequest = { ...payload };
        await updateStaff(editingId, updatePayload);
      }
      cancelForm();
      fetchStaff();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (member: StaffMember) => {
    setToggleError('');
    try {
      const { data } = await toggleStaffActive(member.id);
      setStaff(prev => prev.map(s => s.id === data.id ? data : s));
    } catch (err) {
      setToggleError(extractError(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Staff</h2>
        {!showForm && (
          <button className="btn-indigo" onClick={openCreate}>Add Staff</button>
        )}
      </div>

      {showForm && (
        <div className="form-panel">
          <h3>{editingId === null ? 'Add Staff Member' : 'Edit Staff Member'}</h3>
          {formError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="s-fullname">Full Name *</label>
                <input
                  id="s-fullname"
                  type="text"
                  value={form.fullName}
                  onChange={e => handleFullNameChange(e.target.value)}
                  required
                  maxLength={150}
                />
              </div>
              <div className="form-group">
                <label htmlFor="s-slug">Slug *</label>
                <input
                  id="s-slug"
                  type="text"
                  value={form.slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  required
                  maxLength={200}
                  placeholder="e.g. jane-doe"
                />
              </div>
              <div className="form-group">
                <label htmlFor="s-title">Title</label>
                <input
                  id="s-title"
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  maxLength={150}
                  placeholder="e.g. Senior Stylist"
                />
              </div>
              <div className="form-group">
                <label htmlFor="s-email">Email</label>
                <input
                  id="s-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  maxLength={200}
                />
              </div>
              <div className="form-group">
                <label htmlFor="s-phone">Phone</label>
                <input
                  id="s-phone"
                  type="text"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  maxLength={30}
                />
              </div>
              <div className="form-group">
                <label htmlFor="s-order">Display Order</label>
                <input
                  id="s-order"
                  type="number"
                  value={form.displayOrder}
                  onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))}
                  min={0}
                />
              </div>
              {editingId !== null && (
                <div className="form-check">
                  <input
                    id="s-isactive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  />
                  <label htmlFor="s-isactive">Active</label>
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

      {toggleError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{toggleError}</div>}
      {loading && <div className="state-message">Loading staff…</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && staff.length === 0 && (
        <div className="state-message">No staff members found.</div>
      )}
      {!loading && !error && staff.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Title</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Active</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.id}>
                  <td className="col-id">{member.id}</td>
                  <td>{member.fullName}</td>
                  <td>{member.slug}</td>
                  <td>{member.title ?? '—'}</td>
                  <td>{member.email ?? '—'}</td>
                  <td>{member.phone ?? '—'}</td>
                  <td>
                    <span className={`status-badge ${member.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{member.displayOrder}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-xs edit" onClick={() => openEdit(member)}>Edit</button>
                      <button
                        className={`btn-xs ${member.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleActive(member)}
                      >
                        {member.isActive ? 'Deactivate' : 'Activate'}
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
