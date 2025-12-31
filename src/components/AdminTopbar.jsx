// FILE: src/components/AdminTopbar.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUser, getRole, clearAuth, minutesLeft } from "../utils/auth.js";
import NotificationsBell from "./NotificationsBell.jsx";

export default function AdminTopbar() {
  const nav = useNavigate();
  const user = getUser();
  const role = getRole();
  const mins = minutesLeft(); // كم باقي لانتهاء الجلسة

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
      {/* الجهة اليمنى: الشعار / اسم النظام */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link
          to="/"
          className="brand-mini"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <img
            src="/logo.png"
            alt="شعار"
            style={{ width: 32, height: 32, objectFit: "contain" }}
          />
          <b style={{ color: "var(--accent-dark)" }}>واجهة الفارس الذكية</b>
        </Link>
      </div>

      {/* الجهة اليسرى: الإشعارات + المستخدم + تسجيل الخروج */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* جرس الإشعارات */}
        <NotificationsBell />

        {/* معلومات المستخدم */}
        {user && (
          <div
            className="q-chip"
            style={{
              padding: "6px 10px",
              border: "1px solid var(--ink-200)",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontWeight: 700 }}>
              {user.name || user.full_name || user.email}
            </span>
            <span
              style={{
                marginInlineStart: 4,
                color: "var(--ink-600)",
              }}
            >
              ({role === "admin" ? "مدير" : "موظف"})
            </span>
            <span
              style={{
                marginInlineStart: 4,
                fontSize: 12,
                color: "var(--ink-500)",
              }}
            >
              ينتهي خلال ~{mins} دقيقة
            </span>
          </div>
        )}

        {/* زر تسجيل الخروج */}
        <button className="q-btn ghost" onClick={onLogout}>
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}
