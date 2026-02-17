import { useState, useEffect } from "react";

/* ---------- DATE FORMATTER ---------- */
function getFormattedDate(date) {
  const options = {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
}

/* ---------- LIVE CLOCK HOOK ---------- */
function useCurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return time;
}

export default function Dashboard() {
  const currentTime = useCurrentTime();

  return (
    <>
      <div className="topbar">
        <input placeholder="Search properties, transactions, tasks..." />
        <div className="top-actions">
          <button className="btn dark">Add Task</button>
          <button className="btn light">Add User</button>
          <button className="btn light">Add Property</button>
        </div>
      </div>

      <div className="page-title">
        <h1>Dashboard Overview</h1>
        <p>
          System metrics for today,{" "}
          {getFormattedDate(currentTime)} •{" "}
          {currentTime.toLocaleTimeString()}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Properties</h4>
          <h2>124</h2>
          <span className="positive">+4.2%</span>
        </div>

        <div className="stat-card">
          <h4>Total Users</h4>
          <h2>45</h2>
          <span className="neutral">Stable</span>
        </div>

        <div className="stat-card">
          <h4>Open Tasks</h4>
          <h2>18</h2>
          <span className="warning">8 Due Today</span>
        </div>

        <div className="stat-card">
          <h4>Today's Attendance</h4>
          <h2>92%</h2>
          <div className="progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>

      <div className="chart-row">
        <div className="chart-card">
          <h3>Sales Pipeline Snapshot</h3>
          <div className="chart-placeholder"></div>
          <h2>$42,000</h2>
          <span className="positive">+12.5% from last month</span>
        </div>

        <div className="chart-card">
          <h3>Revenue Overview</h3>
          <div className="chart-placeholder"></div>
          <h2>$128,500</h2>
          <span className="positive">+8.2% Year-to-date</span>
        </div>
      </div>

      <div className="bottom-row">
        <div className="alerts">
          <h3>Facility Issue Alerts</h3>
          <div className="alert urgent">
            Elevator Failure - Block A North
          </div>
          <div className="alert medium">
            Light Outage - Hallway Level 4
          </div>
          <div className="alert urgent">
            Water Leakage - Basement Parking
          </div>
        </div>

        <div className="activity">
          <h3>Recent Activity</h3>
          <p>Monthly AMC report generated</p>
          <p>John Doe created task #TK-9021</p>
        </div>
      </div>
    </>
  );
}
