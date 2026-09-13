// FILE: src/pages/admin/accounting/Expenses.jsx
import { useEffect, useState } from "react";
import { listExpenses, addExpense, listAccounts, listVendors } from "../../../mock/accountingApi.js";
import { Card, EmptyState, Field, Money } from "./ui.jsx";

export default function Expenses() {
  const [rows, setRows] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const empty = { categoryAccountId: "", amount: "", paidFromAccountId: "", expenseDate: "", vendorNameFree: "", description: "" };
  const [form, setForm] = useState(empty);

  const expenseAccounts = accounts.filter((a) => a.type === "expense");
  const cashBankAccounts = accounts.filter((a) => a.subtype === "cash" || a.subtype === "bank");

  async function load() {
    setLoading(true);
    try { const [e, a, v] = await Promise.all([listExpenses(), listAccounts(), listVendors()]); setRows(e); setAccounts(a); setVendors(v); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.categoryAccountId || !form.amount || !form.paidFromAccountId || !form.expenseDate) { setErr("أكمل البيانات."); return; }
    setSaving(true); setErr("");
    try { await addExpense(form); setOpen(false); setForm(empty); await load(); }
    catch (e) { setErr(e.message || "تعذّر الحفظ."); }
    finally { setSaving(false); }
  }

  function accName(id) { const a = accounts.find((x) => x.id === Number(id)); return a ? a.name : "—"; }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title={`المصروفات (${rows.length})`} action={<button className="btn btn-primary" onClick={() => setOpen((o) => !o)}>مصروف جديد</button>}>
        {open && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Field label="نوع المصروف">
                <select className="input" value={form.categoryAccountId} onChange={(e) => setForm({ ...form, categoryAccountId: e.target.value })}>
                  <option value="">اختر</option>{expenseAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </Field>
              <Field label="المبلغ"><input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
              <Field label="تاريخ المصروف"><input className="input" type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} /></Field>
              <Field label="دُفع من">
                <select className="input" value={form.paidFromAccountId} onChange={(e) => setForm({ ...form, paidFromAccountId: e.target.value })}>
                  <option value="">اختر</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </Field>
              <Field label="المورد (اختياري)">
                <select className="input" value={form.vendorId || ""} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}>
                  <option value="">— بدون —</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </Field>
              <Field label="أو اسم جهة نصي"><input className="input" value={form.vendorNameFree} onChange={(e) => setForm({ ...form, vendorNameFree: e.target.value })} /></Field>
            </div>
            <Field label="الوصف"><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "جارٍ الحفظ…" : "حفظ"}</button>
              {err && <span style={{ color: "#a3342a", fontSize: 13 }}>{err}</span>}
            </div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <div style={{ padding: 16 }}>جارٍ التحميل…</div> : rows.length === 0 ? <EmptyState text="لا توجد مصروفات بعد." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>التاريخ</th><th>البند</th><th>المبلغ</th><th>دُفع من</th><th>الوصف</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}><td>{r.expenseDate}</td><td>{accName(r.categoryAccountId)}</td><td><Money n={r.amount} /></td><td>{accName(r.paidFromAccountId)}</td><td>{r.description || "—"}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
