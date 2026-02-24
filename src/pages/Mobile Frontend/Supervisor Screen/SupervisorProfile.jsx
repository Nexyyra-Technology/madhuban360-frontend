/**
 * Profile & Settings - Figma: profile pic, name, ID, location, Change Password, Digital Pass, Logout
 * Route: /mobile/supervisor/profile
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Lock, MapPin, ShieldCheck, LogOut } from "lucide-react";
import LogoutConfirmDialog from "../manager Screen/LogoutConfirmDialog";
import { useAuth } from "../../../context/AuthContext";
import { getSupervisorProfile } from "./supervisorService";
import { getUserDisplayName } from "../../../lib/userUtils";

const MENU_ITEMS = [
  { key: "password", label: "Change Password", icon: Lock, path: "/mobile/supervisor/profile/change-password" },
  { key: "pass", label: "Digital Pass", icon: ShieldCheck, path: null },
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
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName =
    profile?.fullName ??
    profile?.name ??
    (profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : null) ??
    getUserDisplayName(user, "Supervisor");

  const userId = profile?.employeeId ?? profile?.id ?? profile?._id;
  const displayId = userId ? String(userId) : "SUP-2023-89";
  const location = profile?.location ?? profile?.propertyName ?? "Madhuban Group";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowLogout(false);
    navigate("/mobile/login", { replace: true });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "#f0f0f0" }}>
      <div
        className="mobile-end-user-screen manager-screen supervisor-screen supervisor-profile-screen"
        style={{ background: "transparent" }}
      >
        <header
          style={{
            background: "white",
            padding: "14px 18px 16px",
            borderBottom: "1px solid #e0d9d2",
            flexShrink: 0,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate("/mobile/supervisor/dashboard")}
              aria-label="Back"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: "1.5px solid #e0d9d2",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={20} color="#1a1a1a" strokeWidth={2} />
            </button>
            <h1
              style={{
                flex: 1,
                textAlign: "center",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "#0F172A",
                margin: 0,
                lineHeight: "28px",
                letterSpacing: "-0.5px",
              }}
            >
              Profile & Settings
            </h1>
            <div style={{ width: 40, height: 40 }} />
          </div>
        </header>

        <div className="supervisor-profile-content">
          {loading && <p className="manager-loading">Loading profile...</p>}
          {!loading && (
            <>
              <div className="supervisor-profile-card">
                <div className="supervisor-profile-avatar" />
                <h2 className="supervisor-profile-name">{displayName}</h2>
                <p className="supervisor-profile-id">ID: {displayId}</p>
                <div className="supervisor-profile-location-chip">
                  <MapPin size={14} color="#64748B" />
                  {location}
                </div>
              </div>

              <div className="supervisor-profile-menu">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className="supervisor-profile-menu-item"
                      onClick={() => item.path && navigate(item.path)}
                    >
                      <span className="supervisor-profile-menu-icon">
                        <Icon size={18} color="#475569" />
                      </span>
                      <span>{item.label}</span>
                      <span className="supervisor-profile-menu-arrow">
                        <ChevronRight size={18} color="#94A3B8" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="supervisor-profile-logout"
                onClick={() => setShowLogout(true)}
              >
                <LogOut size={16} />
                Logout
              </button>

              <p className="supervisor-profile-version">App Version 2.1.0 | Madhuban Group</p>
            </>
          )}
        </div>

        <LogoutConfirmDialog
          open={showLogout}
          onCancel={() => setShowLogout(false)}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
