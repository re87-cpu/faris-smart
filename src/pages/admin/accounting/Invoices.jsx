// FILE: src/pages/admin/accounting/Invoices.jsx
import { useEffect, useState } from "react";
import {
  listInvoices, addInvoiceDraft, approveInvoice, sendInvoice, cancelInvoice, deleteInvoiceDraft,
  listClients, listServices, getArAging, addCreditNote, addDebitNote,
} from "../../../mock/accountingApi.js";
import { Card, EmptyState, Field, Money, StatusTag } from "./ui.jsx";

const INV_STATUS = {
  draft: { label: "مسودة", cls: "tag-neutral" }, approved: { label: "معتمدة", cls: "tag-accent" },
  sent: { label: "مرسلة", cls: "tag-outline" }, partially_paid: { label: "مدفوعة جزئيًا", cls: "tag-outline" },
  paid: { label: "مدفوعة", cls: "tag-accent" }, overdue: { label: "متأخرة", cls: "tag-neutral" }, cancelled: { label: "ملغاة", cls: "tag-neutral" },
};

export default function Invoices() {
  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [aging, setAging] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [noteFor, setNoteFor] = useState(null);
  const [noteForm, setNoteForm] = useState({ amount: "", taxAmount: "", reason: "", issueDate: "" });

  const emptyForm = { clientId: "", issueDate: "", dueDate: "", discountAmount: "0", notes: "", items: [{ serviceId: "", description: "", quantity: 1, unitPrice: "" }] };
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    try {
      const [inv, cl, sv, ag] = await Promise.all([listInvoices(), listClients(), listServices(), getArAging()]);
      setRows(inv); setClients(cl); setServices(sv); setAging(ag);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function updateItem(i, patch) {
    setForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }));
  }
  function addItem() { setForm((f) => ({ ...f, items: [...f.items, { serviceId: "", description: "", quantity: 1, unitPrice: "" }] })); }
  function removeItem(i) { setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })); }

  const preview = form.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0) - Number(form.discountAmount || 0);

  async function save() {
    if (!form.clientId || !form.issueDate || !form.dueDate) { setErr("أكمل بيانات الفاتورة."); return; }
    const items = form.items.filter((it) => (it.description || it.serviceId) && it.unitPrice);
    if (!items.length) { setErr("أضف بندًا واحدًا على الأقل."); return; }
    setSaving(true); setErr("");
    try {
      await addInvoiceDraft({ ...form, items });
      setOpen(false); setForm(emptyForm);
      await load();
    } catch (e) { setErr(e.message || "تعذّر الحفظ."); }
    finally { setSaving(false); }
  }

  async function doAction(fn, id) { setBusyId(id); try { await fn(id); await load(); } finally { setBusyId(null); } }

  async function saveNote(kind) {
    const fn = kind === "credit" ? addCreditNote : addDebitNote;
    await fn({ originalInvoiceId: noteFor.id, amount: Number(noteForm.amount), taxAmount: Number(noteForm.taxAmount || 0), reason: noteForm.reason, issueDate: noteForm.issueDate });
    setNoteFor(null); setNoteForm({ amount: "", taxAmount: "", reason: "", issueDate: "" });
    await load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title={`الفواتير (${rows.length})`} action={<button className="btn btn-primary" onClick={() => setOpen((o) => !o)}>فاتورة جديدة</button>}>
        {open && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Field label="العميل">
                <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                  <option value="">اختر عميلًا</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="تاريخ الإصدار"><input className="input" type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} /></Field>
              <Field label="تاريخ الاستحقاق"><input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
            </div>

            {form.items.map((it, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 0.8fr 1fr auto", gap: 10, alignItems: "center" }}>
                <select className="input" value={it.serviceId} onChange={(e) => {
                  const svc = services.find((s) => String(s.id) === e.target.value);
                  updateItem(i, { serviceId: e.target.value, description: svc ? svc.name : it.description, unitPrice: svc && svc.defaultPrice ? svc.defaultPrice : it.unitPrice });
                }}>
                  <option value="">— خدمة —</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input className="input" placeholder="الوصف" value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} />
                <input className="input" type="number" placeholder="الكمية" value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} />
                <input className="input" type="number" placeholder="سعر الوحدة" value={it.unitPrice} onChange={(e) => updateItem(i, { unitPrice: e.target.value })} />
                <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => removeItem(i)}>حذف</button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={addItem}>+ إضافة بند</button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="الخصم (ر.س)"><input className="input" type="number" value={form.discountAmount} onChange={(e) => setForm({ ...form, discountAmount: e.target.value })} /></Field>
              <Field label="ملاحظات"><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            </div>

            <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>الإجمالي التقريبي قبل الضريبة: <b><Money n={preview} /></b> — تُحسب الضريبة تلقائيًا عند الحفظ حسب نسبة الإعدادات الحالية.</div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "جارٍ الحفظ…" : "حفظ كمسودة"}</button>
              {err && <span style={{ color: "#a3342a", fontSize: 13 }}>{err}</span>}
            </div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <div style={{ padding: 16 }}>جارٍ التحميل…</div> : rows.length === 0 ? <EmptyState text="لا توجد فواتير بعد." /> : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ margin: 0 }}>
              <thead><tr><th>الرقم</th><th>الإجمالي</th><th>المدفوع</th><th>الاستحقاق</th><th>الحالة</th><th></th></tr></thead>
              <tbody>
                {rows.map((inv) => (
                  <tr key={inv.id}>
                    <td><b>{inv.invoiceNumber}</b></td>
                    <td><Money n={inv.total} /></td>
                    <td><Money n={inv.amountPaid} /></td>
                    <td>{inv.dueDate}</td>
                    <td><StatusTag status={inv.status} map={INV_STATUS} /></td>
                    <td style={{ textAlign: "left", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {inv.status === "draft" && (
                        <>
                          <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} disabled={busyId === inv.id} onClick={() => doAction(approveInvoice, inv.id)}>اعتماد</button>
                          <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} disabled={busyId === inv.id} onClick={() => doAction(deleteInvoiceDraft, inv.id)}>حذف</button>
                        </>
                      )}
                      {inv.status === "approved" && (
                        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} disabled={busyId === inv.id} onClick={() => doAction(sendInvoice, inv.id)}>إرسال</button>
                      )}
                      {["approved", "sent", "partially_paid"].includes(inv.status) && Number(inv.amountPaid) === 0 && (
                        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} disabled={busyId === inv.id} onClick={() => doAction(cancelInvoice, inv.id)}>إلغاء</button>
                      )}
                      {inv.status !== "draft" && inv.status !== "cancelled" && (
                        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => { setNoteFor(inv); setNoteForm({ amount: "", taxAmount: "", reason: "", issueDate: new Date().toISOString().slice(0, 10) }); }}>إشعار دائن/مدين</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {noteFor && (
        <Card title={`إشعار دائن/مدين — فاتورة ${noteFor.invoiceNumber}`} action={<button className="btn btn-ghost" onClick={() => setNoteFor(null)}>إغلاق</button>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="المبلغ (بدون ضريبة)"><input className="input" type="number" value={noteForm.amount} onChange={(e) => setNoteForm({ ...noteForm, amount: e.target.value })} /></Field>
            <Field label="الضريبة"><input className="input" type="number" value={noteForm.taxAmount} onChange={(e) => setNoteForm({ ...noteForm, taxAmount: e.target.value })} /></Field>
            <Field label="التاريخ"><input className="input" type="date" value={noteForm.issueDate} onChange={(e) => setNoteForm({ ...noteForm, issueDate: e.target.value })} /></Field>
            <div style={{ gridColumn: "1 / -1" }}><Field label="السبب"><input className="input" value={noteForm.reason} onChange={(e) => setNoteForm({ ...noteForm, reason: e.target.value })} /></Field></div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => saveNote("credit")}>إصدار إشعار دائن (تخفيض)</button>
              <button className="btn btn-secondary" onClick={() => saveNote("debit")}>إصدار إشعار مدين (إضافة)</button>
            </div>
          </div>
        </Card>
      )}

      <Card title="أعمار الذمم المدينة" style={{ padding: 0, overflow: "hidden" }}>
        {aging.length === 0 ? <EmptyState text="لا توجد مستحقات على العملاء حاليًا." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>العميل</th><th>الفاتورة</th><th>المتبقي</th><th>الاستحقاق</th><th>الفئة</th></tr></thead>
            <tbody>{aging.map((r) => (<tr key={r.id}><td>{r.clientName}</td><td>{r.invoiceNumber}</td><td><Money n={r.remaining} /></td><td>{r.dueDate}</td><td>{r.bucket}</td></tr>))}</tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
