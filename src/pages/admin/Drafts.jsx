// FILE: src/pages/admin/Drafts.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  listDrafts,
  createDraft,
  deleteDraft,
  approveDraft,
  rejectDraft,
  fetchAllCases,
} from "../../mock/api.js";
import { toast } from "../../utils/toast.js";

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
      const [allCases, drafts] = await Promise.all([
        fetchAllCases(),
        listDrafts(status === "all" ? {} : { status }),
      ]);
      setCases(allCases || []);
      setRows(drafts || []);
    } catch (ex) {
      setErr(ex.message || "تعذر التحميل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    let list = rows.slice();
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter((d) =>
        [d.title, d.body, d.id, d.caseId].some((v) =>
          String(v || "").toLowerCase().includes(s)
        )
      );
    }
    if (caseFilter !== "all") {
      list = list.filter(
        (d) => String(d.caseId || "") === String(caseFilter)
      );
    }
    return list;
  }, [rows, q, caseFilter]);

  async function onCreate(e) {
    e.preventDefault();
    try {
      await createDraft({
        title: form.title,
        body: form.body,
        caseId: form.caseId || null,
        authorId: null,
      });
      setForm({ title: "", body: "", caseId: "" });
      toast("تم حفظ المسودة.");
      await load();
    } catch (ex) {
      toast(ex.message || "تعذر إنشاء المسودة.");
    }
  }

  async function onApprove(id) {
    await approveDraft(id);
    toast("تم اعتماد المسودة.");
    await load();
  }

  async function onReject(id) {
    await rejectDraft(id);
    toast("تم رفض المسودة.");
    await load();
  }

  async function onDelete(id) {
    if (!window.confirm("حذف المسودة؟")) return;
    await deleteDraft(id);
    toast("تم حذف المسودة.");
    await load();
  }

  return (
    <div dir="rtl" style={{ padding: "16px 0", display: "grid", gap: 12 }}>
      <section className="q-card" style={{ padding: 16 }}>
        <b style={{ display: "block", marginBottom: 10 }}>مسودة جديدة</b>
        <form
          onSubmit={onCreate}
          className="form"
          style={{ display: "grid", gap: 10 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <input
              className="input"
              placeholder="عنوان المسودة"
              value={form.title}
              onChange={(e) =>
                setForm((s) => ({ ...s, title: e.target.value }))
              }
              required
            />
            <select
              className="input"
              value={form.caseId}
              onChange={(e) =>
                setForm((s) => ({ ...s, caseId: e.target.value }))
              }
            >
              <option value="">— غير مرتبطة —</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="input"
            placeholder="المحتوى…"
            value={form.body}
            onChange={(e) =>
              setForm((s) => ({ ...s, body: e.target.value }))
            }
            style={{ minHeight: 140, padding: "12px 14px" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="q-btn primary">حفظ</button>
            <button
              type="reset"
              className="q-btn ghost"
              onClick={() => setForm({ title: "", body: "", caseId: "" })}
            >
              مسح
            </button>
          </div>
        </form>
      </section>

      <section className="q-card" style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="input"
              placeholder="بحث بالعنوان/النص/الرقم…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ minWidth: 280 }}
            />
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">كل الحالات</option>
              <option value="pending">معلّقة</option>
              <option value="approved">معتمدة</option>
              <option value="rejected">مرفوضة</option>
            </select>
            <select
              className="input"
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
            >
              <option value="all">كل القضايا</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="q-btn ghost" onClick={load}>
              تحديث
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ marginTop: 12 }}>جارٍ التحميل…</div>
        ) : filtered.length === 0 ? (
          <div style={{ marginTop: 12, color: "var(--ink-600)" }}>
            لا توجد مسودات.
          </div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>القضية</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id}>
                    <td>{d.title}</td>
                    <td>{d.caseId ? `#${d.caseId}` : "—"}</td>
                    <td>
                      <span
                        className={`badge ${
                          d.status === "approved"
                            ? "sky"
                            : d.status === "rejected"
                            ? "rose"
                            : ""
                        }`}
                      >
                        {d.status === "pending"
                          ? "معلّقة"
                          : d.status === "approved"
                          ? "معتمدة"
                          : "مرفوضة"}
                      </span>
                    </td>
                    <td>{new Date(d.ts).toLocaleString()}</td>
                    <td
                      style={{
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.status === "pending" && (
                        <>
                          <button
                            className="q-btn primary"
                            onClick={() => onApprove(d.id)}
                          >
                            اعتماد
                          </button>
                          <button
                            className="q-btn ghost"
                            style={{ marginInlineStart: 8 }}
                            onClick={() => onReject(d.id)}
                          >
                            رفض
                          </button>
                        </>
                      )}
                      <button
                        className="q-btn ghost"
                        style={{ marginInlineStart: 8 }}
                        onClick={() => onDelete(d.id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {err && (
          <div className="error" style={{ marginTop: 10 }}>
            {err}
          </div>
        )}
      </section>
    </div>
  );
}
