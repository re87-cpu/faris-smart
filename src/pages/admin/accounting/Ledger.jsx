// FILE: src/pages/admin/accounting/Ledger.jsx
import { useEffect, useState } from "react";
import { listAccounts, getLedger, getTrialBalance, listJournalEntries, addManualJournalEntry } from "../../../mock/accountingApi.js";
import { PageHeader, Section, TableWrap, EmptyState, LoadingState, FormError, Field, Money, Drawer } from "./ui.jsx";

export default function Ledger() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [ledgerRows, setLedgerRows] = useState([]);
  const [trialBalance, setTrialBalance] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [manualForm, setManualForm] = useState({ date: "", description: "", lines: [{ accountId: "", debit: "", credit: "" }, { accountId: "", debit: "", credit: "" }] });
  const [manualErr, setManualErr] = useState("");

  async function load() {
    setLoading(true);
    try { const [a, tb, je] = await Promise.all([listAccounts(), getTrialBalance(), listJournalEntries()]); setAccounts(a); setTrialBalance(tb); setEntries(je); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedAccount) { setLedgerRows([]); return; }
    getLedger(selectedAccount).then(setLedgerRows);
  }, [selectedAccount]);

  function updateLine(i, patch) { setManualForm((f) => ({ ...f, lines: f.lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) })); }
  function addLine() { setManualForm((f) => ({ ...f, lines: [...f.lines, { accountId: "", debit: "", credit: "" }] })); }

  const totalDebit = manualForm.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = manualForm.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);

  async function saveManual() {
    if (!manualForm.date || Math.round(totalDebit * 100) !== Math.round(totalCredit * 100) || totalDebit === 0) {
      setManualErr("يجب أن يساوي إجمالي المدين إجمالي الدائن، وألا يكون صفرًا.");
      return;
    }
    try {
      await addManualJournalEntry({ ...manualForm, lines: manualForm.lines.filter((l) => l.accountId && (l.debit || l.credit)) });
      setOpen(false);
      setManualForm({ date: "", description: "", lines: [{ accountId: "", debit: "", credit: "" }, { accountId: "", debit: "", credit: "" }] });
      await load();
    } catch (e) { setManualErr(e.message || "تعذّر الحفظ."); }
  }

  return (
    <div className="acct">
      <PageHeader title="دفتر الأستاذ وميزان المراجعة" description="حركة كل حساب وتحقّق تلقائي من توازن الدفاتر." />

      {loading || !trialBalance ? <LoadingState /> : (
        <>
          <Section title="ميزان المراجعة">
            <div style={{ fontSize: 13, color: trialBalance.balanced ? "#1E7A45" : "#a3342a", marginBottom: 8 }}>
              {trialBalance.balanced ? "✓ الميزان متوازن" : "⚠ الميزان غير متوازن — راجع القيود"}
            </div>
            <TableWrap>
              <table className="table">
                <thead><tr><th>الرمز</th><th>الحساب</th><th>مدين</th><th>دائن</th></tr></thead>
                <tbody>
                  {trialBalance.rows.filter((r) => r.debit || r.credit).map((r) => (
                    <tr key={r.id}><td>{r.code}</td><td>{r.name}</td><td>{r.debit ? <Money n={r.debit} /> : "—"}</td><td>{r.credit ? <Money n={r.credit} /> : "—"}</td></tr>
                  ))}
                  <tr style={{ fontWeight: 700 }}><td colSpan={2}>الإجمالي</td><td><Money n={trialBalance.totalDebit} /></td><td><Money n={trialBalance.totalCredit} /></td></tr>
                </tbody>
              </table>
            </TableWrap>
          </Section>

          <Section title="دفتر الأستاذ العام" bordered>
            <select className="input" style={{ maxWidth: 320 }} value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
              <option value="">اختر حسابًا لعرض حركته</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
            </select>
            {selectedAccount && (ledgerRows.length === 0 ? <EmptyState text="لا توجد حركات على هذا الحساب." /> : (
              <TableWrap>
                <table className="table">
                  <thead><tr><th>التاريخ</th><th className="wrap">الوصف</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead>
                  <tbody>
                    {ledgerRows.map((r) => (
                      <tr key={r.id}><td>{r.date}</td><td className="wrap">{r.description}</td><td>{r.debit ? <Money n={r.debit} /> : "—"}</td><td>{r.credit ? <Money n={r.credit} /> : "—"}</td><td><b><Money n={r.runningBalance} /></b></td></tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            ))}
          </Section>

          <Section title="القيود المحاسبية" actions={<button className="btn btn-ghost" style={{ fontSize: 12.5 }} onClick={() => setOpen(true)}>قيد يدوي (استثنائي)</button>} bordered>
            {entries.length === 0 ? <EmptyState text="لا توجد قيود بعد." /> : (
              <TableWrap>
                <table className="table">
                  <thead><tr><th>التاريخ</th><th>المصدر</th><th className="wrap">الوصف</th><th>عدد السطور</th></tr></thead>
                  <tbody>{entries.map((e) => (<tr key={e.id}><td>{e.date}</td><td>{e.sourceType}</td><td className="wrap">{e.description}</td><td>{e.lines?.length || 0}</td></tr>))}</tbody>
                </table>
              </TableWrap>
            )}
          </Section>
        </>
      )}

      <Drawer
        open={open} onClose={() => setOpen(false)} title="قيد يدوي (للحالات الاستثنائية فقط)"
        footer={<><button className="btn btn-primary" onClick={saveManual}>ترحيل القيد</button><FormError>{manualErr}</FormError></>}
      >
        <Field label="التاريخ"><input className="input" type="date" value={manualForm.date} onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} /></Field>
        <Field label="الوصف"><input className="input" value={manualForm.description} onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })} /></Field>
        <div className="acct-section-title">السطور</div>
        {manualForm.lines.map((l, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 10, borderBottom: "1px solid var(--color-divider)" }}>
            <select className="input" value={l.accountId} onChange={(e) => updateLine(i, { accountId: e.target.value })}>
              <option value="">اختر حساب</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" type="number" placeholder="مدين" value={l.debit} onChange={(e) => updateLine(i, { debit: e.target.value, credit: "" })} />
              <input className="input" type="number" placeholder="دائن" value={l.credit} onChange={(e) => updateLine(i, { credit: e.target.value, debit: "" })} />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={addLine}>+ سطر آخر</button>
        <div style={{ fontSize: 13 }}>إجمالي المدين: <b><Money n={totalDebit} /></b> — إجمالي الدائن: <b><Money n={totalCredit} /></b></div>
      </Drawer>
    </div>
  );
}
