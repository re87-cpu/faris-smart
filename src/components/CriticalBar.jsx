// FILE: src/components/CriticalBar.jsx
import React from "react";

export default function CriticalBar({ items=[] }){
  if(!items || items.length===0) return null;
  return (
    <div className="q-card" style={{padding:10, borderLeft:"4px solid #b91c1c", background:"#fff7f7"}}>
      <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
        <b style={{color:"#b91c1c"}}>تنبيهات حرجة:</b>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          {items.map((t,i)=>(
            <span key={i} className="badge" style={{background:"#fee2e2", color:"#b91c1c", borderColor:"#fecaca"}}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
