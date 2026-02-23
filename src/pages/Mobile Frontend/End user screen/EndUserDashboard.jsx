/**
 * EndUserDashboard – Main dashboard for logged-in end users
 * -----------------------------------------------------------------------
 * - Header: logo (circle), user name, role, notification bell
 * - Attendance: Check In (green) / Check Out (red) toggle
 * - Task summary: Done vs Remaining counts
 * - Active tasks list (links to task details)
 * - Backend: getCurrentUser, getMyTasks, getTodayAttendance, checkIn
 * - Route: /mobile/dashboard (protected)
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";
import { useAuth } from "../../../context/AuthContext";
import {
  getCurrentUser,
  getMyAssignedTasks,
  getMyTasksWithSummary,
  getTodayAttendance,
  checkIn,
  checkOut,
  formatTaskDuration,
  formatTaskEndTime,
} from "./endUserService";
import logoIcon from "../../../assets/logo-icon.png";

function getUserDisplayName(user) {
  if (!user) return "User";
  if (user.fullName) return user.fullName;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  if (user.displayName) return user.displayName;
  if (user.name && !["Admin", "User", "admin", "user"].includes(user.name)) return user.name;
  if (user.username && !["Admin", "User", "admin", "user"].includes(user.username)) return user.username;
  return "User";
}

function formatTimeHHMMSS(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function EndUserDashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ done: 0, left: 0 });
  const [attendance, setAttendance] = useState({ checkedIn: false });
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => formatTimeHHMMSS(new Date()));
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  useEffect(() => {
    const tick = () => setCurrentTime(formatTimeHHMMSS(new Date()));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  async function loadTasks() {
    try {
      const { summary: s, tasks: t } = await getMyTasksWithSummary();
      setSummary(s || { done: 0, left: 0 });
      setTasks(Array.isArray(t) ? t : []);
    } catch (e) {
      console.error("Failed to load tasks:", e);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [u, taskData, a] = await Promise.all([
          getCurrentUser(),
          getMyTasksWithSummary(),
          getTodayAttendance(),
        ]);
        setUser({ ...authUser, ...u });
        setSummary(taskData?.summary || { done: 0, left: 0 });
        setTasks(Array.isArray(taskData?.tasks) ? taskData.tasks : []);
        setAttendance(a || { checkedIn: false });
      } catch (e) {
        setUser(authUser || { name: "User", location: "Madhuban Group" });
        setTasks([]);
        setSummary({ done: 0, left: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authUser]);

  async function handleCheckIn() {
    if (attendance.checkedIn) return;
    setCheckingIn(true);
    try {
      await checkIn(user?.location || "Lobby, Building A");
      setCheckInTime(formatTimeHHMMSS(new Date()));
      setCheckOutTime(null);
      setAttendance({ checkedIn: true });
      const { summary: s, tasks: updatedTasks } = await getMyTasksWithSummary();
      setSummary(s || { done: 0, left: 0 });
      setTasks(Array.isArray(updatedTasks) ? updatedTasks : []);
    } catch (e) {
      setAttendance({ checkedIn: true });
    } finally {
      setCheckingIn(false);
    }
  }

  async function handleCheckOut() {
    if (!attendance.checkedIn) return;
    setCheckingIn(true);
    try {
      await checkOut();
      setCheckOutTime(formatTimeHHMMSS(new Date()));
      setAttendance({ checkedIn: false });
    } catch (e) {
      setAttendance({ checkedIn: false });
    } finally {
      setCheckingIn(false);
    }
  }

  const done = summary.done ?? tasks.filter((t) => t.status?.toUpperCase() === "COMPLETED").length;
  const remaining = summary.left ?? tasks.filter((t) => {
    const status = t.status?.toUpperCase();
    return ["TO_DO", "IN_PROGRESS", "PENDING", "OVERDUE"].includes(status);
  }).length;

  const statusStyle = (s) => {
    const status = (s || "").toUpperCase();
    if (status === "COMPLETED") return "completed";
    if (status === "OVERDUE") return "overdue";
    if (status === "IN_PROGRESS") return "in-progress";
    return "pending";
  };

  const formatCardDate = (due) => {
    if (due == null || due === "") return "—";
    const d = new Date(due);
    return Number.isNaN(d.getTime()) ? "—" : d.toISOString().slice(0, 10);
  };

  const getAssigneeInitial = (t) => {
    const name = t.assigneeName || t.assignee?.name || "";
    if (name) return String(name).trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    return "U";
  };

  const displayRole = user?.role
    ? String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1).toLowerCase()
    : "User";

  return (
    <div className="mobile-end-user-screen">
      <header className="end-user-header-block">
        <div className="end-user-logo-circle">
          <img src={logoIcon} alt="Logo" />
        </div>
        <div className="end-user-info">
          <h2 className="end-user-name">{getUserDisplayName(user)}</h2>
          <p className="end-user-role">{displayRole}</p>
        </div>
        <button type="button" className="end-user-notify" aria-label="Notifications">🔔</button>
      </header>

      <section className="end-user-section">
        <div className="end-user-section-head">
          <h3>Attendance</h3>
          <span className="gps-badge">GPS Active</span>
        </div>
        <button
          type="button"
          className={`end-user-checkin-btn ${attendance.checkedIn ? "check-out" : ""}`}
          onClick={attendance.checkedIn ? handleCheckOut : handleCheckIn}
          disabled={checkingIn}
        >
          {attendance.checkedIn ? "Check Out" : "Check In"}
        </button>
        <div className="end-user-shift-row">
          <span className="end-user-shift">Time: {currentTime}</span>
          <div className="end-user-check-times">
            {checkInTime && (
              <span className="end-user-shift end-user-check-time">Check-in: {checkInTime}</span>
            )}
            {checkOutTime && (
              <span className="end-user-shift end-user-check-time">Check-out: {checkOutTime}</span>
            )}
          </div>
        </div>
      </section>

      <section className="end-user-section">
        <h3>Tasks for Today</h3>
        <div className="end-user-task-summary">
          <div className="end-user-summary-card done">
            <span className="summary-icon">✓</span>
            <strong>{done} Done</strong>
            <span>Completed</span>
          </div>
          <div className="end-user-summary-card remaining">
            <span className="summary-icon">⏱</span>
            <strong>{remaining} Left</strong>
            <span>Remaining</span>
          </div>
        </div>
      </section>

      <section className="end-user-section">
        <div className="end-user-section-head">
          <h3>My Active Tasks</h3>
          <button 
            type="button" 
            onClick={loadTasks} 
            className="text-blue-600 text-sm"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ↻ Refresh
          </button>
        </div>
        <div className="end-user-task-list">
          {loading ? (
            <p className="end-user-task-list-msg">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="end-user-task-list-msg">No active tasks</p>
          ) : (
            tasks.map((t) => (
              <button
                key={t._id}
                type="button"
                className={`end-user-task-card ${statusStyle(t.status)}`}
                onClick={() => navigate(`/mobile/task/${t._id}`)}
              >
                <div className="task-card-left">
                  <strong>{t.title}</strong>
                  <span>{t.subtitle || t.category || ""}</span>
                  <p>{t.description || "—"}</p>
                  <span className="task-due">🕐 End time: {formatTaskEndTime(t.dueTime || t.dueDate) ?? "—"}</span>
                  <span className="task-due task-duration">⏱ Task duration: {formatTaskDuration(t.durationMinutes) ?? "10 min"}</span>
                </div>
                <span className={`task-tag ${statusStyle(t.status)}`}>
                  {(t.status || "Pending").replace(/_/g, " ")}
                </span>
                <span className="task-arrow">→</span>
              </button>
            ))
          )}
        </div>
      </section>

      <MobileBottomNav />
    </div>
  );
}
