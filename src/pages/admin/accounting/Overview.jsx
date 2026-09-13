// FILE: src/pages/admin/accounting/Overview.jsx
import { useEffect, useState } from "react";
import { getAccountingDashboard } from "../../../mock/accountingApi.js";
import { Card, Stat, Money } from "./ui.jsx";

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {RANGES.map((r) => (
          <button key={r.v} className={range === r.v ? "btn btn-primary" : "btn btn-ghost"} style={{ padding: "4px 12px", fontSize: 13 }} onClick={() => setRange(r.v)}>
            {r.l}
          </button>
        ))}
      </div>

      {loading || !data ? (
        <Card><div style={{ padding: 16 }}>جارٍ التحميل…</div></Card>
      ) : (
        <>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Stat label="الإيرادات" value={<Money n={data.totalRevenue} />} color="#1E7A45" />
            <Stat label="المصروفات" value={<Money n={data.totalExpense} />} color="#C0392B" />
            <Stat label="صافي الربح" value={<Money n={data.netProfit} />} color={data.netProfit >= 0 ? "#1E7A45" : "#C0392B"} />
            <Stat label="التدفق النقدي (الصندوق + البنوك)" value={<Money n={data.cashAndBankBalance} />} />
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Stat label="إجمالي مستحق من العملاء (ذمم مدينة)" value={<Money n={data.totalReceivable} />} color="var(--color-accent-700)" />
            <Stat label="إجمالي مستحق للموردين (ذمم دائنة)" value={<Money n={data.totalPayable} />} color="var(--color-accent-700)" />
            <Stat label="ضريبة القيمة المضافة المستحقة" value={<Money n={data.taxDue} />} />
            <Stat label="فواتير متأخرة" value={data.overdueInvoices} color={data.overdueInvoices > 0 ? "#C0392B" : undefined} />
            <Stat label="فواتير تستحق خلال 7 أيام" value={data.dueSoonInvoices} />
          </div>
          <div style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>
            الفترة: {data.from} — {data.to}
          </div>
        </>
      )}
    </div>
  );
}
