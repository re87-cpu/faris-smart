// FILE: src/pages/Forbidden403.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Forbidden403() {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <div
        className="q-card"
        style={{ padding: "24px 20px", maxWidth: 520, textAlign: "center" }}
      >
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          403 — غير مسموح
        </div>
        <div style={{ color: "var(--ink-600)", marginBottom: 14 }}>
          لا تملك صلاحية الوصول لهذه الصفحة.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link to="/" className="q-btn ghost">
            الصفحة الرئيسية
          </Link>
          <Link to="/login" className="q-btn primary">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
