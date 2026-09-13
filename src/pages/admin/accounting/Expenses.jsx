// FILE: src/pages/admin/accounting/Expenses.jsx
import { useEffect, useMemo, useState } from "react";
import { listExpenses, addExpense, listAccounts, listVendors } from "../../../mock/accountingApi.js";
import { PageHeader, Toolbar, ToolbarSpacer, TableWrap, EmptyState, LoadingState, FormError, Field, FormGrid, Money, Drawer } from "./ui.jsx";

const empty = { categoryAccountId: "", amount: "", paidFromAccountId: "", expenseDate: "", vendorNameFree: "", description: "" };

export default function Expenses() {
  const [rows, setRows] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState(empty);

  const expenseAccounts = accounts.filter((a) => a.type === "expense");
  const cashBankAccounts = accounts.filter((a) => a.subtype === "cash" || a.subtype === "bank");

  async function load() {
    setLoading(true);
    try { const [e, a, v] = await Promise.all([listExpenses(), listAccounts(), listVendors()]); setRows(e); setAccounts(a); setVendors(v); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function accName(id) { return accounts.find((x) => x.id === Number(id))?.name || "—"; }

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    return rows.filter((r) => (r.description || "").includes(q) || accName(r.categoryAccountId).includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, accounts]);

  async function save() {
    if (!form.categoryAccountId || !form.amount || !form.paidFromAccountId || !form.expenseDate) { setErr("أكمل البيانات."); return; }
    setSaving(true); setErr("");
    try { await addExpense(form); setOpen(false); setForm(empty); await load(); }
    catch (e) { setErr(e.message || "تعذّر الحفظ."); }
    finally { setSaving(false); }
  }

  return (
    <div className="acct">
      <PageHeader
        title="المصروفات"
        description="كل مصروف يُسجَّل مباشرة على حساب المصروف المناسب ويُخصم من الصندوق أو البنك."
        actions={<button className="btn btn-primary" onClick={() => { setForm(empty); setErr(""); setOpen(true); }}>مصروف جديد</button>}
      />

      <Toolbar>
        <input className="input" placeholder="ابحث بالوصف أو البند…" value={q} onChange={(e) => setQ(e.target.value)} />
        <ToolbarSpacer />
        <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{filtered.length} من {rows.length}</span>
      </Toolbar>

      {loading ? <LoadingState /> : filtered.length === 0 ? <EmptyState text={rows.length === 0 ? "لا توجد مصروفات بعد." : "لا نتائج مطابقة."} /> : (
        <TableWrap>
          <table className="table">
            <thead><tr><th>التاريخ</th><th>البند</th><th>المبلغ</th><th>دُفع من</th><th className="wrap">الوصف</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}><td>{r.expenseDate}</td><td>{accName(r.categoryAccountId)}</td><td><Money n={r.amount} /></td><td>{accName(r.paidFromAccountId)}</td><td className="wrap">{r.description || "—"}</td></tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Drawer
        open={open} onClose={() => setOpen(false)} title="مصروف جديد"
        footer={<><button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "جارٍ الحفظ…" : "حفظ"}</button><FormError>{err}</FormError></>}
      >
        <Field label="نوع المصروف">
          <select className="input" value={form.categoryAccountId} onChange={(e) => setForm({ ...form, categoryAccountId: e.target.value })}>
            <option value="">اختر</option>{expenseAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <FormGrid>
          <Field label="المبلغ"><input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
          <Field label="تاريخ المصروف"><input className="input" type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} /></Field>
        </FormGrid>
        <Field label="دُفع من">
          <select className="input" value={form.paidFromAccountId} onChange={(e) => setForm({ ...form, paidFromAccountId: e.target.value })}>
            <option value="">اختر</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <FormGrid>
          <Field label="المورد (اختياري)">
            <select className="input" value={form.vendorId || ""} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}>
              <option value="">— بدون —</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
          <Field label="أو اسم جهة نصي"><input className="input" value={form.vendorNameFree} onChange={(e) => setForm({ ...form, vendorNameFree: e.target.value })} /></Field>
        </FormGrid>
        <Field label="الوصف"><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </Drawer>
    </div>
  );
}
