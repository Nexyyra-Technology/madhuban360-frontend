/**
 * MobileBottomNav – Bottom tab navigation for end user screens
 * -----------------------------------------------------------------------
 * - Fixed bottom bar: Dashboard, Tasks, Reports, Profile
 * - Highlights active route
 * - Uses pathname to determine active state
 */
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/mobile/dashboard", label: "Dashboard", icon: "☷" },
  { path: "/mobile/tasks", label: "Tasks", icon: "📋" },
  { path: "/mobile/reports", label: "Reports", icon: "📊" },
  { path: "/mobile/profile", label: "Profile", icon: "👤" },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (itemPath) => path === itemPath || path.startsWith(itemPath + "/");

  return (
    <nav className="mobile-bottom-nav">
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
