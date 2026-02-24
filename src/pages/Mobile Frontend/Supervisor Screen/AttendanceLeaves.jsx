/**
 * Attendance & Leaves - Figma: calendar, Total Staff/Present/On Leave, leave requests
 * Route: /mobile/supervisor/attendance
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAttendanceLeaveData } from "./supervisorService";

export default function AttendanceLeaves() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [month, setMonth] = useState(new Date());
  const [loadedMonthKey, setLoadedMonthKey] = useState("");
  const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
  const loading = loadedMonthKey !== monthKey;

  useEffect(() => {
    let cancelled = false;
    getAttendanceLeaveData(month)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoadedMonthKey(monthKey);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setLoadedMonthKey(monthKey);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [month, monthKey]);

  function prevMonth() {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1));
  }

  function nextMonth() {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1));
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "#f0f0f0" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "transparent" }}>
        <div
          className="mobile-end-user-screen manager-screen supervisor-screen"
          style={{ background: "transparent" }}
        >
        <header className="supervisor-page-header">
          <div className="supervisor-header-bar">
            <button
              type="button"
              className="supervisor-back-btn"
              onClick={() => navigate("/mobile/supervisor/dashboard")}
              aria-label="Back"
            >
              {"<"}
            </button>
            <h1 className="supervisor-page-title">Attendance & Leaves</h1>
          </div>
        </header>

        {loading && <p className="manager-loading">Loading...</p>}
        {!loading && data && (
          <>
            <section className="manager-section supervisor-calendar-card">
              <div className="supervisor-calendar-nav">
                <button type="button" onClick={prevMonth} aria-label="Previous month">
                  {"<"}
                </button>
                <span className="supervisor-calendar-month">{data.month}</span>
                <button type="button" onClick={nextMonth} aria-label="Next month">
                  {">"}
                </button>
              </div>
              <div className="supervisor-calendar-dow">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>
              <div className="supervisor-calendar-grid">
                {(data.days || []).map((d) => (
                  <div key={d.date} className={`supervisor-calendar-day ${d.isSelected ? "selected" : ""}`}>
                    <span>{d.date}</span>
                    <span className={d.percentage < 50 ? "low" : "ok"}>{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="manager-section">
              <div className="supervisor-stats-row">
                <div className="supervisor-stat-box">
                  <span className="supervisor-stat-label">Total Staff</span>
                  <span className="supervisor-stat-num">{data.totalStaff}</span>
                </div>
                <div className="supervisor-stat-box green">
                  <span className="supervisor-stat-label">Present</span>
                  <span className="supervisor-stat-num">{data.present}</span>
                </div>
                <div className="supervisor-stat-box gray">
                  <span className="supervisor-stat-label">On Leave</span>
                  <span className="supervisor-stat-num">{data.onLeave}</span>
                </div>
              </div>
            </section>

            <section className="manager-section">
              <div className="supervisor-section-row">
                <h3 className="manager-section-title">Total Staff</h3>
                <button
                  type="button"
                  className="supervisor-view-all"
                  onClick={() => navigate("/mobile/supervisor/staff-list")}
                >
                  View All
                </button>
              </div>
              <div className="supervisor-staff-avatars">
                {(data.staffOnLeave || []).map((s) => (
                  <div key={s.id} className="supervisor-staff-avatar-item">
                    <div className="supervisor-avatar-circle" />
                    <span className="supervisor-avatar-name">{s.name}</span>
                    <span className="supervisor-avatar-type">{s.type}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="manager-section">
              <div className="supervisor-section-row">
                <h3 className="manager-section-title">Today&apos;s Staff</h3>
                <button
                  type="button"
                  className="supervisor-view-all"
                  onClick={() => navigate("/mobile/supervisor/staff-list")}
                >
                  View All
                </button>
              </div>
              <div className="supervisor-leave-requests">
                {(data.leaveRequests || []).map((lr) => (
                  <div key={lr.id} className="supervisor-leave-card">
                    <div className="supervisor-leave-card-head">
                      <div className="supervisor-leave-user">
                        <div className="supervisor-avatar-circle" />
                        <strong>{lr.name}</strong>
                      </div>
                      <span className="supervisor-leave-time">{lr.timeAgo}</span>
                    </div>
                    <span className="supervisor-pill leave-type">{lr.leaveType}</span>
                    <p className="supervisor-leave-dates">{lr.dateRange}</p>
                    <p className="supervisor-leave-reason">{lr.reason}</p>
                    <div className="supervisor-leave-actions">
                      <button type="button" className="supervisor-btn-deny">
                        Deny
                      </button>
                      <button type="button" className="supervisor-btn-allow">
                        Allow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
