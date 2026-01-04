// FILE: src/pages/admin/CalendarAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getWeekSessions } from "../../mock/api.js";

function fmtToday() {
  return new Date().toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function badgeStyle(kind) {
  const base = {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    border: "1px solid var(--border)",
    background: "#fff",
    color: "var(--ink-700)",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  };
  if (kind === "ok") return { ...base, background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" };
  if (kind === "warn") return { ...base, background: "#fff7ed", borderColor: "#fed7aa", color: "#9a3412" };
  if (kind === "info") return { ...base, background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" };
  if (kind === "bad") return { ...base, background: "#fff1f2", borderColor: "#fecdd3", color: "#9f1239" };
  return base;
}

export default function CalendarAdmin() {
  const [view, setView] = useState("week"); // week | month | day (شكل فقط)
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const rows = await getWeekSessions();
      setSessions(rows || []);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "تعذر تحميل جلسات هذا الأسبوع.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const todayLabel = useMemo(() => fmtToday(), []);

  // إحصائيات بسيطة
  const stats = useMemo(() => {
    const total = sessions?.length || 0;
    // لو الداتا عندك ما فيها وقت/تاريخ قابل للمقارنة، نخليها أرقام بسيطة
    const withCourt = (sessions || []).filter((s) => s.court && String(s.court).trim()).length;
    const withTitle = (sessions || []).filter((s) => s.title && String(s.title).trim()).length;
    return { total, withCourt, withTitle };
  }, [sessions]);

  const ViewButton = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setView(id)}
      className="q-btn"
      style={{
        borderRadius: 999,
        padding: "10px 14px",
        border: "1px solid var(--border)",
        background: view === id ? "var(--accent)" : "#fff",
        color: view === id ? "#fff" : "var(--accent-dark)",
        fontWeight: 900,
        cursor: "pointer",
        minWidth: 80,
      }}
    >
      {label}
    </button>
  );

  return (
    <div dir="rtl" style={{ padding: "16px 0", display: "grid", gap: 12 }}>
      {/* Header */}
      <section className="q-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink-900)" }}>التقويم الإداري</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={badgeStyle("info")}>اليوم: {todayLabel}</span>
              {loading ? (
                <span style={badgeStyle("warn")}>جارٍ تحديث البيانات…</span>
              ) : err ? (
                <span style={badgeStyle("bad")}>تعذر الجلب</span>
              ) : (
                <span style={badgeStyle("ok")}>متصل</span>
              )}
            </div>

            <div style={{ color: "var(--ink-600)", fontSize: 13, marginTop: 2 }}>
              يتم جلب الجلسات فعليًا من قاعدة البيانات (endpoints الجلسات).
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8, padding: 6, borderRadius: 999, border: "1px solid var(--border)", background: "#fff" }}>
              <ViewButton id="month" label="شهر" />
              <ViewButton id="week" label="أسبوع" />
              <ViewButton id="day" label="يوم" />
            </div>

            <button className="q-btn q-outline" onClick={load} disabled={loading} style={{ borderRadius: 999, fontWeight: 900 }}>
              {loading ? "..." : "تحديث"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
          <div className="q-card" style={{ padding: 12, boxShadow: "none", border: "1px solid var(--border)", background: "#fff" }}>
            <div style={{ color: "var(--ink-600)", fontSize: 12 }}>عدد جلسات الأسبوع</div>
            <div style={{ fontSize: 22, fontWeight: 950, marginTop: 4 }}>{stats.total}</div>
          </div>
          <div className="q-card" style={{ padding: 12, boxShadow: "none", border: "1px solid var(--border)", background: "#fff" }}>
            <div style={{ color: "var(--ink-600)", fontSize: 12 }}>جلسات مذكور فيها المحكمة</div>
            <div style={{ fontSize: 22, fontWeight: 950, marginTop: 4 }}>{stats.withCourt}</div>
          </div>
          <div className="q-card" style={{ padding: 12, boxShadow: "none", border: "1px solid var(--border)", background: "#fff" }}>
            <div style={{ color: "var(--ink-600)", fontSize: 12 }}>جلسات مذكور فيها العنوان</div>
            <div style={{ fontSize: 22, fontWeight: 950, marginTop: 4 }}>{stats.withTitle}</div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="q-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <b style={{ fontSize: 16 }}>جلسات هذا الأسبوع</b>
            <div style={{ color: "var(--ink-600)", fontSize: 12 }}>
              العرض الحالي: <b>{view === "week" ? "أسبوع" : view === "month" ? "شهر" : "يوم"}</b> (الشكل فقط)
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", color: "var(--ink-700)" }}>
            <span className="spinner" aria-hidden="true" />
            <span>جارٍ التحميل…</span>
          </div>
        ) : err ? (
          <div className="q-card" style={{ marginTop: 12, padding: 12, boxShadow: "none", borderColor: "#fecaca", background: "#fff1f2" }}>
            <b style={{ color: "#9f1239" }}>تعذر التحميل:</b>{" "}
            <span style={{ color: "#9f1239" }}>{err}</span>
            <div style={{ marginTop: 10 }}>
              <button className="q-btn primary" onClick={load}>إعادة المحاولة</button>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ marginTop: 12, padding: 14, borderRadius: 14, border: "1px dashed var(--border)", color: "var(--ink-600)", background: "#fff" }}>
            لا توجد جلسات مسجّلة لهذا الأسبوع.
          </div>
        ) : (
          <div style={{ marginTop: 12, overflowX: "auto", border: "1px solid var(--border)", borderRadius: 14, background: "#fff" }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>التاريخ</th>
                  <th style={{ whiteSpace: "nowrap" }}>الوقت</th>
                  <th style={{ whiteSpace: "nowrap" }}>رقم القضية</th>
                  <th>العنوان</th>
                  <th>المحكمة</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr key={i}>
                    <td style={{ whiteSpace: "nowrap" }}>{s.date}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{s.time}</td>
                    <td style={{ whiteSpace: "nowrap", fontWeight: 900 }}>{s.caseNo}</td>
                    <td>{s.title || "—"}</td>
                    <td>{s.court || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-500)" }}>
          لاحقًا ممكن نضيف عرض شبكي (Month View) وتصفية حسب المحكمة/القضية، لكن البيانات هنا من الجلسات الحقيقية.
        </div>
      </section>
    </div>
  );
}
