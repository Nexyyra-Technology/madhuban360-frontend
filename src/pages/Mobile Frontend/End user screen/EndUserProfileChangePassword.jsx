/**
 * EndUserProfileChangePassword – Change password when logged in
 * -----------------------------------------------------------------------
 * - Shown from Profile menu (different from forgot-password flow)
 * - Requires: Current password, New password, Confirm
 * - Uses endUserService.changePassword (PUT /api/users/me/change-password)
 * - On success: navigate to /mobile/profile
 * - Route: /mobile/profile/change-password (protected)
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";
import ManagerBottomNav from "../manager Screen/ManagerBottomNav";
import { changePassword } from "./endUserService";

export default function EndUserProfileChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const isManager = location.pathname.includes("/manager/");
  const profilePath = isManager ? "/mobile/manager/profile" : "/mobile/profile";
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!current || !newPass || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (newPass.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await changePassword(current, newPass);
      navigate(profilePath);
    } catch (e) {
      setError(e?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mobile-end-user-screen mobile-change-pwd">
      <header className="end-user-page-header">
        <button type="button" className="mobile-back-btn" onClick={() => navigate(profilePath)}>←</button>
        <h1>Change Password</h1>
      </header>
      <form onSubmit={handleSubmit} className="mobile-change-pwd-content">
        {error && <div className="mobile-error">{error}</div>}
        <div className="mobile-field">
          <label className="mobile-label">Current Password</label>
          <div className="mobile-input-wrap"><input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="mobile-input" placeholder="Enter current password" required /></div>
        </div>
        <div className="mobile-field">
          <label className="mobile-label">New Password</label>
          <div className="mobile-input-wrap"><input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="mobile-input" placeholder="Enter new password" required minLength={6} /></div>
        </div>
        <div className="mobile-field">
          <label className="mobile-label">Confirm New Password</label>
          <div className="mobile-input-wrap"><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mobile-input" placeholder="Confirm new password" required /></div>
        </div>
        <button type="submit" className="mobile-btn-primary" disabled={loading}>{loading ? "Updating..." : "Update Password"}</button>
      </form>
      {isManager ? <ManagerBottomNav /> : <MobileBottomNav />}
    </div>
  );
}
