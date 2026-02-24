/**
 * Pending Tasks – List of pending tasks (Figma: HVAC Maintenance, Elevator Inspection, Fire Alarm System)
 * Route: /mobile/supervisor/pending-tasks
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Building2, User } from "lucide-react";
import TaskDetailsPopup from "./TaskDetailsPopup";
import { getSupervisorPendingTasks } from "./supervisorService";

export default function PendingTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsTask, setDetailsTask] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const list = await getSupervisorPendingTasks();
        if (!cancelled) setTasks(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = tasks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.title || "").toLowerCase().includes(q) ||
      (t.propertyName || "").toLowerCase().includes(q) ||
      (t.supervisor || "").toLowerCase().includes(q) ||
      (t.location || "").toLowerCase().includes(q)
    );
  });

  const initials = (name) =>
    String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .filter(Boolean)
      .join("") || "U";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "#f0f0f0" }}>
      {/* Header */}
      <header
        style={{
          background: "white",
          padding: "14px 18px 16px",
          borderBottom: "1px solid #e0d9d2",
          flexShrink: 0,
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
            Pending Tasks
          </h1>
          <button
            type="button"
            aria-label="Search"
            onClick={() => setShowSearch((s) => !s)}
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
            <Search size={20} color="#9a8f85" strokeWidth={2} />
          </button>
        </div>

        {showSearch && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              background: "white",
              borderRadius: 14,
              padding: "10px 14px",
              gap: 10,
              border: "1.5px solid #e0d9d2",
            }}
          >
            <Search size={16} color="#bbb" strokeWidth={2} />
            <input
              autoFocus
              placeholder="Search pending tasks..."
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
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 24px" }}>
        {loading && (
          <p style={{ textAlign: "center", color: "#9a8f85", fontSize: 14, margin: "24px 0" }}>Loading…</p>
        )}

        {!loading && filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#9a8f85", fontSize: 14, padding: 32 }}>No pending tasks.</p>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((t) => {
              const isUrgent =
                (t.priority || "").toUpperCase() === "HIGH" || (t.priority || "").toUpperCase() === "URGENT";
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetailsTask(t)}
                  onKeyDown={(e) => e.key === "Enter" && setDetailsTask(t)}
                  style={{
                    background: "white",
                    borderRadius: 18,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.045)",
                    overflow: "hidden",
                    display: "flex",
                    cursor: "pointer",
                    border: "1px solid rgba(15, 23, 42, 0.06)",
                  }}
                >
                  {/* left accent */}
                  <div style={{ width: 4, background: isUrgent ? "#e05252" : "transparent" }} />

                  <div style={{ flex: 1, padding: "14px 16px" }}>
                    {/* top row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>
                        {t.title}
                      </div>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          background: "#FFF4D6",
                          color: "#B45309",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        PENDING
                      </span>
                    </div>

                    {/* property row */}
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 13 }}>
                      <Building2 size={14} color="#64748B" strokeWidth={2} />
                      {t.propertyName || t.location || "—"}
                    </div>

                    {/* divider */}
                    <div style={{ height: 1, background: "#E2E8F0", margin: "12px 0" }} />

                    {/* assignee row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0F172A", fontSize: 14, fontWeight: 600 }}>
                        <User size={14} color="#64748B" strokeWidth={2} />
                        {t.supervisor}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailsTask && (
        <TaskDetailsPopup
          taskId={detailsTask.id ?? detailsTask._id}
          onClose={() => setDetailsTask(null)}
        />
      )}

    </div>
  );
}
