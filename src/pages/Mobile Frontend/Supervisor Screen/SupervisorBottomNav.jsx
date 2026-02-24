/**
 * SupervisorBottomNav – Bottom tab navigation for supervisor screens
 * Matches design: Dashboard, Tasks, Attendance, Profile. Active = dark blue + top underline.
 */
import { MdDashboard, MdAssignment, MdDateRange, MdPerson } from "react-icons/md";
import MobileBottomNavBase from "../../../components/MobileBottomNav";

const NAV_ITEMS = [
  { path: "/mobile/supervisor/dashboard", label: "Dashboard", icon: <MdDashboard size={24} /> },
  { path: "/mobile/supervisor/tasks", label: "Tasks", icon: <MdAssignment size={24} /> },
  { path: "/mobile/supervisor/attendance", label: "Attendance", icon: <MdDateRange size={22} /> },
  { path: "/mobile/supervisor/profile", label: "Profile", icon: <MdPerson size={22} /> },
];

export default function SupervisorBottomNav() {
  return <MobileBottomNavBase items={NAV_ITEMS} className="supervisor-bottom-nav" />;
}
