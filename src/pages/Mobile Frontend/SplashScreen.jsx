/**
 * Splash Screen – Madhuban Smart Facility Management intro
 * Illustration, branding, and Login CTA.
 */
import { useNavigate } from "react-router-dom";
import splashIllustration from "../../assets/splash-illustration.png";
import logoIcon from "../../assets/logo-icon.png";
import logoText from "../../assets/logo-text.png";

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="mobile-screen mobile-splash">
      <div className="mobile-splash-illustration">
        <img src={splashIllustration} alt="Smart Facility Management" className="mobile-splash-illustration-img" />
      </div>
      <div className="mobile-splash-brand">
        <div className="mobile-splash-logo">
          <img src={logoIcon} className="mobile-splash-logo-icon" alt="" />
          <img src={logoText} className="mobile-splash-logo-text" alt="Madhuban" />
        </div>
        <h1 className="mobile-splash-title">Smart Facility Management</h1>
        <p className="mobile-splash-desc">Manage maintenance, housekeeping & staff efficiently</p>
      </div>
      <button
        type="button"
        className="mobile-btn-primary mobile-splash-btn"
        onClick={() => navigate("/mobile/login")}
      >
        Login
      </button>
    </div>
  );
}
