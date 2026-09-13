// FILE: src/pages/admin/accounting/Clients.jsx
import { useEffect, useMemo, useState } from "react";
import { listClients, addClient, getClientStatement } from "../../../mock/accountingApi.js";
import { PageHeader, Toolbar, ToolbarSpacer, TableWrap, EmptyState, LoadingState, FormError, Field, FormGrid, Money, Drawer } from "./ui.jsx";

const TYPE_LABELS = { individual: "فرد", company: "شركة", institution: "مؤسسة", other: "جهة أخرى" };
const emptyForm = { name: "", type: "individual", taxNumber: "", commercialRegistration: "", email: "", phone: "", billingAddress: "" };

export default function Clients() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [drawer, setDrawer] = useState(null); // "create" | { statement: client }
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [statement, setStatement] = useState([]);

  async function load() { setLoading(true); try { setRows(await listClients()); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim();
    if (!term) return rows;
    return rows.filter((c) => (c.name || "").includes(term) || (c.phone || "").includes(term) || (c.email || "").includes(term));
  }, [rows, q]);

  async function save() {
    if (!form.name.trim()) { setErr("الاسم مطلوب."); return; }
    setSaving(true); setErr("");
    try { await addClient(form); setDrawer(null); setForm(emptyForm); await load(); }
    catch (e) { setErr(e.message || "تعذّر الحفظ."); }
    finally { setSaving(false); }
  }

  async function openStatement(c) { setDrawer({ statement: c }); setStatement(await getClientStatement(c.id)); }

  return (
    <div className="acct">
      <PageHeader
        title="العملاء"
        description="جهات الفوترة — أفراد أو شركات أو مؤسسات. اضغط على أي عميل لعرض كشف حسابه."
        actions={<button className="btn btn-primary" onClick={() => { setForm(emptyForm); setErr(""); setDrawer("create"); }}>إضافة عميل</button>}
      />

      <Toolbar>
        <input className="input" placeholder="ابحث بالاسم أو الجوال أو البريد…" value={q} onChange={(e) => setQ(e.target.value)} />
        <ToolbarSpacer />
        <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{filtered.length} من {rows.length}</span>
      </Toolbar>

      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState text={rows.length === 0 ? "لا يوجد عملاء بعد." : "لا نتائج مطابقة."} />
      ) : (
        <TableWrap>
          <table className="table">
            <thead><tr><th>الاسم</th><th>النوع</th><th>الجوال</th><th>البريد</th><th></th></tr></thead>
            <tbody>
              {filtered.map((c) => (
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
        </TableWrap>
      )}

      <Drawer
        open={drawer === "create"} onClose={() => setDrawer(null)} title="إضافة عميل/شركة"
        footer={<><button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "جارٍ الحفظ…" : "حفظ"}</button><FormError>{err}</FormError></>}
      >
        <Field label="الاسم"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="النوع">
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <FormGrid>
          <Field label="الرقم الضريبي"><input className="input" value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} /></Field>
          <Field label="السجل التجاري"><input className="input" value={form.commercialRegistration} onChange={(e) => setForm({ ...form, commercialRegistration: e.target.value })} /></Field>
          <Field label="البريد الإلكتروني"><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="الجوال"><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        </FormGrid>
        <Field label="عنوان الفوترة"><input className="input" value={form.billingAddress} onChange={(e) => setForm({ ...form, billingAddress: e.target.value })} /></Field>
      </Drawer>

      <Drawer open={!!drawer?.statement} onClose={() => setDrawer(null)} title={drawer?.statement ? `كشف حساب: ${drawer.statement.name}` : ""}>
        {statement.length === 0 ? <EmptyState text="لا توجد حركات." /> : (
          <TableWrap>
            <table className="table">
              <thead><tr><th>التاريخ</th><th>المرجع</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead>
              <tbody>
                {statement.map((s, i) => (
                  <tr key={i}>
                    <td>{s.date}</td><td>{s.ref}</td>
                    <td>{s.debit ? <Money n={s.debit} /> : "—"}</td>
                    <td>{s.credit ? <Money n={s.credit} /> : "—"}</td>
                    <td><b><Money n={s.balance} /></b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Drawer>
    </div>
  );
}
