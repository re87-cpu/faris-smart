// FILE: src/pages/staff/StaffLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import StaffTopbar from "../../components/StaffTopbar.jsx"; // ← هيدر الموظف

const linkClass = ({ isActive }) => "q-chip" + (isActive ? " is-active" : "");

// أيقونات SVG صغيرة (محلية)
const IHome = () => (
  <svg className="stf-ico" viewBox="0 0 24 24" aria-hidden>
    <path d="M4 10.5 12 4l8 6.5V20a2 2 0 0 1-2 2h-4v-6H10v6H6a2 2 0 0 1-2-2v-9.5Z" />
  </svg>
);
const ICases = () => (
  <svg className="stf-ico" viewBox="0 0 24 24" aria-hidden>
    <path d="M4 6h4l2-2h4l2 2h4v14H4zM6 10h12M6 14h12" />
  </svg>
);
const ICal = () => (
  <svg className="stf-ico" viewBox="0 0 24 24" aria-hidden>
    <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3zM5 8h14" />
  </svg>
);
const ITasks = () => (
  <svg className="stf-ico" viewBox="0 0 24 24" aria-hidden>
    <path d="m4 12 4 4 12-12M4 20h16" />
  </svg>
);
const IDocs = () => (
  <svg className="stf-ico" viewBox="0 0 24 24" aria-hidden>
    <path d="M6 2h7l5 5v15H6zM13 2v5h5" />
  </svg>
);
const INotif = () => (
  <svg className="stf-ico" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm8-6V11a8 8 0 1 0-16 0v5L2 18v2h20v-2z" />
  </svg>
);

export default function StaffLayout() {
  return (
    <div className="page staff-scope" dir="rtl" style={{ minHeight: "100vh" }}>
      <StaffTopbar />

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
              color: "var(--text)",
            }}
          >
            القائمة
          </b>
          <nav style={{ display: "grid", gap: 6 }}>
            <NavLink to="/staff" end className={linkClass}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <IHome /> لوحة التحكم
              </span>
            </NavLink>
            <NavLink to="/staff/cases" className={linkClass}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ICases /> قضاياي
              </span>
            </NavLink>
            <NavLink to="/staff/calendar" className={linkClass}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ICal /> التقويم
              </span>
            </NavLink>
            <NavLink to="/staff/tasks" className={linkClass}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ITasks /> المهام
              </span>
            </NavLink>
            <NavLink to="/staff/documents" className={linkClass}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <IDocs /> المستندات
              </span>
            </NavLink>
            <NavLink to="/staff/notifications" className={linkClass}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <INotif /> الإشعارات
              </span>
            </NavLink>
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
