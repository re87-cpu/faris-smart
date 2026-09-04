// FILE: src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDashboardCounters, getWeekSessions, getUpcomingDeadlines,
  getLatestCases, getRecentActivity, getTeamKPIs, getDashboardTopCounts,
} from "../../mock/api.js";
import AdminSecretarySearch from "../../components/AdminSecretarySearch.jsx";

export default function DashboardAdmin() {
  const [loading, setLoading] = useState(true);
  const [tops, setTops] = useState({ totalCases: 0, pendingUsers: 0, assignedCases: 0 });
  const [counters, setCounters] = useState({ active: 0, closed: 0, sessionsThisWeek: 0, nearDeadlines: 0 });
  const [sessionsWeek, setSessionsWeek] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [latestCases, setLatestCases] = useState([]);
  const [activity, setActivity] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [sort, setSort] = useState({ by: "updatedAt", dir: "desc" });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [topCounts, ctrs, weekSess, ups, latest, act, team] = await Promise.all([
          getDashboardTopCounts(), getDashboardCounters(), getWeekSessions(),
          getUpcomingDeadlines(), getLatestCases(10), getRecentActivity(12), getTeamKPIs(),
        ]);
        setTops(topCounts || {});
        setCounters(ctrs || {});
        setSessionsWeek(weekSess || []);
        setDeadlines(ups || []);
        setLatestCases(latest || []);
        setActivity(act || []);
        setKpis(Array.isArray(team) ? team : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cases = useMemo(() => {
    const toMs = (s) => new Date(String(s).replace(" ", "T")).getTime() || 0;
    const toNum = (s) => Number(String(s || "").replace(/[^\d]/g, "")) || 0;
    return latestCases.slice().sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.by === "updatedAt") return (toMs(a.updatedAt) - toMs(b.updatedAt)) * dir;
      if (sort.by === "no") return (toNum(a.no) - toNum(b.no)) * dir;
      return String(a[sort.by]).localeCompare(String(b[sort.by] || ""), "ar") * dir;
    });
  }, [latestCases, sort]);

  const SortBtn = ({ id, children }) => (
    <button
      className="btn btn-ghost"
      style={{ padding: "4px 10px", fontSize: 13 }}
      onClick={() => setSort((s) => ({ by: id, dir: s.by === id && s.dir === "desc" ? "asc" : "desc" }))}
      type="button"
    >
      {children} {sort.by === id ? (sort.dir === "desc" ? "↓" : "↑") : ""}
    </button>
  );

  const kpiList = Array.isArray(kpis) ? kpis : [];

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, alignItems: "start" }}>
        <div className="ind-grid-3">
          <CardStat label="إجمالي القضايا" value={loading ? "—" : tops.totalCases} to="/admin/cases" />
          <CardStat label="طلبات موظفين معلّقة" value={loading ? "—" : tops.pendingUsers} to="/admin/staff-requests" />
          <CardStat label="قضايا مُسنّدة" value={loading ? "—" : tops.assignedCases} to="/admin/assign" />
        </div>
        <div style={{ position: "sticky", top: 88 }}>
          <AdminSecretarySearch />
        </div>
      </div>

      <div className="ind-grid-4">
        <SmallStat title="القضايا النشطة" value={counters.active} />
        <SmallStat title="القضايا المنتهية" value={counters.closed} />
        <SmallStat title="جلسات هذا الأسبوع" value={counters.sessionsThisWeek} />
        <SmallStat title="مهل قريبة (≤7 أيام)" value={deadlines.length} />
      </div>

      <div className="ind-grid-3">
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
            ].map((a, i) => (
              <Link key={i} className="btn btn-ghost" to={a.to}>{a.label}</Link>
            ))}
          </div>
        </div>

        <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
          <div className="card-title">جلسات هذا الأسبوع</div>
          {loading ? (
            <div style={{ marginTop: 10 }}>جارٍ التحميل…</div>
          ) : sessionsWeek.length === 0 ? (
            <div style={{ marginTop: 10, color: "var(--color-neutral-600)" }}>لا يوجد جلسات هذا الأسبوع.</div>
          ) : (
            <div style={{ marginTop: 10 }}>
              {sessionsWeek.map((s, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 2fr", gap: 8, padding: "10px 0", borderBottom: "1px solid var(--color-neutral-200)" }}>
                  <div>{s.date}</div>
                  <div>{s.time}</div>
                  <div>قضية #{s.caseNo} — {s.title}</div>
                </div>
              ))}
            </div>
          )}
          <Link className="btn btn-ghost" style={{ marginTop: 12 }} to="/admin/calendar">عرض التقويم</Link>
        </div>

        <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
          <div className="card-title">مهل قريبة</div>
          {loading ? (
            <div style={{ marginTop: 10 }}>جارٍ التحميل…</div>
          ) : deadlines.length === 0 ? (
            <div style={{ marginTop: 10, color: "var(--color-neutral-600)" }}>لا توجد مهل قريبة.</div>
          ) : (
            <ul style={{ marginTop: 10, lineHeight: 1.9, paddingRight: 18, listStyle: "none" }}>
              {deadlines.map((d, i) => (
                <li key={i}><span className="tag tag-accent">{d.due}</span> قضية #{d.caseNo} — {d.title}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="ind-grid-3">
        <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b>أحدث القضايا</b>
            <div style={{ display: "flex", gap: 6 }}>
              <SortBtn id="updatedAt">آخر تحديث</SortBtn>
              <SortBtn id="no">رقم القضية</SortBtn>
              <SortBtn id="owner">المسؤول</SortBtn>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={rowHeadStyle}>
              <div>رقم</div><div>العنوان</div><div>المسؤول</div><div>الحالة</div><div>آخر تحديث</div>
            </div>
            {cases.map((c) => (
              <div key={c.no} style={rowStyle}>
                <Link to={`/admin/cases/${c.no}`} style={{ fontWeight: 700 }}>#{c.no}</Link>
                <div>{c.title}</div>
                <div>{c.owner}</div>
                <div><span className="tag tag-accent">{c.status}</span></div>
                <div>{c.updatedAt}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <Link className="btn btn-ghost" to="/admin/cases">جميع القضايا</Link>
          </div>
        </div>

        <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
          <div className="card-title">سجل النشاط</div>
          {loading ? (
            <div style={{ marginTop: 10 }}>جارٍ التحميل…</div>
          ) : activity.length === 0 ? (
            <div style={{ marginTop: 10, color: "var(--color-neutral-600)" }}>لا يوجد نشاط حديث.</div>
          ) : (
            <ul style={{ marginTop: 10, lineHeight: 1.9, paddingRight: 18, listStyle: "none" }}>
              {activity.map((a, i) => (
                <li key={i}>
                  <b>{a.who}</b> — {a.what}
                  {a.caseNo ? <span style={{ color: "var(--color-neutral-600)" }}> (قضية #{a.caseNo})</span> : null}
                  <div style={{ color: "var(--color-neutral-600)", fontSize: 12 }}>{a.at}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
          <div className="card-title">أداء الفريق</div>
          {loading ? (
            <div style={{ marginTop: 10 }}>جارٍ التحميل…</div>
          ) : kpiList.length === 0 ? (
            <div style={{ marginTop: 10, color: "var(--color-neutral-600)" }}>لا يوجد موظفون بعد.</div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <div style={kpiHeadStyle}><div>الموظف</div><div>نشطة</div><div>منتهية</div><div>انضباط المهل</div></div>
              {kpiList.map((p, i) => (
                <div key={i} style={kpiRowStyle}><div>{p.name}</div><div>{p.active}</div><div>{p.closed}</div><div>{p.onTime}</div></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CardStat({ label, value, to }) {
  return (
    <Link to={to} className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", display: "block", textDecoration: "none" }}>
      <div style={{ color: "var(--color-neutral-600)" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{value}</div>
    </Link>
  );
}
function SmallStat({ title, value }) {
  return (
    <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
      <div style={{ color: "var(--color-neutral-600)" }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

const rowHeadStyle = { display: "grid", gridTemplateColumns: "0.7fr 1.6fr 1.2fr 1fr 1.3fr", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-neutral-200)", color: "var(--color-neutral-600)", fontWeight: 700 };
const rowStyle = { display: "grid", gridTemplateColumns: "0.7fr 1.6fr 1.2fr 1fr 1.3fr", gap: 10, padding: "12px 0", borderBottom: "1px solid var(--color-neutral-200)" };
const kpiHeadStyle = { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-neutral-200)", color: "var(--color-neutral-600)", fontWeight: 700 };
const kpiRowStyle = { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 10, padding: "12px 0", borderBottom: "1px solid var(--color-neutral-200)" };
