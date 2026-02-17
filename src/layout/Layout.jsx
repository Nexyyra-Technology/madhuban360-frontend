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
