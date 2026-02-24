/**
 * Profile & Settings – Figma: profile pic, name, ID, location, Change Password, Digital Pass, Logout
 * Route: /mobile/supervisor/profile
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoutConfirmDialog from "../manager Screen/LogoutConfirmDialog";
import { useAuth } from "../../../context/AuthContext";
import { getSupervisorProfile } from "./supervisorService";
import { getUserDisplayName } from "../../../lib/userUtils";

const MENU_ITEMS = [
  { key: "password", label: "Change Password", icon: "🔒", path: "/mobile/supervisor/profile/change-password" },
  { key: "pass", label: "Digital Pass", icon: "🪪", path: "/mobile/supervisor/profile" },
];

export default function SupervisorProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSupervisorProfile()
      .then((p) => { if (!cancelled) setProfile(p); })
      .catch(() => { if (!cancelled) setProfile(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const displayName =
    profile?.fullName ??
    profile?.name ??
    (profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : null) ??
    getUserDisplayName(user, "Rajesh Kumar");

  const userId = profile?.employeeId ?? profile?.id ?? profile?._id;
  const displayId = userId ? String(userId) : "SUP-2023-89";
  const location = profile?.location ?? profile?.propertyName ?? "Vikram Monarch";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowLogout(false);
    navigate("/mobile/login", { replace: true });
  }

  return (
    <div className="mobile-end-user-screen manager-screen supervisor-screen supervisor-profile-screen">
      <header className="supervisor-page-header">
        <div className="supervisor-header-bar">
          <button type="button" className="supervisor-back-btn" onClick={() => navigate("/mobile/supervisor/dashboard")} aria-label="Back">
            ←
          </button>
          <h1 className="supervisor-page-title">Profile & Settings</h1>
        </div>
      </header>

      <div className="supervisor-profile-content">
        {loading && <p className="manager-loading">Loading profile…</p>}
        {!loading && (
          <>
            <div className="supervisor-profile-card">
              <div className="supervisor-profile-avatar" />
              <h2 className="supervisor-profile-name">{displayName}</h2>
              <p className="supervisor-profile-id">ID: {displayId}</p>
              <div className="supervisor-profile-location-chip">
                <span>📍</span> {location}
              </div>
            </div>

            <div className="supervisor-profile-menu">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="supervisor-profile-menu-item"
                  onClick={() => item.path && item.key === "password" && navigate(item.path)}
                >
                  <span className="supervisor-profile-menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="supervisor-profile-menu-arrow">›</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="supervisor-profile-logout"
              onClick={() => setShowLogout(true)}
            >
              <span className="supervisor-logout-icon">→</span> Logout
            </button>

            <p className="supervisor-profile-version">App Version 2.1.0 • Madhuban Group</p>
          </>
        )}
      </div>

      <LogoutConfirmDialog
        open={showLogout}
        onCancel={() => setShowLogout(false)}
        onLogout={handleLogout}
      />

    </div>
  );
}
