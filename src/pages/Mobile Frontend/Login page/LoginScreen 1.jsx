/**
 * Login Screen – Mobile number + Password, Forgot password link
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mobileLogin, requestOtp, normalizeMobile } from "./mobileAuthService";
import logoIcon from "../../../assets/logo-icon.png";
import logoText from "../../../assets/logo-text.png";

export default function LoginScreen() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleForgotPassword() {
    const normalized = normalizeMobile(mobile);
    if (!normalized || normalized.length < 10) {
      setError("Please enter your 10-digit mobile number first.");
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
      await mobileLogin(mobile, password);
      navigate("/mobile/dashboard", { replace: true });
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
            <label className="mobile-label">Mobile Number</label>
            <div className="mobile-input-wrap">
              <span className="mobile-input-icon">📱</span>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="mobile-input"
                placeholder="Enter 10 digit mobile no"
                maxLength={10}
                required
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
      <p className="mobile-footer-copy">Madhuban Group © 2024</p>
    </div>
  );
}
