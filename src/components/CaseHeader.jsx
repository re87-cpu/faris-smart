// FILE: src/components/CaseHeader.jsx
import React from "react";

export default function CaseHeader({ id, title, status, next, assignedTo, role="admin" }){
  return (
    <header className="q-card" style={{padding:14, display:"grid", gap:8}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
        <div style={{display:"grid", gap:4}}>
          <div style={{fontSize:18, fontWeight:900}}>قضية #{id}</div>
          <div style={{color:"var(--ink-600)"}}>{title || "—"}</div>
        </div>
        <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
          <span className="badge">{status || "قيد الترافع"}</span>
          <span className="badge ghost">الموعد القادم: {next || "—"}</span>
          {assignedTo && (
            <span className="badge ghost">المسؤول: {assignedTo}</span>
          )}
          <span className="badge" style={{background:"var(--accent-dark)", color:"#fff"}}>{role==="admin"?"مدير":"موظف"}</span>
        </div>
      </div>
    </header>
  );
}

