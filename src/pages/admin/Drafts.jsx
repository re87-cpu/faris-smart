// FILE: src/pages/admin/Drafts.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listDrafts, createDraft, deleteDraft, approveDraft, rejectDraft, fetchAllCases } from "../../mock/api.js";
import { toast } from "../../utils/toast.js";
import { PageHeader, Toolbar, ToolbarSpacer, TableWrap, EmptyState, LoadingSkeleton, FormError, Drawer, Field, FormGrid, ConfirmButton } from "../../components/admin/ui.jsx";

export default function Drafts() {
  const [rows, setRows] = useState([]);
  const [cases, setCases] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [caseFilter, setCaseFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", caseId: "" });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [allCases, drafts] = await Promise.all([fetchAllCases(), listDrafts(status === "all" ? {} : { status })]);
      setCases(allCases || []);
      setRows(drafts || []);
    } catch (ex) {
      setErr(ex.message || "تعذر التحميل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const filtered = useMemo(() => {
    let list = rows.slice();
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((d) => [d.title, d.body, d.id, d.caseId].some((v) => String(v || "").toLowerCase().includes(s)));
    if (caseFilter !== "all") list = list.filter((d) => String(d.caseId || "") === String(caseFilter));
    return list;
  }, [rows, q, caseFilter]);

  async function onCreate(e) {
    e.preventDefault();
    try {
      await createDraft({ title: form.title, body: form.body, caseId: form.caseId || null, authorId: null });
      setForm({ title: "", body: "", caseId: "" });
      setOpen(false);
      toast("تم حفظ المسودة.");
      await load();
    } catch (ex) { toast(ex.message || "تعذر إنشاء المسودة."); }
  }

  async function onApprove(id) { await approveDraft(id); toast("تم اعتماد المسودة."); await load(); }
  async function onReject(id) { await rejectDraft(id); toast("تم رفض المسودة."); await load(); }
  async function onDelete(id) { await deleteDraft(id); toast("تم حذف المسودة."); await load(); }

  const statusTag = (s) => (s === "approved" ? { cls: "tag-accent", label: "معتمدة" } : s === "rejected" ? { cls: "tag-outline", label: "مرفوضة" } : { cls: "tag-outline", label: "معلّقة" });

  return (
    <div dir="rtl" className="adm">
      <PageHeader
        title="المسودات"
        actions={<button className="btn btn-primary" onClick={() => setOpen(true)}>مسودة جديدة</button>}
      />

      <Toolbar>
        <input className="input" placeholder="بحث بالعنوان/النص/الرقم…" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 280 }} />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">كل الحالات</option>
          <option value="pending">معلّقة</option>
          <option value="approved">معتمدة</option>
          <option value="rejected">مرفوضة</option>
        </select>
        <select className="input" value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)}>
          <option value="all">كل القضايا</option>
          {cases.map((c) => <option key={c.id} value={c.id}>#{c.id} — {c.title}</option>)}
        </select>
        <ToolbarSpacer />
        <button className="btn btn-ghost" onClick={load}>تحديث</button>
      </Toolbar>

      <FormError>{err}</FormError>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState text="لا توجد مسودات." />
      ) : (
        <TableWrap>
          <table className="table">
            <thead><tr><th>العنوان</th><th>القضية</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead>
            <tbody>
              {filtered.map((d) => {
                const st = statusTag(d.status);
                return (
                  <tr key={d.id}>
                    <td>{d.title}</td>
                    <td>{d.caseId ? `#${d.caseId}` : "—"}</td>
                    <td><span className={`tag ${st.cls}`}>{st.label}</span></td>
                    <td>{new Date(d.ts).toLocaleString()}</td>
                    <td style={{ textAlign: "left", whiteSpace: "nowrap" }}>
                      {d.status === "pending" && (
                        <>
                          <button className="btn btn-primary" onClick={() => onApprove(d.id)}>اعتماد</button>
                          <button className="btn btn-danger" style={{ marginInlineStart: 8 }} onClick={() => onReject(d.id)}>رفض</button>
                        </>
                      )}
                      <ConfirmButton style={{ marginInlineStart: 8 }} onConfirm={() => onDelete(d.id)}>حذف</ConfirmButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="مسودة جديدة"
        footer={
          <>
            <button className="btn btn-primary" form="new-draft-form">حفظ</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setForm({ title: "", body: "", caseId: "" }); setOpen(false); }}>إلغاء</button>
          </>
        }
      >
        <form id="new-draft-form" onSubmit={onCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormGrid>
            <Field label="عنوان المسودة">
              <input className="input" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
            </Field>
            <Field label="القضية">
              <select className="input" value={form.caseId} onChange={(e) => setForm((s) => ({ ...s, caseId: e.target.value }))}>
                <option value="">— غير مرتبطة —</option>
                {cases.map((c) => <option key={c.id} value={c.id}>#{c.id} — {c.title}</option>)}
              </select>
            </Field>
          </FormGrid>
          <Field label="المحتوى">
            <textarea className="input" placeholder="المحتوى…" value={form.body} onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))} style={{ minHeight: 220 }} />
          </Field>
        </form>
      </Drawer>
    </div>
  );
}
