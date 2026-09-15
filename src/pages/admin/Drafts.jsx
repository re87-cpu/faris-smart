// FILE: src/pages/admin/Drafts.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listDrafts, createDraft, deleteDraft, approveDraft, rejectDraft, fetchAllCases } from "../../mock/api.js";
import { toast } from "../../utils/toast.js";
import { TableWrap, EmptyState, LoadingSkeleton, FormError, ConfirmButton } from "../../components/admin/ui.jsx";

const STEPS = ["مسودة", "مراجعة", "اعتماد / رفض"];

export default function Drafts() {
  const [rows, setRows] = useState([]);
  const [cases, setCases] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [caseFilter, setCaseFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
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
      toast("تم حفظ المسودة.");
      await load();
    } catch (ex) { toast(ex.message || "تعذر إنشاء المسودة."); }
  }

  async function onApprove(id) { await approveDraft(id); toast("تم اعتماد المسودة."); await load(); }
  async function onReject(id) { await rejectDraft(id); toast("تم رفض المسودة."); await load(); }
  async function onDelete(id) { await deleteDraft(id); toast("تم حذف المسودة."); await load(); }

  const statusTag = (s) => (s === "approved" ? { cls: "tag-accent", label: "معتمدة" } : s === "rejected" ? { cls: "tag-outline", label: "مرفوضة" } : { cls: "tag-outline", label: "معلّقة" });

  return (
    <div dir="rtl" className="adm" style={{ maxWidth: 820 }}>
      <div style={{ paddingBottom: 22, borderBottom: "1px solid var(--color-divider)" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 700, margin: 0 }}>المسودات</h1>
      </div>

      <div className="adm-steps" style={{ maxWidth: 420, padding: "22px 0 26px" }}>
        <div className="adm-steps-line" style={{ top: 29, insetInline: "8%" }} />
        <div className="adm-steps-row">
          {STEPS.map((label, i) => (
            <div className="adm-steps-item" key={label}>
              <span className={`adm-steps-dot${i === 0 ? " done" : ""}`} style={{ width: 9, height: 9 }} />
              <span className={`adm-steps-label${i === 0 ? " on" : ""}`} style={{ fontSize: 12, marginTop: 10 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "26px 0", borderBottom: "1px solid var(--color-divider)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="adm-quick-title" style={{ margin: 0 }}>مسودة جديدة</div>
        <form onSubmit={onCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <input className="assign-select" placeholder="عنوان المسودة" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
            <select className="assign-select" value={form.caseId} onChange={(e) => setForm((s) => ({ ...s, caseId: e.target.value }))}>
              <option value="">— غير مرتبطة —</option>
              {cases.map((c) => <option key={c.id} value={c.id}>#{c.id} — {c.title}</option>)}
            </select>
          </div>
          <textarea className="assign-select" style={{ minHeight: 100, resize: "none" }} placeholder="المحتوى…" value={form.body} onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))} />
          <div><button className="btn btn-primary">حفظ</button></div>
        </form>
      </div>

      <div style={{ paddingTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div className="adm-quick-title" style={{ margin: 0 }}>المسودات الحالية</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <input className="assign-select" placeholder="بحث بالعنوان/النص/الرقم…" style={{ minWidth: 220 }} value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="assign-select" style={{ width: 140 }} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">كل الحالات</option>
              <option value="pending">معلّقة</option>
              <option value="approved">معتمدة</option>
              <option value="rejected">مرفوضة</option>
            </select>
            <select className="assign-select" style={{ width: 160 }} value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)}>
              <option value="all">كل القضايا</option>
              {cases.map((c) => <option key={c.id} value={c.id}>#{c.id} — {c.title}</option>)}
            </select>
          </div>
        </div>

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
      </div>
    </div>
  );
}
