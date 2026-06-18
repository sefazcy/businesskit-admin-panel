import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Appointment, AppointmentStats, UpdateAppointmentRequest } from '../types/appointment';
import type { StaffMember } from '../types/staff';
import type { Service } from '../types/service';
import type { AppointmentFilters } from '../api/appointmentsApi';
import { getAppointments, getAppointmentStats, updateAppointmentStatus, updateAppointment } from '../api/appointmentsApi';
import { getAllStaff } from '../api/staffApi';
import { getAllServices } from '../api/servicesApi';
import { extractError } from '../utils/extractError';

const STATUS_OPTIONS = ['', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];
const VALID_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

const EMPTY_EDIT_FORM = {
  customerFullName: '',
  customerEmail: '',
  customerPhone: '',
  staffMemberId: '',
  businessServiceId: '',
  requestedDate: '',
  requestedTime: '',
  note: '',
  status: 'Pending',
  adminNote: '',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState<AppointmentStats | null>(null);

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [serviceList, setServiceList] = useState<Service[]>([]);

  const [statusFilter, setStatusFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [statusError, setStatusError] = useState('');
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set<number>());

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editFormError, setEditFormError] = useState('');
  const [editFormLoading, setEditFormLoading] = useState(false);

  useEffect(() => {
    getAllStaff().then(({ data }) => setStaffList(data)).catch(() => {});
    getAllServices().then(({ data }) => setServiceList(data)).catch(() => {});
  }, []);

  const fetchStats = () => {
    getAppointmentStats()
      .then(({ data }) => setStats(data))
      .catch(() => {});
  };

  const fetchAppointments = () => {
    setLoading(true);
    setError('');
    const filters: AppointmentFilters = {};
    if (statusFilter) filters.status = statusFilter;
    if (dateFilter) filters.date = dateFilter;
    if (staffFilter) filters.staffMemberId = Number(staffFilter);
    if (serviceFilter) filters.businessServiceId = Number(serviceFilter);

    getAppointments(filters)
      .then(({ data }) => setAppointments(data))
      .catch(() => setError('Failed to load appointments. Check that the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [statusFilter, staffFilter, serviceFilter, dateFilter]);

  const handleStatusChange = async (appointment: Appointment, newStatus: string) => {
    if (newStatus === appointment.status) return;
    setStatusError('');
    setUpdatingIds(prev => new Set([...prev, appointment.id]));

    try {
      const { data } = await updateAppointmentStatus(appointment.id, {
        status: newStatus,
        adminNote: appointment.adminNote ?? null,
      });
      setAppointments(prev => prev.map(a => a.id === data.id ? data : a));
      fetchStats();
    } catch (err) {
      setStatusError(extractError(err));
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(appointment.id);
        return next;
      });
    }
  };

  const openEdit = (appointment: Appointment) => {
    setEditForm({
      customerFullName: appointment.customerFullName,
      customerEmail: appointment.customerEmail ?? '',
      customerPhone: appointment.customerPhone,
      staffMemberId: appointment.staffMemberId !== null ? String(appointment.staffMemberId) : '',
      businessServiceId: appointment.businessServiceId !== null ? String(appointment.businessServiceId) : '',
      requestedDate: appointment.requestedDate.split('T')[0],
      requestedTime: appointment.requestedTime,
      note: appointment.note ?? '',
      status: appointment.status,
      adminNote: appointment.adminNote ?? '',
    });
    setEditingId(appointment.id);
    setEditFormError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormError('');
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    setEditFormLoading(true);
    setEditFormError('');

    const payload: UpdateAppointmentRequest = {
      customerFullName: editForm.customerFullName,
      customerEmail: editForm.customerEmail.trim() || null,
      customerPhone: editForm.customerPhone,
      staffMemberId: editForm.staffMemberId !== '' ? Number(editForm.staffMemberId) : null,
      businessServiceId: editForm.businessServiceId !== '' ? Number(editForm.businessServiceId) : null,
      requestedDate: editForm.requestedDate,
      requestedTime: editForm.requestedTime,
      note: editForm.note.trim() || null,
      status: editForm.status,
      adminNote: editForm.adminNote.trim() || null,
    };

    try {
      const { data } = await updateAppointment(editingId, payload);
      setAppointments(prev => prev.map(a => a.id === data.id ? data : a));
      fetchStats();
      cancelEdit();
    } catch (err) {
      setEditFormError(extractError(err));
    } finally {
      setEditFormLoading(false);
    }
  };

  const hasFilters = !!(statusFilter || dateFilter || staffFilter || serviceFilter);

  const clearFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setStaffFilter('');
    setServiceFilter('');
  };

  return (
    <div>
      <div className="page-header">
        <h2>Appointments</h2>
      </div>

      {stats && (
        <div className="dashboard-cards" style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="card">
            <div className="card-title">Total</div>
            <div className="card-body" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {stats.totalAppointments}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Pending</div>
            <div className="card-body" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#92400e' }}>
              {stats.pendingCount}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Confirmed</div>
            <div className="card-body" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#166534' }}>
              {stats.confirmedCount}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Cancelled</div>
            <div className="card-body" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#991b1b' }}>
              {stats.cancelledCount}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Completed</div>
            <div className="card-body" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1d4ed8' }}>
              {stats.completedCount}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Today</div>
            <div className="card-body" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4338ca' }}>
              {stats.todayCount}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Next 7 Days</div>
            <div className="card-body" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0369a1' }}>
              {stats.upcoming7DaysCount}
            </div>
          </div>
        </div>
      )}

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s || 'All'}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-staff">Staff</label>
          <select
            id="filter-staff"
            value={staffFilter}
            onChange={e => setStaffFilter(e.target.value)}
          >
            <option value="">All</option>
            {staffList.map(m => (
              <option key={m.id} value={String(m.id)}>{m.fullName}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-service">Service</label>
          <select
            id="filter-service"
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
          >
            <option value="">All</option>
            {serviceList.map(s => (
              <option key={s.id} value={String(s.id)}>{s.title}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-date">Date</label>
          <input
            id="filter-date"
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
        </div>
        {hasFilters && (
          <button className="btn-clear" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {editingId !== null && (
        <div className="form-panel">
          <h3>Edit Appointment #{editingId}</h3>
          {editFormError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{editFormError}</div>
          )}
          <form onSubmit={handleEditSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="edit-fullname">Customer Full Name *</label>
                <input
                  id="edit-fullname"
                  type="text"
                  value={editForm.customerFullName}
                  onChange={e => setEditForm(f => ({ ...f, customerFullName: e.target.value }))}
                  required
                  maxLength={150}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-email">Customer Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editForm.customerEmail}
                  onChange={e => setEditForm(f => ({ ...f, customerEmail: e.target.value }))}
                  maxLength={200}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-phone">Customer Phone *</label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={editForm.customerPhone}
                  onChange={e => setEditForm(f => ({ ...f, customerPhone: e.target.value }))}
                  required
                  maxLength={30}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-staff">Staff</label>
                <select
                  id="edit-staff"
                  value={editForm.staffMemberId}
                  onChange={e => setEditForm(f => ({ ...f, staffMemberId: e.target.value }))}
                >
                  <option value="">None</option>
                  {staffList.map(m => (
                    <option key={m.id} value={String(m.id)}>{m.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-service">Service</label>
                <select
                  id="edit-service"
                  value={editForm.businessServiceId}
                  onChange={e => setEditForm(f => ({ ...f, businessServiceId: e.target.value }))}
                >
                  <option value="">None</option>
                  {serviceList.map(s => (
                    <option key={s.id} value={String(s.id)}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-date">Date *</label>
                <input
                  id="edit-date"
                  type="date"
                  value={editForm.requestedDate}
                  onChange={e => setEditForm(f => ({ ...f, requestedDate: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-time">Time *</label>
                <input
                  id="edit-time"
                  type="time"
                  value={editForm.requestedTime}
                  onChange={e => setEditForm(f => ({ ...f, requestedTime: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-status">Status *</label>
                <select
                  id="edit-status"
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                >
                  {VALID_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="form-group">
                <label htmlFor="edit-note">Customer Note</label>
                <textarea
                  id="edit-note"
                  value={editForm.note}
                  onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))}
                  maxLength={1000}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-admin-note">Admin Note</label>
                <textarea
                  id="edit-admin-note"
                  value={editForm.adminNote}
                  onChange={e => setEditForm(f => ({ ...f, adminNote: e.target.value }))}
                  maxLength={1000}
                  rows={3}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-indigo" disabled={editFormLoading}>
                {editFormLoading ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" className="btn-outline" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {statusError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{statusError}</span>
          <button
            onClick={() => setStatusError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: '0 0.25rem' }}
            aria-label="Dismiss error"
          >✕</button>
        </div>
      )}

      {loading && <div className="state-message">Loading appointments…</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && appointments.length === 0 && (
        <div className="state-message">No appointments found.</div>
      )}
      {!loading && !error && appointments.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Staff</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td className="col-id">{a.id}</td>
                  <td>{a.customerFullName}</td>
                  <td>{a.customerPhone}</td>
                  <td>{a.staffMemberName ?? '—'}</td>
                  <td>{a.businessServiceTitle ?? '—'}</td>
                  <td>{a.requestedDate.split('T')[0]}</td>
                  <td>{a.requestedTime}</td>
                  <td>
                    <span className={`status-badge status-${a.status.toLowerCase()}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        className="btn-xs edit"
                        onClick={() => openEdit(a)}
                      >
                        Edit
                      </button>
                      <select
                        className="status-select"
                        value={a.status}
                        disabled={updatingIds.has(a.id)}
                        onChange={e => handleStatusChange(a, e.target.value)}
                      >
                        {VALID_STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
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
