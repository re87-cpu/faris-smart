// FILE: src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDashboardCounters, getWeekSessions, getUpcomingDeadlines,
  listMyTasks, toggleMyTask, listFinancialTransactions,
  listPendingUsers, listDrafts,
} from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";
import { fmtMoney, financialTotals } from "../../data/financialSeed.js";
import { pickBaytAlYawm } from "../../utils/baytAlYawm.js";
import { Section } from "../../components/admin/ui.jsx";

const OFFICIAL_LINKS = [
  { label: "نظام الإثبات", href: "https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/2716057c-c097-4bad-8e1e-ae1400c678d5/1" },
  { label: "نظام المرافعات الشرعية", href: "https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/f0eaae46-9f84-40ee-815e-a9a700f268b3/1" },
  { label: "نظام المرافعات أمام ديوان المظالم", href: "https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/f2f7b465-b576-4f47-8e7e-a9a700f27202/1" },
  { label: "نظام الإجراءات الجزائية", href: "https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/8f1b7079-a5f0-425d-b5e0-a9a700f26b2d/1" },
  { label: "نظام الشركات", href: "https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/a8376aea-1bc3-49d4-9027-aed900b555af/1" },
  { label: "منصة معين", href: "https://moen.bog.gov.sa/Eservices/Pages/default.aspx" },
  { label: "منصة ناجز", href: "https://najiz.sa/applications/landing/" },
];

const ICON = {
  cases: <path d="M3 7h5l2 2h11v10H3z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  tasks: <><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M7 12l3 3 7-7" /></>,
  employees: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" /></>,
  drafts: <><path d="M6 3h9l3 3v15H6z" /><path d="M9 10h6M9 14h6" /></>,
  notifications: <><path d="M12 3a5 5 0 0 0-5 5v3c0 2-1 3-1 3h12s-1-1-1-3V8a5 5 0 0 0-5-5z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
};

const QUICK_LINKS = [
  { label: "القضايا", to: "/admin/cases", icon: "cases" },
  { label: "التقويم", to: "/admin/calendar", icon: "calendar" },
  { label: "المهام", to: "/admin/tasks", icon: "tasks" },
  { label: "الموظفون", to: "/admin/employees", icon: "employees" },
  { label: "المسودات", to: "/admin/drafts", icon: "drafts" },
  { label: "الإشعارات", to: "/admin/notifications", icon: "notifications" },
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
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function parseLooseDate(v) {
  if (!v) return null;
  const s = String(v);
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s.trim()) ? s + "T00:00:00" : s);
  return isNaN(d.getTime()) ? null : d;
}

export default function DashboardAdmin() {
  const me = getAuth()?.user || null;
  const greetName = me?.name || me?.full_name || "المدير";

  const [bayt] = useState(() => pickBaytAlYawm());

  const [loading, setLoading] = useState(true);
  const [counters, setCounters] = useState({ active: 0, closed: 0, sessionsThisWeek: 0, nearDeadlines: 0 });
  const [sessionsWeek, setSessionsWeek] = useState([]);
  const [deadlines, setDeadlines] = useState([]);

  const [myTasks, setMyTasks] = useState([]);
  const [tasksBusyId, setTasksBusyId] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [reminderText, setReminderText] = useState("");

  const [fin, setFin] = useState({ totalIncome: 0, totalExpense: 0, totalDue: 0, net: 0 });
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [pendingDraftsCount, setPendingDraftsCount] = useState(0);

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
      try {
        const rows = await listFinancialTransactions();
        setFin(financialTotals(Array.isArray(rows) ? rows : []));
      } catch {
        setFin({ totalIncome: 0, totalExpense: 0, totalDue: 0, net: 0 });
      }
    })();
    listPendingUsers().then((rows) => setPendingUsersCount(Array.isArray(rows) ? rows.length : 0)).catch(() => {});
    listDrafts({ status: "pending" }).then((rows) => setPendingDraftsCount(Array.isArray(rows) ? rows.length : 0)).catch(() => {});
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

  const todaysSessions = useMemo(() => {
    const today = new Date();
    return sessionsWeek.filter((s) => { const d = parseLooseDate(s.date); return d && isSameDay(d, today); });
  }, [sessionsWeek]);

  const overdueOrTodayTasks = useMemo(() => {
    const today = new Date();
    return myTasks.filter((t) => {
      if (t.done || !t.due) return false;
      const d = parseLooseDate(t.due);
      if (!d) return false;
      return d <= new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    });
  }, [myTasks]);

  const attentionItems = useMemo(() => {
    const items = [];
    deadlines.forEach((d, i) => items.push({
      key: `dl-${i}`, type: "مهلة", title: `قضية #${d.caseNo} — ${d.title}`, meta: d.due, to: "/admin/calendar",
    }));
    overdueOrTodayTasks.forEach((t) => items.push({
      key: `task-${t.id}`, type: "مهمة", title: t.title, meta: t.due ? new Date(t.due).toLocaleDateString("ar-SA") : "", to: "/admin/tasks",
    }));
    if (pendingUsersCount > 0) items.push({
      key: "staff", type: "طلب", title: `${pendingUsersCount} ${pendingUsersCount === 1 ? "طلب موظف يحتاج مراجعة" : "طلبات موظفين تحتاج مراجعة"}`, meta: "", to: "/admin/staff-requests",
    });
    if (pendingDraftsCount > 0) items.push({
      key: "drafts", type: "مسودة", title: `${pendingDraftsCount} ${pendingDraftsCount === 1 ? "مسودة تنتظر الاعتماد" : "مسودات تنتظر الاعتماد"}`, meta: "", to: "/admin/drafts",
    });
    if (fin.totalDue > 0) items.push({
      key: "fin", type: "مالية", title: `مستحقات غير محصّلة: ${fmtMoney(fin.totalDue)} ر.س`, meta: "", to: "/admin/financial",
    });
    return items;
  }, [deadlines, overdueOrTodayTasks, pendingUsersCount, pendingDraftsCount, fin.totalDue]);

  const todaysPath = useMemo(() => {
    const items = [];
    todaysSessions.forEach((s, i) => items.push({
      key: `s-${i}`, time: s.time || "—", title: `جلسة — #${s.caseNo}${s.title ? " — " + s.title : ""}`,
    }));
    overdueOrTodayTasks.forEach((t) => items.push({ key: `t-${t.id}`, time: "—", title: t.title }));
    return items.sort((a, b) => (a.time === "—" ? 1 : 0) - (b.time === "—" ? 1 : 0) || String(a.time).localeCompare(String(b.time)));
  }, [todaysSessions, overdueOrTodayTasks]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "صباح الخير" : "مساء الخير";
  }, []);
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    []
  );

  return (
    <div dir="rtl" className="adm">
      <div className="adm-hero">
        <div>
          <div style={{ color: "var(--color-neutral-600)", fontSize: 13, marginBottom: 12 }}>{todayLabel}</div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1.15 }}>{greeting}، {greetName}</h1>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 21, fontWeight: 500, color: "var(--color-neutral-700)", marginTop: 8 }}>لنبدأ من حيث يحتاجك العمل.</div>

          <div className="adm-hero-stats">
            <div className="adm-hero-stat"><b>{loading ? "—" : counters.active}</b><span>قضايا نشطة</span></div>
            <div className="adm-hero-divider" />
            <div className="adm-hero-stat"><b>{loading ? "—" : todaysSessions.length}</b><span>جلسات اليوم</span></div>
            <div className="adm-hero-divider" />
            <div className="adm-hero-stat"><b style={{ color: "var(--color-accent-700)" }}>{loading ? "—" : attentionItems.length}</b><span>يحتاج انتباهك</span></div>
          </div>
        </div>

        {bayt && (
          <div className="adm-hero-poem adm-fade-in">
            <span className="adm-bayt-label">بيت اليوم</span>
            <div className="adm-bayt-verse">
              <div className="adm-bayt-line">{bayt.first}</div>
              <div className="adm-bayt-line">{bayt.second}</div>
            </div>
            <div className="adm-bayt-poet">— {bayt.poet}</div>
          </div>
        )}
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

      <div style={{ paddingTop: 6 }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 19, margin: "0 0 6px" }}>يحتاج انتباهك</h2>
        {loading ? (
          <div style={{ color: "var(--color-neutral-600)", fontSize: 14, padding: "18px 0" }}>جارٍ التحميل…</div>
        ) : attentionItems.length === 0 ? (
          <div style={{ color: "var(--color-neutral-600)", fontSize: 14, padding: "18px 0" }}>لا توجد عناصر تتطلب انتباهك الآن.</div>
        ) : (
          <div>
            {attentionItems.map((it, i) => (
              <Link key={it.key} to={it.to} className="adm-attn-row" style={{ animationDelay: `${i * 70}ms` }}>
                <span className="adm-attn-index">{String(i + 1).padStart(2, "0")}</span>
                <div className="adm-attn-body">
                  <div className="adm-attn-title">{it.title}</div>
                  {it.meta && <div className="adm-attn-meta">{it.meta}</div>}
                </div>
                <span className="adm-attn-go">فتح ←</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="adm-qp-grid">
        <div>
          <h2 className="adm-quick-title">وصول سريع</h2>
          <div className="adm-quick-col">
            {QUICK_LINKS.map((l) => (
              <Link key={l.to} className="adm-quick-link" to={l.to}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{ICON[l.icon]}</svg>
                <span className="lbl">{l.label}</span>
                <span className="arw">←</span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="adm-path-title-h">مسار اليوم</h2>
          {todaysPath.length === 0 ? (
            <div style={{ color: "var(--color-neutral-600)", fontSize: 13.5, paddingTop: 8 }}>لا عناصر مجدولة اليوم.</div>
          ) : (
            <div className="adm-path-h">
              <div className="adm-path-h-line" />
              <div className="adm-path-h-row">
                {todaysPath.map((it) => (
                  <div key={it.key} className="adm-path-h-item">
                    <span className="adm-path-h-dot" />
                    <span className="adm-path-h-label">{it.title}</span>
                    <span className="adm-path-h-time">{it.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Section title="أولوياتي اليوم" bordered>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {priorities.length === 0 ? (
            <div style={{ color: "var(--color-neutral-600)", fontSize: 13.5 }}>لا مهام مسجّلة بعد.</div>
          ) : (
            priorities.map((t) => (
              <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={t.done} disabled={tasksBusyId === t.id} onChange={() => onToggleTask(t)} />
                <span style={t.done ? { textDecoration: "line-through", color: "var(--color-neutral-500)" } : undefined}>{t.title}</span>
              </label>
            ))
          )}
          <Link to="/admin/tasks" className="btn btn-ghost" style={{ alignSelf: "flex-start", fontSize: 13, marginTop: 4 }}>عرض كل المهام ←</Link>

          <form onSubmit={addReminder} style={{ marginTop: 8, paddingTop: 12, borderTop: "1px dashed var(--color-neutral-300)", display: "flex", gap: 8 }}>
            <input
              className="assign-select" placeholder="ذكّرني بـ…" style={{ flex: 1, fontSize: 13, maxWidth: 320 }}
              value={reminderText} onChange={(e) => setReminderText(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">إضافة</button>
          </form>
          {reminders.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 420 }}>
              {reminders.map((text, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                  <span>{text}</span>
                  <a onClick={() => removeReminder(i)} style={{ color: "var(--color-neutral-500)", fontSize: 12, cursor: "pointer" }}>حذف</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section title="مراجع قضائية" bordered>
        <a href="https://laws.moj.gov.sa/ar/JudicialDecisionsList/1" target="_blank" rel="noopener noreferrer" className="adm-quick-link">
          <span className="lbl">أحكام قضائية جديدة على موقع وزارة العدل — اطّلع عليها</span>
          <span className="arw">←</span>
        </a>
        <div className="adm-quick-col-2">
          {OFFICIAL_LINKS.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="adm-quick-link">
              <span className="lbl">{l.label}</span>
              <span className="arw">←</span>
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}
