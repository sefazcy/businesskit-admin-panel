import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <span className="topbar-user">{user?.fullName || user?.email || 'Admin'}</span>
      <button className="btn-logout" onClick={handleLogout}>Log out</button>
    </header>
  );
}
