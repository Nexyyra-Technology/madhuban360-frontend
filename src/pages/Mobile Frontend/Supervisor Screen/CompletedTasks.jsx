/**
 * Completed Tasks – List of completed tasks. UI matches dashboard style (inline styles, lucide-react).
 * Route: /mobile/supervisor/in-progress
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MapPin, User, Clock, ChevronRight } from "lucide-react";
import TaskDetailsPopup from "./TaskDetailsPopup";
import { getSupervisorCompletedTasks } from "./supervisorService";

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

function elapsed(startIso, estimatedMinutes) {
  if (!startIso) return { text: "—", percent: 0, overdue: false };
  const start = new Date(startIso).getTime();
  const now = Date.now();
  const elapsedMs = now - start;
  const elapsedM = Math.floor(elapsedMs / 60000);
  const est = estimatedMinutes || 120;
  const overdue = elapsedM > est;
  const percent = Math.min(100, (elapsedM / est) * 100);
  const h = Math.floor(elapsedM / 60);
  const m = elapsedM % 60;
  const eh = Math.floor(est / 60);
  const em = est % 60;
  const text = `${h}h ${m}m / ${eh}h${em ? ` ${em}m` : ""}`;
  return { text, percent: Math.min(100, percent), overdue };
}

export default function CompletedTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailsTask, setDetailsTask] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const list = await getSupervisorCompletedTasks();
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
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.location && t.location.toLowerCase().includes(q)) ||
      (t.supervisor && t.supervisor.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "#f5f2ee" }}>
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
            Completed Tasks
          </h1>
          <button
            type="button"
            aria-label="Search"
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
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 24px" }}>
        {loading && (
          <p style={{ textAlign: "center", color: "#9a8f85", fontSize: 14, margin: "24px 0" }}>Loading…</p>
        )}
        {!loading && filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#9a8f85", fontSize: 14, padding: 32 }}>No completed tasks.</p>
        )}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((t) => {
              const startAt = t.startedAt || t.updatedAt || t.updated_at;
              const est = t.estimatedMinutes ?? 120;
              const prog = elapsed(startAt, est);
              const isPriority =
                (t.priority || "").toUpperCase() === "HIGH" || (t.priority || "").toUpperCase() === "URGENT";
              return (
                <div
                  key={t.id ?? t._id}
                  style={{
                    background: "white",
                    borderRadius: 20,
                    padding: 18,
                    boxShadow: "0 2px 14px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#1a1a1a",
                        flex: 1,
                        lineHeight: 1.3,
                      }}
                    >
                      {t.title}
                    </h3>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        flexShrink: 0,
                        background: isPriority ? "#fce7f3" : "#d1fae5",
                        color: isPriority ? "#be185d" : "#059669",
                      }}
                    >
                      {isPriority ? "PRIORITY" : "COMPLETED"}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#9a8f85",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 14,
                    }}
                  >
                    <MapPin size={14} color="#9a8f85" />
                    {t.location || "—"}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#9a8f85",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: 4,
                        }}
                      >
                        Assigned Staff
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#1a1a1a", fontWeight: 500 }}>
                        <User size={14} color="#9a8f85" />
                        {t.supervisor || "—"}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#9a8f85",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: 4,
                        }}
                      >
                        Started At
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#1a1a1a", fontWeight: 500 }}>
                        <Clock size={14} color="#9a8f85" />
                        {formatTime(startAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: prog.overdue ? "#b91c1c" : "#1a1a1a",
                        marginBottom: 6,
                      }}
                    >
                      {prog.overdue ? "Overdue" : "Time Elapsed"}
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: "#e0d9d2",
                        borderRadius: 4,
                        overflow: "hidden",
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${prog.percent}%`,
                          background: prog.overdue ? "#e05252" : "#4f6ef7",
                          borderRadius: 4,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: prog.overdue ? "#b91c1c" : "#9a8f85",
                        fontWeight: 500,
                      }}
                    >
                      {prog.text}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailsTask(t)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#4f6ef7",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    View Details
                    <ChevronRight size={16} strokeWidth={2} />
                  </button>
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
