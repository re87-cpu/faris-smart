// FILE: src/pages/admin/AdminAnalytics.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchAllCases, getTeamKPIs, getDashboardCounters, getDashboardTopCounts, getWeekSessions } from "../../mock/api.js";

const STATUS_LABELS = { open: "قيد الترافع", closed: "مغلقة", archived: "مؤرشفة" };

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [counters, setCounters] = useState({ active: 0, closed: 0, sessionsThisWeek: 0, nearDeadlines: 0 });
  const [topCounts, setTopCounts] = useState({ totalCases: 0, assignedCases: 0, pendingUsers: 0 });
  const [weekSessions, setWeekSessions] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const [cs, team, ctr, tops, sessions] = await Promise.all([
          fetchAllCases(), getTeamKPIs(), getDashboardCounters(), getDashboardTopCounts(), getWeekSessions(),
        ]);
        setCases(cs || []);
        setKpis(team || []);
        setCounters({ active: ctr?.active || 0, closed: ctr?.closed || 0, sessionsThisWeek: ctr?.sessionsThisWeek || 0, nearDeadlines: ctr?.nearDeadlines || 0 });
        setTopCounts({ totalCases: tops?.totalCases || 0, assignedCases: tops?.assignedCases || 0, pendingUsers: tops?.pendingUsers || 0 });
        setWeekSessions(sessions || []);
      } catch (ex) {
        console.error(ex);
        setErr(ex.message || "تعذّر تحميل بيانات التحليلات.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byStatus = useMemo(() => {
    const m = new Map();
    cases.forEach((c) => { const key = STATUS_LABELS[c.status] || c.status || "غير محدد"; m.set(key, (m.get(key) || 0) + 1); });
    return Array.from(m.entries()).map(([status, count]) => ({ status, count }));
  }, [cases]);

  const byCourt = useMemo(() => {
    const m = new Map();
    cases.forEach((c) => { const key = c.court || "غير محدد"; m.set(key, (m.get(key) || 0) + 1); });
    return Array.from(m.entries()).map(([court, count]) => ({ court, count }));
  }, [cases]);

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div className="card-title">ملخّص سريع</div>
        {err && <div style={{ marginTop: 8, color: "#b3261e" }}>{err}</div>}
        <div className="ind-grid-4" style={{ marginTop: 10 }}>
          <Stat title="قضايا نشطة" value={counters.active} />
          <Stat title="قضايا منتهية" value={counters.closed} />
          <Stat title="جلسات هذا الأسبوع" value={counters.sessionsThisWeek} />
          <Stat title="مهل قريبة ≤7 أيام" value={counters.nearDeadlines} />
        </div>
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div className="card-title">إحصائيات عامة للشركة</div>
        {loading ? <div style={{ marginTop: 10 }}>جارٍ التحميل…</div> : (
          <div className="ind-grid-3" style={{ marginTop: 10 }}>
            <Stat title="إجمالي القضايا" value={topCounts.totalCases} />
            <Stat title="قضايا مسندة لموظفين" value={topCounts.assignedCases} />
            <Stat title="طلبات تسجيل معلّقة" value={topCounts.pendingUsers} />
          </div>
        )}
      </div>

      <div className="ind-grid-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
          <div className="card-title">توزيع حسب الحالة</div>
          {loading ? <div style={{ marginTop: 10 }}>جارٍ التحميل…</div> : byStatus.length === 0 ? <Empty /> : (
            <ul style={{ marginTop: 10, lineHeight: 1.9, paddingRight: 18, listStyle: "none" }}>
              {byStatus.map((r, i) => <li key={i}><span className="tag tag-accent">{r.status}</span> — {r.count}</li>)}
            </ul>
          )}
        </div>
        <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
          <div className="card-title">توزيع حسب المحكمة</div>
          {loading ? <div style={{ marginTop: 10 }}>جارٍ التحميل…</div> : byCourt.length === 0 ? <Empty /> : (
            <ul style={{ marginTop: 10, lineHeight: 1.9, paddingRight: 18, listStyle: "none" }}>
              {byCourt.map((r, i) => <li key={i}><span className="tag tag-outline">{r.court}</span> — {r.count}</li>)}
            </ul>
          )}
        </div>
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div className="card-title">أداء الفريق</div>
        {loading ? <div style={{ marginTop: 10 }}>جارٍ التحميل…</div> : kpis.length === 0 ? <Empty /> : (
          <div style={{ marginTop: 10 }}>
            <div style={head}><div>الموظف</div><div>نشطة</div><div>منتهية</div><div>انضباط المهل</div></div>
            {kpis.map((p, i) => <div key={i} style={row}><div>{p.name}</div><div>{p.active}</div><div>{p.closed}</div><div>{p.onTime}</div></div>)}
          </div>
        )}
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div className="card-title">جلسات هذا الأسبوع</div>
        {loading && !weekSessions.length ? <div style={{ marginTop: 10 }}>جارٍ التحميل…</div> : weekSessions.length === 0 ? <Empty /> : (
          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 420 }}>
              <thead><tr><th>اليوم</th><th>الوقت</th><th>رقم / عنوان القضية</th><th>المحكمة</th></tr></thead>
              <tbody>
                {weekSessions.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.date}</td><td>{s.time}</td>
                    <td><span style={{ fontWeight: 700 }}>{s.caseNo}</span>{s.title && <span style={{ marginInlineStart: 6, fontSize: 12, color: "var(--color-neutral-600)" }}>— {s.title}</span>}</td>
                    <td>{s.court || "—"}</td>
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

function Stat({ title, value }) {
  return <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", padding: 14 }}><div style={{ color: "var(--color-neutral-600)" }}>{title}</div><div style={{ fontSize: 24, fontWeight: 900 }}>{value}</div></div>;
}
function Empty() { return <div style={{ marginTop: 10, color: "var(--color-neutral-600)" }}>لا توجد بيانات كافية.</div>; }

const head = { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-neutral-200)", color: "var(--color-neutral-600)", fontWeight: 700 };
const row = { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 10, padding: "12px 0", borderBottom: "1px solid var(--color-neutral-200)" };
