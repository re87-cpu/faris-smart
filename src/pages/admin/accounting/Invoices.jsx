// FILE: src/pages/admin/accounting/Invoices.jsx
import { useEffect, useMemo, useState } from "react";
import {
  listInvoices, addInvoiceDraft, approveInvoice, sendInvoice, cancelInvoice, deleteInvoiceDraft,
  listClients, listServices, getArAging, addCreditNote, addDebitNote,
} from "../../../mock/accountingApi.js";
import {
  PageHeader, Toolbar, ToolbarSpacer, TableWrap, EmptyState, LoadingState, FormError,
  Field, FormGrid, Money, StatusTag, Drawer, ConfirmButton, Section,
} from "./ui.jsx";

const INV_STATUS = {
  draft: { label: "مسودة", cls: "tag-neutral" }, approved: { label: "معتمدة", cls: "tag-accent" },
  sent: { label: "مرسلة", cls: "tag-outline" }, partially_paid: { label: "مدفوعة جزئيًا", cls: "tag-outline" },
  paid: { label: "مدفوعة", cls: "tag-accent" }, overdue: { label: "متأخرة", cls: "tag-neutral" }, cancelled: { label: "ملغاة", cls: "tag-neutral" },
};
const emptyForm = { clientId: "", issueDate: "", dueDate: "", discountAmount: "0", notes: "", items: [{ serviceId: "", description: "", quantity: 1, unitPrice: "" }] };

export default function Invoices() {
  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [aging, setAging] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [drawer, setDrawer] = useState(null); // "create" | { note: invoice }
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [noteForm, setNoteForm] = useState({ amount: "", taxAmount: "", reason: "", issueDate: "" });

  async function load() {
    setLoading(true);
    try {
      const [inv, cl, sv, ag] = await Promise.all([listInvoices(), listClients(), listServices(), getArAging()]);
      setRows(inv); setClients(cl); setServices(sv); setAging(ag);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function clientName(id) { return clients.find((c) => c.id === Number(id))?.name || ""; }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q.trim()) return true;
      const term = q.trim();
      return r.invoiceNumber.includes(term) || clientName(r.clientId).includes(term);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, statusFilter, clients]);

  function updateItem(i, patch) { setForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) })); }
  function addItem() { setForm((f) => ({ ...f, items: [...f.items, { serviceId: "", description: "", quantity: 1, unitPrice: "" }] })); }
  function removeItem(i) { setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })); }

  const preview = form.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0) - Number(form.discountAmount || 0);

  async function save() {
    if (!form.clientId || !form.issueDate || !form.dueDate) { setErr("أكمل بيانات الفاتورة."); return; }
    const items = form.items.filter((it) => (it.description || it.serviceId) && it.unitPrice);
    if (!items.length) { setErr("أضف بندًا واحدًا على الأقل."); return; }
    setSaving(true); setErr("");
    try { await addInvoiceDraft({ ...form, items }); setDrawer(null); setForm(emptyForm); await load(); }
    catch (e) { setErr(e.message || "تعذّر الحفظ."); }
    finally { setSaving(false); }
  }

  async function doAction(fn, id) { setBusyId(id); try { await fn(id); await load(); } finally { setBusyId(null); } }

  async function saveNote(kind) {
    const inv = drawer.note;
    const fn = kind === "credit" ? addCreditNote : addDebitNote;
    await fn({ originalInvoiceId: inv.id, amount: Number(noteForm.amount), taxAmount: Number(noteForm.taxAmount || 0), reason: noteForm.reason, issueDate: noteForm.issueDate });
    setDrawer(null); setNoteForm({ amount: "", taxAmount: "", reason: "", issueDate: "" });
    await load();
  }

  return (
    <div className="acct">
      <PageHeader
        title="الفواتير"
        description="الدورة الكاملة: مسودة ← اعتماد ← إرسال ← تحصيل. يحسب النظام الضريبة والقيود تلقائيًا."
        actions={<button className="btn btn-primary" onClick={() => { setForm(emptyForm); setErr(""); setDrawer("create"); }}>فاتورة جديدة</button>}
      />

      <Toolbar>
        <input className="input" placeholder="ابحث برقم الفاتورة أو اسم العميل…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">كل الحالات</option>
          {Object.entries(INV_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <ToolbarSpacer />
        <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{filtered.length} من {rows.length}</span>
      </Toolbar>

      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState text={rows.length === 0 ? "لا توجد فواتير بعد." : "لا نتائج مطابقة."} />
      ) : (
        <TableWrap>
          <table className="table">
            <thead><tr><th>الرقم</th><th>العميل</th><th>الإجمالي</th><th>المدفوع</th><th>الاستحقاق</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id}>
                  <td><b>{inv.invoiceNumber}</b></td>
                  <td>{clientName(inv.clientId)}</td>
                  <td><Money n={inv.total} /></td>
                  <td><Money n={inv.amountPaid} /></td>
                  <td>{inv.dueDate}</td>
                  <td><StatusTag status={inv.status} map={INV_STATUS} /></td>
                  <td>
                    <div className="acct-row-actions">
                      {inv.status === "draft" && (
                        <>
                          <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} disabled={busyId === inv.id} onClick={() => doAction(approveInvoice, inv.id)}>اعتماد</button>
                          <ConfirmButton className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} confirmLabel="تأكيد الحذف" onConfirm={() => doAction(deleteInvoiceDraft, inv.id)}>حذف</ConfirmButton>
                        </>
                      )}
                      {inv.status === "approved" && (
                        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} disabled={busyId === inv.id} onClick={() => doAction(sendInvoice, inv.id)}>إرسال</button>
                      )}
                      {["approved", "sent", "partially_paid"].includes(inv.status) && Number(inv.amountPaid) === 0 && (
                        <ConfirmButton className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} confirmLabel="تأكيد الإلغاء" onConfirm={() => doAction(cancelInvoice, inv.id)}>إلغاء</ConfirmButton>
                      )}
                      {inv.status !== "draft" && inv.status !== "cancelled" && (
                        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => { setDrawer({ note: inv }); setNoteForm({ amount: "", taxAmount: "", reason: "", issueDate: new Date().toISOString().slice(0, 10) }); }}>إشعار دائن/مدين</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {aging.length > 0 && (
        <Section title="أعمار الذمم المدينة" bordered>
          <TableWrap>
            <table className="table">
              <thead><tr><th>العميل</th><th>الفاتورة</th><th>المتبقي</th><th>الاستحقاق</th><th>الفئة</th></tr></thead>
              <tbody>{aging.map((r) => (<tr key={r.id}><td>{r.clientName}</td><td>{r.invoiceNumber}</td><td><Money n={r.remaining} /></td><td>{r.dueDate}</td><td>{r.bucket}</td></tr>))}</tbody>
            </table>
          </TableWrap>
        </Section>
      )}

      <Drawer
        open={drawer === "create"} onClose={() => setDrawer(null)} title="فاتورة جديدة"
        footer={<><button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "جارٍ الحفظ…" : "حفظ كمسودة"}</button><FormError>{err}</FormError></>}
      >
        <FormGrid>
          <Field label="العميل">
            <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              <option value="">اختر عميلًا</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="تاريخ الإصدار"><input className="input" type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} /></Field>
          <Field label="تاريخ الاستحقاق"><input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
          <Field label="الخصم (ر.س)"><input className="input" type="number" value={form.discountAmount} onChange={(e) => setForm({ ...form, discountAmount: e.target.value })} /></Field>
        </FormGrid>

        <div className="acct-section-title" style={{ marginTop: 6 }}>البنود</div>
        {form.items.map((it, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 10, borderBottom: "1px solid var(--color-divider)" }}>
            <select className="input" value={it.serviceId} onChange={(e) => {
              const svc = services.find((s) => String(s.id) === e.target.value);
              updateItem(i, { serviceId: e.target.value, description: svc ? svc.name : it.description, unitPrice: svc && svc.defaultPrice ? svc.defaultPrice : it.unitPrice });
            }}>
              <option value="">— خدمة —</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input className="input" placeholder="الوصف" value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} />
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" type="number" placeholder="الكمية" value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} />
              <input className="input" type="number" placeholder="سعر الوحدة" value={it.unitPrice} onChange={(e) => updateItem(i, { unitPrice: e.target.value })} />
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => removeItem(i)}>حذف</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={addItem}>+ إضافة بند</button>
        <Field label="ملاحظات"><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>الإجمالي التقريبي قبل الضريبة: <b><Money n={preview} /></b> — تُحسب الضريبة تلقائيًا عند الحفظ.</div>
      </Drawer>

      <Drawer open={!!drawer?.note} onClose={() => setDrawer(null)} title={drawer?.note ? `إشعار دائن/مدين — فاتورة ${drawer.note.invoiceNumber}` : ""}>
        <FormGrid>
          <Field label="المبلغ (بدون ضريبة)"><input className="input" type="number" value={noteForm.amount} onChange={(e) => setNoteForm({ ...noteForm, amount: e.target.value })} /></Field>
          <Field label="الضريبة"><input className="input" type="number" value={noteForm.taxAmount} onChange={(e) => setNoteForm({ ...noteForm, taxAmount: e.target.value })} /></Field>
          <Field label="التاريخ"><input className="input" type="date" value={noteForm.issueDate} onChange={(e) => setNoteForm({ ...noteForm, issueDate: e.target.value })} /></Field>
        </FormGrid>
        <Field label="السبب"><input className="input" value={noteForm.reason} onChange={(e) => setNoteForm({ ...noteForm, reason: e.target.value })} /></Field>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => saveNote("credit")}>إصدار إشعار دائن (تخفيض)</button>
          <button className="btn btn-secondary" onClick={() => saveNote("debit")}>إصدار إشعار مدين (إضافة)</button>
        </div>
      </Drawer>
    </div>
  );
}
