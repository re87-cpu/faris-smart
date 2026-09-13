// FILE: src/pages/admin/accounting/Vendors.jsx
import { useEffect, useMemo, useState } from "react";
import {
  listVendors, addVendor, getVendorStatement,
  listPurchaseInvoices, addPurchaseInvoice, approvePurchaseInvoice, getApAging,
} from "../../../mock/accountingApi.js";
import { PageHeader, Toolbar, ToolbarSpacer, TableWrap, EmptyState, LoadingState, FormError, Field, FormGrid, Money, StatusTag, Drawer, Section } from "./ui.jsx";

const PO_STATUS = {
  draft: { label: "مسودة", cls: "tag-neutral" }, approved: { label: "معتمدة", cls: "tag-accent" },
  partially_paid: { label: "مدفوعة جزئيًا", cls: "tag-outline" }, paid: { label: "مدفوعة", cls: "tag-accent" },
  cancelled: { label: "ملغاة", cls: "tag-neutral" },
};
const emptyVendor = { name: "", taxNumber: "", email: "", phone: "" };
const emptyPO = { vendorId: "", issueDate: "", dueDate: "", items: [{ description: "", quantity: 1, unitPrice: "" }] };

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [aging, setAging] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [drawer, setDrawer] = useState(null); // "vendor" | "po" | { statement }
  const [vendorForm, setVendorForm] = useState(emptyVendor);
  const [poForm, setPoForm] = useState(emptyPO);
  const [poErr, setPoErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [statement, setStatement] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const [v, p, a] = await Promise.all([listVendors(), listPurchaseInvoices(), getApAging()]);
      setVendors(v); setPurchases(p); setAging(a);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function vendorName(id) { return vendors.find((v) => v.id === Number(id))?.name || ""; }

  const filteredVendors = useMemo(() => {
    if (!q.trim()) return vendors;
    return vendors.filter((v) => (v.name || "").includes(q) || (v.phone || "").includes(q));
  }, [vendors, q]);

  async function saveVendor() {
    if (!vendorForm.name.trim()) return;
    await addVendor(vendorForm);
    setDrawer(null); setVendorForm(emptyVendor);
    await load();
  }

  async function openStatement(v) { setDrawer({ statement: v }); setStatement(await getVendorStatement(v.id)); }

  function updateItem(i, patch) { setPoForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) })); }
  function addItem() { setPoForm((f) => ({ ...f, items: [...f.items, { description: "", quantity: 1, unitPrice: "" }] })); }

  async function savePO() {
    if (!poForm.vendorId || !poForm.issueDate || !poForm.dueDate) { setPoErr("أكمل بيانات الفاتورة."); return; }
    setSaving(true); setPoErr("");
    try {
      await addPurchaseInvoice({ ...poForm, items: poForm.items.filter((it) => it.description && it.unitPrice) });
      setDrawer(null); setPoForm(emptyPO);
      await load();
    } catch (e) { setPoErr(e.message || "تعذّر الحفظ."); }
    finally { setSaving(false); }
  }

  async function approve(id) { await approvePurchaseInvoice(id); await load(); }

  return (
    <div className="acct">
      <PageHeader
        title="الموردون والمشتريات"
        description="بيانات الموردين وفواتير المشتريات — يُنشئ الاعتماد قيدها المحاسبي تلقائيًا."
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => { setPoForm(emptyPO); setPoErr(""); setDrawer("po"); }}>فاتورة مشتريات</button>
            <button className="btn btn-primary" onClick={() => { setVendorForm(emptyVendor); setDrawer("vendor"); }}>إضافة مورد</button>
          </>
        }
      />

      <Toolbar>
        <input className="input" placeholder="ابحث عن مورد…" value={q} onChange={(e) => setQ(e.target.value)} />
        <ToolbarSpacer />
        <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{filteredVendors.length} من {vendors.length}</span>
      </Toolbar>

      {loading ? <LoadingState /> : filteredVendors.length === 0 ? <EmptyState text={vendors.length === 0 ? "لا يوجد موردون بعد." : "لا نتائج مطابقة."} /> : (
        <TableWrap>
          <table className="table">
            <thead><tr><th>الاسم</th><th>الجوال</th><th>البريد</th><th></th></tr></thead>
            <tbody>
              {filteredVendors.map((v) => (
                <tr key={v.id}>
                  <td><b>{v.name}</b></td><td>{v.phone || "—"}</td><td>{v.email || "—"}</td>
                  <td style={{ textAlign: "left" }}><button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openStatement(v)}>كشف حساب</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Section title={`فواتير المشتريات (${purchases.length})`} bordered>
        {purchases.length === 0 ? <EmptyState text="لا توجد فواتير مشتريات بعد." /> : (
          <TableWrap>
            <table className="table">
              <thead><tr><th>الرقم</th><th>المورد</th><th>الإجمالي</th><th>المدفوع</th><th>الحالة</th><th></th></tr></thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.invoiceNumber}</b></td><td>{vendorName(p.vendorId)}</td><td><Money n={p.total} /></td><td><Money n={p.amountPaid} /></td>
                    <td><StatusTag status={p.status} map={PO_STATUS} /></td>
                    <td style={{ textAlign: "left" }}>{p.status === "draft" && <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => approve(p.id)}>اعتماد</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Section>

      {aging.length > 0 && (
        <Section title="أعمار الذمم الدائنة" bordered>
          <TableWrap>
            <table className="table">
              <thead><tr><th>المورد</th><th>الفاتورة</th><th>المتبقي</th><th>الاستحقاق</th><th>الفئة</th></tr></thead>
              <tbody>{aging.map((r) => (<tr key={r.id}><td>{r.vendorName}</td><td>{r.invoiceNumber}</td><td><Money n={r.remaining} /></td><td>{r.dueDate}</td><td>{r.bucket}</td></tr>))}</tbody>
            </table>
          </TableWrap>
        </Section>
      )}

      <Drawer open={drawer === "vendor"} onClose={() => setDrawer(null)} title="إضافة مورد" footer={<button className="btn btn-primary" onClick={saveVendor}>حفظ</button>}>
        <Field label="الاسم"><input className="input" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} /></Field>
        <FormGrid>
          <Field label="الرقم الضريبي"><input className="input" value={vendorForm.taxNumber} onChange={(e) => setVendorForm({ ...vendorForm, taxNumber: e.target.value })} /></Field>
          <Field label="البريد"><input className="input" value={vendorForm.email} onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })} /></Field>
          <Field label="الجوال"><input className="input" value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} /></Field>
        </FormGrid>
      </Drawer>

      <Drawer
        open={drawer === "po"} onClose={() => setDrawer(null)} title="فاتورة مشتريات جديدة"
        footer={<><button className="btn btn-primary" disabled={saving} onClick={savePO}>{saving ? "جارٍ الحفظ…" : "حفظ كمسودة"}</button><FormError>{poErr}</FormError></>}
      >
        <Field label="المورد">
          <select className="input" value={poForm.vendorId} onChange={(e) => setPoForm({ ...poForm, vendorId: e.target.value })}>
            <option value="">اختر مورد</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </Field>
        <FormGrid>
          <Field label="تاريخ الفاتورة"><input className="input" type="date" value={poForm.issueDate} onChange={(e) => setPoForm({ ...poForm, issueDate: e.target.value })} /></Field>
          <Field label="تاريخ الاستحقاق"><input className="input" type="date" value={poForm.dueDate} onChange={(e) => setPoForm({ ...poForm, dueDate: e.target.value })} /></Field>
        </FormGrid>
        <div className="acct-section-title">البنود</div>
        {poForm.items.map((it, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            <input className="input" placeholder="الوصف" value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} />
            <input className="input" type="number" placeholder="الكمية" style={{ maxWidth: 90 }} value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} />
            <input className="input" type="number" placeholder="السعر" style={{ maxWidth: 110 }} value={it.unitPrice} onChange={(e) => updateItem(i, { unitPrice: e.target.value })} />
          </div>
        ))}
        <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={addItem}>+ سطر آخر</button>
      </Drawer>

      <Drawer open={!!drawer?.statement} onClose={() => setDrawer(null)} title={drawer?.statement ? `كشف حساب مورد: ${drawer.statement.name}` : ""}>
        {statement.length === 0 ? <EmptyState text="لا توجد حركات." /> : (
          <TableWrap>
            <table className="table">
              <thead><tr><th>التاريخ</th><th>المرجع</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead>
              <tbody>{statement.map((s, i) => (<tr key={i}><td>{s.date}</td><td>{s.ref}</td><td>{s.debit ? <Money n={s.debit} /> : "—"}</td><td>{s.credit ? <Money n={s.credit} /> : "—"}</td><td><b><Money n={s.balance} /></b></td></tr>))}</tbody>
            </table>
          </TableWrap>
        )}
      </Drawer>
    </div>
  );
}
