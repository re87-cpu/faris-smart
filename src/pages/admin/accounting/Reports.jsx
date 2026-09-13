// FILE: src/pages/admin/accounting/Reports.jsx
import { useEffect, useState } from "react";
import { getIncomeStatement, getBalanceSheet, getCashFlow } from "../../../mock/accountingApi.js";
import { PageHeader, Section, EmptyState, LoadingState, Money } from "./ui.jsx";

const RANGES = [["today", "اليوم"], ["week", "أسبوع"], ["month", "شهر"], ["quarter", "ربع سنة"], ["year", "سنة"]];

export default function Reports() {
  const [range, setRange] = useState("month");
  const [income, setIncome] = useState(null);
  const [balance, setBalance] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [i, b, c] = await Promise.all([getIncomeStatement({ range }), getBalanceSheet({}), getCashFlow({ range })]);
      setIncome(i); setBalance(b); setCashFlow(c);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [range]);

  return (
    <div className="acct">
      <PageHeader
        title="التقارير المالية"
        description="قائمة الدخل، الميزانية العمومية، والتدفقات النقدية."
        actions={
          <div style={{ display: "flex", gap: 4 }}>
            {RANGES.map(([v, l]) => (
              <button
                key={v} type="button" onClick={() => setRange(v)}
                className="btn" style={{ padding: "5px 12px", fontSize: 12.5, border: "1px solid var(--color-divider)", background: range === v ? "var(--color-accent)" : "transparent", color: range === v ? "#fff" : "var(--color-text)" }}
              >
                {l}
              </button>
            ))}
          </div>
        }
      />

      {loading ? <LoadingState /> : (
        <>
          <Section title="قائمة الدخل" hint={`${income?.from} — ${income?.to}`}>
            {!income || (income.revenue.length === 0 && income.expense.length === 0) ? <EmptyState text="لا توجد حركات في هذه الفترة." /> : (
              <table className="table">
                <tbody>
                  <tr style={{ fontWeight: 700 }}><td colSpan={2}>الإيرادات</td></tr>
                  {income.revenue.map((r) => (<tr key={r.code}><td>{r.name}</td><td><Money n={r.amount} /></td></tr>))}
                  <tr><td>إجمالي الإيرادات</td><td><b><Money n={income.totalRevenue} /></b></td></tr>
                  <tr style={{ fontWeight: 700 }}><td colSpan={2}>المصروفات</td></tr>
                  {income.expense.map((r) => (<tr key={r.code}><td>{r.name}</td><td><Money n={r.amount} /></td></tr>))}
                  <tr><td>إجمالي المصروفات</td><td><b><Money n={income.totalExpense} /></b></td></tr>
                  <tr style={{ fontWeight: 700, borderTop: "2px solid var(--color-neutral-300)" }}><td>صافي الربح</td><td><Money n={income.netProfit} /></td></tr>
                </tbody>
              </table>
            )}
          </Section>

          <Section title="الميزانية العمومية" hint={`حتى ${balance?.asOf}`} bordered>
            {!balance ? <EmptyState text="لا بيانات." /> : (
              <table className="table">
                <tbody>
                  <tr style={{ fontWeight: 700 }}><td colSpan={2}>الأصول</td></tr>
                  {balance.assets.map((r) => (<tr key={r.code}><td>{r.name}</td><td><Money n={r.balance} /></td></tr>))}
                  <tr><td>إجمالي الأصول</td><td><b><Money n={balance.totalAssets} /></b></td></tr>
                  <tr style={{ fontWeight: 700 }}><td colSpan={2}>الالتزامات</td></tr>
                  {balance.liabilities.map((r) => (<tr key={r.code}><td>{r.name}</td><td><Money n={r.balance} /></td></tr>))}
                  <tr><td>إجمالي الالتزامات</td><td><b><Money n={balance.totalLiabilities} /></b></td></tr>
                  <tr style={{ fontWeight: 700 }}><td colSpan={2}>حقوق الملكية</td></tr>
                  {balance.equity.map((r) => (<tr key={r.code}><td>{r.name}</td><td><Money n={r.balance} /></td></tr>))}
                  <tr><td>إجمالي حقوق الملكية</td><td><b><Money n={balance.totalEquity} /></b></td></tr>
                  <tr style={{ color: balance.balanced ? "#1E7A45" : "#a3342a" }}><td colSpan={2}>{balance.balanced ? "✓ الميزانية متوازنة" : "⚠ غير متوازنة"}</td></tr>
                </tbody>
              </table>
            )}
          </Section>

          <Section title="التدفقات النقدية" hint={`${cashFlow?.from} — ${cashFlow?.to}`} bordered>
            {!cashFlow ? <EmptyState text="لا بيانات." /> : (
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 14 }}>
                <div>التشغيلية: <b><Money n={cashFlow.operatingActivities} /></b></div>
                <div>الاستثمارية: <b><Money n={cashFlow.investingActivities} /></b></div>
                <div>صافي التغيّر في النقدية: <b><Money n={cashFlow.netChange} /></b></div>
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
