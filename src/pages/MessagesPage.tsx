import { useEffect, useState } from 'react';
import type { ContactMessage } from '../types/contactMessage';
import type { MessageFilters } from '../api/contactMessagesApi';
import {
  getAllMessages,
  markRead,
  markUnread,
  markReplied,
  archiveMessage,
  unarchiveMessage,
} from '../api/contactMessagesApi';
import { extractError } from '../utils/extractError';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [unreadFilter, setUnreadFilter] = useState(false);
  const [archivedFilter, setArchivedFilter] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMessages = () => {
    setLoading(true);
    setError('');
    const filters: MessageFilters = {};
    if (unreadFilter) filters.unreadOnly = true;
    if (archivedFilter) filters.archivedOnly = true;

    getAllMessages(filters)
      .then(({ data }) => setMessages(data))
      .catch(() => setError('Failed to load messages. Check that the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, [unreadFilter, archivedFilter]);

  const applyUpdate = (updated: ContactMessage) => {
    setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelectedMessage(updated);
  };

  const handleAction = async (action: () => Promise<{ data: ContactMessage }>) => {
    setActionLoading(true);
    setActionError('');
    try {
      const { data } = await action();
      applyUpdate(data);
      if (archivedFilter || unreadFilter) {
        fetchMessages();
      }
    } catch (err) {
      setActionError(extractError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const closePanel = () => {
    setSelectedMessage(null);
    setActionError('');
  };

  const hasFilters = unreadFilter || archivedFilter;

  const clearFilters = () => {
    setUnreadFilter(false);
    setArchivedFilter(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Messages</h2>
      </div>

      <div className="filters">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: '#475569', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={unreadFilter}
            onChange={e => setUnreadFilter(e.target.checked)}
            style={{ accentColor: '#6366f1', width: '1rem', height: '1rem' }}
          />
          Unread only
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: '#475569', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={archivedFilter}
            onChange={e => setArchivedFilter(e.target.checked)}
            style={{ accentColor: '#6366f1', width: '1rem', height: '1rem' }}
          />
          Archived only
        </label>
        {hasFilters && (
          <button className="btn-clear" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {selectedMessage && (
        <div className="form-panel">
          <h3>Message #{selectedMessage.id}</h3>

          {actionError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{actionError}</div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', padding: '0.45rem 0' }}>{selectedMessage.fullName}</div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', padding: '0.45rem 0' }}>{selectedMessage.email}</div>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', padding: '0.45rem 0' }}>{selectedMessage.phone ?? '—'}</div>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', padding: '0.45rem 0' }}>{selectedMessage.subject ?? '—'}</div>
            </div>
            <div className="form-group">
              <label>IP Address</label>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', padding: '0.45rem 0' }}>{selectedMessage.ipAddress ?? '—'}</div>
            </div>
            <div className="form-group">
              <label>Received</label>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', padding: '0.45rem 0' }}>{new Date(selectedMessage.createdAt).toLocaleString()}</div>
            </div>
            <div className="form-group">
              <label>Updated</label>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', padding: '0.45rem 0' }}>{new Date(selectedMessage.updatedAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-group">
              <label>Message</label>
              <div style={{
                fontSize: '0.875rem',
                color: '#1e293b',
                padding: '0.625rem 0.75rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: '1.6',
              }}>
                {selectedMessage.message}
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
            {selectedMessage.isRead ? (
              <button
                className="btn-outline"
                disabled={actionLoading}
                onClick={() => handleAction(() => markUnread(selectedMessage.id))}
              >
                Mark as Unread
              </button>
            ) : (
              <button
                className="btn-indigo"
                disabled={actionLoading}
                onClick={() => handleAction(() => markRead(selectedMessage.id))}
              >
                Mark as Read
              </button>
            )}

            {!selectedMessage.isReplied && (
              <button
                className="btn-outline"
                disabled={actionLoading}
                onClick={() => handleAction(() => markReplied(selectedMessage.id))}
              >
                Mark as Replied
              </button>
            )}

            {selectedMessage.isArchived ? (
              <button
                className="btn-outline"
                disabled={actionLoading}
                onClick={() => handleAction(() => unarchiveMessage(selectedMessage.id))}
              >
                Unarchive
              </button>
            ) : (
              <button
                className="btn-outline"
                disabled={actionLoading}
                onClick={() => handleAction(() => archiveMessage(selectedMessage.id))}
              >
                Archive
              </button>
            )}

            <button className="btn-outline" onClick={closePanel} disabled={actionLoading}>
              Close
            </button>
          </div>
        </div>
      )}

      {loading && <div className="state-message">Loading messages…</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && messages.length === 0 && (
        <div className="state-message">No messages found.</div>
      )}
      {!loading && !error && messages.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>From</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg.id}>
                  <td className="col-id">{msg.id}</td>
                  <td style={{ fontWeight: msg.isRead ? 400 : 600 }}>{msg.fullName}</td>
                  <td>{msg.email}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.subject ?? '—'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{msg.createdAt.split('T')[0]}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      <span className={`status-badge ${msg.isRead ? 'status-confirmed' : 'status-pending'}`}>
                        {msg.isRead ? 'Read' : 'Unread'}
                      </span>
                      {msg.isReplied && (
                        <span className="status-badge status-completed">Replied</span>
                      )}
                      {msg.isArchived && (
                        <span className="status-badge status-cancelled">Archived</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn-xs edit"
                      onClick={() => { setSelectedMessage(msg); setActionError(''); }}
                    >
                      View
                    </button>
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
