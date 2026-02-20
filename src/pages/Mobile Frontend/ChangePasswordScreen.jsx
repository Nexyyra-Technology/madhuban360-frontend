/**
 * Change Password Screen – Shown after OTP verified (forgot password flow)
 * New Password, Confirm Password, Update Password
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resetPasswordWithOtp } from "./mobileAuthService";

export default function ChangePasswordScreen() {
  const navigate = useNavigate();
  const mobile = sessionStorage.getItem("mobileForgotPassword") || "";
  const resetToken = sessionStorage.getItem("mobileResetToken") || "";
  const otpCode = sessionStorage.getItem("mobileOtpCode") || "";
  const otpVerified = sessionStorage.getItem("mobileOtpVerified");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!otpVerified || !mobile) {
      navigate("/mobile/login", { replace: true });
    }
  }, [otpVerified, mobile, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!newPassword.trim()) {
      setError("New password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp(mobile, otpCode, newPassword, resetToken);
      sessionStorage.removeItem("mobileForgotPassword");
      sessionStorage.removeItem("mobileOtpVerified");
      sessionStorage.removeItem("mobileResetToken");
      sessionStorage.removeItem("mobileOtpCode");
      navigate("/mobile/login", { replace: true });
    } catch (err) {
      setError(err?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mobile-screen mobile-change-pwd">
      <button
        type="button"
        className="mobile-back-btn"
        onClick={() => navigate("/mobile/otp")}
        aria-label="Back"
      >
        ←
      </button>
      <div className="mobile-change-pwd-content">
        <h1 className="mobile-change-pwd-title">Create New Password</h1>
        <p className="mobile-change-pwd-subtitle">
          Your new password must be different from previous used passwords.
        </p>
        <form onSubmit={handleSubmit} className="mobile-change-pwd-form">
          {error ? (
            <div className="mobile-error" role="alert">
              {error}
            </div>
          ) : null}
          <div className="mobile-field">
            <label className="mobile-label">New Password</label>
            <div className="mobile-input-wrap">
              <span className="mobile-input-icon">🔑</span>
              <input
                type={showNewPwd ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mobile-input"
                placeholder="Enter New Password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="mobile-pwd-toggle"
                onClick={() => setShowNewPwd(!showNewPwd)}
                aria-label={showNewPwd ? "Hide password" : "Show password"}
              >
                {showNewPwd ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          <div className="mobile-field">
            <label className="mobile-label">Confirm Password</label>
            <div className="mobile-input-wrap">
              <span className="mobile-input-icon">🛡</span>
              <input
                type={showConfirmPwd ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mobile-input"
                placeholder="Confirm password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="mobile-pwd-toggle"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                aria-label={showConfirmPwd ? "Hide password" : "Show password"}
              >
                {showConfirmPwd ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="mobile-btn-primary mobile-change-pwd-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
        <p className="mobile-change-pwd-footer">
          By setting a password, you agree to our{" "}
          <a href="/terms" className="mobile-link-inline">Terms of Service</a>
          {" & "}
          <a href="/privacy" className="mobile-link-inline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
