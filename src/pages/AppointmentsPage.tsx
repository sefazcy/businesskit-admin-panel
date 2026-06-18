import { useEffect, useState } from 'react';
import type { Appointment, AppointmentStats } from '../types/appointment';
import type { StaffMember } from '../types/staff';
import type { Service } from '../types/service';
import type { AppointmentFilters } from '../api/appointmentsApi';
import { getAppointments, getAppointmentStats, updateAppointmentStatus } from '../api/appointmentsApi';
import { getAllStaff } from '../api/staffApi';
import { getAllServices } from '../api/servicesApi';

const STATUS_OPTIONS = ['', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];
const VALID_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === 'object') {
      if ('message' in data && typeof (data as { message: unknown }).message === 'string') {
        return (data as { message: string }).message;
      }
    }
  }
  return 'An unexpected error occurred.';
}

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

  const hasFilters = !!(statusFilter || dateFilter || staffFilter || serviceFilter);

  const clearFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setStaffFilter('');
    setServiceFilter('');
  };

  return (
    <div>
      <h2>Appointments</h2>

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
                <th>Change Status</th>
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
