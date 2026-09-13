// FILE: src/pages/admin/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import AdminTopbar from "../../components/AdminTopbar.jsx";

const GROUPS = [
  { label: "نظرة عامة", links: [
    { to: "/dashboard-admin", label: "الرئيسية", end: true },
    { to: "/admin/analytics", label: "التحليلات" },
    { to: "/admin/financial", label: "المالية" },
    { to: "/admin/accounting", label: "المحاسبة" },
  ]},
  { label: "القضايا", links: [
    { to: "/admin/cases", label: "القضايا" },
    { to: "/admin/assign", label: "الإسناد" },
    { to: "/admin/calendar", label: "التقويم" },
    { to: "/admin/tasks", label: "المهام" },
  ]},
  { label: "الفريق والمستندات", links: [
    { to: "/admin/employees", label: "الموظفون" },
    { to: "/admin/staff-requests", label: "طلبات الموظفين" },
    { to: "/admin/drafts", label: "المسودات" },
    { to: "/admin/articles", label: "المقالات" },
    { to: "/admin/archive", label: "الأرشيف" },
    { to: "/admin/notifications", label: "الإشعارات" },
  ]},
];

export default function AdminLayout() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <AdminTopbar />
      <div style={{ display: "grid", gridTemplateColumns: "232px 1fr", maxWidth: 1400, margin: "0 auto" }}>
        <aside
          style={{
            padding: "18px 12px", background: "var(--color-surface)",
            borderInlineEnd: "1px solid var(--color-neutral-200)", minHeight: "calc(100vh - 57px)",
          }}
        >
          {GROUPS.map((g) => (
            <div key={g.label}>
              <div className="ind-sectag">{g.label}</div>
              <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 14 }}>
                {g.links.map((link) => (
                  <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `ind-navi ${isActive ? "on" : ""}`}>
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </aside>
        <main style={{ padding: "24px 28px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
