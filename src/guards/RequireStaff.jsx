// FILE: src/guards/RequireStaff.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "../utils/auth.js";

export default function RequireStaff({ children }) {
  const loc  = useLocation();
  const auth = getAuth();

  if (!auth) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  if (auth.role !== "staff") {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
}
