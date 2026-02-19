import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./sidebar";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  return (
    <div className={`app ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="main-wrap">
        <header className="app-header">
          <button
            type="button"
            className="app-header-back-btn"
            onClick={() => (isDashboard ? navigate("/login") : navigate(-1))}
            title="Go back"
            aria-label="Go back"
          >
            ← Back
          </button>
          <span className="app-header-title">Main Admin</span>
          <div className="app-header-actions">
            <button type="button" className="app-header-icon" title="Search" aria-label="Search">🔍</button>
            <button type="button" className="app-header-icon" title="Settings" aria-label="Settings">⚙</button>
            <button type="button" className="app-header-icon" title="Notifications" aria-label="Notifications">🔔</button>
            <button type="button" className="app-header-icon" title="Help" aria-label="Help">?</button>
            <div className="app-header-avatar" title="Profile" aria-hidden />
          </div>
        </header>
        <main className="main"><Outlet /></main>
      </div>
    </div>
  );
}
