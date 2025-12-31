// FILE: src/guards/RequireAdmin.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "../utils/auth.js";

export default function RequireAdmin({ children }) {
  const loc  = useLocation();
  const auth = getAuth(); // يبطل تلقائيًا لو انتهت الجلسة

  if (!auth) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  if (auth.role !== "admin") {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
}
