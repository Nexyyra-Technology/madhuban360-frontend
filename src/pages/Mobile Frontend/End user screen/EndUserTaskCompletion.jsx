/**
 * EndUserTaskCompletion – Task completion with photo proof
 * -----------------------------------------------------------------------
 * - Before/After photos via CameraCapture (live camera only, no upload)
 * - Optional notes textarea
 * - On Submit: POST {{baseUrl}}/api/staff/tasks/{{taskId}}/complete (submitTaskCompletion)
 *   with FormData: before, after (photos), notes. Auth: Bearer token.
 * - On success: navigate to /mobile/task/:id/success
 * - Route: /mobile/task/:id/complete (protected)
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";
import CameraCapture from "./CameraCapture";
import { getTaskById, submitTaskCompletion } from "./endUserService";

export default function EndUserTaskCompletion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (id) getTaskById(id).then(setTask).catch(() => setTask(null));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!id) return;
    setError("");
    setSubmitting(true);
    try {
      await submitTaskCompletion(id, {
        beforePhoto,
        afterPhoto,
        notes: notes.trim() || undefined,
      });
      navigate(`/mobile/task/${id}/success`);
    } catch (e) {
      setError(e?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="mobile-end-user-screen mobile-task-completion">
      <header className="end-user-page-header">
        <button type="button" className="mobile-back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>End User Task Completion</h1>
      </header>
      <p className="task-completion-subtitle">Room {task?.title || id} - {task?.description?.split(" ")[0] || "Deep Clean"}</p>

      <div className="task-completion-progress">
        <span>Step {step} of {totalSteps}: Verification</span>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <span className="task-id">Task #{id?.slice(-4) || "8821"}: Standard Cleaning</span>
      </div>

      <form onSubmit={handleSubmit} className="task-completion-form">
        <h3>Proof of Completion</h3>
        <p className="proof-instruction">Please capture photos of the room before and after the task. Direct camera capture only.</p>

        <div className="proof-section">
          <div className="proof-label">
            <span>Before Task</span>
            {beforePhoto && <span className="proof-badge uploaded">Uploaded</span>}
          </div>
          <CameraCapture
            label="Current Snap"
            onCapture={setBeforePhoto}
            capturedBlob={beforePhoto}
            compact={false}
          />
        </div>

        <div className="proof-section">
          <div className="proof-label">
            <span>After Task</span>
            {afterPhoto && <span className="proof-badge current">Current Snap</span>}
          </div>
          <CameraCapture
            label="Current Snap"
            onCapture={setAfterPhoto}
            capturedBlob={afterPhoto}
            compact={false}
          />
        </div>

        <div className="proof-section">
          <label>Notes / Observations (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Report broken items or maintenance needs..."
            rows={3}
          />
        </div>

        {error && (
          <p className="task-completion-error" role="alert">{error}</p>
        )}

        {/* On click: POST {{baseUrl}}/api/staff/tasks/{{taskId}}/complete. Enabled when both photos are captured OR when text is written in Notes/Observations. */}
        <button
          type="submit"
          className="end-user-primary-btn full-width"
          disabled={submitting || ((!beforePhoto || !afterPhoto) && !notes.trim())}
        >
          {submitting ? "Submitting..." : "▶ Submit for Verification"}
        </button>
      </form>

      <MobileBottomNav />
    </div>
  );
}
