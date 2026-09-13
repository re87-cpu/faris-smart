// FILE: src/pages/admin/accounting/ChartOfAccounts.jsx
import { useEffect, useMemo, useState } from "react";
import { listAccounts, addAccount, updateAccount } from "../../../mock/accountingApi.js";
import { PageHeader, Toolbar, ToolbarSpacer, TableWrap, EmptyState, LoadingState, FormError, Field, FormGrid, Drawer } from "./ui.jsx";

const TYPE_LABELS = { asset: "أصول", liability: "التزامات", equity: "حقوق ملكية", revenue: "إيرادات", expense: "مصروفات" };
const empty = { code: "", name: "", type: "expense", subtype: "", parentId: "" };

export default function ChartOfAccounts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState(empty);

  async function load() { setLoading(true); try { setRows(await listAccounts()); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    return rows.filter((a) => a.name.includes(q) || a.code.includes(q));
  }, [rows, q]);

  async function save() {
    if (!form.code || !form.name) { setErr("أدخل الرمز والاسم."); return; }
    try { await addAccount({ ...form, parentId: form.parentId || null }); setOpen(false); setForm(empty); await load(); }
    catch (e) { setErr(e.message === "code_taken" ? "هذا الرمز مستخدم بالفعل." : (e.message || "تعذّر الحفظ.")); }
  }

  async function toggleActive(a) { await updateAccount(a.id, { active: !a.active }); await load(); }

  return (
    <div className="acct">
      <PageHeader
        title="دليل الحسابات"
        description="الشجرة الأساسية مزروعة مسبقًا؛ يمكنك إضافة حسابات فرعية عند الحاجة."
        actions={<button className="btn btn-primary" onClick={() => { setForm(empty); setErr(""); setOpen(true); }}>إضافة حساب فرعي</button>}
      />

      <Toolbar>
        <input className="input" placeholder="ابحث بالرمز أو الاسم…" value={q} onChange={(e) => setQ(e.target.value)} />
        <ToolbarSpacer />
        <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{filtered.length} من {rows.length}</span>
      </Toolbar>

      {loading ? <LoadingState /> : filtered.length === 0 ? <EmptyState text="لا نتائج." /> : (
        <TableWrap>
          <table className="table">
            <thead><tr><th>الرمز</th><th>الاسم</th><th>النوع</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.code}</td>
                  <td>{a.parentId ? "— " : ""}{a.name}</td>
                  <td>{TYPE_LABELS[a.type]}</td>
                  <td>{a.active ? "نشط" : "معطّل"}</td>
                  <td style={{ textAlign: "left" }}>
                    {!a.isSystem && <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => toggleActive(a)}>{a.active ? "تعطيل" : "تفعيل"}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Drawer
        open={open} onClose={() => setOpen(false)} title="إضافة حساب فرعي"
        footer={<><button className="btn btn-primary" onClick={save}>حفظ</button><FormError>{err}</FormError></>}
      >
        <FormGrid>
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
        </FormGrid>
      </Drawer>
    </div>
  );
}
