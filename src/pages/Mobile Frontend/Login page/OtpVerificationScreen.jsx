/**
 * OtpVerificationScreen – Forgot password OTP flow
 * -----------------------------------------------------------------------
 * - Shown after user requests OTP from Login (Forgot password)
 * - 6-digit OTP input with paste support + numeric keypad
 * - Verify Now calls verifyOtp; on success navigates to Change Password
 * - Resend code with 45s countdown cooldown
 * - Route: /mobile/otp | Mobile stored in sessionStorage (mobileForgotPassword)
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { requestOtp, verifyOtp, normalizeMobile } from "./mobileAuthService";
import logoIcon from "../../../assets/logo-icon.png";
import logoText from "../../../assets/logo-text.png";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 45;

// Masks phone for display (e.g. +91 XXXXX X1234)
function maskPhone(mobile) {
  const n = normalizeMobile(mobile);
  if (!n || n.length < 10) return "+91 XXXXX XXXXX";
  return `+91 XXXXX X${n.slice(-4)}`;
}

export default function OtpVerificationScreen() {
  const navigate = useNavigate();
  const mobile = sessionStorage.getItem("mobileForgotPassword") || "";
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  const startCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_SEC);
  }, []);

  useEffect(() => {
    if (!mobile || normalizeMobile(mobile).length < 10) {
      navigate("/mobile/login", { replace: true });
      return;
    }
    startCooldown();
  }, [mobile, navigate, startCooldown]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  function handleOtpChange(idx, val) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setError("");
    if (digit && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 4) {
      setError("Please enter the complete OTP.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await verifyOtp(mobile, code);
      sessionStorage.setItem("mobileOtpVerified", "1");
      sessionStorage.setItem("mobileResetToken", data?.resetToken || "");
      sessionStorage.setItem("mobileOtpCode", code);
      navigate("/mobile/change-password", { replace: true });
    } catch (err) {
      setError(err?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    try {
      await requestOtp(mobile);
      startCooldown();
    } catch (err) {
      setError(err?.message || "Failed to resend OTP.");
    }
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="mobile-screen mobile-otp">
      <button
        type="button"
        className="mobile-back-btn"
        onClick={() => navigate("/mobile/login")}
        aria-label="Back"
      >
        ←
      </button>
      <h1 className="mobile-otp-header">OTP Verification</h1>
      <div className="mobile-otp-content">
        <div className="mobile-otp-brand">
          <img src={logoIcon} className="mobile-otp-logo-icon" alt="" />
          <img src={logoText} className="mobile-otp-logo-text" alt="" />
        </div>
        <h2 className="mobile-otp-title">OTP Verification</h2>
        <p className="mobile-otp-instruction">Enter the 6-digit code sent to</p>
        <p className="mobile-otp-phone">{maskPhone(mobile)}</p>
        <div
          className="mobile-otp-inputs"
          onPaste={handlePaste}
        >
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="mobile-otp-input"
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>
        {error ? (
          <div className="mobile-error mobile-otp-error" role="alert">
            {error}
          </div>
        ) : null}
        <button
          type="button"
          className="mobile-btn-primary mobile-otp-verify"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Now"}
        </button>
        <div className="mobile-otp-resend">
          <span className="mobile-otp-resend-text">Didn&apos;t receive code?</span>
          <button
            type="button"
            className={`mobile-link mobile-otp-resend-btn ${resendCooldown > 0 ? "disabled" : ""}`}
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            Resend code
          </button>
        </div>
        {resendCooldown > 0 && (
          <p className="mobile-otp-timer">
            <span className="mobile-otp-timer-icon">🕐</span> {formatTime(resendCooldown)}
          </p>
        )}
      </div>
      <div className="mobile-otp-keypad">
        <div className="mobile-keypad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, ""].map((n, i) => (
            <button
              key={i}
              type="button"
              className="mobile-keypad-key"
              onClick={() => {
                if (n === "") return;
                const idx = otp.findIndex((d) => !d);
                if (idx >= 0) {
                  handleOtpChange(idx, String(n));
                }
              }}
              disabled={n === ""}
            >
              {n !== "" ? n : ""}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
