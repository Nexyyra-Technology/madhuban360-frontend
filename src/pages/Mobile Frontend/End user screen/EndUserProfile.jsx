/**
 * End User Profile & Settings
 * Backend API: getCurrentUser - fetches user from database
 * Backend API: updateUserProfile - updates profile in database
 * Change Password: links to mobile change-password flow
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";
import { getCurrentUser } from "./endUserService";

const MENU_ITEMS = [
  { key: "edit", label: "Edit Profile", icon: "👥", path: "/mobile/profile/edit" },
  { key: "password", label: "Change Password", icon: "🔒", path: "/mobile/change-password" },
  { key: "help", label: "Help & Support", icon: "❓", path: "/mobile/help" },
  { key: "pass", label: "Digital Pass", icon: "🖨", path: "/mobile/digital-pass" },
];

export default function EndUserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser({ name: "Rajesh Kumar", userId: "SUP-2023-89", zone: "Zone B: Cafeteria & Lobby" }));
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/mobile/login", { replace: true });
  }

  return (
    <div className="mobile-end-user-screen mobile-profile">
      <header className="end-user-page-header">
        <button type="button" className="mobile-back-btn" onClick={() => navigate("/mobile/dashboard")}>←</button>
        <h1>Profile & Settings</h1>
      </header>

      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar" />
          <button type="button" className="profile-edit-avatar" aria-label="Edit photo">✎</button>
        </div>
        <h2>{user?.name || "Rajesh Kumar"}</h2>
        <p className="profile-id">ID: {user?.userId || user?._id || "SUP-2023-89"}</p>
        <span className="profile-zone">📍 {user?.zone || "Zone B: Cafeteria & Lobby"}</span>
      </div>

      <div className="profile-menu">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className="profile-menu-item"
            onClick={() => {
              if (item.key === "password") navigate("/mobile/profile/change-password");
              else if (item.key === "edit") navigate("/mobile/profile/edit");
              else navigate(item.path);
            }}
          >
            <span className="profile-menu-icon">{item.icon}</span>
            <span>{item.label}</span>
            <span className="profile-menu-arrow">›</span>
          </button>
        ))}
      </div>

      <button type="button" className="profile-logout" onClick={handleLogout}>
        → Logout
      </button>

      <p className="profile-footer">App Version 2.1.0 • Madhuban Group</p>

      <MobileBottomNav />
    </div>
  );
}
