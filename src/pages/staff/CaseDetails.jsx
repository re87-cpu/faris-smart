// FILE: src/pages/staff/CaseDetails.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useParams, NavLink, useNavigate } from "react-router-dom";
import CaseHeader from "../../components/CaseHeader.jsx";
import CriticalBar from "../../components/CriticalBar.jsx";
import { fetchCase } from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";

export default function CaseDetails() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const me = auth?.user || null;
  const meId = me?.id ? String(me.id) : null;

  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    if (!meId) { navigate("/login", { replace: true }); return; }

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const c = await fetchCase(caseId);
        if (!alive) return;
        const isMine = c.assignedTo && meId ? String(c.assignedTo) === meId : false;
        const assignedLabel = isMine && (c.assignedName || me?.full_name || me?.name) ? "أنا" : c.assignedName ? c.assignedName : c.assignedTo ? `#${c.assignedTo}` : "غير مسندة";
        setMeta({ id: c.id, case_number: c.case_number, title: c.title, status: c.status || "—", next: c.next || "", assignedTo: assignedLabel, alerts: [] });
      } catch (ex) {
        console.error("CaseDetails load error:", ex);
        if (!alive) return;
        setErr(ex.message || "تعذّر تحميل بيانات القضية.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [caseId, meId, navigate]);

  if (loading) return <div dir="rtl" style={{ minHeight: 200, display: "grid", placeItems: "center" }}><div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>جارٍ تحميل بيانات القضية…</div></div>;

  if (err || !meta) {
    return (
      <div dir="rtl" style={{ minHeight: 220, display: "grid", placeItems: "center" }}>
        <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", maxWidth: 480, textAlign: "center" }}>
          <div style={{ marginBottom: 12, color: "#b3261e" }}>{err || "القضية غير موجودة."}</div>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>رجوع</button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <CaseHeader id={meta.id} case_number={meta.case_number} title={meta.title} status={meta.status} next={meta.next} assignedTo={meta.assignedTo} role="staff" />
      {meta.alerts && meta.alerts.length > 0 && <CriticalBar items={meta.alerts} />}

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tab to="" end>الخط الزمني</Tab>
          <Tab to="sessions">الجلسات</Tab>
          <Tab to="documents">المستندات</Tab>
          <Tab to="notes">ملاحظات</Tab>
        </nav>
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", minHeight: 220 }}>
        <Outlet />
      </div>
    </div>
  );
}

function Tab({ to, end, children }) {
  return <NavLink to={to} end={end} className={({ isActive }) => `btn ${isActive ? "btn-primary" : "btn-ghost"}`}>{children}</NavLink>;
}
