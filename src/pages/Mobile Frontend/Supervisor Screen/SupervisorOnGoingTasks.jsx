/**
 * Task Management - Figma: Task Management tabs (On Going Task / Task Verification), Today's Tasks
 * Route: /mobile/supervisor/tasks
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Clock3, MapPin } from "lucide-react";
import TaskDetailsPopup from "./TaskDetailsPopup";
import { approveTask, getSupervisorAllTasks, rejectTask } from "./supervisorService";

export default function SupervisorOnGoingTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsTask, setDetailsTask] = useState(null);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  async function loadTasks() {
    setLoading(true);
    try {
      const list = await getSupervisorAllTasks();
      setTasks(Array.isArray(list) ? list : []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const list = await getSupervisorAllTasks();
        if (!cancelled) setTasks(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isOverdue = (t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() < Date.now() && t.status === "PENDING";
  };

  const classifyStatus = (t) => {
    if (isOverdue(t)) return "OVERDUE";
    if (t.status === "IN_PROGRESS") return "IN_PROGRESS";
    return "PENDING";
  };

  const formatTimeRange = (t) => {
    if (!t.startTime || !t.endTime) return "--";
    return `${t.startTime} - ${t.endTime}`;
  };

  const formatDuration = (t) => {
    const m = t.estimatedMinutes ?? 10;
    return `${m} Mins`;
  };

  const ongoingTasks = tasks.filter((t) => {
    const s = classifyStatus(t);
    return ["OVERDUE", "PENDING", "IN_PROGRESS"].includes(s);
  });

  const verificationTasks = (() => {
    const statuses = new Set([
      "REVIEW",
      "PENDING_APPROVAL",
      "COMPLETED",
      "DONE",
      "SUBMITTED",
      "FOR_VERIFICATION",
    ]);
    return tasks.filter((t) => statuses.has(String(t.status || "").toUpperCase()));
  })();

  const badgeStyle = (status) => {
    if (status === "OVERDUE") {
      return { bg: "#FEE2E2", color: "#B91C1C", label: "Overdue" };
    }
    if (status === "IN_PROGRESS") {
      return { bg: "#E0F2FE", color: "#0369A1", label: "In Progress" };
    }
    return { bg: "#FFF4D6", color: "#B45309", label: "Pending" };
  };

  async function handleApprove(taskId) {
    if (!taskId) return;
    setApprovingId(taskId);
    try {
      await approveTask(taskId);
      await loadTasks();
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(taskId) {
    if (!taskId) return;
    setRejectingId(taskId);
    try {
      await rejectTask(taskId, "");
      await loadTasks();
    } finally {
      setRejectingId(null);
    }
  }

  const listForTab = activeTab === "ongoing" ? ongoingTasks : verificationTasks;
  const countLabel = activeTab === "ongoing" ? "Active" : "Pending";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "#f0f0f0" }}>
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
            Task Management
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

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setActiveTab("ongoing")}
            style={{
              height: 38,
              borderRadius: 9999,
              border: activeTab === "ongoing" ? "none" : "1.5px solid #d1d5db",
              background: activeTab === "ongoing" ? "#1E293B" : "#fff",
              color: activeTab === "ongoing" ? "#fff" : "#334155",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            On Going Task
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("verification")}
            style={{
              height: 38,
              borderRadius: 9999,
              border: activeTab === "verification" ? "none" : "1.5px solid #d1d5db",
              background: activeTab === "verification" ? "#1E293B" : "#fff",
              color: activeTab === "verification" ? "#fff" : "#334155",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Task Verification
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 20, color: "#0F172A" }}>
            {activeTab === "ongoing" ? "Today's Tasks" : "Task Verification"}
          </div>
          <span style={{ fontSize: 13, color: "#6B7280" }}>
            {listForTab.length} {countLabel}
          </span>
        </div>

        {loading && (
          <p style={{ textAlign: "center", color: "#9a8f85", fontSize: 14, margin: "24px 0" }}>
            Loading...
          </p>
        )}

        {!loading && listForTab.length === 0 && (
          <p style={{ textAlign: "center", color: "#9a8f85", fontSize: 14, padding: 32 }}>
            {activeTab === "ongoing" ? "No tasks for today." : "No tasks pending verification."}
          </p>
        )}

        {!loading && activeTab === "ongoing" && ongoingTasks.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ongoingTasks.map((t) => {
              const status = classifyStatus(t);
              const badge = badgeStyle(status);
              const overdue = status === "OVERDUE";
              return (
                <div
                  key={t.id}
                  style={{
                    background: "white",
                    borderRadius: 18,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.045)",
                    overflow: "hidden",
                    display: "flex",
                    border: "1px solid rgba(15, 23, 42, 0.06)",
                  }}
                >
                  <div
                    style={{
                      width: 4,
                      background: overdue ? "#F97373" : "#0EA5E9",
                    }}
                  />
                  <div style={{ flex: 1, padding: "14px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>
                        {t.title}
                      </div>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          background: badge.bg,
                          color: badge.color,
                          flexShrink: 0,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 8,
                        fontSize: 13,
                        color: "#6B7280",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                          {t.frequency || "Daily"}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#6B7280",
                            fontSize: 13,
                          }}
                        >
                          <Clock3 size={14} color="#6B7280" />
                          {formatTimeRange(t)}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>Location</div>
                        <div style={{ fontSize: 12, color: "#0F172A" }}>{t.location || "--"}</div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                          {formatDuration(t)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#EEF2FF",
                            color: "#4F46E5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {t.supervisor ? t.supervisor[0]?.toUpperCase() : "U"}
                        </div>
                        <span style={{ fontSize: 13, color: "#0F172A" }}>
                          Assigned to <strong>{t.supervisor || "Unassigned"}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDetailsTask(t)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 9999,
                          border: "none",
                          background: "#0F172A",
                          color: "white",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && activeTab === "verification" && verificationTasks.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {verificationTasks.map((t) => {
              const id = t.id;
              const isUrgent = ["HIGH", "URGENT"].includes(String(t.priority || "").toUpperCase());
              return (
                <div
                  key={id}
                  style={{
                    background: "white",
                    borderRadius: 14,
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "14px 12px 8px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: 16, color: "#1f2937", lineHeight: 1.2 }}>
                        {t.title}
                      </h3>
                      {isUrgent && (
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#EA580C",
                            background: "#FFF7ED",
                          }}
                        >
                          URGENT
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: 8, fontSize: 13, color: "#334155" }}>
                      Completed By: <strong>{t.supervisor || "Unassigned"}</strong>
                    </div>

                    <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>DURATION TAKEN</div>
                        <div style={{ fontSize: 13, color: "#0F172A", marginTop: 4 }}>{formatDuration(t)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>LOCATION</div>
                        <div style={{ fontSize: 13, color: "#0F172A", marginTop: 4, display: "flex", gap: 4 }}>
                          <MapPin size={14} color="#64748B" />
                          <span>{t.location || "--"}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: "1px solid #E5E7EB",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>START TIME</div>
                        <div style={{ fontSize: 13, color: "#0F172A", marginTop: 4 }}>
                          {t.startTime || "--"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>END TIME</div>
                        <div style={{ fontSize: 13, color: "#0F172A", marginTop: 4 }}>
                          {t.endTime || "--"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>DURATION</div>
                        <div style={{ fontSize: 13, color: "#0F172A", marginTop: 4 }}>
                          {formatDuration(t)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #E5E7EB",
                      padding: 12,
                      display: "grid",
                      gridTemplateColumns: "1.3fr 1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setDetailsTask(t)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#475569",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.2px",
                        cursor: "pointer",
                      }}
                    >
                      VIEW DETAILS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(id)}
                      disabled={rejectingId === id}
                      style={{
                        border: "none",
                        borderRadius: 10,
                        background: "#FEE2E2",
                        color: "#DC2626",
                        fontSize: 14,
                        fontWeight: 700,
                        height: 38,
                        cursor: "pointer",
                      }}
                    >
                      {rejectingId === id ? "..." : "Reject"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(id)}
                      disabled={approvingId === id}
                      style={{
                        border: "none",
                        borderRadius: 10,
                        background: "#16A34A",
                        color: "white",
                        fontSize: 14,
                        fontWeight: 700,
                        height: 38,
                        cursor: "pointer",
                      }}
                    >
                      {approvingId === id ? "..." : "Approve"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailsTask && (
        <TaskDetailsPopup taskId={detailsTask.id} onClose={() => setDetailsTask(null)} />
      )}
    </div>
  );
}
