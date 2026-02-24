/**
 * ManagerBottomNav – Bottom tab navigation for manager screens
 */
import MobileBottomNavBase from "../../../components/MobileBottomNav";

const NAV_ITEMS = [
  { path: "/mobile/manager/dashboard", label: "Dashboard", icon: "☷" },
  { path: "/mobile/manager/tasks", label: "Tasks", icon: "📋" },
  { path: "/mobile/manager/supervisors", label: "Supervisor", icon: "👥" },
  { path: "/mobile/manager/reports", label: "Reports", icon: "📊" },
  { path: "/mobile/manager/profile", label: "Profile", icon: "👤" },
];

export default function ManagerBottomNav() {
  return <MobileBottomNavBase items={NAV_ITEMS} className="manager-bottom-nav" />;
}
