import { useState } from "react";
import Sidebar from "./sidebar";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="main-wrap">
        <header className="app-header">
          <span className="app-header-title">Main Admin</span>
          <div className="app-header-actions">
            <button type="button" className="app-header-icon" title="Search" aria-label="Search">🔍</button>
            <button type="button" className="app-header-icon" title="Settings" aria-label="Settings">⚙</button>
            <button type="button" className="app-header-icon" title="Notifications" aria-label="Notifications">🔔</button>
            <button type="button" className="app-header-icon" title="Help" aria-label="Help">?</button>
            <div className="app-header-avatar" title="Profile" aria-hidden />
          </div>
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
