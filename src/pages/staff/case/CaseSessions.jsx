// FILE: src/pages/staff/case/CaseSessions.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { listSessions, createSession } from "../../../mock/api.js";

export default function CaseSessions() {
  const { caseId } = useParams();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const refreshKey = sp.get("refresh") || "";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    session_at: "",
    court: "",
    room: "",
    notes: "",
  });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const list = await listSessions(caseId);
      setRows(list || []);
    } catch (ex) {
      console.error("listSessions error:", ex);
      setErr(ex.message || "تعذّر تحميل الجلسات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, refreshKey]);

  function goWriteSummary(sessionId) {
    nav(`../sessions/summary?session=${sessionId}`);
  }

  async function onAddSession(e) {
    e.preventDefault();
    setErr("");

    if (!form.session_at) {
      setErr("حدد تاريخ ووقت الجلسة أولاً.");
      return;
    }

    setAdding(true);
    try {
      await createSession(caseId, {
        session_at: form.session_at,
        court: form.court,
        room: form.room,
        notes: form.notes,
      });

      setForm({ session_at: "", court: "", room: "", notes: "" });
      await load();
    } catch (ex) {
      console.error("createSession error:", ex);
      setErr(ex.message || "تعذّر إضافة الجلسة.");
    } finally {
      setAdding(false);
    }
  }

  function summaryPreview(s) {
    const txt = String(s?.summary || "").trim();
    if (!txt) return "—";
    return txt.length > 80 ? txt.slice(0, 80) + "…" : txt;
  }

  return (
    <div dir="rtl" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <b>الجلسات</b>

        {rows.length > 0 && (
          <button className="q-btn primary" onClick={() => goWriteSummary(rows[0].id)}>
            كتابة/تعديل ملخص الجلسة الأخيرة
          </button>
        )}
      </div>

      {err && <div className="error">{err}</div>}

      <section className="q-card" style={{ padding: 12 }}>
        <b>إضافة جلسة جديدة</b>
        <form onSubmit={onAddSession} className="form" style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 8 }}>
            <input
              className="input"
              type="datetime-local"
              value={form.session_at}
              onChange={(e) => setForm((s) => ({ ...s, session_at: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="المحكمة (اختياري)"
              value={form.court}
              onChange={(e) => setForm((s) => ({ ...s, court: e.target.value }))}
            />
            <input
              className="input"
              placeholder="القاعة (اختياري)"
              value={form.room}
              onChange={(e) => setForm((s) => ({ ...s, room: e.target.value }))}
            />
          </div>

          <textarea
            className="input"
            placeholder="ملاحظات (اختياري)"
            value={form.notes}
            onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
            style={{ minHeight: 90 }}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button className="q-btn primary" disabled={adding}>
              {adding ? "جارٍ الإضافة…" : "حفظ الجلسة"}
            </button>
          </div>
        </form>
      </section>

      <section className="q-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 12 }}>جارٍ التحميل…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 12, color: "var(--ink-600)" }}>
            لا توجد جلسات مسجلة لهذه القضية بعد.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>المعرف</th>
                  <th>التاريخ</th>
                  <th>المحكمة</th>
                  <th>القاعة</th>
                  <th>الملاحظات</th>
                  <th>الملخص</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.sessionAt ? new Date(s.sessionAt).toLocaleString("ar-SA") : "—"}</td>
                    <td>{s.court || "—"}</td>
                    <td>{s.room || "—"}</td>
                    <td style={{ whiteSpace: "pre-wrap" }}>{s.notes || "—"}</td>
                    <td style={{ whiteSpace: "pre-wrap" }}>
                      {s.summary ? summaryPreview(s) : <span style={{ color: "var(--ink-600)" }}>غير مكتمل</span>}
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <button className="q-btn ghost" onClick={() => goWriteSummary(s.id)}>
                        {s.summary ? "تعديل الملخص" : "كتابة ملخص"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
