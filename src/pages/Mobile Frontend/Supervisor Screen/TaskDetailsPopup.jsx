/**
 * TaskDetailsPopup - Centered modal for supervisor task details.
 * Uses GET /api/supervisor/tasks/:id via getSupervisorTaskById.
 */
import { useEffect, useState } from "react";
import { X, MessageCircle, Phone, MapPin } from "lucide-react";
import { getSupervisorTaskById } from "./supervisorService";

function formatTimeOfDay(time) {
  if (!time) return "--";
  // Accept "HH:MM:SS" or "HH:MM".
  const parts = String(time).split(":");
  if (parts.length < 2) return "--";

  const [h, m] = parts;
  const d = new Date();
  d.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
  if (Number.isNaN(d.getTime())) return "--";

  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDurationMinutes(minutes) {
  if (minutes == null) return "--";
  const m = Number(minutes);
  if (!Number.isFinite(m) || m <= 0) return "--";
  if (m < 60) return `${m}m`;

  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

export default function TaskDetailsPopup({ taskId, onClose }) {
  const [task, setTask] = useState(null);
  const [fetchedTaskId, setFetchedTaskId] = useState(null);

  useEffect(() => {
    if (!taskId) return;

    let cancelled = false;

    getSupervisorTaskById(taskId)
      .then((t) => {
        if (!cancelled) {
          setTask(t);
          setFetchedTaskId(taskId);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTask(null);
          setFetchedTaskId(taskId);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const loading = Boolean(taskId) && fetchedTaskId !== taskId;
  const currentTask = fetchedTaskId === taskId ? task : null;

  const priority = (currentTask?.priority || "").toUpperCase();
  const isUrgent = priority === "HIGH" || priority === "URGENT";

  const title = currentTask?.taskName ?? currentTask?.title ?? "Untitled Task";
  const assigneeName =
    currentTask?.assigneeName ??
    currentTask?.assignee?.name ??
    currentTask?.supervisor ??
    "Unassigned";

  const start = currentTask?.startTime ?? null;
  const end = currentTask?.endTime ?? null;
  const durationText = formatDurationMinutes(currentTask?.timeDuration);

  const location =
    currentTask?.locationFloor ??
    currentTask?.roomNumber ??
    currentTask?.propertyName ??
    currentTask?.location ??
    "--";

  return (
    <div
      onClick={onClose}
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="task-details-title"
        style={{
          background: "white",
          borderRadius: 24,
          width: "100%",
          maxWidth: 360,
          padding: "20px 20px 24px",
          boxShadow: "0 20px 40px rgba(15,23,42,0.25)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2
            id="task-details-title"
            style={{
              margin: 0,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#0F172A",
            }}
          >
            Task Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "#E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} color="#0F172A" />
          </button>
        </header>

        {loading && (
          <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
            Loading...
          </p>
        )}

        {!loading && currentTask && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              {isUrgent && (
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    background: "#FEE2E2",
                    color: "#B91C1C",
                  }}
                >
                  Urgent
                </span>
              )}
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "#E0F2FE",
                  color: "#0369A1",
                }}
              >
                Maintenance
              </span>
            </div>

            <h3
              style={{
                margin: "0 0 14px 0",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "#0F172A",
              }}
            >
              {title}
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#E5E7EB",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  {assigneeName}
                </div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  Housekeeping
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  aria-label="Message"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "none",
                    background: "#E0F2FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <MessageCircle size={16} color="#0369A1" />
                </button>
                <button
                  type="button"
                  aria-label="Call"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "none",
                    background: "#E0F2FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Phone size={16} color="#0369A1" />
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    color: "#9CA3AF",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  Start Time
                </div>
                <div style={{ fontWeight: 600, color: "#0F172A" }}>
                  {formatTimeOfDay(start)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    color: "#9CA3AF",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  End Time
                </div>
                <div style={{ fontWeight: 600, color: "#0F172A" }}>
                  {formatTimeOfDay(end)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    color: "#9CA3AF",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  Duration
                </div>
                <div style={{ fontWeight: 600, color: "#0F172A" }}>
                  {durationText}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 8,
                background: "#F9FAFB",
                borderRadius: 16,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  color: "#9CA3AF",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Exact Location
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "#0F172A",
                }}
              >
                <MapPin size={14} color="#0EA5E9" />
                {location}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
