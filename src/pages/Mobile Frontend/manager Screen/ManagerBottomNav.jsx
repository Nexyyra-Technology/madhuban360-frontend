/**
 * ManagerBottomNav – Bottom tab navigation for manager screens
 * -----------------------------------------------------------------------
 * - Fixed bottom bar: Dashboard, Tasks, Supervisor, Reports, Profile
 * - Highlights active route
 */
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/mobile/manager/dashboard", label: "Dashboard", icon: "☷" },
  { path: "/mobile/manager/tasks", label: "Tasks", icon: "📋" },
  { path: "/mobile/manager/supervisors", label: "Supervisor", icon: "👥" },
  { path: "/mobile/manager/reports", label: "Reports", icon: "📊" },
  { path: "/mobile/manager/profile", label: "Profile", icon: "👤" },
];

export default function ManagerBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (itemPath) => path === itemPath || path.startsWith(itemPath + "/");

  return (
    <nav className="mobile-bottom-nav manager-bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.path}
          type="button"
          className={`mobile-nav-item ${isActive(item.path) ? "active" : ""}`}
          onClick={() => navigate(item.path)}
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span className="mobile-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
