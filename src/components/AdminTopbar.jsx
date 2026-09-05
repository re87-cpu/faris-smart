// FILE: src/components/AdminTopbar.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUser, getRole, clearAuth, minutesLeft } from "../utils/auth.js";
import NotificationsBell from "./NotificationsBell.jsx";
import logo from "../assets/logo.png";

export default function AdminTopbar() {
  const nav = useNavigate();
  const user = getUser();
  const role = getRole();
  const mins = minutesLeft();

  function onLogout() {
    clearAuth();
    nav("/login", { replace: true });
  }

  return (
    <header className="nav" dir="rtl" style={{ borderBottom: "1px solid var(--color-neutral-300)", position: "sticky", top: 0, zIndex: 50, background: "var(--color-bg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src={logo} alt="فارس للمحاماة" style={{ height: 32 }} />
          <span className="nav-brand" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18 }}>
            فارس <span style={{ color: "var(--color-accent-700)", fontSize: 13 }}>/ المدير</span>
          </span>
        </Link>
        <div style={{ flex: 1 }} />
        <NotificationsBell />
        {user && (
          <span className="tag tag-outline">
            {user.name || user.full_name || user.email} — {role === "admin" ? "مدير" : "موظف"} — ~{mins} د
          </span>
        )}
        <button className="btn btn-ghost" onClick={onLogout}>تسجيل الخروج</button>
      </div>
    </header>
  );
}
