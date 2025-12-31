// FILE: src/pages/staff/case/SessionSummaryForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { addSessionSummary, getSession } from "../../../mock/api.js";

export default function SessionSummaryForm() {
  const { caseId } = useParams();
  const [query] = useSearchParams();
  const sessionId = query.get("session");

  const nav = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  function normalizeSession(s) {
    if (!s) return null;
    return {
      id: s.id,
      sessionAt: s.sessionAt || s.session_at || null,
      court: s.court || null,
      room: s.room || null,
      summary: s.summary || "",
    };
  }

  useEffect(() => {
    if (!sessionId) return;
    let alive = true;

    (async () => {
      try {
        const s = await getSession(caseId, sessionId);
        if (!alive) return;

        const norm = normalizeSession(s);
        setSession(norm);

        const prev = String(norm?.summary || "").trim();
        setText(prev);
      } catch (ex) {
        console.error("getSession error:", ex);
        if (!alive) return;
        setErr(ex.message || "تعذّر تحميل الجلسة.");
      }
    })();

    return () => {
      alive = false;
    };
  }, [caseId, sessionId]);

  async function onSubmit(e, goWhere = "sessions") {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!sessionId) {
      setErr("فضلاً اختار جلسة من تبويب الجلسات أولاً.");
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      setErr("اكتب الملخص أولاً.");
      return;
    }

    setLoading(true);

    try {
      await addSessionSummary(caseId, sessionId, { summary: trimmed });

      setOk("تم حفظ الملخص.");
      if (goWhere === "cases") {
        setTimeout(() => nav(`/staff/cases`, { replace: true }), 450);
      } else {
        setTimeout(
          () => nav(`../sessions?refresh=${Date.now()}`, { replace: true }),
          450
        );
      }
    } catch (ex) {
      console.error("addSessionSummary error:", ex);
      setErr(ex.message || "تعذّر الحفظ.");
    } finally {
      setLoading(false);
    }
  }

  if (!sessionId) {
    return (
      <div dir="rtl" className="q-card" style={{ padding: 16 }}>
        <div style={{ marginBottom: 10 }}>
          لا توجد جلسة محددة. افتح تبويب <b>الجلسات</b> ثم اضغط "كتابة ملخص"
          على الجلسة المطلوبة.
        </div>
        <button className="q-btn ghost" onClick={() => nav("../sessions")}>
          الذهاب إلى الجلسات
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => onSubmit(e, "sessions")}
      dir="rtl"
      className="form"
      style={{ display: "grid", gap: 12 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <b>ملخص الجلسة</b>
        <button
          type="button"
          className="q-btn ghost"
          onClick={() => nav("../sessions")}
        >
          رجوع
        </button>
      </div>

      {session && (
        <div className="q-card" style={{ padding: 10 }}>
          <div>
            <b>تاريخ الجلسة:</b>{" "}
            {session.sessionAt
              ? new Date(session.sessionAt).toLocaleString("ar-SA")
              : "—"}
          </div>
          <div>
            <b>المحكمة:</b> {session.court || "—"}
          </div>
          <div>
            <b>القاعة:</b> {session.room || "—"}
          </div>
        </div>
      )}

      <textarea
        className="input"
        placeholder="اكتب ملخص الجلسة بوضوح…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ minHeight: 180 }}
      />

      {err && <div className="error">{err}</div>}
      {ok && <div className="badge">{ok}</div>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="q-btn primary" disabled={loading}>
          {loading ? "جارٍ الحفظ…" : "حفظ"}
        </button>

        <button
          type="button"
          className="q-btn ghost"
          disabled={loading}
          onClick={(e) => onSubmit(e, "cases")}
        >
          حفظ ثم الرجوع لقضاياي
        </button>

        <button
          type="button"
          onClick={() => nav("../sessions")}
          className="q-btn ghost"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
