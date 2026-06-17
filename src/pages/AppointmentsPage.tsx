import { useEffect, useState } from 'react';
import { getAppointments } from '../api/appointmentsApi';
import { Appointment } from '../types/appointment';

const STATUS_OPTIONS = ['', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchAppointments = () => {
    setLoading(true);
    setError('');
    const filters: Record<string, string> = {};
    if (statusFilter) filters.status = statusFilter;
    if (dateFilter) filters.date = dateFilter;

    getAppointments(filters)
      .then(({ data }) => setAppointments(data))
      .catch(() => setError('Failed to load appointments. Check that the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  return (
    <div>
      <h2>Appointments</h2>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s || 'All'}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-date">Date</label>
          <input
            id="filter-date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        {(statusFilter || dateFilter) && (
          <button
            className="btn-clear"
            onClick={() => { setStatusFilter(''); setDateFilter(''); }}
          >
            Clear filters
          </button>
        )}
      </div>

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
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
