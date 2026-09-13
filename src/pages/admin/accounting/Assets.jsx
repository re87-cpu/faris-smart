// FILE: src/pages/admin/accounting/Assets.jsx
import { useEffect, useState } from "react";
import { listFixedAssets, addFixedAsset, disposeFixedAsset, runDepreciation, listAccounts } from "../../../mock/accountingApi.js";
import { PageHeader, Toolbar, ToolbarSpacer, TableWrap, EmptyState, LoadingState, FormError, Field, FormGrid, Money, StatusTag, Drawer } from "./ui.jsx";

const STATUS = { active: { label: "نشط", cls: "tag-accent" }, disposed: { label: "مستبعد", cls: "tag-neutral" } };
const empty = { name: "", category: "", cost: "", purchaseDate: "", usefulLifeYears: "5", salvageValue: "0", paidFromAccountId: "" };

export default function Assets() {
  const [rows, setRows] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(null); // "create" | { dispose: asset }
  const [err, setErr] = useState("");
  const [form, setForm] = useState(empty);
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
    try { await addFixedAsset(form); setDrawer(null); setForm(empty); await load(); }
    catch (e) { setErr(e.message || "تعذّر الحفظ."); }
  }

  async function dispose() {
    if (!disposeForm.disposalDate || !disposeForm.receiveIntoAccountId) return;
    await disposeFixedAsset(drawer.dispose.id, disposeForm);
    setDrawer(null); setDisposeForm({ disposalDate: "", proceeds: "0", receiveIntoAccountId: "" });
    await load();
  }

  async function runNow() { const now = new Date(); await runDepreciation({ year: now.getFullYear(), month: now.getMonth() + 1 }); await load(); }

  return (
    <div className="acct">
      <PageHeader
        title="الأصول الثابتة"
        description="يُحسب الإهلاك الشهري تلقائيًا بالقسط الثابت ويُرحَّل قيده دون تكرار."
        actions={<button className="btn btn-primary" onClick={() => { setForm(empty); setErr(""); setDrawer("create"); }}>أصل جديد</button>}
      />

      <Toolbar>
        <button className="btn btn-ghost" style={{ fontSize: 12.5 }} onClick={runNow}>تشغيل إهلاك هذا الشهر يدويًا</button>
        <ToolbarSpacer />
        <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{rows.length} أصل</span>
      </Toolbar>

      {loading ? <LoadingState /> : rows.length === 0 ? <EmptyState text="لا توجد أصول ثابتة بعد." /> : (
        <TableWrap>
          <table className="table">
            <thead><tr><th>الاسم</th><th>التكلفة</th><th>الإهلاك المتراكم</th><th>القيمة الدفترية</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td><b>{a.name}</b></td><td><Money n={a.cost} /></td><td><Money n={a.accumulatedDepreciation} /></td><td><Money n={a.bookValue} /></td>
                  <td><StatusTag status={a.status} map={STATUS} /></td>
                  <td style={{ textAlign: "left" }}>
                    {a.status === "active" && <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => { setDrawer({ dispose: a }); setDisposeForm({ disposalDate: new Date().toISOString().slice(0, 10), proceeds: "0", receiveIntoAccountId: "" }); }}>استبعاد/بيع</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Drawer
        open={drawer === "create"} onClose={() => setDrawer(null)} title="أصل ثابت جديد"
        footer={<><button className="btn btn-primary" onClick={save}>حفظ</button><FormError>{err}</FormError></>}
      >
        <Field label="اسم الأصل"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <FormGrid>
          <Field label="التصنيف"><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="التكلفة"><input className="input" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></Field>
          <Field label="تاريخ الشراء"><input className="input" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} /></Field>
          <Field label="العمر الافتراضي (سنوات)"><input className="input" type="number" value={form.usefulLifeYears} onChange={(e) => setForm({ ...form, usefulLifeYears: e.target.value })} /></Field>
          <Field label="القيمة التخريدية"><input className="input" type="number" value={form.salvageValue} onChange={(e) => setForm({ ...form, salvageValue: e.target.value })} /></Field>
        </FormGrid>
        <Field label="دُفع من">
          <select className="input" value={form.paidFromAccountId} onChange={(e) => setForm({ ...form, paidFromAccountId: e.target.value })}>
            <option value="">اختر حساب</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
      </Drawer>

      <Drawer
        open={!!drawer?.dispose} onClose={() => setDrawer(null)} title={drawer?.dispose ? `استبعاد/بيع: ${drawer.dispose.name}` : ""}
        footer={<button className="btn btn-primary" onClick={dispose}>تأكيد الاستبعاد</button>}
      >
        <FormGrid>
          <Field label="تاريخ الاستبعاد"><input className="input" type="date" value={disposeForm.disposalDate} onChange={(e) => setDisposeForm({ ...disposeForm, disposalDate: e.target.value })} /></Field>
          <Field label="المبلغ المستلم (إن وُجد)"><input className="input" type="number" value={disposeForm.proceeds} onChange={(e) => setDisposeForm({ ...disposeForm, proceeds: e.target.value })} /></Field>
        </FormGrid>
        <Field label="استلم في حساب">
          <select className="input" value={disposeForm.receiveIntoAccountId} onChange={(e) => setDisposeForm({ ...disposeForm, receiveIntoAccountId: e.target.value })}>
            <option value="">اختر حساب</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
      </Drawer>
    </div>
  );
}
