import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="main">{children}</main>
    </div>
  );
}
