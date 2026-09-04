// FILE: src/pages/staff/StaffCalendar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchMyCases, listCaseSessions } from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";

export default function StaffCalendar() {
  const me = getAuth()?.user || null;
  const [rows, setRows] = useState([]);
  const [view, setView] = useState("week"); // week | month
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      if (!me) return;
      setLoading(true);
      setErr("");
      try {
        // 1) جلب قضايا الموظف من /my/cases
        const cs = await fetchMyCases();
        const safeCases = cs || [];

        // 2) جلب جلسات كل قضية من /cases/:id/sessions
        const sessionsArrays = await Promise.all(
          safeCases.map((c) => listCaseSessions(c.id))
        );

        const items = [];

        safeCases.forEach((c, idx) => {
          // موعد next من جدول القضايا (لو موجود)
          if (c.next) {
            const dt = toDate(c.next);
            if (dt)
              items.push({
                caseId: c.id,
                title: c.title,
                status: "موعد قادم",
                at: dt,
              });
          }

          // جلسات هذه القضية من جدول sessions
          (sessionsArrays[idx] || []).forEach((s) => {
            const dt = toDate(s.at);
            if (!dt) return;
            items.push({
              caseId: c.id,
              title: c.title,
              status: s.court ? `جلسة: ${s.court}` : "جلسة",
              at: dt,
            });
          });
        });

        setRows(items);
      } catch (e) {
        console.error(e);
        setErr(e.message || "تعذّر تحميل التقويم.");
      } finally {
        setLoading(false);
      }
    })();
  }, [me?.id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const now = new Date();
    let list = rows.slice();

    if (s)
      list = list.filter((x) =>
        [x.caseId, x.title, x.status].some((v) =>
          String(v || "").toLowerCase().includes(s)
        )
      );

    if (view === "week") {
      const start = startOfWeek(now);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      list = list.filter((x) => x.at >= start && x.at < end);
    } else {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      list = list.filter((x) => x.at >= start && x.at < end);
    }

    return list.sort((a, b) => a.at - b.at);
  }, [rows, q, view]);

  if (!me)
    return (
      <div className="card elev-sm" style={{ padding: 16, border: "1px solid var(--color-neutral-300)" }}>
        الرجاء تسجيل الدخول.
      </div>
    );

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", flexWrap: "wrap" }}>
          <input className="input" placeholder="بحث…" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 200 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`btn ${view === "week" ? "btn-primary" : "btn-ghost"}`} onClick={() => setView("week")}>أسبوع</button>
            <button className={`btn ${view === "month" ? "btn-primary" : "btn-ghost"}`} onClick={() => setView("month")}>شهر</button>
          </div>
        </div>
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 16 }}>جارٍ التحميل…</div>
        ) : err ? (
          <div style={{ padding: 16, color: "#b3261e" }}>{err}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 16, color: "var(--color-neutral-600)" }}>لا يوجد مواعيد في هذا النطاق.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr><th>التاريخ</th><th>الوقت</th><th>القضية</th><th>العنوان</th><th>الحالة</th></tr>
              </thead>
              <tbody>
                {filtered.map((x, i) => (
                  <tr key={i}>
                    <td>{x.at.toLocaleDateString()}</td>
                    <td>{x.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ fontWeight: 700 }}>#{x.caseId}</td>
                    <td>{x.title}</td>
                    <td><span className="tag tag-accent">{x.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function toDate(v) {
  if (!v) return null;
  const s = String(v);
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T"));
  return isNaN(d) ? null : d;
}

function startOfWeek(d) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // نبدأ من الإثنين
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
