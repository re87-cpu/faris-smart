// FILE: src/pages/staff/StaffLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import StaffTopbar from "../../components/StaffTopbar.jsx";

const LINKS = [
  { to: "/staff", label: "لوحة التحكم", end: true },
  { to: "/staff/cases", label: "قضاياي" },
  { to: "/staff/calendar", label: "التقويم" },
  { to: "/staff/tasks", label: "المهام" },
  { to: "/staff/documents", label: "المستندات" },
  { to: "/staff/articles", label: "المقالات" },
  { to: "/staff/notifications", label: "الإشعارات" },
];

export default function StaffLayout() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <StaffTopbar />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", maxWidth: 1320, margin: "0 auto" }}>
        <aside style={{ padding: "16px 10px", borderInlineEnd: "1px solid var(--color-neutral-300)", minHeight: "calc(100vh - 53px)" }}>
          <div className="ind-sectag">القائمة</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `ind-navi ${isActive ? "on" : ""}`}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main style={{ padding: 20 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
