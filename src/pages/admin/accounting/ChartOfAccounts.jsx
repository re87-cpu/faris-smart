// FILE: src/pages/admin/accounting/ChartOfAccounts.jsx
import { useEffect, useState } from "react";
import { listAccounts, addAccount, updateAccount } from "../../../mock/accountingApi.js";
import { Card, EmptyState, Field } from "./ui.jsx";

const TYPE_LABELS = { asset: "أصول", liability: "التزامات", equity: "حقوق ملكية", revenue: "إيرادات", expense: "مصروفات" };

export default function ChartOfAccounts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ code: "", name: "", type: "expense", subtype: "", parentId: "" });

  async function load() { setLoading(true); try { setRows(await listAccounts()); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.code || !form.name) { setErr("أدخل الرمز والاسم."); return; }
    try { await addAccount({ ...form, parentId: form.parentId || null }); setOpen(false); setForm({ code: "", name: "", type: "expense", subtype: "", parentId: "" }); await load(); }
    catch (e) { setErr(e.message === "code_taken" ? "هذا الرمز مستخدم بالفعل." : (e.message || "تعذّر الحفظ.")); }
  }

  async function toggleActive(a) { await updateAccount(a.id, { active: !a.active }); await load(); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title={`دليل الحسابات (${rows.length})`} action={<button className="btn btn-primary" onClick={() => setOpen((o) => !o)}>إضافة حساب فرعي</button>}>
        {open && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
            <Field label="الرمز"><input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
            <Field label="الاسم"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="النوع">
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="الحساب الأب">
              <select className="input" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                <option value="">— بدون —</option>
                {rows.filter((r) => r.type === form.type).map((r) => <option key={r.id} value={r.id}>{r.code} — {r.name}</option>)}
              </select>
            </Field>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <button className="btn btn-primary" onClick={save}>حفظ</button>
              {err && <span style={{ color: "#a3342a", fontSize: 12 }}>{err}</span>}
            </div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <div style={{ padding: 16 }}>جارٍ التحميل…</div> : rows.length === 0 ? <EmptyState text="لا توجد حسابات." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>الرمز</th><th>الاسم</th><th>النوع</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>{a.code}</td>
                  <td style={{ paddingRight: a.parentId ? 20 : 0 }}>{a.parentId ? "— " : ""}{a.name}</td>
                  <td>{TYPE_LABELS[a.type]}</td>
                  <td>{a.active ? "نشط" : "معطّل"}</td>
                  <td style={{ textAlign: "left" }}>
                    {!a.isSystem && <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => toggleActive(a)}>{a.active ? "تعطيل" : "تفعيل"}</button>}
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
