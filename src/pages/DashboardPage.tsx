import { useAuth } from '../auth/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Dashboard</h2>
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
          <div className="card-body card-soon">Coming soon</div>
        </div>
        <div className="card">
          <div className="card-title">Gallery</div>
          <div className="card-body card-soon">Coming soon</div>
        </div>
      </div>
    </div>
  );
}
