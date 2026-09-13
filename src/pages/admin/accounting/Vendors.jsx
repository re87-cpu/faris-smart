// FILE: src/pages/admin/accounting/Vendors.jsx
import { useEffect, useState } from "react";
import {
  listVendors, addVendor, getVendorStatement,
  listPurchaseInvoices, addPurchaseInvoice, approvePurchaseInvoice, getApAging,
} from "../../../mock/accountingApi.js";
import { Card, EmptyState, Field, Money, StatusTag } from "./ui.jsx";

const PO_STATUS = {
  draft: { label: "مسودة", cls: "tag-neutral" }, approved: { label: "معتمدة", cls: "tag-accent" },
  partially_paid: { label: "مدفوعة جزئيًا", cls: "tag-outline" }, paid: { label: "مدفوعة", cls: "tag-accent" },
  cancelled: { label: "ملغاة", cls: "tag-neutral" },
};

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [aging, setAging] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openVendor, setOpenVendor] = useState(false);
  const [vendorForm, setVendorForm] = useState({ name: "", taxNumber: "", email: "", phone: "" });
  const [statementFor, setStatementFor] = useState(null);
  const [statement, setStatement] = useState([]);

  const [openPO, setOpenPO] = useState(false);
  const [poForm, setPoForm] = useState({ vendorId: "", issueDate: "", dueDate: "", items: [{ description: "", quantity: 1, unitPrice: "" }] });
  const [poErr, setPoErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [v, p, a] = await Promise.all([listVendors(), listPurchaseInvoices(), getApAging()]);
      setVendors(v); setPurchases(p); setAging(a);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function saveVendor() {
    if (!vendorForm.name.trim()) return;
    await addVendor(vendorForm);
    setOpenVendor(false); setVendorForm({ name: "", taxNumber: "", email: "", phone: "" });
    await load();
  }

  async function openStatement(v) { setStatementFor(v); setStatement(await getVendorStatement(v.id)); }

  function updateItem(i, patch) {
    setPoForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }));
  }
  function addItem() { setPoForm((f) => ({ ...f, items: [...f.items, { description: "", quantity: 1, unitPrice: "" }] })); }

  async function savePO() {
    if (!poForm.vendorId || !poForm.issueDate || !poForm.dueDate) { setPoErr("أكمل بيانات الفاتورة."); return; }
    setSaving(true); setPoErr("");
    try {
      await addPurchaseInvoice({ ...poForm, items: poForm.items.filter((it) => it.description && it.unitPrice) });
      setOpenPO(false);
      setPoForm({ vendorId: "", issueDate: "", dueDate: "", items: [{ description: "", quantity: 1, unitPrice: "" }] });
      await load();
    } catch (e) { setPoErr(e.message || "تعذّر الحفظ."); }
    finally { setSaving(false); }
  }

  async function approve(id) { await approvePurchaseInvoice(id); await load(); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title={`الموردون (${vendors.length})`} action={<button className="btn btn-primary" onClick={() => setOpenVendor((o) => !o)}>إضافة مورد</button>}>
        {openVendor && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
            <Field label="الاسم"><input className="input" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} /></Field>
            <Field label="الرقم الضريبي"><input className="input" value={vendorForm.taxNumber} onChange={(e) => setVendorForm({ ...vendorForm, taxNumber: e.target.value })} /></Field>
            <Field label="البريد"><input className="input" value={vendorForm.email} onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })} /></Field>
            <Field label="الجوال"><input className="input" value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} /></Field>
            <div style={{ gridColumn: "1 / -1" }}><button className="btn btn-primary" onClick={saveVendor}>حفظ</button></div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <div style={{ padding: 16 }}>جارٍ التحميل…</div> : vendors.length === 0 ? <EmptyState text="لا يوجد موردون بعد." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>الاسم</th><th>الجوال</th><th>البريد</th><th></th></tr></thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}><td><b>{v.name}</b></td><td>{v.phone || "—"}</td><td>{v.email || "—"}</td>
                  <td style={{ textAlign: "left" }}><button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openStatement(v)}>كشف حساب</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {statementFor && (
        <Card title={`كشف حساب مورد: ${statementFor.name}`} action={<button className="btn btn-ghost" onClick={() => setStatementFor(null)}>إغلاق</button>} style={{ padding: 0, overflow: "hidden" }}>
          {statement.length === 0 ? <EmptyState text="لا توجد حركات." /> : (
            <table className="table" style={{ margin: 0 }}>
              <thead><tr><th>التاريخ</th><th>المرجع</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead>
              <tbody>{statement.map((s, i) => (<tr key={i}><td>{s.date}</td><td>{s.ref}</td><td>{s.debit ? <Money n={s.debit} /> : "—"}</td><td>{s.credit ? <Money n={s.credit} /> : "—"}</td><td><b><Money n={s.balance} /></b></td></tr>))}</tbody>
            </table>
          )}
        </Card>
      )}

      <Card title={`فواتير المشتريات (${purchases.length})`} action={<button className="btn btn-primary" onClick={() => setOpenPO((o) => !o)}>فاتورة مشتريات جديدة</button>}>
        {openPO && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Field label="المورد">
                <select className="input" value={poForm.vendorId} onChange={(e) => setPoForm({ ...poForm, vendorId: e.target.value })}>
                  <option value="">اختر مورد</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </Field>
              <Field label="تاريخ الفاتورة"><input className="input" type="date" value={poForm.issueDate} onChange={(e) => setPoForm({ ...poForm, issueDate: e.target.value })} /></Field>
              <Field label="تاريخ الاستحقاق"><input className="input" type="date" value={poForm.dueDate} onChange={(e) => setPoForm({ ...poForm, dueDate: e.target.value })} /></Field>
            </div>
            {poForm.items.map((it, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                <input className="input" placeholder="الوصف" value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} />
                <input className="input" type="number" placeholder="الكمية" value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} />
                <input className="input" type="number" placeholder="سعر الوحدة" value={it.unitPrice} onChange={(e) => updateItem(i, { unitPrice: e.target.value })} />
              </div>
            ))}
            <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={addItem}>+ سطر آخر</button>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn btn-primary" disabled={saving} onClick={savePO}>{saving ? "جارٍ الحفظ…" : "حفظ كمسودة"}</button>
              {poErr && <span style={{ color: "#a3342a", fontSize: 13 }}>{poErr}</span>}
            </div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {purchases.length === 0 ? <EmptyState text="لا توجد فواتير مشتريات بعد." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>الرقم</th><th>الإجمالي</th><th>المدفوع</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td><b>{p.invoiceNumber}</b></td><td><Money n={p.total} /></td><td><Money n={p.amountPaid} /></td>
                  <td><StatusTag status={p.status} map={PO_STATUS} /></td>
                  <td style={{ textAlign: "left" }}>{p.status === "draft" && <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => approve(p.id)}>اعتماد</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="أعمار الذمم الدائنة" style={{ padding: 0, overflow: "hidden" }}>
        {aging.length === 0 ? <EmptyState text="لا توجد مستحقات للموردين حاليًا." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>المورد</th><th>الفاتورة</th><th>المتبقي</th><th>الاستحقاق</th><th>الفئة</th></tr></thead>
            <tbody>{aging.map((r) => (<tr key={r.id}><td>{r.vendorName}</td><td>{r.invoiceNumber}</td><td><Money n={r.remaining} /></td><td>{r.dueDate}</td><td>{r.bucket}</td></tr>))}</tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
