import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getUnreadNotificationCount } from '../../api/notificationsApi';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    getUnreadNotificationCount()
      .then(({ data }) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <Link
        to="/notifications"
        style={{ fontSize: '0.875rem', color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
      >
        Notifications
        {unreadCount !== null && unreadCount > 0 && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#6366f1',
            color: 'white',
            borderRadius: '9999px',
            fontSize: '0.6875rem',
            fontWeight: 600,
            minWidth: '1.25rem',
            height: '1.25rem',
            padding: '0 0.3rem',
            lineHeight: 1,
          }}>
            {unreadCount}
          </span>
        )}
      </Link>
      <span className="topbar-user">{user?.fullName || user?.email || 'Admin'}</span>
      <button className="btn-logout" onClick={handleLogout}>Log out</button>
    </header>
  );
}
