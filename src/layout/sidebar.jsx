import { NavLink } from "react-router-dom";
import logoIcon from "../assets/logo-icon.png";
import logoText from "../assets/logo-text.png";

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <img src={logoIcon} className="brand-icon" />
          {!collapsed && <img src={logoText} className="brand-text" />}
        </div>

        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/users">User Management</NavLink>
          <NavLink to="/properties">Property Management</NavLink>
          <NavLink to="/tasks">Task Manager</NavLink>

          {!collapsed && <p className="nav-section">SYSTEM</p>}

          <NavLink to="/hrms">HRMS</NavLink>
          <NavLink to="/sales">Sales and Lease</NavLink>
          <NavLink to="/facility">Facility Management</NavLink>
          <NavLink to="/legal">Legal and Documentations</NavLink>
          <NavLink to="/accounts">Accounts</NavLink>
          <NavLink to="/store">Store and Purchase</NavLink>
          <NavLink to="/reports">Reports</NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "→" : "←"}
        </button>

        {!collapsed && (
          <div className="sidebar-user">
            <div className="avatar"></div>
            <div>
              <strong>Harish Sawant</strong>
              <p>Head Administrator</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
