import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart,
  Users,
  Building,
  ClipboardList,
  Landmark,
  TrendingUp,
  Wrench,
  FileText,
  FileStack,
  ShoppingCart,
  ArrowUpRight
} from "lucide-react";
import logoIcon from "../assets/logo-icon.png";
import logoText from "../assets/logo-text.png";

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };
  return (
    <aside className="sidebar sidebar-figma">
      <div className="sidebar-inner">
        <div className="brand brand-figma">
          <img src={logoIcon} className="brand-icon" alt="" />
          {!collapsed && <img src={logoText} className="brand-text" alt="MADHUBAN" />}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className="sidebar-link" end><span className="sidebar-icon"><BarChart size={18} /></span><span className="sidebar-label">Dashboard</span></NavLink>
          <NavLink to="/users" className="sidebar-link"><span className="sidebar-icon"><Users size={18} /></span><span className="sidebar-label">User Management</span></NavLink>
          <NavLink to="/properties" className="sidebar-link"><span className="sidebar-icon"><Building size={18} /></span><span className="sidebar-label">Property Management</span></NavLink>
          <NavLink to="/tasks" className="sidebar-link"><span className="sidebar-icon"><ClipboardList size={18} /></span><span className="sidebar-label">Task Manager</span></NavLink>

          {!collapsed && <p className="nav-section">SYSTEM</p>}

          <NavLink to="/hrms" className="sidebar-link"><span className="sidebar-icon"><Landmark size={18} /></span><span className="sidebar-label">HRMS</span></NavLink>
          <NavLink to="/sales" className="sidebar-link"><span className="sidebar-icon"><TrendingUp size={18} /></span><span className="sidebar-label">Sales and Lease</span></NavLink>
          <NavLink to="/facility" className="sidebar-link"><span className="sidebar-icon"><Wrench size={18} /></span><span className="sidebar-label">Facility Management</span></NavLink>
          <NavLink to="/legal" className="sidebar-link"><span className="sidebar-icon"><FileText size={18} /></span><span className="sidebar-label">Legal and Documentations</span></NavLink>
          <NavLink to="/accounts" className="sidebar-link"><span className="sidebar-icon"><FileStack size={18} /></span><span className="sidebar-label">Accounts</span></NavLink>
          <NavLink to="/store" className="sidebar-link"><span className="sidebar-icon"><ShoppingCart size={18} /></span><span className="sidebar-label">Store and Purchase</span></NavLink>
          <NavLink to="/reports" className="sidebar-link"><span className="sidebar-icon"><BarChart size={18} /></span><span className="sidebar-label">Reports</span></NavLink>
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
              <strong>ADMIN</strong>
            </div>
            <button type="button" className="sidebar-logout-btn" title="Logout" aria-label="Logout" onClick={handleLogout}><ArrowUpRight className="w-4 h-4" /></button>
          </div>
        )}
        {!collapsed && (
          <button type="button" className="sidebar-logout-text-btn" onClick={handleLogout}>Logout</button>
        )}
      </div>
    </aside>
  );
}
