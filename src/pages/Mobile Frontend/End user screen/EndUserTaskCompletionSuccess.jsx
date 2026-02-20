/**
 * EndUserTaskCompletionSuccess – Success confirmation after task submit
 * -----------------------------------------------------------------------
 * - Shows success icon, submission ID, completion time
 * - Go to Next Task → /mobile/tasks
 * - Back to Dashboard → /mobile/dashboard
 * - Route: /mobile/task/:id/success (protected)
 */
import { useNavigate, useParams } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";

export default function EndUserTaskCompletionSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const taskId = id ? `MG-${id.slice(-4)}-B` : `MG-${Date.now().toString(36).slice(-4).toUpperCase()}-B`;

  return (
    <div className="mobile-end-user-screen mobile-task-success">
      <header className="end-user-page-header">
        <h1>End User Task Completion</h1>
      </header>

      <div className="task-success-content">
        <div className="task-success-icon">✓</div>
        <h2>Task Submitted!</h2>
        <p>Your work has been sent to the supervisor for verification.</p>

        <div className="task-success-details">
          <div className="task-success-thumb" />
          <div>
            <strong>Submission Details</strong>
            <p>Lobby Maintenance - Area</p>
            <span>🕐 Completed at {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
            <span>📄 ID: {taskId}</span>
          </div>
        </div>

        <div className="task-success-actions">
          <button
            type="button"
            className="end-user-primary-btn full-width"
            onClick={() => navigate("/mobile/tasks")}
          >
            Go to Next Task →
          </button>
          <button
            type="button"
            className="end-user-secondary-btn full-width"
            onClick={() => navigate("/mobile/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
