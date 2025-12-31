// FILE: src/pages/staff/StaffHeaderOnly.jsx
import React from "react";
import StaffTopbar from "../../components/StaffTopbar.jsx";
import { Outlet } from "react-router-dom";

export default function StaffHeaderOnly() {
  return (
    <div className="page" dir="rtl" style={{ minHeight: "100vh" }}>
      <StaffTopbar />
      <div style={{ width: "min(1200px,95%)", margin: "18px auto" }}>
        <Outlet />
      </div>
    </div>
  );
}
