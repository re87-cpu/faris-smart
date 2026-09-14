// FILE: src/pages/admin/AdminArticles.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  listArticles,
  listMyArticles,
  createArticle,
  updateArticle,
  approveArticle,
  rejectArticle,
  deleteArticle,
} from "../../mock/api.js";
import { toast } from "../../utils/toast.js";
import { PageHeader, Toolbar, ToolbarSpacer, TableWrap, EmptyState, LoadingSkeleton, FormError, Drawer, Field, ConfirmButton } from "../../components/admin/ui.jsx";

const STATUS = {
  published: { cls: "tag-accent", label: "منشور" },
  pending: { cls: "tag-outline", label: "قيد المراجعة" },
  rejected: { cls: "tag-outline", label: "مرفوض" },
};

function fmt(v) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("ar-SA");
}

const EMPTY = { id: null, title: "", content: "" };

export default function AdminArticles() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      // المدير يرى كل المقالات؛ لو الباكند ما يرجّع الكل نكمّل بمقالاته
      let all = [];
      try {
        all = await listArticles({ limit: 500 });
      } catch {
        all = [];
      }
      let mine = [];
      try {
        mine = await listMyArticles();
      } catch {
        mine = [];
      }
      const byId = new Map();
      [...all, ...mine].forEach((a) => byId.set(a.id, a));
      const merged = [...byId.values()].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setRows(merged);
    } catch (ex) {
      setErr(ex.message || "تعذّر تحميل المقالات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = rows.slice();
    if (status !== "all") list = list.filter((a) => a.status === status);
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter((a) =>
        [a.title, a.content, a.authorName].some((v) => String(v || "").toLowerCase().includes(s))
      );
    }
    return list;
  }, [rows, q, status]);

  async function onSubmit(e) {
    e.preventDefault();
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) return;
    setBusy(true);
    try {
      if (form.id) {
        await updateArticle(form.id, { title, content });
        toast("تم تحديث المقال.");
      } else {
        await createArticle({ title, content });
        toast("تم نشر المقال.");
      }
      setForm(EMPTY);
      setOpen(false);
      await load();
    } catch (ex) {
      toast(ex.message || "تعذّر حفظ المقال.");
    } finally {
      setBusy(false);
    }
  }

  async function onApprove(id) {
    try { await approveArticle(id); toast("تم نشر المقال."); await load(); }
    catch (ex) { toast(ex.message || "تعذّر النشر."); }
  }
  async function onReject(id) {
    try { await rejectArticle(id); toast("تم رفض المقال."); await load(); }
    catch (ex) { toast(ex.message || "تعذّر الرفض."); }
  }
  async function onDelete(id) {
    try { await deleteArticle(id); toast("تم حذف المقال."); await load(); }
    catch (ex) { toast(ex.message || "تعذّر الحذف."); }
  }
  function onEdit(a) {
    setForm({ id: a.id, title: a.title, content: a.content });
    setOpen(true);
  }
  function onNew() {
    setForm(EMPTY);
    setOpen(true);
  }

  return (
    <div dir="rtl" className="adm">
      <PageHeader
        title="المقالات"
        description="مقالات المدير تُنشر مباشرة في صفحة المقالات العامة."
        actions={<button className="btn btn-primary" onClick={onNew}>مقال جديد</button>}
      />

      <Toolbar>
        <input
          className="input"
          placeholder="بحث بالعنوان/النص/الكاتب…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">كل الحالات</option>
          <option value="pending">قيد المراجعة</option>
          <option value="published">منشور</option>
          <option value="rejected">مرفوض</option>
        </select>
        <ToolbarSpacer />
        <button className="btn btn-ghost" onClick={load}>تحديث</button>
      </Toolbar>

      <FormError>{err}</FormError>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState text="لا توجد مقالات." />
      ) : (
        <TableWrap>
          <table className="table">
            <thead>
              <tr><th>العنوان</th><th>الكاتب</th><th>الحالة</th><th>التاريخ</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const st = STATUS[a.status] || STATUS.pending;
                return (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.authorName || "—"}</td>
                    <td><span className={`tag ${st.cls}`}>{st.label}</span></td>
                    <td>{fmt(a.publishedAt || a.createdAt)}</td>
                    <td style={{ textAlign: "left", whiteSpace: "nowrap" }}>
                      {a.status === "pending" && (
                        <>
                          <button className="btn btn-primary" onClick={() => onApprove(a.id)}>نشر</button>
                          <button className="btn btn-danger" style={{ marginInlineStart: 8 }} onClick={() => onReject(a.id)}>رفض</button>
                        </>
                      )}
                      {a.status === "rejected" && (
                        <button className="btn btn-primary" onClick={() => onApprove(a.id)}>نشر</button>
                      )}
                      <button className="btn btn-ghost" style={{ marginInlineStart: 8 }} onClick={() => onEdit(a)}>تعديل</button>
                      <ConfirmButton style={{ marginInlineStart: 8 }} onConfirm={() => onDelete(a.id)}>حذف</ConfirmButton>
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
        title={form.id ? "تعديل مقال" : "مقال جديد"}
        footer={
          <>
            <button className="btn btn-primary" form="article-form" disabled={busy}>
              {busy ? "جارٍ الحفظ…" : form.id ? "حفظ التعديل" : "نشر"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>إلغاء</button>
          </>
        }
      >
        <form id="article-form" onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="عنوان المقال">
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              required
            />
          </Field>
          <Field label="نص المقال">
            <textarea
              className="input"
              placeholder="نص المقال…"
              value={form.content}
              onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
              style={{ minHeight: 260 }}
              required
            />
          </Field>
        </form>
      </Drawer>
    </div>
  );
}
