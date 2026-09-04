// FILE: src/pages/staff/StaffArticles.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listMyArticles, createArticle, updateArticle, deleteArticle } from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";
import { toast } from "../../utils/toast.js";

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

export default function StaffArticles() {
  const me = getAuth()?.user || null;
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const list = await listMyArticles();
      setRows((list || []).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (ex) {
      setErr(ex.message || "تعذّر تحميل المقالات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [me?.id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((a) => [a.title, a.content].some((v) => String(v || "").toLowerCase().includes(s)));
  }, [rows, q]);

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
        toast("تم إرسال المقال للمراجعة.");
      }
      setForm(EMPTY);
      await load();
    } catch (ex) {
      toast(ex.message || "تعذّر حفظ المقال.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("حذف المقال؟")) return;
    try { await deleteArticle(id); toast("تم الحذف."); await load(); }
    catch (ex) { toast(ex.message || "تعذّر الحذف."); }
  }
  function onEdit(a) {
    setForm({ id: a.id, title: a.title, content: a.content });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!me) {
    return <div className="q-card" style={{ padding: 16 }} dir="rtl">الرجاء تسجيل الدخول.</div>;
  }

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div className="card-title">{form.id ? "تعديل مقال" : "مقال جديد"}</div>
        <div style={{ fontSize: 12, color: "var(--color-neutral-600)", marginTop: 2 }}>
          يُراجع المدير المقال قبل نشره في صفحة المقالات العامة.
        </div>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <input
            className="input"
            placeholder="عنوان المقال"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            required
          />
          <textarea
            className="input"
            placeholder="نص المقال…"
            value={form.content}
            onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
            style={{ minHeight: 180 }}
            required
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "جارٍ الحفظ…" : form.id ? "حفظ التعديل" : "إرسال للمراجعة"}
            </button>
            {form.id && (
              <button type="button" className="btn btn-ghost" onClick={() => setForm(EMPTY)}>إلغاء</button>
            )}
          </div>
        </form>
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <b>مقالاتي</b>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" placeholder="بحث…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn btn-ghost" onClick={load}>تحديث</button>
          </div>
        </div>

        {loading ? (
          <div style={{ marginTop: 12 }}>جارٍ التحميل…</div>
        ) : filtered.length === 0 ? (
          <div style={{ marginTop: 12, color: "var(--color-neutral-600)" }}>لا توجد مقالات.</div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr><th>العنوان</th><th>الحالة</th><th>التاريخ</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const st = STATUS[a.status] || STATUS.pending;
                  const editable = a.status === "pending" || a.status === "rejected";
                  return (
                    <tr key={a.id}>
                      <td>{a.title}</td>
                      <td><span className={`tag ${st.cls}`}>{st.label}</span></td>
                      <td>{fmt(a.publishedAt || a.createdAt)}</td>
                      <td style={{ textAlign: "left", whiteSpace: "nowrap" }}>
                        {editable && (
                          <button className="btn btn-ghost" onClick={() => onEdit(a)}>تعديل</button>
                        )}
                        <button className="btn btn-ghost" style={{ marginInlineStart: 8 }} onClick={() => onDelete(a.id)}>حذف</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {err && <div style={{ marginTop: 10, color: "#b3261e" }}>{err}</div>}
      </div>
    </div>
  );
}
