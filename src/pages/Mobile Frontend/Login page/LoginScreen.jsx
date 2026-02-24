/**
 * LoginScreen – Mobile authentication
 * -----------------------------------------------------------------------
 * - Mobile number (10-digit) + Password login
 * - Forgot password link triggers OTP flow via /mobile/otp
 * - Uses mobileAuthService: mobileLogin, requestOtp
 * - On success: redirect by role – Manager/Admin → /mobile/manager/dashboard, Staff → /mobile/dashboard
 * - Route: /mobile/login
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mobileLogin, requestOtp, normalizeMobile } from "./mobileAuthService";
import { useAuth } from "../../../context/AuthContext";
import { isManagerRole, isSupervisorRole } from "../../../lib/userUtils";
import logoIcon from "../../../assets/logo-icon.png";
import logoText from "../../../assets/logo-text.png";

export default function LoginScreen() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // ----- Handlers -----
  async function handleForgotPassword() {
    const isEmail = String(mobile || "").includes("@");
    const normalized = normalizeMobile(mobile);
    if (!isEmail && (!normalized || normalized.length < 10)) {
      setError("Please enter your 10-digit mobile number first.");
      return;
    }
    if (isEmail) {
      setError("Forgot password for email accounts: please use the desktop login or contact support.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await requestOtp(normalized);
      sessionStorage.setItem("mobileForgotPassword", normalized);
      navigate("/mobile/otp");
    } catch (err) {
      setError(err?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await mobileLogin(mobile, password);
      setUser(user);
      const target = isSupervisorRole(user)
        ? "/mobile/supervisor/dashboard"
        : isManagerRole(user)
          ? "/mobile/manager/dashboard"
          : "/mobile/dashboard";
      navigate(target, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mobile-screen mobile-login">
      <button
        type="button"
        className="mobile-back-btn"
        onClick={() => navigate("/mobile/splash")}
        aria-label="Back"
      >
        ←
      </button>
      <div className="mobile-login-content">
        <div className="mobile-login-brand">
          <img src={logoIcon} className="mobile-login-logo-icon" alt="" />
          <img src={logoText} className="mobile-login-logo-text" alt="MADHUBAN" />
        </div>
        <form onSubmit={handleSubmit} className="mobile-login-form">
          {error ? (
            <div className="mobile-error" role="alert">
              {error}
            </div>
          ) : null}
          <div className="mobile-field">
            <label className="mobile-label">Mobile Number or Email</label>
            <div className="mobile-input-wrap">
              <span className="mobile-input-icon">📱</span>
              <input
                type="text"
                inputMode={/[a-zA-Z@.]/.test(mobile) ? "email" : "numeric"}
                value={mobile}
                onChange={(e) => {
                  const v = e.target.value;
                  const looksLikeEmail = /[a-zA-Z@.]/.test(v);
                  setMobile(looksLikeEmail ? v : v.replace(/\D/g, "").slice(0, 10));
                }}
                className="mobile-input"
                placeholder="Mobile (10 digits) or Email"
                required
                autoComplete="username"
              />
            </div>
          </div>
          <div className="mobile-field">
            <label className="mobile-label">Password</label>
            <div className="mobile-input-wrap">
              <span className="mobile-input-icon">🔑</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mobile-input"
                placeholder="Enter password"
                required
              />
            </div>
          </div>
          <div className="mobile-forgot-wrap">
            <button
              type="button"
              className="mobile-link"
              onClick={handleForgotPassword}
            >
              Forgot password ?
            </button>
          </div>
          <button type="submit" className="mobile-btn-primary mobile-login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
      <p className="mobile-footer-copy">Madhuban Group © 2026</p>
    </div>
  );
}
