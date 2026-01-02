// FILE: src/components/StaffTopbar.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUser, getRole, clearAuth, minutesLeft } from "../utils/auth.js";
import NotificationsBell from "./NotificationsBell.jsx";

export default function StaffTopbar() {
  const nav = useNavigate();
  const user = getUser();
  const role = getRole();
  const mins = minutesLeft();

  function onLogout() {
    clearAuth();
    nav("/login", { replace: true });
  }

  return (
    <header
      className="q-card"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        gap: 12,
      }}
      dir="rtl"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link
          to="/staff"
          className="brand-mini"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
          title="العودة للوحة الموظف"
        >
          <img
            src="/logo.png"
            alt="شعار"
            style={{ width: 32, height: 32, objectFit: "contain" }}
          />
          <b style={{ color: "var(--accent-dark)" }}>واجهة فارس المكتبية</b>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <NotificationsBell />

        {user && (
          <div
            style={{
              padding: "6px 10px",
              border: "1px solid var(--border)",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
            }}
            title="معلومات الجلسة"
          >
            <span style={{ fontWeight: 800 }}>
              {user.name || user.full_name || user.email}
            </span>
            <span style={{ marginInlineStart: 4, color: "var(--muted)" }}>
              ({role === "admin" ? "مدير" : "موظف"})
            </span>
            <span style={{ marginInlineStart: 4, fontSize: 12, color: "var(--muted)" }}>
              ينتهي خلال ~{mins} دقيقة
            </span>
          </div>
        )}

        <button className="q-btn ghost" onClick={onLogout}>
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}
