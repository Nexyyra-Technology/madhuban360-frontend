/**
 * Login Page
 * ----------
 * Tries /api/auth/login then /api/users/login. Backend via Vite proxy (vite.config.js only).
 * Design: Matches MADHUBAN dashboard (logo, colors #283046, #1f2937)
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import logoIcon from "../assets/logo-icon.png";
import logoText from "../assets/logo-text.png";

const AUTH_PATHS = ["/api/auth/login", "/api/users/login", "/api/login"];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = JSON.stringify({ email, password });
      let res;
      let data = {};
      for (const path of AUTH_PATHS) {
        res = await fetch(`${API_BASE_URL}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        data = await res.json().catch(() => ({}));
        if (res.status !== 404) break;
      }
      const lastRes = res;
      const lastData = data;

      if (lastRes.status === 404) {
        // No auth endpoint – use dev token from env or demo-token so app is runnable
        const fallback = import.meta.env.VITE_DEV_TOKEN || "demo-token";
        localStorage.setItem("token", fallback);
        navigate("/", { replace: true });
        return;
      }

      if (!lastRes.ok) {
        const msg = lastData?.message || lastData?.error || (lastRes.status === 401 ? "Invalid email or password" : `Request failed (${lastRes.status})`);
        setError(msg);
        return;
      }
      const token = lastData?.token ?? lastData?.data?.token ?? lastData?.accessToken;
      if (!token) {
        setError("Login succeeded but no token received. Check backend response format.");
        return;
      }
      localStorage.setItem("token", token);
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
