/**
 * Login Page — Enhanced UI
 * Design: Luxury/refined dark theme matching MADHUBAN dashboard (#283046, #1f2937)
 * Features: Animated background, glassmorphism card, smooth interactions
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Building2 } from "lucide-react";
import logoIcon from "../assets/logo-icon.png";
import logoText from "../assets/logo-text.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #0d1117;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .lp-left {
          position: relative;
          background: #131c2e;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          overflow: hidden;
        }

        /* Animated orb background */
        .lp-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .lp-orb-1 {
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(99,130,210,0.18) 0%, transparent 70%);
          top: -100px; left: -120px;
          animation: orbFloat1 8s ease-in-out infinite;
        }
        .lp-orb-2 {
          width: 360px; height: 360px;
          background: radial-gradient(circle, rgba(56,189,148,0.12) 0%, transparent 70%);
          bottom: -80px; right: -60px;
          animation: orbFloat2 10s ease-in-out infinite;
        }
        .lp-orb-3 {
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(245,158,66,0.08) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: orbFloat3 12s ease-in-out infinite;
        }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 40px) scale(1.08); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, -30px) scale(1.05); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-48%, -52%) scale(1.1); }
        }

        /* Diagonal decorative lines */
        .lp-lines {
          position: absolute; inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .lp-lines::before, .lp-lines::after {
          content: '';
          position: absolute;
          width: 1px;
          height: 200%;
          background: linear-gradient(to bottom, transparent, rgba(99,130,210,0.15), transparent);
          top: -50%;
        }
        .lp-lines::before { left: 30%; transform: rotate(15deg); }
        .lp-lines::after { right: 20%; transform: rotate(15deg); }

        /* Grid dots pattern */
        .lp-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        .lp-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
          z-index: 1;
          animation: fadeSlideDown 0.7s ease both;
        }
        .lp-brand-icon {
          width: 40px; height: 40px;
          object-fit: contain;
          filter: drop-shadow(0 0 12px rgba(99,130,210,0.5));
        }
        .lp-brand-text {
          height: 22px;
          object-fit: contain;
          filter: brightness(1.2);
        }

        .lp-hero {
          position: relative;
          z-index: 1;
          animation: fadeSlideUp 0.8s ease 0.15s both;
        }
        .lp-hero-label {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(99,130,210,0.8);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .lp-hero-label::before {
          content: '';
          display: block;
          width: 24px; height: 1px;
          background: rgba(99,130,210,0.8);
        }
        .lp-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 4vw, 4rem);
          font-weight: 300;
          line-height: 1.1;
          color: #e8eaf0;
          letter-spacing: -0.01em;
          margin-bottom: 1.5rem;
        }
        .lp-hero-title em {
          font-style: italic;
          color: #8fa3db;
        }
        .lp-hero-desc {
          font-size: 0.9rem;
          color: rgba(200,210,230,0.5);
          line-height: 1.7;
          max-width: 340px;
        }

        .lp-stats {
          display: flex;
          gap: 2.5rem;
          position: relative;
          z-index: 1;
          animation: fadeSlideUp 0.8s ease 0.3s both;
        }
        .lp-stat-item {}
        .lp-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 600;
          color: #c8d4f0;
          line-height: 1;
        }
        .lp-stat-label {
          font-size: 0.72rem;
          color: rgba(180,195,230,0.45);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 0.3rem;
        }
        .lp-stat-divider {
          width: 1px;
          background: rgba(99,130,210,0.15);
          align-self: stretch;
        }

        /* ── RIGHT PANEL ── */
        .lp-right {
          background: #0d1117;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }
        .lp-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(99,130,210,0.2), transparent);
        }

        .lp-card {
          width: 100%;
          max-width: 420px;
          animation: fadeSlideUp 0.8s ease 0.1s both;
        }

        .lp-card-header {
          margin-bottom: 2.5rem;
        }
        .lp-card-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(99,130,210,0.7);
          margin-bottom: 0.75rem;
        }
        .lp-card-eyebrow-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(99,130,210,0.7);
        }
        .lp-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem;
          font-weight: 300;
          color: #e0e6f0;
          line-height: 1.15;
          letter-spacing: -0.01em;
          margin-bottom: 0.5rem;
        }
        .lp-card-subtitle {
          font-size: 0.85rem;
          color: rgba(180,195,230,0.4);
        }

        /* Error */
        .lp-error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.82rem;
          color: #fca5a5;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .lp-error::before { content: '⚠'; font-size: 0.9rem; }

        /* Form */
        .lp-form { display: flex; flex-direction: column; gap: 1.25rem; }

        .lp-field { display: flex; flex-direction: column; gap: 0.5rem; }

        .lp-label {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(180,195,230,0.5);
        }

        .lp-input-wrap {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,130,210,0.15);
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .lp-input-wrap.is-focused {
          border-color: rgba(99,130,210,0.5);
          background: rgba(99,130,210,0.05);
          box-shadow: 0 0 0 3px rgba(99,130,210,0.08), inset 0 1px 0 rgba(255,255,255,0.03);
        }

        .lp-input-icon {
          padding: 0 0.875rem;
          display: flex;
          align-items: center;
          color: rgba(180,195,230,0.3);
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .lp-input-wrap.is-focused .lp-input-icon { color: rgba(99,130,210,0.7); }

        .lp-input {
          flex: 1;
          padding: 0.85rem 0.5rem 0.85rem 0;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #d0daf0;
          caret-color: rgba(99,130,210,0.8);
        }
        .lp-input::placeholder { color: rgba(180,195,230,0.2); }

        .lp-input-btn {
          padding: 0 0.875rem;
          background: transparent;
          border: none;
          cursor: pointer;
          color: rgba(180,195,230,0.3);
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .lp-input-btn:hover { color: rgba(180,195,230,0.6); }

        /* Submit */
        .lp-submit {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.95rem 1.5rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #3d5a9e 0%, #2d4480 50%, #283e73 100%);
          color: #d0daf8;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(40,62,115,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .lp-submit::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%);
        }
        .lp-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(40,62,115,0.55), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .lp-submit:active:not(:disabled) { transform: translateY(0); }
        .lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .lp-submit-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(208,218,248,0.3);
          border-top-color: #d0daf8;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .lp-submit-arrow { transition: transform 0.2s; }
        .lp-submit:hover .lp-submit-arrow { transform: translateX(3px); }

        /* Footer note */
        .lp-footer {
          margin-top: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(180,195,230,0.25);
          font-size: 0.75rem;
        }
        .lp-footer svg { opacity: 0.5; }

        /* Animations */
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .lp-root { grid-template-columns: 1fr; }
          .lp-left { display: none; }
          .lp-right::before { display: none; }
        }
      `}</style>

      <div className="lp-root">
        {/* ── LEFT ── */}
        <div className="lp-left">
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />
          <div className="lp-orb lp-orb-3" />
          <div className="lp-lines" />
          <div className="lp-dots" />

          <div className="lp-brand">
            <img src={logoIcon} className="lp-brand-icon" alt="" />
            <img src={logoText} className="lp-brand-text" alt="MADHUBAN" />
          </div>

          <div className="lp-hero">
            <p className="lp-hero-label">Property Management</p>
            <h2 className="lp-hero-title">
              Manage your<br />
              properties with<br />
              <em>clarity</em>
            </h2>
            <p className="lp-hero-desc">
              A unified dashboard for occupancy, revenue, and operations — everything you need, nothing you don't.
            </p>
          </div>

          <div className="lp-stats">
            <div className="lp-stat-item">
              <div className="lp-stat-num">99.9%</div>
              <div className="lp-stat-label">Uptime</div>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat-item">
              <div className="lp-stat-num">Real‑time</div>
              <div className="lp-stat-label">Analytics</div>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat-item">
              <div className="lp-stat-num">Secure</div>
              <div className="lp-stat-label">Encrypted</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="lp-right">
          <div className="lp-card">
            <div className="lp-card-header">
              <div className="lp-card-eyebrow">
                <span className="lp-card-eyebrow-dot" />
                Admin Portal
              </div>
              <h1 className="lp-card-title">Welcome back</h1>
              <p className="lp-card-subtitle">Sign in to access your dashboard</p>
            </div>

            {error && (
              <div className="lp-error" role="alert">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="lp-form">
              {/* Email */}
              <div className="lp-field">
                <label className="lp-label">Email address</label>
                <div className={`lp-input-wrap${focused === "email" ? " is-focused" : ""}`}>
                  <span className="lp-input-icon">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    className="lp-input"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lp-field">
                <label className="lp-label">Password</label>
                <div className={`lp-input-wrap${focused === "password" ? " is-focused" : ""}`}>
                  <span className="lp-input-icon">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    className="lp-input"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="lp-input-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="lp-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="lp-submit-spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} className="lp-submit-arrow" />
                  </>
                )}
              </button>
            </form>

            <div className="lp-footer">
              <Lock size={12} />
              Secured with end-to-end encryption
            </div>
          </div>
        </div>
      </div>
    </>
  );
}