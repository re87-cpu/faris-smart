import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import AdminTopbar from "../../components/AdminTopbar.jsx";

export default function AdminLayout() {
  return (
    <div className="page" dir="rtl" style={{ minHeight: "100vh" }}>
      <AdminTopbar />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 18,
          width: "min(1200px,95%)",
          margin: "18px auto",
        }}
      >
        <aside className="q-card" style={{ padding: 12 }}>
          <b
            style={{
              display: "block",
              marginBottom: 10,
              color: "var(--accent-dark)",
            }}
          >
            القائمة
          </b>

          <nav className="sidebar-nav" style={{ display: "grid", gap: 8 }}>
            {[
              { to: "/dashboard-admin", label: "الرئيسية", end: true },
              { to: "/admin/cases", label: "القضايا" },
              { to: "/admin/employees", label: "الموظفون" },
              { to: "/admin/calendar", label: "التقويم" },
              { to: "/admin/assign", label: "إسناد" },

              // ✅ جديد
              { to: "/admin/tasks", label: "المهام" },
              { to: "/admin/notifications", label: "الإشعارات" },
    

              { to: "/admin/analytics", label: "التحليلات" },
              { to: "/admin/archive", label: "الأرشيف" },
              { to: "/admin/drafts", label: "المسودات" },
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `q-btn navlink ${isActive ? "primary" : "ghost"}`
                }
                title={link.label}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
