// FILE: src/pages/admin/accounting/Subscriptions.jsx
import { useEffect, useState } from "react";
import { listSubscriptions, addSubscription, updateSubscription, listClients, listServices } from "../../../mock/accountingApi.js";
import { Card, EmptyState, Field, Money, StatusTag } from "./ui.jsx";

const STATUS = { active: { label: "نشط", cls: "tag-accent" }, paused: { label: "متوقف مؤقتًا", cls: "tag-outline" }, ended: { label: "منتهٍ", cls: "tag-neutral" } };

export default function Subscriptions() {
  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "", serviceId: "", amount: "", billingCycle: "monthly", startDate: "" });
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    try { const [s, c, sv] = await Promise.all([listSubscriptions(), listClients(), listServices()]); setRows(s); setClients(c); setServices(sv); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.clientId || !form.amount || !form.startDate) { setErr("أكمل البيانات."); return; }
    try { await addSubscription(form); setOpen(false); setForm({ clientId: "", serviceId: "", amount: "", billingCycle: "monthly", startDate: "" }); await load(); }
    catch (e) { setErr(e.message || "تعذّر الحفظ."); }
  }

  async function toggle(id, status) { await updateSubscription(id, { status }); await load(); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title={`الاشتراكات المتكررة (${rows.length})`} action={<button className="btn btn-primary" onClick={() => setOpen((o) => !o)}>اشتراك جديد</button>}>
        {open && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
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
            <Field label="القيمة"><input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
            <Field label="الدورة">
              <select className="input" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}>
                <option value="monthly">شهري</option><option value="yearly">سنوي</option>
              </select>
            </Field>
            <Field label="تاريخ البداية"><input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <button className="btn btn-primary" onClick={save}>حفظ</button>
              {err && <span style={{ color: "#a3342a", fontSize: 13 }}>{err}</span>}
            </div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <div style={{ padding: 16 }}>جارٍ التحميل…</div> : rows.length === 0 ? <EmptyState text="لا توجد اشتراكات بعد." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>القيمة</th><th>الدورة</th><th>الفاتورة القادمة</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td><Money n={s.amount} /></td><td>{s.billingCycle === "monthly" ? "شهري" : "سنوي"}</td><td>{s.nextInvoiceDate}</td>
                  <td><StatusTag status={s.status} map={STATUS} /></td>
                  <td style={{ textAlign: "left" }}>
                    {s.status === "active" ? (
                      <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => toggle(s.id, "paused")}>إيقاف مؤقت</button>
                    ) : s.status === "paused" ? (
                      <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => toggle(s.id, "active")}>استئناف</button>
                    ) : null}
                    {s.status !== "ended" && <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12, marginRight: 6 }} onClick={() => toggle(s.id, "ended")}>إنهاء</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
