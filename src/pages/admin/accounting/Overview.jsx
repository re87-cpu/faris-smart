// FILE: src/pages/admin/accounting/Overview.jsx
import { useEffect, useState } from "react";
import { getAccountingDashboard } from "../../../mock/accountingApi.js";
import { PageHeader, Toolbar, StatRow, Section, AlertList, LoadingState, Money } from "./ui.jsx";
import { fmtMoney } from "../../../data/financialSeed.js";

const RANGES = [
  { v: "today", l: "اليوم" }, { v: "week", l: "أسبوع" }, { v: "month", l: "شهر" },
  { v: "quarter", l: "ربع سنة" }, { v: "year", l: "سنة" },
];

export default function Overview() {
  const [range, setRange] = useState("month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setData(await getAccountingDashboard({ range })); }
      finally { setLoading(false); }
    })();
  }, [range]);

  const alerts = data ? [
    data.overdueInvoices > 0 && { label: "فواتير متأخرة عن الاستحقاق", value: `${data.overdueInvoices}`, color: "#a3342a" },
    data.dueSoonInvoices > 0 && { label: "فواتير تستحق خلال 7 أيام", value: `${data.dueSoonInvoices}`, color: "var(--color-accent-700)" },
    data.taxDue > 0 && { label: "ضريبة قيمة مضافة مستحقة", value: <Money n={data.taxDue} /> },
    data.totalPayable > 0 && { label: "مستحق للموردين", value: <Money n={data.totalPayable} /> },
  ].filter(Boolean) : [];

  return (
    <div className="acct">
      <PageHeader
        title="نظرة عامة"
        description="ملخص سريع للوضع المالي — التفاصيل الكاملة في تبويبات الفواتير والمصروفات والتقارير."
        actions={
          <div style={{ display: "flex", gap: 4 }}>
            {RANGES.map((r) => (
              <button
                key={r.v} type="button" onClick={() => setRange(r.v)}
                className="btn" style={{
                  padding: "5px 12px", fontSize: 12.5, border: "1px solid var(--color-divider)",
                  background: range === r.v ? "var(--color-accent)" : "transparent",
                  color: range === r.v ? "#fff" : "var(--color-text)",
                }}
              >
                {r.l}
              </button>
            ))}
          </div>
        }
      />

      {loading || !data ? <LoadingState /> : (
        <>
          <StatRow items={[
            { label: "الإيرادات", value: `${fmtMoney(data.totalRevenue)} ر.س`, color: "#1E7A45" },
            { label: "المصروفات", value: `${fmtMoney(data.totalExpense)} ر.س`, color: "#C0392B" },
            { label: "صافي الربح", value: `${fmtMoney(data.netProfit)} ر.س`, color: data.netProfit >= 0 ? "#1E7A45" : "#C0392B" },
            { label: "الصندوق والبنوك", value: `${fmtMoney(data.cashAndBankBalance)} ر.س` },
            { label: "مستحق من العملاء", value: `${fmtMoney(data.totalReceivable)} ر.س` },
          ]} />

          <Section title="يحتاج انتباهك" bordered>
            <AlertList items={alerts} empty="لا توجد تنبيهات — كل شيء تحت السيطرة." />
          </Section>

          <div style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>الفترة المعروضة: {data.from} — {data.to}</div>
        </>
      )}
    </div>
  );
}
