import { NavLink } from 'react-router-dom';

const activeClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">BusinessKit</div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={activeClass}>Dashboard</NavLink>
        <NavLink to="/appointments" className={activeClass}>Appointments</NavLink>
        <NavLink to="/staff" className={activeClass}>Staff</NavLink>
        <NavLink to="/services" className={activeClass}>Services</NavLink>
        <NavLink to="/blog" className={activeClass}>Blog</NavLink>
        <span className="nav-link disabled">Gallery</span>
        <span className="nav-link disabled">Settings</span>
      </nav>
    </aside>
  );
}
