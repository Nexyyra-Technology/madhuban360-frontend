/**
 * ManagerTaskOverview – Task list for managers
 * -----------------------------------------------------------------------
 * - Search bar, filter tabs: All, Overdue, In Progress, Completed
 * - Task cards with colored left border by status
 * - Route: /mobile/manager/tasks
 */
import { useState } from "react";
import ManagerBottomNav from "./ManagerBottomNav";

const FILTERS = ["All", "Overdue", "In Progress", "Completed"];

const MOCK_TASKS = [
  {
    id: 1,
    title: "AC Unit Repair - Tower B, Floor 5",
    location: "Prestige Towers",
    supervisor: "Rajesh Kumar",
    due: "Today, 10:30 AM",
    status: "Overdue",
    category: "Facility",
  },
  {
    id: 2,
    title: "Deep Cleaning - Lobby Area",
    location: "The Grand Atrium",
    supervisor: "Priya Sharma",
    due: "Today, 1:00 PM",
    status: "In Progress",
    category: "Housekeeping",
  },
  {
    id: 3,
    title: "Elevator Maintenance - Block C",
    location: "Oasis Tower",
    supervisor: "Amit Patel",
    due: "Completed 2h ago",
    status: "Completed",
    category: "Facility",
  },
  {
    id: 4,
    title: "Gym Deep Clean Cycle",
    location: "Skyline Residence",
    supervisor: "Sunita Devi",
    due: "Today, 11:15 AM",
    status: "Pending",
    category: "Housekeeping",
  },
];

function statusClass(s) {
  const t = (s || "").toLowerCase();
  if (t === "overdue") return "overdue";
  if (t === "in progress") return "in-progress";
  if (t === "completed") return "completed";
  return "pending";
}

export default function ManagerTaskOverview() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredTasks = MOCK_TASKS.filter((t) => {
    if (filter !== "All") {
      if (filter === "Overdue" && t.status !== "Overdue") return false;
      if (filter === "In Progress" && t.status !== "In Progress") return false;
      if (filter === "Completed" && t.status !== "Completed") return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        (t.supervisor && t.supervisor.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="mobile-end-user-screen manager-screen manager-task-screen">
      <header className="manager-task-header">
        <h1 className="manager-task-title">Task Overview</h1>
      </header>

      <section className="manager-section">
        <div className="manager-search-wrap">
          <span className="manager-search-icon">🔍</span>
          <input
            type="text"
            className="manager-search-input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="manager-filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`manager-filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className="manager-section manager-task-list-wrap">
        <div className="manager-task-list">
          {filteredTasks.map((t) => (
            <div key={t.id} className={`manager-task-card ${statusClass(t.status)}`}>
              <div className="manager-task-card-body">
                <strong>{t.title}</strong>
                <span>🏢 {t.location}</span>
                <span>👤 Supervisor : {t.supervisor}</span>
                <span>🕐 {t.due}</span>
              </div>
              <div className="manager-task-card-meta">
                <span className={`manager-task-tag ${statusClass(t.status)}`}>{t.status}</span>
                <span className="manager-task-category">🏛 {t.category}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ManagerBottomNav />
    </div>
  );
}
