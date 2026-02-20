/**
 * EndUserDashboard – Main dashboard for logged-in end users
 * -----------------------------------------------------------------------
 * - Shows greeting, user info, location pin
 * - Attendance: Check In button (GPS badge)
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
  getMyTasks,
  getMyAssignedTasks,
  getTodayAttendance,
  checkIn,
} from "./endUserService";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

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

export default function EndUserDashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState({ checkedIn: false });
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  async function loadTasks() {
    try {
      const t = await getMyAssignedTasks();
      setTasks(Array.isArray(t) ? t : []);
    } catch (e) {
      console.error("Failed to load tasks:", e);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [u, t, a] = await Promise.all([
          getCurrentUser(),
          getMyAssignedTasks(),
          getTodayAttendance(),
        ]);
        setUser({ ...authUser, ...u });
        setTasks(Array.isArray(t) ? t : []);
        setAttendance(a || { checkedIn: false });
      } catch (e) {
        setUser(authUser || { name: "User", location: "Madhuban Group" });
        setTasks([]);
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
      setAttendance({ checkedIn: true });
      // Refresh tasks after check-in to show assigned tasks
      const updatedTasks = await getMyAssignedTasks();
      setTasks(Array.isArray(updatedTasks) ? updatedTasks : []);
    } catch (e) {
      setAttendance({ checkedIn: true });
    } finally {
      setCheckingIn(false);
    }
  }

  const done = tasks.filter((t) => t.status?.toUpperCase() === "COMPLETED").length;
  const remaining = tasks.filter((t) => {
    const status = t.status?.toUpperCase();
    return ["TO_DO", "IN_PROGRESS", "PENDING", "OVERDUE"].includes(status);
  }).length;

  const statusStyle = (s) => {
    if (s === "OVERDUE") return "overdue";
    if (s === "IN_PROGRESS") return "in-progress";
    return "pending";
  };

  return (
    <div className="mobile-end-user-screen">
      <header className="end-user-header">
        <h1>End User Dashboard</h1>
        <div className="end-user-profile-row">
          <div className="end-user-avatar" />
          <div className="end-user-info">
            <h2>{getGreeting()}, {getUserDisplayName(user)}</h2>
            <p className="end-user-location">📍 {user?.location || "Madhuban Group"}</p>
          </div>
          <button type="button" className="end-user-notify" aria-label="Notifications">🔔</button>
        </div>
      </header>

      <div className="end-user-location-card">
        <div className="end-user-location-pin">📍 Lobby, Building A</div>
      </div>

      <section className="end-user-section">
        <div className="end-user-section-head">
          <h3>Attendance</h3>
          <span className="gps-badge">GPS Active</span>
        </div>
        <button
          type="button"
          className="end-user-checkin-btn"
          onClick={handleCheckIn}
          disabled={attendance.checkedIn || checkingIn}
        >
          {attendance.checkedIn ? "Checked In" : "Check In"}
        </button>
        <p className="end-user-shift">Shift starts at 08:00 AM</p>
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
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p>No active tasks</p>
          ) : (
            tasks.slice(0, 5).map((t) => (
              <button
                key={t._id}
                type="button"
                className={`end-user-task-card ${statusStyle(t.status)}`}
                onClick={() => navigate(`/mobile/task/${t._id}`)}
              >
                <div className="task-card-left">
                  <strong>{t.title}</strong>
                  <span>{t.subtitle || t.category}</span>
                  <p>{t.description}</p>
                  <span className="task-due">🕐 Due: {t.dueTime || t.dueDate || "-"}</span>
                </div>
                <span className={`task-tag ${statusStyle(t.status)}`}>
                  {t.status?.replace(/_/g, " ") || "Pending"}
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
