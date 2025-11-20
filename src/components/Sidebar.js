import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles.css";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("loggedIn");
    navigate("/login");
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-circle">MS</div>
        <h2>Marine Survey</h2>
      </div>

      <ul className="sidebar-menu">
        <li className={isActive("/")}>
          <Link to="/">
            <span className="icon">📊</span> Dashboard
          </Link>
        </li>

        <li className={isActive("/pdf-form")}>
          <Link to="/pdf-form">
            <span className="icon">📄</span> Generate PDF
          </Link>
        </li>

        <li className="logout-item">
          <button onClick={logout}>
            <span className="icon">🚪</span> Logout
          </button>
        </li>
      </ul>
    </div>
  );
}
