/**
 * ManagerSupervisors – Supervisor list for managers
 * -----------------------------------------------------------------------
 * - Data from /api/users/supervisors + task completion from /api/tasks
 * - Route: /mobile/manager/supervisors
 */
import { useState, useEffect } from "react";
import ManagerBottomNav from "./ManagerBottomNav";
import { getManagerSupervisors } from "./managerService";

function attendanceColor(pct) {
  if (pct == null) return "";
  if (pct >= 80) return "text-green-600";
  if (pct >= 50) return "text-amber-600";
  return "text-red-600";
}

function completionColor(pct) {
  if (pct == null) return "bg-gray-400";
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export default function ManagerSupervisors() {
  const [search, setSearch] = useState("");
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await getManagerSupervisors();
        if (!cancelled) setSupervisors(list || []);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load supervisors");
          setSupervisors([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = supervisors.filter(
    (s) =>
      !search ||
      (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.role && s.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mobile-end-user-screen manager-screen">
      <header className="manager-supervisors-header">
        <span className="manager-header-sub">Manager Supervisors</span>
        <h1 className="manager-task-title">Supervisors</h1>
      </header>

      <section className="manager-section">
        <div className="manager-search-wrap">
          <span className="manager-search-icon">🔍</span>
          <input
            type="text"
            className="manager-search-input"
            placeholder="Search supervisors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {loading && (
        <section className="manager-section">
          <p className="manager-loading">Loading supervisors…</p>
        </section>
      )}

      {error && !loading && (
        <section className="manager-section">
          <p className="manager-error">{error}</p>
        </section>
      )}

      {!loading && !error && (
        <section className="manager-section">
          <div className="manager-supervisor-cards">
            {filtered.length === 0 ? (
              <p className="manager-empty">No supervisors found.</p>
            ) : (
              filtered.map((s) => (
                <div key={s.id ?? s.name} className="manager-supervisor-card">
                  <div className="manager-supervisor-card-top">
                    <div className="manager-supervisor-card-avatar-wrap">
                      <div className="manager-supervisor-card-avatar" />
                      <span className="manager-status-dot" />
                    </div>
                    <div className="manager-supervisor-card-info">
                      <span className="manager-supervisor-card-name">{s.name}</span>
                      <span className="manager-supervisor-card-role">{s.role}</span>
                      <span className="manager-supervisor-card-location">• {s.location}</span>
                    </div>
                    <span
                      className={`manager-shift-tag ${
                        (s.shift || "").toLowerCase().includes("on") ? "on-shift" : "off-duty"
                      }`}
                    >
                      {s.shift ?? "—"}
                    </span>
                  </div>
                  <div className="manager-supervisor-card-stats">
                    {s.attendance != null && (
                      <div className="manager-supervisor-attendance">
                        <span>📅 Attendance:</span>
                        <span className={attendanceColor(s.attendance)}> {s.attendance}%</span>
                      </div>
                    )}
                    <div className="manager-supervisor-completion">
                      <span>Task Completion</span>
                      <div className="manager-completion-bar-wrap">
                        <div className="manager-completion-track">
                          <div
                            className={`manager-completion-fill ${completionColor(s.taskCompletion)}`}
                            style={{ width: `${s.taskCompletion ?? 0}%` }}
                          />
                        </div>
                        <span
                          className={`manager-completion-pct ${attendanceColor(s.taskCompletion)}`}
                        >
                          {s.taskCompletion ?? 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <ManagerBottomNav />
    </div>
  );
}
