// FILE: src/pages/Forbidden403.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Forbidden403() {
  return (
    <div className="site" dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, textAlign: "center", border: "1px solid var(--s-line)", borderRadius: 4, padding: "2.6rem 2rem", background: "#fff" }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: "var(--s-navy)", marginBottom: 8 }}>403 — غير مسموح</div>
        <p style={{ color: "var(--s-muted)", marginBottom: 20, fontWeight: 300 }}>لا تملك صلاحية الوصول لهذه الصفحة.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" className="site-btn site-btn-outline site-btn-sm">الصفحة الرئيسية</Link>
          <Link to="/login" className="site-btn site-btn-primary site-btn-sm">تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}
