/**
 * Staff List – Figma: search, filter tabs (All Staff, Present, Absent), attendance records
 * Route: /mobile/supervisor/staff-list (linked from Attendance View All)
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupervisorBottomNav from "./SupervisorBottomNav";
import { getStaffList } from "./supervisorService";

const TABS = ["All Staff", "Present", "Absent"];

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function avatarColor(index) {
  const colors = ["#ec4899", "#3b82f6", "#f97316", "#06b6d4", "#6b7280"];
  return colors[index % colors.length];
}

export default function StaffList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All Staff");
  const [data, setData] = useState({ list: [], total: 0, present: 0, absent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStaffList({
      search: search || undefined,
      tab: tab === "All Staff" ? undefined : tab,
    })
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData({ list: [], total: 0, present: 0, absent: 0 }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search, tab]);

  const tabKey = tab === "All Staff" ? "All" : tab;
  const count = tabKey === "All" ? data.total : tabKey === "Present" ? data.present : data.absent;

  return (
    <div className="mobile-end-user-screen manager-screen supervisor-screen">
      <header className="supervisor-page-header">
        <h1 className="supervisor-page-title standalone">Staff List</h1>
      </header>

      <section className="manager-section">
        <div className="supervisor-search-wrap">
          <span className="supervisor-search-icon">🔍</span>
          <input
            type="text"
            className="supervisor-search-input"
            placeholder="Search staff by name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="supervisor-filter-tabs">
          <button
            type="button"
            className={`supervisor-filter-tab ${tab === "All Staff" ? "active" : ""}`}
            onClick={() => setTab("All Staff")}
          >
            All Staff
          </button>
          <button
            type="button"
            className={`supervisor-filter-tab ${tab === "Present" ? "active" : ""}`}
            onClick={() => setTab("Present")}
          >
            Present ({data.present})
          </button>
          <button
            type="button"
            className={`supervisor-filter-tab ${tab === "Absent" ? "active" : ""}`}
            onClick={() => setTab("Absent")}
          >
            Absent ({data.absent})
          </button>
        </div>
      </section>

      <section className="manager-section">
        <h3 className="supervisor-uppercase-label">ATTENDANCE RECORDS</h3>
        {loading && <p className="manager-loading">Loading…</p>}
        {!loading && (
          <div className="supervisor-staff-list-cards">
            {data.list.length === 0 ? (
              <p className="manager-empty">No staff found.</p>
            ) : (
              data.list.map((s, i) => (
                <div key={s.id} className="supervisor-staff-record-card">
                  <div
                    className="supervisor-staff-initials"
                    style={{ background: avatarColor(i) }}
                  >
                    {getInitials(s.name)}
                  </div>
                  <div className="supervisor-staff-record-info">
                    <strong>{s.name}</strong>
                    <span className="supervisor-staff-record-role">{s.role}</span>
                    {s.reason && (
                      <p className="supervisor-staff-record-extra">
                        Reason: {s.reason} · Duration: {s.duration}
                      </p>
                    )}
                  </div>
                  <span className={`supervisor-status-pill ${(s.status || "").toLowerCase().replace(/\s/g, "-")}`}>
                    {s.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      <SupervisorBottomNav />
    </div>
  );
}
