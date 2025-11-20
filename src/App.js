import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import PdfForm from "./pages/PdfForm";

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/pdf-form" element={<ProtectedRoute><MainLayout><PdfForm /></MainLayout></ProtectedRoute>} />
    </Routes>
  );
}
