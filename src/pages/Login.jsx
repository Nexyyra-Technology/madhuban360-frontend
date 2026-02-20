/**
 * Login Page
 * ----------
 * Uses authApi.login; stores token and user (including lastLoginAt from backend).
 * Design: Matches MADHUBAN dashboard (logo, colors #283046, #1f2937)
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import logoIcon from "../assets/logo-icon.png";
import logoText from "../assets/logo-text.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <img src={logoIcon} className="login-brand-icon" alt="" />
          <img src={logoText} className="login-brand-text" alt="MADHUBAN" />
        </div>
        <p className="login-tagline">Property Management Dashboard</p>
      </div>
      <div className="login-right">
        <div className="login-card">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to access your dashboard</p>
          {error ? (
            <div className="login-error" role="alert">
              {error}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="login-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="login-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
