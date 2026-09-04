// FILE: src/pages/staff/case/CaseTimeline.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCaseTimeline } from "../../../mock/api.js";

function fmtDate(v) { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? String(v) : d.toLocaleString("ar-SA"); }
function typeLabel(t) { switch (t) { case "activity": return "نشاط"; case "doc": return "مستند"; case "note": return "ملاحظة"; case "session": return "جلسة"; default: return t || "حدث"; } }

export default function CaseTimeline() {
  const { caseId } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr("");
      try {
        const list = await getCaseTimeline(caseId);
        if (!alive) return;
        setRows((Array.isArray(list) ? list : []).map((r) => ({ type: r?.type || "", at: r?.at || null, who: r?.who || "", text: r?.text || "" })));
      } catch (e) {
        console.error("getCaseTimeline error:", e);
        if (!alive) return;
        setErr(e?.message || "تعذّر تحميل الخط الزمني.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [caseId]);

  return (
    <div dir="rtl" style={{ display: "grid", gap: 10 }}>
      {loading ? <div>جارٍ التحميل…</div> : err ? <div style={{ color: "#b3261e" }}>{err}</div> : rows.length === 0 ? (
        <div style={{ color: "var(--color-neutral-600)" }}>لا يوجد نشاط بعد.</div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
          {rows.map((r, i) => (
            <li key={`${r.at || "na"}-${i}`} className="card" style={{ border: "1px solid var(--color-neutral-300)", boxShadow: "none" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
                <span className="tag tag-outline">{typeLabel(r.type)}</span>
                <span className="tag tag-outline">{fmtDate(r.at)}</span>
                {r.who && <span style={{ fontWeight: 700 }}>{String(r.who)}</span>}
              </div>
              <div style={{ lineHeight: 1.9 }}>{r.text || "—"}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
