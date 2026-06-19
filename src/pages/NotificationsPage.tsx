import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Notification, NotificationFilters } from '../types/notification';
import {
  getNotifications,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
} from '../api/notificationsApi';
import { extractError } from '../utils/extractError';

const TYPE_LABELS: Record<string, string> = {
  AppointmentCreated: 'Appointment Created',
  AppointmentConfirmed: 'Appointment Confirmed',
  AppointmentCancelled: 'Appointment Cancelled',
  ContactMessageReceived: 'Contact Message',
};

const ENTITY_LINKS: Record<string, string> = {
  Appointment: '/appointments',
  ContactMessage: '/messages',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [type, setType] = useState('');
  const [take, setTake] = useState(50);

  const [markingAll, setMarkingAll] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  const fetchNotifications = () => {
    setLoading(true);
    setError('');
    const filters: NotificationFilters = { take };
    if (unreadOnly) filters.unreadOnly = true;
    if (type) filters.type = type;

    getNotifications(filters)
      .then(({ data }) => setNotifications(data))
      .catch(() => setError('Failed to load notifications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly, type, take]);

  const handleMarkRead = async (id: number) => {
    setUpdatingIds(prev => new Set(prev).add(id));
    setActionError('');
    try {
      const { data } = await markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === data.id ? data : n)));
    } catch (err) {
      setActionError(extractError(err));
    } finally {
      setUpdatingIds(prev => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const handleMarkUnread = async (id: number) => {
    setUpdatingIds(prev => new Set(prev).add(id));
    setActionError('');
    try {
      const { data } = await markNotificationUnread(id);
      setNotifications(prev => prev.map(n => (n.id === data.id ? data : n)));
    } catch (err) {
      setActionError(extractError(err));
    } finally {
      setUpdatingIds(prev => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    setActionError('');
    try {
      await markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      setActionError(extractError(err));
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Notifications</h2>
        <p className="page-subtitle">Review recent admin notifications and mark them as read or unread.</p>
      </div>

      {actionError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          {actionError}
          <button
            onClick={() => setActionError('')}
            style={{ marginLeft: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="filters">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: '#475569', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={e => setUnreadOnly(e.target.checked)}
            style={{ accentColor: '#6366f1', width: '1rem', height: '1rem' }}
          />
          Unread only
        </label>

        <div className="filter-group">
          <label>Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="status-select">
            <option value="">All types</option>
            <option value="AppointmentCreated">Appointment Created</option>
            <option value="AppointmentConfirmed">Appointment Confirmed</option>
            <option value="AppointmentCancelled">Appointment Cancelled</option>
            <option value="ContactMessageReceived">Contact Message</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Show</label>
          <select value={take} onChange={e => setTake(Number(e.target.value))} className="status-select">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>

        <button className="btn-outline" onClick={fetchNotifications} disabled={loading}>
          Refresh
        </button>

        <button className="btn-indigo" onClick={handleMarkAllRead} disabled={markingAll || loading}>
          {markingAll ? 'Marking…' : 'Mark all as read'}
        </button>
      </div>

      {loading && <div className="state-message">Loading notifications…</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && notifications.length === 0 && (
        <div className="state-message">No notifications found.</div>
      )}
      {!loading && !error && notifications.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Title</th>
                <th>Message</th>
                <th>Type</th>
                <th>Related</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(n => {
                const relatedLink = n.relatedEntityType ? ENTITY_LINKS[n.relatedEntityType] : null;
                return (
                  <tr key={n.id}>
                    <td>
                      <span className={`status-badge ${n.isRead ? 'status-confirmed' : 'status-pending'}`}>
                        {n.isRead ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td style={{ fontWeight: n.isRead ? 400 : 600 }}>{n.title}</td>
                    <td style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.message}
                    </td>
                    <td>{TYPE_LABELS[n.type] ?? n.type}</td>
                    <td>
                      {n.relatedEntityType && n.relatedEntityId != null ? (
                        relatedLink ? (
                          <Link to={relatedLink} style={{ color: '#6366f1', textDecoration: 'none' }}>
                            {n.relatedEntityType} #{n.relatedEntityId}
                          </Link>
                        ) : (
                          <span>{n.relatedEntityType} #{n.relatedEntityId}</span>
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{n.createdAt.split('T')[0]}</td>
                    <td>
                      {n.isRead ? (
                        <button
                          className="btn-xs"
                          disabled={updatingIds.has(n.id)}
                          onClick={() => handleMarkUnread(n.id)}
                        >
                          Mark unread
                        </button>
                      ) : (
                        <button
                          className="btn-xs edit"
                          disabled={updatingIds.has(n.id)}
                          onClick={() => handleMarkRead(n.id)}
                        >
                          Mark read
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
