/**
 * Direct mobile camera capture - no upload, live image only.
 * Uses navigator.mediaDevices.getUserMedia for live preview + capture.
 */
import { useState, useEffect, useRef } from "react";

export default function CameraCapture({ label, onCapture, capturedBlob, compact }) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  async function startCamera() {
    setError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      setError("Camera access denied. Please allow camera permission.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !stream) return;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  }

  if (capturedBlob) {
    return (
      <div className={`camera-capture-result ${compact ? "compact" : ""}`}>
        <img src={URL.createObjectURL(capturedBlob)} alt={label} />
        <button type="button" className="camera-capture-retake" onClick={() => onCapture(null)}>
          Retake
        </button>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className={`camera-capture-placeholder ${compact ? "compact" : ""}`}>
        <button type="button" className="camera-capture-btn" onClick={startCamera}>
          <span className="camera-icon">📷</span>
          <span>{label}</span>
        </button>
        {error && <p className="camera-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="camera-capture-live">
      <video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div className="camera-capture-actions">
        <button type="button" className="camera-capture-cancel" onClick={stopCamera}>
          Cancel
        </button>
        <button type="button" className="camera-capture-snap" onClick={capture}>
          Capture
        </button>
      </div>
    </div>
  );
}
