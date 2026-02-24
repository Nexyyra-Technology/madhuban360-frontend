/**
 * SupervisorLayout – Wraps all supervisor routes with shared chrome and bottom nav.
 * SupervisorBottomNav stays on every supervisor page without duplicating it in each screen.
 */
import { Outlet } from "react-router-dom";
import SupervisorBottomNav from "./SupervisorBottomNav";

export default function SupervisorLayout() {
  return (
    <div className="mobile-end-user-screen manager-screen supervisor-screen supervisor-layout">
      <Outlet />
      <SupervisorBottomNav />
    </div>
  );
}
