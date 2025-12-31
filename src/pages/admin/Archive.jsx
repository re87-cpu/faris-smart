// FILE: src/pages/admin/Archive.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchAllCases,
  reopenCase,
  deleteCase,
} from "../../mock/api.js";

export default function Archive() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ by: "closedAt", dir: "desc" });
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const cs = await fetchAllCases();
      // نعرض فقط القضايا المغلقة أو المؤرشفة (من الـ DB: closed / archived)
      setRows(
        (cs || []).filter(
          (c) => c.status === "closed" || c.status === "archived"
        )
      );
    } catch (ex) {
      console.error(ex);
      setErr(ex.message || "تعذر التحميل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = rows.slice();

    if (s) {
      list = list.filter((r) =>
        [
          r.id,
          r.case_number,
          r.title,
          r.court,
          r.assignedName || r.assignedTo,
        ].some((v) => String(v || "").toLowerCase().includes(s))
      );
    }

    const toMs = (x) =>
      x
        ? new Date(
            String(x).includes("T") ? x : String(x).replace(" ", "T")
          ).getTime()
        : 0;
    const toNum = (x) =>
      Number(String(x || "").replace(/[^\d]/g, "")) || 0;

    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const aClosedAt = a.updatedAt || a.created_at || null;
      const bClosedAt = b.updatedAt || b.created_at || null;

      switch (sort.by) {
        case "id":
          return (toNum(a.id) - toNum(b.id)) * dir;
        case "title":
          return (
            String(a.title || "").localeCompare(
              String(b.title || ""),
              "ar"
            ) * dir
          );
        case "closedAt":
        default:
          return (toMs(aClosedAt) - toMs(bClosedAt)) * dir;
      }
    });

    return list;
  }, [rows, q, sort]);

  async function onReopen(id) {
    try {
      await reopenCase(id);
      await load();
    } catch (ex) {
      console.error(ex);
      alert(ex.message || "تعذر إعادة فتح القضية.");
    }
  }

  async function onDelete(id, title) {
    const ok = window.confirm(
      `سيتم حذف القضية نهائياً من النظام.\nرقم/معرّف: ${id}\nالعنوان: ${title || ""}\nهل أنتِ متأكدة؟`
    );
    if (!ok) return;
    try {
      await deleteCase(id);
      await load();
    } catch (ex) {
      console.error(ex);
      alert(ex.message || "تعذر حذف القضية.");
    }
  }

  const SortBtn = ({ id, children }) => (
    <button
      className="q-link"
      style={{
        padding: 6,
        borderRadius: 8,
        border: "1px solid var(--border)",
      }}
      onClick={() =>
        setSort((s) => ({
          by: id,
          dir: s.by === id && s.dir === "desc" ? "asc" : "desc",
        }))
      }
      title={`فرز حسب ${children}`}
    >
      {children} {sort.by === id ? (sort.dir === "desc" ? "↓" : "↑") : ""}
    </button>
  );

  return (
    <div dir="rtl" style={{ padding: "16px 0", display: "grid", gap: 12 }}>
      <section className="q-card" style={{ padding: 16 }}>
        <b>الأرشيف (قضايا مغلقة / مؤرشفة)</b>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            className="input"
            placeholder="بحث برقم/عنوان/محكمة/مسؤول…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="q-btn ghost" onClick={load}>
            تحديث
          </button>
        </div>
      </section>

      <section className="q-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 16 }}>جارٍ التحميل…</div>
        ) : err ? (
          <div className="error" style={{ margin: 12 }}>
            {err}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 16, color: "var(--ink-600)" }}>
            لا توجد قضايا مغلقة أو مؤرشفة.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <SortBtn id="id">الرقم</SortBtn>
                  </th>
                  <th>
                    <SortBtn id="title">العنوان</SortBtn>
                  </th>
                  <th>المحكمة</th>
                  <th>المسؤول</th>
                  <th>
                    <SortBtn id="closedAt">تاريخ الإغلاق/الأرشفة</SortBtn>
                  </th>
                  <th>التالي</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const closedAt = r.updatedAt || r.created_at || null;
                  return (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>{r.title}</td>
                      <td>{r.court || "—"}</td>
                      <td>{r.assignedName || r.assignedTo || "—"}</td>
                      <td>
                        {closedAt
                          ? new Date(closedAt).toLocaleString()
                          : "—"}
                      </td>
                      <td>{r.next || "—"}</td>
                      <td
                        style={{
                          textAlign: "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <button
                          className="q-btn primary"
                          onClick={() => onReopen(r.id)}
                        >
                          إعادة فتح
                        </button>
                        <button
                          className="q-btn ghost"
                          style={{ marginInlineStart: 8 }}
                          onClick={() => onDelete(r.id, r.title)}
                        >
                          حذف نهائي
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
