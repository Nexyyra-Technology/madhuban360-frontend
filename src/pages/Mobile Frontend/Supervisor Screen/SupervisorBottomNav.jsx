/**
 * SupervisorBottomNav – Bottom tab navigation for supervisor screens
 * Figma: Dashboard, Calendar (Attendance), Analytics, Profile
 */
import MobileBottomNavBase from "../../../components/MobileBottomNav";

const NAV_ITEMS = [
  { path: "/mobile/supervisor/dashboard", label: "Dashboard", icon: "☷" },
  { path: "/mobile/supervisor/tasks", label: "Tasks", icon: "📋" },
  { path: "/mobile/supervisor/attendance", label: "Attendance", icon: "📊" },
  { path: "/mobile/supervisor/profile", label: "Profile", icon: "👤" },
];

export default function SupervisorBottomNav() {
  return <MobileBottomNavBase items={NAV_ITEMS} className="supervisor-bottom-nav" />;
}
