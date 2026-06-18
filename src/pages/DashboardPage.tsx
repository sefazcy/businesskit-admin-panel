import { useAuth } from '../auth/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>
      <p className="page-subtitle">
        Welcome back{user?.fullName ? `, ${user.fullName}` : ''}. Here is a summary of your modules.
      </p>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-title">Backend</div>
          <div className="card-body card-active">Connected</div>
        </div>
        <div className="card">
          <div className="card-title">Appointments</div>
          <div className="card-body card-active">Module active</div>
        </div>
        <div className="card">
          <div className="card-title">Staff</div>
          <div className="card-body card-active">Module active</div>
        </div>
        <div className="card">
          <div className="card-title">Services</div>
          <div className="card-body card-active">Module active</div>
        </div>
        <div className="card">
          <div className="card-title">Blog</div>
          <div className="card-body card-active">Module active</div>
        </div>
        <div className="card">
          <div className="card-title">Gallery</div>
          <div className="card-body card-active">Module active</div>
        </div>
        <div className="card">
          <div className="card-title">Messages</div>
          <div className="card-body card-active">Module active</div>
        </div>
        <div className="card">
          <div className="card-title">Settings</div>
          <div className="card-body card-active">Module active</div>
        </div>
      </div>
    </div>
  );
}
