import { useState, Suspense } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";

const PageFallback = () => (
  <div style={{ padding: 24, textAlign: "center", color: "#666" }}>Loading…</div>
);

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="main-wrap">
        <main className="main">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
