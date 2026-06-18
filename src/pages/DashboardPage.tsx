import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchDashboardData } from '../api/dashboardApi';
import type { DashboardData } from '../api/dashboardApi';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h2>Dashboard</h2>
        </div>
        <div className="state-message">Loading dashboard…</div>
      </div>
    );
  }

  const stats = data?.appointmentStats ?? null;
  const upcoming = (data?.upcomingAppointments ?? []).slice(0, 5);

  const healthText =
    data?.healthOk === true ? 'Connected' : data?.healthOk === false ? 'Offline' : '—';
  const healthClass =
    data?.healthOk === true ? 'card-active' : data?.healthOk === false ? 'stat-offline' : 'stat-muted';

  const settingsValue =
    data?.settingsConfigured == null
      ? null
      : data.settingsConfigured
      ? 'Configured'
      : 'Not configured';
  const settingsColorClass =
    data?.settingsConfigured === true
      ? 'card-active'
      : data?.settingsConfigured === false
      ? 'stat-pending'
      : undefined;

  const statCard = (
    title: string,
    value: number | string | null,
    to: string,
    colorClass?: string,
    statusText?: boolean,
  ) => {
    const base = statusText ? 'card-status' : 'card-stat';
    return (
      <Link to={to} className="card-link">
        <div className="card">
          <div className="card-title">{title}</div>
          <div className={`${base}${value === null ? ' stat-muted' : colorClass ? ` ${colorClass}` : ''}`}>
            {value !== null ? value : '—'}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>
      <p className="page-subtitle">
        Welcome back{user?.fullName ? `, ${user.fullName}` : ''}. Here is a live summary of your modules.
      </p>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-title">Backend</div>
          <div className={`card-status ${healthClass}`}>{healthText}</div>
        </div>

        {statCard("Today's Appointments", stats?.todayCount ?? null, '/appointments')}
        {statCard(
          'Pending',
          stats?.pendingCount ?? null,
          '/appointments',
          stats?.pendingCount ? 'stat-pending' : undefined,
        )}
        {statCard('Upcoming 7 Days', stats?.upcoming7DaysCount ?? null, '/appointments')}
        {statCard(
          'Unread Messages',
          data?.unreadMessagesCount ?? null,
          '/messages',
          data?.unreadMessagesCount ? 'stat-pending' : undefined,
        )}
        {statCard('Active Staff', data?.activeStaffCount ?? null, '/staff')}
        {statCard('Active Services', data?.activeServicesCount ?? null, '/services')}
        {statCard('Published Posts', data?.publishedBlogCount ?? null, '/blog')}
        {statCard('Gallery Items', data?.activeGalleryCount ?? null, '/gallery')}
        {statCard('Settings', settingsValue, '/settings', settingsColorClass, true)}
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>Upcoming Appointments</h3>
          <Link
            to="/appointments"
            className="btn-outline"
            style={{ fontSize: '0.8125rem', padding: '0.3rem 0.75rem' }}
          >
            View all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="state-message" style={{ padding: '2rem' }}>
            No upcoming appointments.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(a => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{a.requestedDate.split('T')[0]}</td>
                    <td>{a.requestedTime}</td>
                    <td>{a.customerFullName}</td>
                    <td>{a.businessServiceTitle ?? '—'}</td>
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
    </div>
  );
}
