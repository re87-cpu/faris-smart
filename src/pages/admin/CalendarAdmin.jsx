// FILE: src/pages/admin/CalendarAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWeekSessions } from "../../mock/api.js";

/* =========================
   Helpers
========================= */
const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function toIsoDateKey(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseSessionDate(s) {
  // يتوقع: s.date قد تكون "2026-01-04" أو "04/01/2026" أو Date
  const raw = s?.date;
  if (!raw) return null;

  // ISO
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // جربي Date()
  const dt = new Date(raw);
  if (!Number.isNaN(dt.getTime())) return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

  // fallback
  return null;
}

function monthLabel(d) {
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long" });
}

function fmtToday() {
  return new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function normalizeStr(v) {
  return String(v ?? "").trim();
}

function getCaseIdFromSession(s) {
  // نحاول نطلع رقم/معرّف القضية من أي حقل متاح
  return (
    s?.caseId ??
    s?.case_id ??
    s?.caseNo ??
    s?.case_no ??
    s?.caseNumber ??
    s?.case_number ??
    s?.case ??
    s?.caseRef ??
    ""
  );
}

function statusStyle(status) {
  const st = normalizeStr(status).toLowerCase();
  const base = {
    borderRadius: 10,
    padding: "6px 8px",
    border: "1px solid var(--border)",
    background: "#fff",
    color: "var(--ink-900)",
  };

  if (st === "closed" || st === "مغلقة") return { ...base, background: "#fff1f2", borderColor: "#fecdd3" };
  if (st === "archived" || st === "مؤرشفة") return { ...base, background: "#f8fafc", borderColor: "#e2e8f0" };
  // open/default
  return { ...base, background: "#eff6ff", borderColor: "#bfdbfe" };
}

function buildMonthGrid(anchorDate) {
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const startWeekday = first.getDay(); // 0 Sun ... 6 Sat
  const totalDays = last.getDate();

  const cells = [];
  // فراغات قبل أول يوم
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  // الأيام
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));

  // نخلي الشبكة كاملة (أسابيع كاملة) 7-أعمدة
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const pad = 7 - remainder;
    for (let i = 0; i < pad; i++) cells.push(null);
  }

  return cells; // طولها مضاعفات 7
}

/* =========================
   Component
========================= */
export default function CalendarAdmin() {
  const navigate = useNavigate();

  const [view, setView] = useState("month"); // week | month | day
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [err, setErr] = useState("");

  // فلاتر
  const [courtFilter, setCourtFilter] = useState("");
  const [caseFilter, setCaseFilter] = useState("");

  // شهر/يوم
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [dayCursor, setDayCursor] = useState(() => new Date());

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const rows = await getWeekSessions();
      setSessions(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "تعذر تحميل الجلسات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const todayLabel = useMemo(() => fmtToday(), []);

  // فلترة البيانات
  const filtered = useMemo(() => {
    const c = normalizeStr(courtFilter);
    const q = normalizeStr(caseFilter);

    return (sessions || []).filter((s) => {
      const courtTxt = normalizeStr(s.court);
      const caseNoTxt = normalizeStr(s.caseNo ?? s.case_number ?? s.caseId ?? s.case_id);
      const titleTxt = normalizeStr(s.title);

      const okCourt = c ? courtTxt.includes(c) : true;
      const okCase = q ? caseNoTxt.includes(q) || titleTxt.includes(q) : true;
      return okCourt && okCase;
    });
  }, [sessions, courtFilter, caseFilter]);

  // إحصائيات
  const stats = useMemo(() => {
    const total = filtered.length;
    const withCourt = filtered.filter((s) => normalizeStr(s.court)).length;
    const withTitle = filtered.filter((s) => normalizeStr(s.title)).length;
    return { total, withCourt, withTitle };
  }, [filtered]);

  // تجميع حسب اليوم (Month/Day)
  const byDay = useMemo(() => {
    const map = new Map(); // key -> sessions[]
    for (const s of filtered) {
      const dt = parseSessionDate(s);
      if (!dt) continue;
      const key = toIsoDateKey(dt);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    // ترتيب جلسات كل يوم حسب الوقت إن وجد
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => normalizeStr(a.time).localeCompare(normalizeStr(b.time)));
      map.set(k, arr);
    }
    return map;
  }, [filtered]);

  const monthCells = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  function clearFilters() {
    setCourtFilter("");
    setCaseFilter("");
  }

  function openCaseFromSession(s) {
    const cid = getCaseIdFromSession(s);
    if (!cid) return; // إذا ما عندنا رقم قضية، ما نسوي شيء
    navigate(`/admin/cases/${encodeURIComponent(String(cid))}`);
  }

  function goPrevMonth() {
    setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function goNextMonth() {
    setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function goPrevDay() {
    setDayCursor((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  }
  function goNextDay() {
    setDayCursor((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  }

  const dayKey = toIsoDateKey(dayCursor);
  const daySessions = byDay.get(dayKey) || [];

  return (
    <div dir="rtl" style={{ padding: 16, display: "grid", gap: 12 }}>
      {/* Header */}
      <section className="q-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 20, fontWeight: 950 }}>التقويم الإداري</div>
            <div style={{ color: "var(--ink-600)", fontSize: 13 }}>اليوم: {todayLabel}</div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, padding: 6, borderRadius: 999, border: "1px solid var(--border)", background: "#fff" }}>
              <button className={`q-btn ${view === "month" ? "primary" : "ghost"}`} onClick={() => setView("month")} style={{ borderRadius: 999 }}>
                شهر
              </button>
              <button className={`q-btn ${view === "week" ? "primary" : "ghost"}`} onClick={() => setView("week")} style={{ borderRadius: 999 }}>
                أسبوع
              </button>
              <button className={`q-btn ${view === "day" ? "primary" : "ghost"}`} onClick={() => setView("day")} style={{ borderRadius: 999 }}>
                يوم
              </button>
            </div>

            <button className="q-btn q-outline" onClick={load} disabled={loading} style={{ borderRadius: 999, fontWeight: 900 }}>
              {loading ? "..." : "تحديث"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center" }}>
          <input className="input" placeholder="تصفية حسب المحكمة" value={courtFilter} onChange={(e) => setCourtFilter(e.target.value)} />
          <input className="input" placeholder="تصفية حسب رقم / عنوان القضية" value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)} />
          <button className="q-btn ghost" type="button" onClick={clearFilters} disabled={!courtFilter && !caseFilter}>
            مسح
          </button>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          <div className="q-card" style={{ padding: 12, boxShadow: "none", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--ink-600)", fontSize: 12 }}>إجمالي الجلسات (بعد التصفية)</div>
            <div style={{ fontSize: 22, fontWeight: 950, marginTop: 4 }}>{stats.total}</div>
          </div>
          <div className="q-card" style={{ padding: 12, boxShadow: "none", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--ink-600)", fontSize: 12 }}>مذكور فيها المحكمة</div>
            <div style={{ fontSize: 22, fontWeight: 950, marginTop: 4 }}>{stats.withCourt}</div>
          </div>
          <div className="q-card" style={{ padding: 12, boxShadow: "none", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--ink-600)", fontSize: 12 }}>مذكور فيها العنوان</div>
            <div style={{ fontSize: 22, fontWeight: 950, marginTop: 4 }}>{stats.withTitle}</div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="q-card" style={{ padding: 16 }}>
        {loading ? (
          <div>جارٍ التحميل…</div>
        ) : err ? (
          <div className="q-card" style={{ padding: 12, boxShadow: "none", borderColor: "#fecaca", background: "#fff1f2" }}>
            <b style={{ color: "#9f1239" }}>تعذر التحميل:</b>{" "}
            <span style={{ color: "#9f1239" }}>{err}</span>
            <div style={{ marginTop: 10 }}>
              <button className="q-btn primary" onClick={load}>إعادة المحاولة</button>
            </div>
          </div>
        ) : view === "week" ? (
          /* ===== WEEK VIEW ===== */
          filtered.length === 0 ? (
            <div style={{ color: "var(--ink-600)" }}>لا توجد جلسات.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الوقت</th>
                    <th>رقم القضية</th>
                    <th>العنوان</th>
                    <th>المحكمة</th>
                    <th>فتح</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const cid = getCaseIdFromSession(s);
                    return (
                      <tr key={i}>
                        <td>{s.date}</td>
                        <td>{s.time}</td>
                        <td style={{ fontWeight: 900 }}>{s.caseNo || cid || "—"}</td>
                        <td>{s.title || "—"}</td>
                        <td>{s.court || "—"}</td>
                        <td>
                          <button
                            className="q-btn q-outline"
                            type="button"
                            onClick={() => openCaseFromSession(s)}
                            disabled={!cid}
                            style={{ padding: "6px 10px" }}
                          >
                            فتح القضية
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : view === "month" ? (
          /* ===== MONTH VIEW ===== */
          <div>
            {/* Month Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="q-btn ghost" type="button" onClick={goPrevMonth}>السابق</button>
                <div style={{ fontWeight: 950, fontSize: 16 }}>{monthLabel(monthCursor)}</div>
                <button className="q-btn ghost" type="button" onClick={goNextMonth}>التالي</button>
              </div>

              <button
                className="q-btn q-outline"
                type="button"
                onClick={() => {
                  const t = new Date();
                  setMonthCursor(new Date(t.getFullYear(), t.getMonth(), 1));
                }}
              >
                هذا الشهر
              </button>
            </div>

            {/* Weekday headers */}
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {WEEKDAYS_AR.map((w) => (
                <div key={w} style={{ fontSize: 12, fontWeight: 900, color: "var(--ink-600)", textAlign: "center" }}>
                  {w}
                </div>
              ))}
            </div>

            {/* Month grid */}
            <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {monthCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={idx} style={{ border: "1px dashed var(--border)", borderRadius: 12, minHeight: 110, background: "#fff" }} />;
                }

                const key = toIsoDateKey(cell);
                const items = byDay.get(key) || [];
                const isToday = key === toIsoDateKey(new Date());

                return (
                  <div
                    key={key}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 10,
                      minHeight: 110,
                      background: "#fff",
                      outline: isToday ? "2px solid rgba(45,89,134,0.25)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontWeight: 950 }}>
                        {cell.getDate()}
                        {isToday ? <span style={{ fontSize: 12, color: "var(--accent-dark)", marginInlineStart: 6 }}>اليوم</span> : null}
                      </div>

                      <button
                        className="q-btn ghost"
                        type="button"
                        style={{ padding: "6px 10px" }}
                        onClick={() => {
                          setDayCursor(cell);
                          setView("day");
                        }}
                      >
                        عرض اليوم
                      </button>
                    </div>

                    {items.length === 0 ? (
                      <div style={{ fontSize: 12, color: "var(--ink-500)" }}>—</div>
                    ) : (
                      <div style={{ display: "grid", gap: 6 }}>
                        {items.slice(0, 3).map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => openCaseFromSession(s)}
                            disabled={!getCaseIdFromSession(s)}
                            style={{
                              ...statusStyle(s.status),
                              textAlign: "right",
                              cursor: getCaseIdFromSession(s) ? "pointer" : "not-allowed",
                            }}
                            title={s.title || ""}
                          >
                            <div style={{ fontWeight: 950, fontSize: 12 }}>
                              {s.time ? `${s.time} — ` : ""}
                              {s.caseNo || getCaseIdFromSession(s) || "قضية"}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--ink-700)" }}>
                              {s.title || "—"}
                            </div>
                          </button>
                        ))}

                        {items.length > 3 ? (
                          <div style={{ fontSize: 12, color: "var(--ink-600)" }}>
                            +{items.length - 3} جلسات أخرى
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ===== DAY VIEW ===== */
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="q-btn ghost" type="button" onClick={goPrevDay}>السابق</button>
                <div style={{ fontWeight: 950, fontSize: 16 }}>
                  {dayCursor.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
                <button className="q-btn ghost" type="button" onClick={goNextDay}>التالي</button>
              </div>

              <button
                className="q-btn q-outline"
                type="button"
                onClick={() => {
                  const t = new Date();
                  setDayCursor(new Date(t.getFullYear(), t.getMonth(), t.getDate()));
                }}
              >
                اليوم
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              {daySessions.length === 0 ? (
                <div style={{ padding: 14, borderRadius: 14, border: "1px dashed var(--border)", color: "var(--ink-600)" }}>
                  لا توجد جلسات في هذا اليوم.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {daySessions.map((s, i) => {
                    const cid = getCaseIdFromSession(s);
                    return (
                      <div key={i} className="q-card" style={{ padding: 12, boxShadow: "none", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <div style={{ fontWeight: 950 }}>
                            {s.time ? `${s.time} — ` : ""}
                            {s.caseNo || cid || "قضية"}
                          </div>
                          <button className="q-btn q-outline" type="button" onClick={() => openCaseFromSession(s)} disabled={!cid}>
                            فتح القضية
                          </button>
                        </div>

                        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap", color: "var(--ink-700)" }}>
                          <div>العنوان: <b>{s.title || "—"}</b></div>
                          <div>المحكمة: <b>{s.court || "—"}</b></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
