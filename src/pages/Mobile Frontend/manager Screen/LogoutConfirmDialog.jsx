/**
 * LogoutConfirmDialog – Confirmation modal for logout
 * -----------------------------------------------------------------------
 * - Orange warning icon
 * - "Are you sure you want to log out?" message
 * - Cancel and Logout buttons
 */
export default function LogoutConfirmDialog({ open, onCancel, onLogout }) {
  if (!open) return null;

  return (
    <div className="manager-logout-overlay" onClick={onCancel}>
      <div className="manager-logout-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="manager-logout-icon-wrap">
          <span className="manager-logout-icon">⚠</span>
        </div>
        <p className="manager-logout-message">Are you sure you want to log out?</p>
        <div className="manager-logout-actions">
          <button type="button" className="manager-logout-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="manager-logout-confirm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
