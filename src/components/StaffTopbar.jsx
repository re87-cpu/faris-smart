// FILE: src/components/StaffTopbar.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUser, getRole, clearAuth, minutesLeft } from "../utils/auth.js";
import NotificationsBell from "./NotificationsBell.jsx";
import logo from "../assets/logo.png";

export default function StaffTopbar() {
  const nav = useNavigate();
  const user = getUser();
  const role = getRole();
  const mins = minutesLeft();

  function onLogout() {
    clearAuth();
    nav("/login", { replace: true });
  }

  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  const timeLeft = hrs > 0 ? `${hrs}س ${rem}د` : `${rem}د`;

  return (
    <header
      className="nav" dir="rtl"
      style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 24px" }}>
        <Link to="/staff" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }} title="العودة إلى الموظف">
          <img src={logo} alt="فارس للمحاماة" style={{ height: 34 }} />
          <span className="nav-brand" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 19, margin: 0 }}>
            فارس <span style={{ color: "var(--color-accent-700)", fontSize: 13, fontWeight: 500 }}>الموظف</span>
          </span>
        </Link>
        <div style={{ flex: 1 }} />
        <NotificationsBell />
        {user && (
          <span className="tag tag-neutral" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>{user.name || user.full_name || user.email}</span>
            <span style={{ opacity: .55 }}>·</span>
            <span>{role === "admin" ? "مدير" : "موظف"}</span>
            <span style={{ opacity: .55 }}>·</span>
            <span style={{ opacity: .75 }}>يتبقى {timeLeft}</span>
          </span>
        )}
        <button className="btn btn-secondary" onClick={onLogout}>تسجيل الخروج</button>
      </div>
    </header>
  );
}
