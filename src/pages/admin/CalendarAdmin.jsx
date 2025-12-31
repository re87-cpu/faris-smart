// FILE: src/pages/admin/CalendarAdmin.jsx
import React, { useEffect, useState } from "react";
import { getWeekSessions } from "../../mock/api.js";

export default function CalendarAdmin() {
  const [view, setView] = useState("week"); // week | month | day (شكل فقط)
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [err, setErr] = useState("");

  const today = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const rows = await getWeekSessions();
      setSessions(rows || []);
    } catch (e) {
      console.error(e);
      setErr(e.message || "تعذر تحميل جلسات هذا الأسبوع.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div dir="rtl" style={{ padding: "16px 0", display: "grid", gap: 12 }}>
      <section className="q-card" style={{ padding: 16, marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              التقويم الإداري
            </div>
            <div style={{ color: "var(--ink-500)" }}>اليوم: {today}</div>
            <div style={{ color: "var(--ink-500)", marginTop: 4, fontSize: 13 }}>
              يتم جلب الجلسات فعليًا من قاعدة البيانات (endpoints الجلسات).
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className={`q-btn ${view === "month" ? "primary" : "ghost"}`}
              onClick={() => setView("month")}
            >
              شهر
            </button>
            <button
              className={`q-btn ${view === "week" ? "primary" : "ghost"}`}
              onClick={() => setView("week")}
            >
              أسبوع
            </button>
            <button
              className={`q-btn ${view === "day" ? "primary" : "ghost"}`}
              onClick={() => setView("day")}
            >
              يوم
            </button>
            <button className="q-btn ghost" onClick={load} disabled={loading}>
              تحديث
            </button>
          </div>
        </div>
      </section>

      <section className="q-card" style={{ padding: 16 }}>
        <b>جلسات هذا الأسبوع</b>
        {loading ? (
          <div style={{ marginTop: 10 }}>جارٍ التحميل…</div>
        ) : err ? (
          <div className="error" style={{ marginTop: 10 }}>
            {err}
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ marginTop: 10, color: "var(--ink-600)" }}>
            لا توجد جلسات مسجّلة لهذا الأسبوع.
          </div>
        ) : (
          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوقت</th>
                  <th>رقم القضية</th>
                  <th>العنوان</th>
                  <th>المحكمة</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr key={i}>
                    <td>{s.date}</td>
                    <td>{s.time}</td>
                    <td>{s.caseNo}</td>
                    <td>{s.title || "—"}</td>
                    <td>{s.court || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ marginTop: 8, fontSize: 12, color: "var(--ink-500)" }}>
          لاحقاً ممكن نضيف عرض شبكي (Month View) لكن البيانات هنا كلها من
          الجلسات الحقيقية في النظام.
        </p>
      </section>
    </div>
  );
}
