// FILE: src/pages/admin/accounting/Settings.jsx
import { useEffect, useState } from "react";
import {
  listTaxSettings, addTaxSetting, listFiscalYears, addFiscalYear,
  listFiscalPeriods, closeFiscalPeriod, openFiscalPeriod, closeFiscalYear,
} from "../../../mock/accountingApi.js";
import { PageHeader, Section, TableWrap, EmptyState, ConfirmButton } from "./ui.jsx";

export default function Settings() {
  const [taxRows, setTaxRows] = useState([]);
  const [taxForm, setTaxForm] = useState({ vatRate: "15", effectiveFrom: "" });
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [newYear, setNewYear] = useState(new Date().getFullYear() + 1);
  const [err, setErr] = useState("");

  async function load() { const [t, y] = await Promise.all([listTaxSettings(), listFiscalYears()]); setTaxRows(t); setYears(y); }
  useEffect(() => { load(); }, []);

  async function viewPeriods(y) { setSelectedYear(y); setPeriods(await listFiscalPeriods(y.id)); }

  async function saveTax() {
    if (!taxForm.vatRate || !taxForm.effectiveFrom) return;
    await addTaxSetting(taxForm);
    setTaxForm({ vatRate: "15", effectiveFrom: "" });
    await load();
  }

  async function addYear() {
    try { await addFiscalYear({ year: Number(newYear) }); await load(); }
    catch (e) { setErr(e.message === "year_already_exists" ? "هذه السنة موجودة بالفعل." : (e.message || "تعذّر الإضافة.")); }
  }

  async function togglePeriod(p) {
    if (p.status === "open") await closeFiscalPeriod(p.id); else await openFiscalPeriod(p.id);
    setPeriods(await listFiscalPeriods(selectedYear.id));
  }

  async function closeYear() {
    try { await closeFiscalYear(selectedYear.id); await load(); setSelectedYear(null); }
    catch (e) { setErr(e.message || "تعذّر إقفال السنة."); }
  }

  return (
    <div className="acct">
      <PageHeader title="الإعدادات" description="نسبة الضريبة والسنوات والفترات المالية." />

      <Section title="ضريبة القيمة المضافة">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input className="input" type="number" style={{ maxWidth: 100 }} value={taxForm.vatRate} onChange={(e) => setTaxForm({ ...taxForm, vatRate: e.target.value })} />
          <input className="input" type="date" style={{ maxWidth: 180 }} value={taxForm.effectiveFrom} onChange={(e) => setTaxForm({ ...taxForm, effectiveFrom: e.target.value })} />
          <button className="btn btn-primary" onClick={saveTax}>حفظ نسبة جديدة</button>
        </div>
        <TableWrap>
          <table className="table">
            <thead><tr><th>النسبة</th><th>سارية من</th></tr></thead>
            <tbody>{taxRows.map((t) => (<tr key={t.id}><td>{t.vatRate}%</td><td>{t.effectiveFrom}</td></tr>))}</tbody>
          </table>
        </TableWrap>
      </Section>

      <Section
        title="السنوات المالية" bordered
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" type="number" style={{ maxWidth: 100 }} value={newYear} onChange={(e) => setNewYear(e.target.value)} />
            <button className="btn btn-secondary" onClick={addYear}>فتح سنة جديدة</button>
          </div>
        }
      >
        {years.length === 0 ? <EmptyState text="لا توجد سنوات مالية." /> : (
          <TableWrap>
            <table className="table">
              <thead><tr><th>السنة</th><th>الحالة</th><th></th></tr></thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y.id}>
                    <td>{y.year}</td><td>{y.status === "open" ? "مفتوحة" : "مُقفلة"}</td>
                    <td style={{ textAlign: "left" }}><button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => viewPeriods(y)}>عرض الفترات</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
        {err && <div className="acct-error" style={{ marginTop: 8 }}>{err}</div>}
      </Section>

      {selectedYear && (
        <Section
          title={`فترات سنة ${selectedYear.year}`} bordered
          actions={selectedYear.status === "open" && <ConfirmButton confirmLabel="تأكيد إقفال السنة كاملة" onConfirm={closeYear}>إقفال السنة كاملة</ConfirmButton>}
        >
          <TableWrap>
            <table className="table">
              <thead><tr><th>من</th><th>إلى</th><th>الحالة</th><th></th></tr></thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p.id}>
                    <td>{p.periodStart}</td><td>{p.periodEnd}</td><td>{p.status === "open" ? "مفتوحة" : "مغلقة"}</td>
                    <td style={{ textAlign: "left" }}><button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => togglePeriod(p)}>{p.status === "open" ? "إغلاق" : "فتح"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </Section>
      )}
    </div>
  );
}
