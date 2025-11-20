import React, { useEffect, useState } from "react";
import "./dashboard.css";

export default function Dashboard() {
  const [time, setTime] = useState("");

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dash-wrapper">

      {/* TOP RIGHT CLOCK */}
      <div className="clock-box">{time}</div>

      <div className="dash-card fade-in">
        <div className="dash-icon">⚓</div>

        <h1 className="dash-title">Welcome to Marine Survey System</h1>

        <p className="dash-text">
          Your smart tool for generating professional container survey reports.
        </p>

        <button
          className="dash-btn"
          onClick={() => (window.location.href = "/pdf-form")}
        >
          Generate PDF →
        </button>
      </div>
    </div>
  );
}
