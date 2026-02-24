/**
 * ManagerProfile – Profile & settings for facility manager
 * -----------------------------------------------------------------------
 * - Profile from /api/users/me
 * - Edit Profile, Change Password, Notification settings
 * - Logout button opens LogoutConfirmDialog
 * - Route: /mobile/manager/profile
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ManagerBottomNav from "./ManagerBottomNav";
import LogoutConfirmDialog from "./LogoutConfirmDialog";
import { useAuth } from "../../../context/AuthContext";
import { getManagerProfile } from "./managerService";

const MENU_ITEMS = [
  { key: "edit", label: "Edit Profile", icon: "✎" },
  { key: "password", label: "Change Password", icon: "🔒" },
  { key: "notification", label: "Notification settings", icon: "🔔" },
];

export default function ManagerProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const p = await getManagerProfile();
        if (!cancelled) setProfile(p);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const displayName =
    profile?.fullName ??
    profile?.name ??
    (profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : null) ??
    user?.fullName ??
    user?.name ??
    "Manager";

  const designation =
    profile?.jobTitle ?? profile?.job_title ?? profile?.role ?? "Senior Facility Manager";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowLogout(false);
    navigate("/mobile/login", { replace: true });
  }

  return (
    <div className="mobile-end-user-screen manager-screen manager-profile-screen">
      <header className="manager-profile-header">
        <span className="manager-header-sub">Manager Profile</span>
        <h1 className="manager-profile-title">Profile & Settings</h1>
      </header>

      <div className="manager-profile-content">
        {loading && <p className="manager-loading">Loading profile…</p>}

        {!loading && (
          <>
            <div className="manager-profile-card">
              <div className="manager-profile-avatar-wrap">
                <div className="manager-profile-avatar" />
                <button
                  type="button"
                  className="manager-profile-edit-avatar"
                  aria-label="Edit photo"
                >
                  ✎
                </button>
              </div>
              <h2 className="manager-profile-name">{displayName}</h2>
              <p className="manager-profile-designation">{designation}</p>
            </div>

            <div className="manager-profile-menu">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="manager-profile-menu-item"
                  onClick={() => {
                    if (item.key === "password")
                      navigate("/mobile/manager/profile/change-password");
                    else if (item.key === "edit") navigate("/mobile/manager/profile");
                  }}
                >
                  <span className="manager-profile-menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="manager-profile-menu-arrow">›</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="manager-profile-logout"
              onClick={() => setShowLogout(true)}
            >
              <span className="manager-logout-btn-icon">→</span> Logout
            </button>

            <div className="manager-profile-footer">
              <p>Madhuban Facility Manager App</p>
              <p className="manager-profile-version">Version 2.1.0</p>
            </div>
          </>
        )}
      </div>

      <LogoutConfirmDialog
        open={showLogout}
        onCancel={() => setShowLogout(false)}
        onLogout={handleLogout}
      />

      <ManagerBottomNav />
    </div>
  );
}
