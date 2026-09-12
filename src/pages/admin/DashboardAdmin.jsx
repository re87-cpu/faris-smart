// FILE: src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDashboardCounters, getWeekSessions, getUpcomingDeadlines,
  listMyTasks, toggleMyTask, listFinancialTransactions, listMojReports,
} from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";
import { fmtMoney, financialTotals } from "../../data/financialSeed.js";

const OFFICIAL_LINKS = [
  { label: "الأنظمة واللوائح", href: "https://laws.moj.gov.sa/" },
  { label: "الأحكام القضائية", href: "https://sjp.moj.gov.sa/" },
  { label: "ناجز", href: "https://www.najiz.sa/" },
  { label: "وزارة العدل", href: "https://www.moj.gov.sa/" },
];

function startOfWeek(d) {
  const date = new Date(d);
  const diff = (date.getDay() + 1) % 7; // أيام منذ آخر سبت
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function endOfWeek(d) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

export default function DashboardAdmin() {
  const me = getAuth()?.user || null;
  const greetName = me?.name || me?.full_name || "المدير";

  const [loading, setLoading] = useState(true);
  const [counters, setCounters] = useState({ active: 0, closed: 0, sessionsThisWeek: 0, nearDeadlines: 0 });
  const [sessionsWeek, setSessionsWeek] = useState([]);
  const [deadlines, setDeadlines] = useState([]);

  const [myTasks, setMyTasks] = useState([]);
  const [tasksBusyId, setTasksBusyId] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [reminderText, setReminderText] = useState("");

  const [fin, setFin] = useState({ totalIncome: 0, totalExpense: 0, totalDue: 0, net: 0 });
  const [finLoading, setFinLoading] = useState(true);

  const [latestMojReport, setLatestMojReport] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await listMojReports();
        setLatestMojReport(rows?.[0] || null);
      } catch {
        setLatestMojReport(null);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ctrs, weekSess, ups] = await Promise.all([
          getDashboardCounters(), getWeekSessions(), getUpcomingDeadlines(),
        ]);
        setCounters(ctrs || {});
        setSessionsWeek(weekSess || []);
        setDeadlines(ups || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setFinLoading(true);
      try {
        const rows = await listFinancialTransactions();
        setFin(financialTotals(Array.isArray(rows) ? rows : []));
      } catch {
        setFin({ totalIncome: 0, totalExpense: 0, totalDue: 0, net: 0 });
      } finally {
        setFinLoading(false);
      }
    })();
  }, []);

  async function loadMyTasks() {
    if (!me) return;
    try {
      const rows = await listMyTasks();
      setMyTasks(Array.isArray(rows) ? rows : []);
    } catch {
      setMyTasks([]);
    }
  }
  useEffect(() => { loadMyTasks(); /* eslint-disable-next-line */ }, [me?.id]);

  async function onToggleTask(t) {
    setTasksBusyId(t.id);
    try { await toggleMyTask(t.id, !t.done); await loadMyTasks(); }
    finally { setTasksBusyId(null); }
  }

  function addReminder(e) {
    e.preventDefault();
    const v = reminderText.trim();
    if (!v) return;
    setReminders((r) => [...r, v]);
    setReminderText("");
  }
  function removeReminder(i) { setReminders((r) => r.filter((_, j) => j !== i)); }

  const priorities = useMemo(() => {
    return myTasks
      .slice()
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const ad = a.due ? new Date(a.due).getTime() : Infinity;
        const bd = b.due ? new Date(b.due).getTime() : Infinity;
        return ad - bd;
      })
      .slice(0, 4);
  }, [myTasks]);

  const weekTaskProgress = useMemo(() => {
    const s = startOfWeek(new Date()).getTime();
    const e = endOfWeek(new Date()).getTime();
    const inWeek = myTasks.filter((t) => {
      if (!t.due) return false;
      const ts = new Date(t.due).getTime();
      return ts >= s && ts <= e;
    });
    const done = inWeek.filter((t) => t.done).length;
    return { done, total: inWeek.length };
  }, [myTasks]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "صباح الخير" : "مساء الخير";
  }, []);
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    []
  );

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: 0 }}>{greeting}، {greetName}</h1>
        <div style={{ color: "var(--color-neutral-600)", fontSize: 13, marginTop: 4 }}>
          {todayLabel}
          {deadlines.length > 0 && ` — لديك ${deadlines.length} ${deadlines.length === 1 ? "مهلة تحتاج" : "مهل تحتاج"} انتباهك هذا الأسبوع`}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCorner value={loading ? "—" : counters.active} label="قضايا نشطة" to="/admin/cases" />
        <StatCorner value={loading ? "—" : counters.closed} label="قضايا منتهية" to="/admin/archive" />
        <StatCorner value={loading ? "—" : counters.sessionsThisWeek} label="جلسات هذا الأسبوع" to="/admin/calendar" />
        <StatCorner value={loading ? "—" : deadlines.length} label="مهل قريبة (≤7 أيام)" color="var(--color-accent-700)" />
      </div>

      {weekTaskProgress.total > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-neutral-600)", marginBottom: 6 }}>
            <span>إنجاز المهام هذا الأسبوع</span>
            <span>{weekTaskProgress.done} من {weekTaskProgress.total}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.round((weekTaskProgress.done / weekTaskProgress.total) * 100)}%` }} />
          </div>
        </div>
      )}

      <div>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>الملخص المالي — {new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <StatCorner value={finLoading ? "—" : `${fmtMoney(fin.totalIncome)} ر.س`} label="الإيرادات المحصّلة" color="#1E7A45" to="/admin/financial" />
          <StatCorner value={finLoading ? "—" : `${fmtMoney(fin.totalExpense)} ر.س`} label="المصروفات" color="#C0392B" to="/admin/financial" />
          <StatCorner value={finLoading ? "—" : `${fmtMoney(fin.totalDue)} ر.س`} label="مستحقات غير محصّلة" color="var(--color-accent-700)" to="/admin/financial" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 28, alignItems: "start" }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>جلسات هذا الأسبوع</div>
          {sessionsWeek.length === 0 ? (
            <div style={{ color: "var(--color-neutral-600)", fontSize: 14 }}>لا يوجد جلسات هذا الأسبوع.</div>
          ) : (
            <table className="plain-table">
              <thead><tr><th>اليوم</th><th>الوقت</th><th>القضية</th><th>المحكمة</th></tr></thead>
              <tbody>
                {sessionsWeek.map((s, i) => (
                  <tr key={i}>
                    <td>{s.date}</td>
                    <td>{s.time}</td>
                    <td><b>#{s.caseNo}</b> — {s.title}</td>
                    <td>{s.court || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Link className="btn btn-ghost" style={{ marginTop: 12 }} to="/admin/calendar">عرض التقويم ←</Link>

          {deadlines.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>مهل قريبة</div>
              <ul style={{ lineHeight: 1.9, paddingRight: 18, listStyle: "none", margin: 0 }}>
                {deadlines.map((d, i) => (
                  <li key={i}><span className="tag tag-accent">{d.due}</span> قضية #{d.caseNo} — {d.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>أولوياتي اليوم</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {priorities.length === 0 ? (
              <div style={{ color: "var(--color-neutral-600)", fontSize: 14 }}>لا مهام مسجّلة بعد.</div>
            ) : (
              priorities.map((t) => (
                <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
                  <input type="checkbox" checked={t.done} disabled={tasksBusyId === t.id} onChange={() => onToggleTask(t)} />
                  <span style={t.done ? { textDecoration: "line-through", color: "var(--color-neutral-500)" } : undefined}>{t.title}</span>
                </label>
              ))
            )}
            <Link to="/admin/tasks" className="btn btn-ghost" style={{ alignSelf: "flex-start", fontSize: 13, marginTop: 4 }}>عرض كل المهام ←</Link>

            <form onSubmit={addReminder} style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--color-neutral-300)", display: "flex", gap: 8 }}>
              <input
                className="input" placeholder="ذكّرني بـ…" style={{ flex: 1, fontSize: 13 }}
                value={reminderText} onChange={(e) => setReminderText(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary">إضافة</button>
            </form>
            {reminders.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                {reminders.map((text, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span>{text}</span>
                    <a onClick={() => removeReminder(i)} style={{ color: "var(--color-neutral-500)", fontSize: 12, cursor: "pointer" }}>حذف</a>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--color-neutral-300)", fontSize: 13, color: "var(--color-neutral-600)" }}>
              من أنصف الناس من نفسه، أمِن غضبهم.
            </div>

            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--color-neutral-300)", display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="https://sjp.moj.gov.sa/" target="_blank" rel="noopener noreferrer" className="mini-banner">
                <span>أحكام قضائية جديدة على موقع وزارة العدل — اطّلع عليها</span>
              </a>
              {latestMojReport && (
                <Link to="/admin/moj-reports" className="mini-banner">
                  <span>تقرير شهري جديد: {latestMojReport.name} — نزّله من صفحتنا</span>
                </Link>
              )}
              <div>
                <div style={{ fontSize: 12, color: "var(--color-neutral-600)", marginBottom: 6 }}>خدمات ومراجع قضائية</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {OFFICIAL_LINKS.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="tag tag-outline">{l.label}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div className="card-title">عمليات سريعة</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {[
            { label: "إضافة قضية", to: "/admin/cases/new" },
            { label: "إسناد قضية", to: "/admin/assign" },
            { label: "اعتماد مسودة", to: "/admin/drafts" },
            { label: "التقويم", to: "/admin/calendar" },
            { label: "الأرشيف", to: "/admin/archive" },
            { label: "جميع القضايا", to: "/admin/cases" },
            { label: "ابحث عن قضية", to: "/admin/cases" },
          ].map((a, i) => (
            <Link key={i} className="btn btn-ghost" to={a.to}>{a.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCorner({ value, label, color, to }) {
  const body = (
    <>
      <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
      <b style={color ? { color } : undefined}>{value}</b>
      <span>{label}</span>
    </>
  );
  return to ? (
    <Link to={to} className="stat-corner" style={{ textDecoration: "none", color: "inherit" }}>{body}</Link>
  ) : (
    <div className="stat-corner">{body}</div>
  );
}
