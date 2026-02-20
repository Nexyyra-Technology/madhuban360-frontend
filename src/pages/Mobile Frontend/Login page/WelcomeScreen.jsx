/**
 * WelcomeScreen – Initial branding screen for mobile app
 * -----------------------------------------------------------------------
 * - Madhuban Group branding with logo and Facility Management tagline
 * - Auto-advances to Splash screen after 2.5s delay
 * - Tap anywhere to skip and go to Splash immediately
 * - Route: /mobile/welcome (default entry for /mobile)
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../../../assets/logo-icon.png";
import logoText from "../../../assets/logo-text.png";

// Delay in ms before auto-navigation to Splash
const SPLASH_DELAY_MS = 2500;

export default function WelcomeScreen() {
  // ----- State & effects -----
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setReady(true);
      navigate("/mobile/splash", { replace: true });
    }, SPLASH_DELAY_MS);
    return () => clearTimeout(t);
  }, [navigate]);

  // ----- Handlers -----
  function handleSkip() {
    navigate("/mobile/splash", { replace: true });
  }

  // ----- Render -----
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
