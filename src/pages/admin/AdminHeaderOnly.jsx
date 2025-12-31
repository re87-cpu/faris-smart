import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import AdminTopbar from "../../components/AdminTopbar.jsx";

export default function AdminHeaderOnly() {
  return (
    <div className="page" dir="rtl" style={{ minHeight: "100vh" }}>
      <AdminTopbar />

      <div style={{ width: "min(1200px,95%)", margin: "18px auto" }}>
        <div className="q-card" style={{ padding: 12, marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link className="q-btn ghost" to="/dashboard-admin">
                الرئيسية
              </Link>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <NavLink className="q-btn ghost" to="/admin/cases">القضايا</NavLink>
              <NavLink className="q-btn ghost" to="/admin/employees">الموظفون</NavLink>
              <NavLink className="q-btn ghost" to="/admin/notifications">الإشعارات</NavLink>
            </div>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
