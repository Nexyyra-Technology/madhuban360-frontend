/**
 * MobileBottomNav – Bottom tab navigation for end user screens
 */
import MobileBottomNavBase from "../../../components/MobileBottomNav";

const NAV_ITEMS = [
  { path: "/mobile/dashboard", label: "Dashboard", icon: "☷" },
  { path: "/mobile/tasks", label: "Tasks", icon: "📋" },
  { path: "/mobile/reports", label: "Reports", icon: "📊" },
  { path: "/mobile/profile", label: "Profile", icon: "👤" },
];

export default function MobileBottomNav() {
  return <MobileBottomNavBase items={NAV_ITEMS} />;
}
