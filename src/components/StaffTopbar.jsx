// FILE: src/components/StaffTopbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, getRole, clearAuth } from "../utils/auth.js";
import NotificationsBell from "./NotificationsBell.jsx";

export default function StaffTopbar() {
  const nav = useNavigate();
  const user = getUser();
  const role = getRole();

  const displayName =
    user?.name || user?.full_name || user?.email || "مستخدم غير معرّف";
  const roleLabel = role === "admin" ? "مدير" : "موظف";

  function logout() {
    clearAuth();
    nav("/login", { replace: true });
  }

  return (
    <header className="q-nav" dir="rtl">
      {/* الجهة اليمنى: رجوع / شعار بسيط */}
      <div className="q-left" style={{ gap: 8 }}>
        <Link className="q-link" to="/">
          ← الرجوع
        </Link>
      </div>

      {/* الجهة اليسرى: جرس + معلومات الموظف + تسجيل الخروج */}
      <div
        className="q-left"
        style={{ gap: 12, alignItems: "center", display: "flex" }}
      >
        {/* جرس الإشعارات */}
        <NotificationsBell />

        {/* معلومات المستخدم بشكل مرتب */}
        <span
          className="q-link"
          style={{
            cursor: "default",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontWeight: 700 }}>👤 {displayName}</span>
          <span style={{ color: "var(--ink-700)" }}>— {roleLabel}</span>
        </span>

        {/* زر تسجيل الخروج */}
        <button
          className="q-link"
          onClick={logout}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}
