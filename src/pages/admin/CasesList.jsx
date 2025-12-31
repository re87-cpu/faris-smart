// FILE: src/pages/admin/CasesList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllCases, updateCaseMeta, fetchEmployees } from "../../mock/api.js";
import { toast } from "../../utils/toast.js";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
  open: "قيد الترافع",
  closed: "مغلقة",
  archived: "مؤرشفة",
};

const STATUS_OPTIONS = [
  { value: "open", label: "قيد الترافع" },
  { value: "closed", label: "مغلقة" },
  { value: "archived", label: "مؤرشفة" },
];

export default function CasesList() {
  const nav = useNavigate();

  const [rows, setRows] = useState([]);
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fAssign, setFAssign] = useState("all");
  const [sort, setSort] = useState({ by: "updatedAt", dir: "desc" });
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState({});
  const [savingId, setSavingId] = useState(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [cs, es] = await Promise.all([fetchAllCases(), fetchEmployees()]);
      setRows(cs || []);
      setEmps(es || []);
    } catch (ex) {
      setErr(ex.message || "تعذر التحميل.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const empNameById = useMemo(() => {
    const m = new Map();
    (emps || []).forEach((e) => m.set(String(e.id), e.full_name || e.name || e.email));
    return m;
  }, [emps]);

  function displayAssigned(r) {
    const assigned = r.assignedTo ?? r.assigned_to ?? null;
    if (!assigned) return "";
    return empNameById.get(String(assigned)) || String(assigned);
  }

  function startEdit(row) {
    setEditing((s) => ({
      ...s,
      [row.id]: {
        status: row.status || "open",
        next: normalizeForInput(row.next),
      },
    }));
  }

  function cancelEdit(id) {
    setEditing((s) => {
      const n = { ...s };
      delete n[id];
      return n;
    });
  }

  function changeEdit(id, patch) {
    setEditing((s) => ({ ...s, [id]: { ...(s[id] || {}), ...patch } }));
  }

  async function saveRow(id) {
    const data = editing[id];
    if (!data) return;
    setSavingId(id);
    try {
      const patch = { status: data.status };
      await updateCaseMeta(id, patch);
      await load();
      cancelEdit(id);
      toast("تم حفظ التعديلات.");
    } catch (ex) {
      toast(ex.message || "تعذر حفظ التعديلات.");
    } finally {
      setSavingId(null);
    }
  }

  const filteredSorted = useMemo(() => {
    const text = q.trim().toLowerCase();
    let list = rows.slice();

    if (text) {
      list = list.filter((r) => {
        const assignedText = displayAssigned(r);
        return [r.id, r.title, r.status, assignedText, r.court, r.case_number].some((v) =>
          String(v || "").toLowerCase().includes(text)
        );
      });
    }

    if (fStatus !== "all") list = list.filter((r) => (r.status || "") === fStatus);

    if (fAssign === "assigned") list = list.filter((r) => !!(r.assignedTo ?? r.assigned_to));
    else if (fAssign === "unassigned") list = list.filter((r) => !(r.assignedTo ?? r.assigned_to));

    const toMs = (s) =>
      s ? new Date(String(s).includes("T") ? s : String(s).replace(" ", "T")).getTime() : 0;
    const toNum = (s) => Number(String(s || "").replace(/[^\d]/g, "")) || 0;

    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.by) {
        case "id":
          return (toNum(a.id) - toNum(b.id)) * dir;
        case "title":
          return String(a.title || "").localeCompare(String(b.title || ""), "ar") * dir;
        case "status":
          return String(a.status || "").localeCompare(String(b.status || ""), "ar") * dir;
        case "assignedTo":
          return String(displayAssigned(a) || "").localeCompare(String(displayAssigned(b) || ""), "ar") * dir;
        case "next":
          return (toMs(a.next) - toMs(b.next)) * dir;
        case "updatedAt":
        default:
          return ((toMs(a.updatedAt) || toMs(a.next)) - (toMs(b.updatedAt) || toMs(b.next))) * dir;
      }
    });

    return list;
  }, [rows, q, fStatus, fAssign, sort, empNameById]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, page]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const SortBtn = ({ id, children }) => (
    <button
      className="q-link"
      style={{ padding: 6, borderRadius: 8, border: "1px solid var(--border)" }}
      onClick={() =>
        setSort((s) => ({
          by: id,
          dir: s.by === id && s.dir === "desc" ? "asc" : "desc",
        }))
      }
      title={`فرز حسب ${children} (${sort.by === id ? (sort.dir === "desc" ? "تنازلي" : "تصاعدي") : ""})`}
      aria-label={`فرز حسب ${children}`}
    >
      {children} {sort.by === id ? (sort.dir === "desc" ? "↓" : "↑") : ""}
    </button>
  );

  return (
    <div dir="rtl" style={{ padding: "16px 0", display: "grid", gap: 12 }}>
      <section className="q-card" style={{ padding: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="input"
              placeholder="بحث برقم/عنوان/حالة/مسؤول/محكمة…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              style={{ minWidth: 280 }}
            />

            <select
              className="input"
              value={fStatus}
              onChange={(e) => {
                setFStatus(e.target.value);
                setPage(1);
              }}
              title="فلتر الحالة"
            >
              <option value="all">كل الحالات</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              className="input"
              value={fAssign}
              onChange={(e) => {
                setFAssign(e.target.value);
                setPage(1);
              }}
              title="فلتر الإسناد"
            >
              <option value="all">الكل</option>
              <option value="assigned">مُسنّد</option>
              <option value="unassigned">غير مُسنّد</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link className="q-btn ghost" to="/admin/cases/new">إنشاء قضية</Link>
            <Link className="q-btn ghost" to="/admin/assign">إسناد</Link>
            <button className="q-btn ghost" onClick={load}>تحديث</button>
          </div>
        </div>
      </section>

      <section className="q-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 16 }}>جارٍ التحميل…</div>
        ) : err ? (
          <div className="error" style={{ margin: 12 }}>{err}</div>
        ) : filteredSorted.length === 0 ? (
          <div style={{ padding: 16, color: "var(--ink-600)" }}>لا توجد نتائج.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th><SortBtn id="id">الرقم</SortBtn></th>
                  <th><SortBtn id="title">العنوان</SortBtn></th>
                  <th>المحكمة</th>
                  <th><SortBtn id="status">الحالة</SortBtn></th>
                  <th><SortBtn id="assignedTo">المسؤول</SortBtn></th>
                  <th><SortBtn id="next">الموعد القادم</SortBtn></th>
                  <th><SortBtn id="updatedAt">آخر تحديث</SortBtn></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => {
                  const isEdit = !!editing[r.id];
                  const ed = editing[r.id] || {};
                  return (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>{r.title}</td>
                      <td>{r.court || ""}</td>
                      <td>
                        {!isEdit ? (
                          <span className="badge">{STATUS_LABELS[r.status] || r.status || ""}</span>
                        ) : (
                          <select className="input" value={ed.status} onChange={(e) => changeEdit(r.id, { status: e.target.value })}>
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>{displayAssigned(r)}</td>
                      <td style={{ minWidth: 200 }}>
                        {!isEdit ? (r.next ? new Date(r.next).toLocaleString() : "") : (
                          <input className="input" type="datetime-local" value={ed.next || ""} onChange={(e) => changeEdit(r.id, { next: e.target.value })} />
                        )}
                      </td>
                      <td>
                        {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : r.next ? new Date(r.next).toLocaleString() : ""}
                      </td>
                      <td style={{ textAlign: "left", whiteSpace: "nowrap" }}>
                        {!isEdit ? (
                          <>
                            <button className="q-btn primary" onClick={() => nav(`/admin/cases/${encodeURIComponent(r.id)}`)}>فتح</button>
                            <button className="q-btn ghost" style={{ marginInlineStart: 8 }} onClick={() => startEdit(r)}>تعديل</button>
                          </>
                        ) : (
                          <>
                            <button className="q-btn primary" disabled={savingId === r.id} onClick={() => saveRow(r.id)}>
                              {savingId === r.id ? "يحفظ…" : "حفظ"}
                            </button>
                            <button className="q-btn ghost" style={{ marginInlineStart: 8 }} onClick={() => cancelEdit(r.id)}>إلغاء</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!loading && filteredSorted.length > 0 && (
        <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "var(--ink-600)" }}>
            عرض {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredSorted.length)} من {filteredSorted.length}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="q-btn ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>السابق</button>
            <div className="badge ghost">صفحة {page} / {totalPages}</div>
            <button className="q-btn ghost" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>التالي</button>
          </div>
        </section>
      )}
    </div>
  );
}

function normalizeForInput(dt) {
  if (!dt) return "";
  const s = String(dt);
  if (s.includes("T")) return s.slice(0, 16);
  return s.replace(" ", "T").slice(0, 16);
}
