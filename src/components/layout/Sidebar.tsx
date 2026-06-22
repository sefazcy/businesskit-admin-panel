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
        <NavLink to="/customers" className={activeClass}>Customers</NavLink>
        <NavLink to="/notifications" className={activeClass}>Notifications</NavLink>
        <NavLink to="/staff" className={activeClass}>Staff</NavLink>
        <NavLink to="/working-hours" className={activeClass}>Working Hours</NavLink>
        <NavLink to="/services" className={activeClass}>Services</NavLink>
        <NavLink to="/blog" className={activeClass}>Blog</NavLink>
        <NavLink to="/gallery" className={activeClass}>Gallery</NavLink>
        <NavLink to="/messages" className={activeClass}>Messages</NavLink>
        <NavLink to="/payments" className={activeClass}>Payments</NavLink>
        <NavLink to="/products" className={activeClass}>Products</NavLink>
        <NavLink to="/settings" className={activeClass}>Settings</NavLink>
      </nav>
    </aside>
  );
}
