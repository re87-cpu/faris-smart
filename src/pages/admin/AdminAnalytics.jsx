// FILE: src/pages/admin/AdminAnalytics.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchAllCases, getTeamKPIs, getDashboardCounters, getDashboardTopCounts, getWeekSessions } from "../../mock/api.js";
import { PageHeader, Section, StatRow, EmptyState, LoadingSkeleton, FormError, TableWrap } from "../../components/admin/ui.jsx";

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
    <div dir="rtl" className="adm">
      <PageHeader title="التحليلات" description="نظرة عامة على أداء القضايا والفريق." />
      <FormError>{err}</FormError>

      <Section title="ملخّص سريع">
        <StatRow items={[
          { value: counters.active, label: "قضايا نشطة" },
          { value: counters.closed, label: "قضايا منتهية" },
          { value: counters.sessionsThisWeek, label: "جلسات هذا الأسبوع" },
          { value: counters.nearDeadlines, label: "مهل قريبة ≤7 أيام" },
        ]} />
      </Section>

      <Section title="إحصائيات عامة" bordered>
        {loading ? <LoadingSkeleton rows={1} /> : (
          <StatRow items={[
            { value: topCounts.totalCases, label: "إجمالي القضايا" },
            { value: topCounts.assignedCases, label: "قضايا مسندة لموظفين" },
            { value: topCounts.pendingUsers, label: "طلبات تسجيل معلّقة" },
          ]} />
        )}
      </Section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <Section title="توزيع حسب الحالة" bordered>
          {loading ? <LoadingSkeleton rows={3} /> : byStatus.length === 0 ? <EmptyState text="لا توجد بيانات كافية." /> : (
            <div className="adm-alerts">
              {byStatus.map((r, i) => (
                <div className="adm-alert-row" key={i}><span className="tag tag-accent">{r.status}</span><span style={{ fontWeight: 700 }}>{r.count}</span></div>
              ))}
            </div>
          )}
        </Section>
        <Section title="توزيع حسب المحكمة" bordered>
          {loading ? <LoadingSkeleton rows={3} /> : byCourt.length === 0 ? <EmptyState text="لا توجد بيانات كافية." /> : (
            <div className="adm-alerts">
              {byCourt.map((r, i) => (
                <div className="adm-alert-row" key={i}><span className="tag tag-outline">{r.court}</span><span style={{ fontWeight: 700 }}>{r.count}</span></div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <Section title="أداء الفريق" bordered>
        {loading ? <LoadingSkeleton rows={3} /> : kpis.length === 0 ? <EmptyState text="لا توجد بيانات كافية." /> : (
          <TableWrap>
            <table className="table">
              <thead><tr><th>الموظف</th><th>نشطة</th><th>منتهية</th><th>انضباط المهل</th></tr></thead>
              <tbody>
                {kpis.map((p, i) => (
                  <tr key={i}><td>{p.name}</td><td>{p.active}</td><td>{p.closed}</td><td>{p.onTime}</td></tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Section>

      <Section title="جلسات هذا الأسبوع" bordered>
        {loading && !weekSessions.length ? <LoadingSkeleton rows={3} /> : weekSessions.length === 0 ? <EmptyState text="لا توجد بيانات كافية." /> : (
          <TableWrap>
            <table className="table">
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
          </TableWrap>
        )}
      </Section>
    </div>
  );
}
