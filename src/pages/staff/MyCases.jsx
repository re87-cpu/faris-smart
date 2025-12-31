// FILE: src/pages/staff/MyCases.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyCases } from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";

export default function MyCases() {
  const nav = useNavigate();
  const me = getAuth()?.user || null; // {id,name,email}
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ by: "updatedAt", dir: "desc" });

  async function load() {
    if (!me) return;
    setLoading(true);
    setErr("");
    try {
      const cs = await fetchMyCases(); // /my/cases من الـ API

      const normalized = (cs || []).map((c) => ({
        ...c,
        court: c.court || null,
        next: c.next || "",
        // ✅ الباكند يرجّع updated_at وليس updatedAt
        updatedAt: c.updated_at || c.created_at || null,
      }));

      setRows(normalized);
    } catch (ex) {
      setErr(ex.message || "تعذر التحميل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [me?.id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const toMs = (v) =>
      v
        ? new Date(String(v).includes("T") ? v : String(v).replace(" ", "T")).getTime()
        : 0;

    let list = rows.slice();
    if (s)
      list = list.filter((r) =>
        [r.id, r.case_number, r.title, r.status, r.court].some((v) =>
          String(v || "").toLowerCase().includes(s)
        )
      );

    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.by) {
        case "id":
          return (Number(a.id) - Number(b.id)) * dir;
        case "title":
          return (
            String(a.title || "").localeCompare(String(b.title || ""), "ar") * dir
          );
        case "status":
          return (
            String(a.status || "").localeCompare(String(b.status || ""), "ar") * dir
          );
        case "next":
          return (toMs(a.next) - toMs(b.next)) * dir;
        case "updatedAt":
        default:
          return (toMs(a.updatedAt || a.next) - toMs(b.updatedAt || b.next)) * dir;
      }
    });

    return list;
  }, [rows, q, sort]);

  const SortBtn = ({ id, children }) => (
    <button
      className="q-link"
      style={{
        padding: 6,
        border: "1px solid var(--border)",
        borderRadius: 8,
      }}
      onClick={() =>
        setSort((s) => ({
          by: id,
          dir: s.by === id && s.dir === "desc" ? "asc" : "desc",
        }))
      }
      type="button"
    >
      {children} {sort.by === id ? (sort.dir === "desc" ? "↓" : "↑") : ""}
    </button>
  );

  if (!me)
    return (
      <div className="q-card" style={{ padding: 16 }}>
        الرجاء تسجيل الدخول.
      </div>
    );

  return (
    <div dir="rtl" style={{ display: "grid", gap: 12, padding: "16px 0" }}>
      <section className="q-card" style={{ padding: 12 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <input
            className="input"
            placeholder="بحث برقم/عنوان/حالة/محكمة…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 260 }}
          />
          <button className="q-btn ghost" onClick={load} type="button">
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
            لا توجد قضايا مُسندة لك.
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
                  <th>
                    <SortBtn id="status">الحالة</SortBtn>
                  </th>
                  <th>
                    <SortBtn id="next">الموعد القادم</SortBtn>
                  </th>
                  <th>
                    <SortBtn id="updatedAt">آخر تحديث</SortBtn>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{r.case_number ? r.case_number : `#${r.id}`}</td>
                    <td>{r.title}</td>
                    <td>{r.court || "—"}</td>
                    <td>
                      <span className="badge">{r.status || "—"}</span>
                    </td>
                    <td>{r.next || "—"}</td>
                    <td>{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</td>
                    <td style={{ textAlign: "left" }}>
                      <button
                        className="q-btn primary"
                        onClick={() => nav(`/staff/cases/${encodeURIComponent(r.id)}`)}
                        type="button"
                      >
                        فتح
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
