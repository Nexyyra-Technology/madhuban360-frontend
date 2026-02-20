/**
 * EndUserReports – Reports & analytics placeholder
 * -----------------------------------------------------------------------
 * - Placeholder screen for bottom nav "Reports"
 * - Can be extended with GET /api/reports or /api/attendance
 * - Route: /mobile/reports (protected)
 */
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";

export default function EndUserReports() {
  const navigate = useNavigate();
  return (
    <div className="mobile-end-user-screen">
      <header className="end-user-page-header">
        <h1>Reports</h1>
      </header>
      <div className="end-user-placeholder">
        <p>Reports & analytics</p>
        <p className="text-muted">Connect backend API: GET /api/reports or /api/attendance</p>
      </div>
      <MobileBottomNav />
    </div>
  );
}
