/**
 * Shared mobile bottom navigation – used by both EndUser and Manager screens
 */
import { memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function MobileBottomNavBase({ items, className = "" }) {
  const navigate = useNavigate();
  const path = useLocation().pathname;

  const isActive = (itemPath) => path === itemPath || path.startsWith(itemPath + "/");

  return (
    <nav className={`mobile-bottom-nav ${className}`.trim()}>
      {items.map((item) => (
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

export default memo(MobileBottomNavBase);
