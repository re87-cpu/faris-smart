// FILE: src/pages/admin/accounting/Assets.jsx
import { useEffect, useState } from "react";
import { listFixedAssets, addFixedAsset, disposeFixedAsset, runDepreciation, listAccounts } from "../../../mock/accountingApi.js";
import { Card, EmptyState, Field, Money, StatusTag } from "./ui.jsx";

const STATUS = { active: { label: "نشط", cls: "tag-accent" }, disposed: { label: "مستبعد", cls: "tag-neutral" } };

export default function Assets() {
  const [rows, setRows] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const empty = { name: "", category: "", cost: "", purchaseDate: "", usefulLifeYears: "5", salvageValue: "0", paidFromAccountId: "" };
  const [form, setForm] = useState(empty);
  const [disposeFor, setDisposeFor] = useState(null);
  const [disposeForm, setDisposeForm] = useState({ disposalDate: "", proceeds: "0", receiveIntoAccountId: "" });

  const cashBankAccounts = accounts.filter((a) => a.subtype === "cash" || a.subtype === "bank");

  async function load() {
    setLoading(true);
    try { const [a, ac] = await Promise.all([listFixedAssets(), listAccounts()]); setRows(a); setAccounts(ac); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name || !form.cost || !form.purchaseDate || !form.paidFromAccountId) { setErr("أكمل البيانات."); return; }
    try { await addFixedAsset(form); setOpen(false); setForm(empty); await load(); }
    catch (e) { setErr(e.message || "تعذّر الحفظ."); }
  }

  async function dispose() {
    if (!disposeForm.disposalDate || !disposeForm.receiveIntoAccountId) return;
    await disposeFixedAsset(disposeFor.id, disposeForm);
    setDisposeFor(null); setDisposeForm({ disposalDate: "", proceeds: "0", receiveIntoAccountId: "" });
    await load();
  }

  async function runNow() {
    const now = new Date();
    await runDepreciation({ year: now.getFullYear(), month: now.getMonth() + 1 });
    await load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card
        title={`الأصول الثابتة (${rows.length})`}
        action={<div style={{ display: "flex", gap: 8 }}><button className="btn btn-ghost" onClick={runNow}>تشغيل إهلاك هذا الشهر يدويًا</button><button className="btn btn-primary" onClick={() => setOpen((o) => !o)}>أصل جديد</button></div>}
      >
        {open && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
            <Field label="اسم الأصل"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="التصنيف"><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="التكلفة"><input className="input" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></Field>
            <Field label="تاريخ الشراء"><input className="input" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} /></Field>
            <Field label="العمر الافتراضي (سنوات)"><input className="input" type="number" value={form.usefulLifeYears} onChange={(e) => setForm({ ...form, usefulLifeYears: e.target.value })} /></Field>
            <Field label="القيمة التخريدية"><input className="input" type="number" value={form.salvageValue} onChange={(e) => setForm({ ...form, salvageValue: e.target.value })} /></Field>
            <Field label="دُفع من">
              <select className="input" value={form.paidFromAccountId} onChange={(e) => setForm({ ...form, paidFromAccountId: e.target.value })}>
                <option value="">اختر حساب</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn btn-primary" onClick={save}>حفظ</button>
              {err && <span style={{ color: "#a3342a", fontSize: 13 }}>{err}</span>}
            </div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <div style={{ padding: 16 }}>جارٍ التحميل…</div> : rows.length === 0 ? <EmptyState text="لا توجد أصول ثابتة بعد." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>الاسم</th><th>التكلفة</th><th>الإهلاك المتراكم</th><th>القيمة الدفترية</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td><b>{a.name}</b></td><td><Money n={a.cost} /></td><td><Money n={a.accumulatedDepreciation} /></td><td><Money n={a.bookValue} /></td>
                  <td><StatusTag status={a.status} map={STATUS} /></td>
                  <td style={{ textAlign: "left" }}>
                    {a.status === "active" && <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => { setDisposeFor(a); setDisposeForm({ disposalDate: new Date().toISOString().slice(0, 10), proceeds: "0", receiveIntoAccountId: "" }); }}>استبعاد/بيع</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {disposeFor && (
        <Card title={`استبعاد/بيع: ${disposeFor.name}`} action={<button className="btn btn-ghost" onClick={() => setDisposeFor(null)}>إغلاق</button>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="تاريخ الاستبعاد"><input className="input" type="date" value={disposeForm.disposalDate} onChange={(e) => setDisposeForm({ ...disposeForm, disposalDate: e.target.value })} /></Field>
            <Field label="المبلغ المستلم (إن وُجد)"><input className="input" type="number" value={disposeForm.proceeds} onChange={(e) => setDisposeForm({ ...disposeForm, proceeds: e.target.value })} /></Field>
            <Field label="استلم في حساب">
              <select className="input" value={disposeForm.receiveIntoAccountId} onChange={(e) => setDisposeForm({ ...disposeForm, receiveIntoAccountId: e.target.value })}>
                <option value="">اختر حساب</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <div style={{ gridColumn: "1 / -1" }}><button className="btn btn-primary" onClick={dispose}>تأكيد الاستبعاد</button></div>
          </div>
        </Card>
      )}
    </div>
  );
}
