import React from "react";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">{children}</div>
    </div>
  );
}
