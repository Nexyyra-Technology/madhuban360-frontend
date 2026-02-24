/**
 * Supervisor Dashboard – Matches example.jsx layout with inline styles and lucide-react icons.
 * Data from GET /api/supervisor/dashboard. Route: /mobile/supervisor/dashboard
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MapPin, ClipboardList, Clock, Search, ChevronRight } from "lucide-react";
import { getSupervisorDashboard } from "./supervisorService";
import { getNotifications } from "../notificationService";
import { getGreeting } from "../../../lib/userUtils";
import logoIcon from "../../../assets/logo-icon.png";

const defaultDashboard = {
  supervisor: { supervisorName: "Supervisor", organizationName: "Madhuban Group", profileImageUrl: null },
  summary: { completed: 0, pending: 0 },
  staffOnline: { onlineTeamMembersCount: 0, teamMembers: [] },
};

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(defaultDashboard);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getNotifications(true)
      .then(({ unreadCount: c }) => setUnreadCount(c ?? 0))
      .catch(() => setUnreadCount(0));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const dashboard = await getSupervisorDashboard();
        if (!cancelled) setData(dashboard);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load dashboard");
          setData(defaultDashboard);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const { supervisor, summary, staffOnline } = data;
  const completed = summary?.completed ?? 0;
  const pending = summary?.pending ?? 0;
  const teamMembers = Array.isArray(staffOnline?.teamMembers) ? staffOnline.teamMembers : [];
  const onlineCount = staffOnline?.onlineTeamMembersCount ?? 0;

  const filteredMembers = teamMembers.filter(
    (m) =>
      (m.staffName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOnline = (member) => (member.status || "").toLowerCase() === "online";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "#f5f2ee" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2.5px solid #c8a882",
                flexShrink: 0,
              }}
            >
              {supervisor?.profileImageUrl ? (
                <img src={supervisor.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <img src={logoIcon} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, color: "#1a1a1a", lineHeight: 1.2 }}>
                {getGreeting()}, {supervisor?.supervisorName ?? "Supervisor"}
              </div>
              <div style={{ fontSize: 12, color: "#9a8f85", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <MapPin size={11} color="#9a8f85" />
                {supervisor?.organizationName ?? "Madhuban Group"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/mobile/supervisor/notifications")}
            aria-label="Notifications"
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "1.5px solid #e0d9d2",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              cursor: "pointer",
            }}
          >
            <Bell size={18} color="#4a4a4a" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: 9,
                  width: 7,
                  height: 7,
                  background: "#e05252",
                  borderRadius: "50%",
                  border: "1.5px solid white",
                }}
              />
            )}
          </button>
        </div>

        {loading && (
          <p style={{ textAlign: "center", color: "#9a8f85", fontSize: 14, margin: "24px 0" }}>Loading dashboard…</p>
        )}

        {error && !loading && (
          <p style={{ padding: 12, marginBottom: 16, background: "#fef2f2", color: "#b91c1c", fontSize: 14, borderRadius: 8 }}>
            {error} Showing offline view.
          </p>
        )}

        {!loading && (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
              <button
                type="button"
                onClick={() => navigate("/mobile/supervisor/in-progress")}
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 18,
                  boxShadow: "0 2px 14px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  border: "none",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                    background: "#eef2ff",
                  }}
                >
                  <ClipboardList size={18} color="#4f6ef7" strokeWidth={1.8} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{completed}</div>
                <div style={{ fontSize: 12.5, color: "#9a8f85", fontWeight: 500 }}>Completed</div>
              </button>
              <button
                type="button"
                onClick={() => navigate("/mobile/supervisor/pending-tasks")}
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 18,
                  boxShadow: "0 2px 14px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  border: "none",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                    background: "#fff8ed",
                  }}
                >
                  <Clock size={18} color="#e8963a" strokeWidth={1.8} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{pending}</div>
                <div style={{ fontSize: 12.5, color: "#9a8f85", fontWeight: 500 }}>Pending</div>
              </button>
            </div>

            {/* Staff Section */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: "28px",
                  letterSpacing: "-0.5px",
                  verticalAlign: "middle",
                  color: "#0F172A",
                }}
              >
                Staff Online
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              
                <button
                  type="button"
                  onClick={() => setShowSearch((s) => !s)}
                  aria-label="Search"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "1.5px solid #e0d9d2",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Search size={15} color="#9a8f85" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#64748B", fontWeight: 500, marginBottom: 16 }}>
              <div style={{ width: 7, height: 7, background: "#3dab6e", borderRadius: "50%" }} />
              {onlineCount} Team Members Active
            </div>

            {showSearch && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "white",
                  borderRadius: 14,
                  padding: "10px 16px",
                  gap: 10,
                  marginBottom: 16,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
              >
                <Search size={14} color="#bbb" strokeWidth={2} />
                <input
                  autoFocus
                  placeholder="Search staff or zone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: 13.5,
                    color: "#1a1a1a",
                    background: "transparent",
                    flex: 1,
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredMembers.length === 0 ? (
                <p style={{ textAlign: "center", color: "#9a8f85", fontSize: 14, padding: 24 }}>No staff online.</p>
              ) : (
                filteredMembers.map((member, i) => (
                  <div
                    key={member.staffId ?? i}
                    role="button"
                    tabIndex={0}
                    onClick={() => {}}
                    style={{
                      background: "white",
                      borderRadius: 18,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.045)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
                      {member.profileImageUrl ? (
                        <img
                          src={member.profileImageUrl}
                          alt=""
                          style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "#e0d9d2",
                          }}
                        />
                      )}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 1,
                          right: 1,
                          width: 11,
                          height: 11,
                          borderRadius: "50%",
                          border: "2px solid white",
                          background: isOnline(member) ? "#3dab6e" : "#bbb",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: "#1a1a1a", marginBottom: 3 }}>
                        {member.staffName ?? "Staff"}
                      </div>
                      <div style={{ fontSize: 12, color: "#9a8f85", display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={11} color="#9a8f85" />
                        {member.location || "Zone A: Lobby"}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#f5f2ee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9a8f85",
                      }}
                    >
                      <ChevronRight size={16} strokeWidth={2} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
