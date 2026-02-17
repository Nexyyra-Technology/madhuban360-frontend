<<<<<<< HEAD
import { useState } from "react";
import Sidebar from "./Sidebar";

/*
===================================================
MAIN APP LAYOUT
- Controls sidebar collapse
- Wraps all routed pages
===================================================
*/

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
=======
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
>>>>>>> 7ff153fd9903c7bdd2dfd4b33e67df74f3f33c8f
