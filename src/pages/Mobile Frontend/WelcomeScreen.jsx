/**
 * Welcome Screen – Initial branding screen (Madhuban Group, Facility Management)
 * Auto-advances to Splash after delay; tap to skip.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../../assets/logo-icon.png";
import logoText from "../../assets/logo-text.png";

const SPLASH_DELAY_MS = 2500;

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setReady(true);
      navigate("/mobile/splash", { replace: true });
    }, SPLASH_DELAY_MS);
    return () => clearTimeout(t);
  }, [navigate]);

  function handleSkip() {
    navigate("/mobile/splash", { replace: true });
  }

  return (
    <div
      className="mobile-screen mobile-welcome"
      onClick={handleSkip}
      onKeyDown={(e) => e.key === "Enter" && handleSkip()}
      role="button"
      tabIndex={0}
      aria-label="Welcome - tap to continue"
    >
      <div className="mobile-welcome-content">
        <div className="mobile-welcome-logo">
          <img src={logoIcon} className="mobile-welcome-logo-icon" alt="" />
          <img src={logoText} className="mobile-welcome-logo-text" alt="Madhuban Group" />
        </div>
        <p className="mobile-welcome-tagline">Facility Management</p>
      </div>
      <div className="mobile-welcome-footer">
        <p className="mobile-welcome-footer-line">Premium Property Services</p>
        <p className="mobile-welcome-version">v 2.4.0</p>
      </div>
    </div>
  );
}
