// FILE: src/pages/admin/accounting/Subscriptions.jsx
import { useEffect, useState } from "react";
import { listSubscriptions, addSubscription, updateSubscription, listClients, listServices } from "../../../mock/accountingApi.js";
import { PageHeader, Toolbar, ToolbarSpacer, TableWrap, EmptyState, LoadingState, FormError, Field, FormGrid, Money, StatusTag, Drawer, ConfirmButton } from "./ui.jsx";

const STATUS = { active: { label: "نشط", cls: "tag-accent" }, paused: { label: "متوقف مؤقتًا", cls: "tag-outline" }, ended: { label: "منتهٍ", cls: "tag-neutral" } };
const emptyForm = { clientId: "", serviceId: "", amount: "", billingCycle: "monthly", startDate: "" };

export default function Subscriptions() {
  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    try { const [s, c, sv] = await Promise.all([listSubscriptions(), listClients(), listServices()]); setRows(s); setClients(c); setServices(sv); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function clientName(id) { return clients.find((c) => c.id === Number(id))?.name || ""; }

  async function save() {
    if (!form.clientId || !form.amount || !form.startDate) { setErr("أكمل البيانات."); return; }
    try { await addSubscription(form); setOpen(false); setForm(emptyForm); await load(); }
    catch (e) { setErr(e.message || "تعذّر الحفظ."); }
  }

  async function toggle(id, status) { await updateSubscription(id, { status }); await load(); }

  return (
    <div className="acct">
      <PageHeader
        title="الاشتراكات المتكررة"
        description="عقود شهرية أو سنوية — يولّد النظام فاتورة تلقائيًا عند حلول موعد كل دورة."
        actions={<button className="btn btn-primary" onClick={() => { setForm(emptyForm); setErr(""); setOpen(true); }}>اشتراك جديد</button>}
      />

      <Toolbar><ToolbarSpacer /><span style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{rows.length} اشتراك</span></Toolbar>

      {loading ? <LoadingState /> : rows.length === 0 ? <EmptyState text="لا توجد اشتراكات بعد." /> : (
        <TableWrap>
          <table className="table">
            <thead><tr><th>العميل</th><th>القيمة</th><th>الدورة</th><th>الفاتورة القادمة</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>{clientName(s.clientId)}</td>
                  <td><Money n={s.amount} /></td>
                  <td>{s.billingCycle === "monthly" ? "شهري" : "سنوي"}</td>
                  <td>{s.nextInvoiceDate}</td>
                  <td><StatusTag status={s.status} map={STATUS} /></td>
                  <td>
                    <div className="acct-row-actions">
                      {s.status === "active" && <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => toggle(s.id, "paused")}>إيقاف مؤقت</button>}
                      {s.status === "paused" && <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => toggle(s.id, "active")}>استئناف</button>}
                      {s.status !== "ended" && <ConfirmButton className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} confirmLabel="تأكيد الإنهاء" onConfirm={() => toggle(s.id, "ended")}>إنهاء</ConfirmButton>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Drawer
        open={open} onClose={() => setOpen(false)} title="اشتراك جديد"
        footer={<><button className="btn btn-primary" onClick={save}>حفظ</button><FormError>{err}</FormError></>}
      >
        <Field label="العميل">
          <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
            <option value="">اختر عميلًا</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="الخدمة">
          <select className="input" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
            <option value="">— اختياري —</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <FormGrid>
          <Field label="القيمة"><input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
          <Field label="الدورة">
            <select className="input" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}>
              <option value="monthly">شهري</option><option value="yearly">سنوي</option>
            </select>
          </Field>
        </FormGrid>
        <Field label="تاريخ البداية"><input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
      </Drawer>
    </div>
  );
}
