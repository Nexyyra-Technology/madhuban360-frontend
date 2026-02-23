/**
 * ManagerSupervisors – Supervisor list for managers
 * -----------------------------------------------------------------------
 * - Search bar
 * - Supervisor cards: avatar, name, role, location, shift tag, attendance %, task completion bar
 * - Route: /mobile/manager/supervisors
 */
import { useState } from "react";
import ManagerBottomNav from "./ManagerBottomNav";

const MOCK_SUPERVISORS = [
  { id: 1, name: "David Chen", role: "Facility Lead", location: "East Wing", shift: "On Shift", attendance: 88, taskCompletion: 94 },
  { id: 2, name: "Jerome Bell", role: "Housekeeping", location: "Block - A", shift: "Off Duty", attendance: 60, taskCompletion: 80 },
  { id: 3, name: "Jane Cooper", role: "Facility Lead", location: "West Wing", shift: "On Shift", attendance: 98, taskCompletion: 70 },
  { id: 4, name: "Robert Fox", role: "Maintenance", location: "Block - B", shift: "On Shift", attendance: 30, taskCompletion: 28 },
];

function attendanceColor(pct) {
  if (pct >= 80) return "text-green-600";
  if (pct >= 50) return "text-amber-600";
  return "text-red-600";
}

function completionColor(pct) {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export default function ManagerSupervisors() {
  const [search, setSearch] = useState("");
  const supervisors = MOCK_SUPERVISORS.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase())
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

      <section className="manager-section">
        <div className="manager-supervisor-cards">
          {supervisors.map((s) => (
            <div key={s.id} className="manager-supervisor-card">
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
                <span className={`manager-shift-tag ${s.shift === "On Shift" ? "on-shift" : "off-duty"}`}>
                  {s.shift}
                </span>
              </div>
              <div className="manager-supervisor-card-stats">
                <div className="manager-supervisor-attendance">
                  <span>📅 Attendance:</span>
                  <span className={attendanceColor(s.attendance)}> {s.attendance}%</span>
                </div>
                <div className="manager-supervisor-completion">
                  <span>Task Completion</span>
                  <div className="manager-completion-bar-wrap">
                    <div className="manager-completion-track">
                      <div
                        className={`manager-completion-fill ${completionColor(s.taskCompletion)}`}
                        style={{ width: `${s.taskCompletion}%` }}
                      />
                    </div>
                    <span className={`manager-completion-pct ${attendanceColor(s.taskCompletion)}`}>
                      {s.taskCompletion}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ManagerBottomNav />
    </div>
  );
}
