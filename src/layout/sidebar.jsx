import { NavLink } from "react-router-dom";
import logoIcon from "../assets/logo-icon.png";
import logoText from "../assets/logo-text.png";

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className="sidebar sidebar-figma">
      <div className="sidebar-inner">
        <div className="brand brand-figma">
          <img src={logoIcon} className="brand-icon" alt="" />
          {!collapsed && <img src={logoText} className="brand-text" alt="MADHUBAN" />}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className="sidebar-link" end><span className="sidebar-icon">📊</span><span className="sidebar-label">Dashboard</span></NavLink>
          <NavLink to="/users" className="sidebar-link"><span className="sidebar-icon">👥</span><span className="sidebar-label">User Management</span></NavLink>
          <NavLink to="/properties" className="sidebar-link"><span className="sidebar-icon">🏢</span><span className="sidebar-label">Property Management</span></NavLink>
          <NavLink to="/tasks" className="sidebar-link"><span className="sidebar-icon">📋</span><span className="sidebar-label">Task Manager</span></NavLink>

          {!collapsed && <p className="nav-section">SYSTEM</p>}

          <NavLink to="/hrms" className="sidebar-link"><span className="sidebar-icon">🏛</span><span className="sidebar-label">HRMS</span></NavLink>
          <NavLink to="/sales" className="sidebar-link"><span className="sidebar-icon">📈</span><span className="sidebar-label">Sales and Lease</span></NavLink>
          <NavLink to="/facility" className="sidebar-link"><span className="sidebar-icon">🔧</span><span className="sidebar-label">Facility Management</span></NavLink>
          <NavLink to="/legal" className="sidebar-link"><span className="sidebar-icon">📄</span><span className="sidebar-label">Legal and Documentations</span></NavLink>
          <NavLink to="/accounts" className="sidebar-link"><span className="sidebar-icon">📑</span><span className="sidebar-label">Accounts</span></NavLink>
          <NavLink to="/store" className="sidebar-link"><span className="sidebar-icon">🛒</span><span className="sidebar-label">Store and Purchase</span></NavLink>
          <NavLink to="/reports" className="sidebar-link"><span className="sidebar-icon">📊</span><span className="sidebar-label">Reports</span></NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button type="button" className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? "→" : "←"}
        </button>
        {!collapsed && (
          <div className="sidebar-user">
            <div className="avatar" />
            <div className="sidebar-user-info">
              <strong>Harish Sawant</strong>
              <p>Head Administrator</p>
            </div>
            <button type="button" className="sidebar-logout-btn" title="Logout" aria-label="Logout">↗</button>
          </div>
        )}
      </div>
    </aside>
  );
}
