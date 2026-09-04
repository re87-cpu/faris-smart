// FILE: src/pages/admin/AdminTasks.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listMyTasks, addMyTask, toggleMyTask, deleteMyTask, updateMyTask } from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";

function toDateInputValue(v) {
  if (!v) return "";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch { return ""; }
}

function normalizeTaskForUI(t) {
  const dueRaw = t?.dueAt ?? t?.due_at ?? t?.due ?? null;
  return { id: t?.id, title: t?.title || "", done: !!t?.done, due: toDateInputValue(dueRaw), createdAt: t?.createdAt || t?.created_at || null };
}

export default function AdminTasks() {
  const me = getAuth()?.user || null;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState({ title: "", due: "" });

  async function load() {
    if (!me) return;
    setLoading(true);
    setErr("");
    try {
      const tasks = await listMyTasks();
      setList((tasks || []).map(normalizeTaskForUI));
    } catch (e) {
      setErr(e.message || "تعذّر تحميل المهام.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [me?.id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let arr = list.slice();
    if (s) arr = arr.filter((t) => [t.title, t.id].some((v) => String(v || "").toLowerCase().includes(s)));
    return arr;
  }, [list, q]);

  async function onAdd(e) {
    e.preventDefault();
    setErr("");
    const title = String(form.title || "").trim();
    if (!title) return;
    try {
      setBusyId("add");
      await addMyTask({ title, due_at: form.due ? form.due : null });
      setForm({ title: "", due: "" });
      await load();
    } catch (e2) { setErr(e2.message || "فشل إضافة المهمة."); }
    finally { setBusyId(null); }
  }

  async function onToggle(t) {
    setErr("");
    try { setBusyId(t.id); await toggleMyTask(t.id, !t.done); await load(); }
    catch (e) { setErr(e.message || "تعذّر تحديث المهمة."); }
    finally { setBusyId(null); }
  }

  async function onDelete(t) {
    setErr("");
    if (!window.confirm(`حذف المهمة: "${t.title}" ؟`)) return;
    try { setBusyId(t.id); await deleteMyTask(t.id); await load(); }
    catch (e) { setErr(e.message || "تعذّر حذف المهمة."); }
    finally { setBusyId(null); }
  }

  async function onQuickDate(t, e) {
    setErr("");
    try { setBusyId(t.id); const v = e.target.value || ""; await updateMyTask(t.id, { due_at: v ? v : null }); await load(); }
    catch (ex) { setErr(ex.message || "تعذّر تحديث التاريخ."); }
    finally { setBusyId(null); }
  }

  if (!me) return <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }} dir="rtl">الرجاء تسجيل الدخول.</div>;

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div className="card-title">مهمة جديدة</div>
        <form onSubmit={onAdd} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr auto", gap: 8, marginTop: 10 }}>
          <input className="input" placeholder="عنوان المهمة…" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
          <input className="input" type="date" value={form.due} onChange={(e) => setForm((s) => ({ ...s, due: e.target.value }))} />
          <button className="btn btn-primary" disabled={busyId === "add"}>{busyId === "add" ? "جارٍ الإضافة…" : "إضافة"}</button>
        </form>
      </div>

      {err && <div style={{ color: "#b3261e" }}>{err}</div>}

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <b>مهامي (المدير)</b>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" placeholder="بحث…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn btn-ghost" onClick={load} disabled={loading}>تحديث</button>
          </div>
        </div>

        {loading ? (
          <div style={{ marginTop: 10 }}>جارٍ التحميل…</div>
        ) : filtered.length === 0 ? (
          <div style={{ marginTop: 10, color: "var(--color-neutral-600)" }}>لا توجد مهام.</div>
        ) : (
          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table className="table">
              <thead><tr><th>تم</th><th>العنوان</th><th>تاريخ مستهدف</th><th></th></tr></thead>
              <tbody>
                {filtered.map((t) => {
                  const isBusy = busyId === t.id;
                  return (
                    <tr key={t.id}>
                      <td style={{ textAlign: "center" }}><input type="checkbox" checked={t.done} onChange={() => onToggle(t)} disabled={isBusy} /></td>
                      <td style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.title}</td>
                      <td style={{ minWidth: 160 }}><input className="input" type="date" value={t.due || ""} onChange={(e) => onQuickDate(t, e)} disabled={isBusy} /></td>
                      <td style={{ textAlign: "left" }}><button className="btn btn-ghost" onClick={() => onDelete(t)} disabled={isBusy}>حذف</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
