import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css"; // <-- Add CSS file

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const doLogin = (e) => {
    e.preventDefault();
    if (user === "admin" && pass === "1234") {
      localStorage.setItem("loggedIn", "true");
      navigate("/");
    } else {
      alert("Invalid Login. Use admin / 1234");
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-card">
        <h2 className="login-title">Marine Survey Login</h2>

        <form onSubmit={doLogin}>
          <label>Username</label>
          <input
            placeholder="Enter username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <button className="login-btn" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
