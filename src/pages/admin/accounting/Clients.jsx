// FILE: src/pages/admin/accounting/Clients.jsx
import { useEffect, useState } from "react";
import { listClients, addClient, getClientStatement } from "../../../mock/accountingApi.js";
import { Card, EmptyState, Field, Money } from "./ui.jsx";

const TYPE_LABELS = { individual: "فرد", company: "شركة", institution: "مؤسسة", other: "جهة أخرى" };

export default function Clients() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", type: "individual", taxNumber: "", commercialRegistration: "", email: "", phone: "", billingAddress: "" });
  const [statementFor, setStatementFor] = useState(null);
  const [statement, setStatement] = useState([]);

  async function load() { setLoading(true); try { setRows(await listClients()); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name.trim()) { setErr("الاسم مطلوب."); return; }
    setSaving(true); setErr("");
    try { await addClient(form); setOpen(false); setForm({ name: "", type: "individual", taxNumber: "", commercialRegistration: "", email: "", phone: "", billingAddress: "" }); await load(); }
    catch (e) { setErr(e.message || "تعذّر الحفظ."); }
    finally { setSaving(false); }
  }

  async function openStatement(c) {
    setStatementFor(c);
    setStatement(await getClientStatement(c.id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title={`العملاء (${rows.length})`} action={<button className="btn btn-primary" onClick={() => setOpen((o) => !o)}>إضافة عميل/شركة</button>}>
        {open && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
            <Field label="الاسم"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="النوع">
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="الرقم الضريبي"><input className="input" value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} /></Field>
            <Field label="السجل التجاري"><input className="input" value={form.commercialRegistration} onChange={(e) => setForm({ ...form, commercialRegistration: e.target.value })} /></Field>
            <Field label="البريد الإلكتروني"><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="الجوال"><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="عنوان الفوترة"><input className="input" value={form.billingAddress} onChange={(e) => setForm({ ...form, billingAddress: e.target.value })} /></Field>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "جارٍ الحفظ…" : "حفظ"}</button>
              {err && <span style={{ color: "#a3342a", fontSize: 13 }}>{err}</span>}
            </div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <div style={{ padding: 16 }}>جارٍ التحميل…</div> : rows.length === 0 ? <EmptyState text="لا يوجد عملاء بعد." /> : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ margin: 0 }}>
              <thead><tr><th>الاسم</th><th>النوع</th><th>الجوال</th><th>البريد</th><th></th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td><b>{c.name}</b></td>
                    <td>{TYPE_LABELS[c.type] || c.type}</td>
                    <td>{c.phone || "—"}</td>
                    <td>{c.email || "—"}</td>
                    <td style={{ textAlign: "left" }}><button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openStatement(c)}>كشف حساب</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {statementFor && (
        <Card title={`كشف حساب: ${statementFor.name}`} action={<button className="btn btn-ghost" onClick={() => setStatementFor(null)}>إغلاق</button>} style={{ padding: 0, overflow: "hidden" }}>
          {statement.length === 0 ? <EmptyState text="لا توجد حركات." /> : (
            <table className="table" style={{ margin: 0 }}>
              <thead><tr><th>التاريخ</th><th>المرجع</th><th>النوع</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead>
              <tbody>
                {statement.map((s, i) => (
                  <tr key={i}>
                    <td>{s.date}</td><td>{s.ref}</td><td>{s.kind}</td>
                    <td>{s.debit ? <Money n={s.debit} /> : "—"}</td>
                    <td>{s.credit ? <Money n={s.credit} /> : "—"}</td>
                    <td><b><Money n={s.balance} /></b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}
