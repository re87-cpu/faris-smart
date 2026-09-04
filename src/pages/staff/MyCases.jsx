// FILE: src/pages/staff/MyCases.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyCases } from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";

export default function MyCases() {
  const nav = useNavigate();
  const me = getAuth()?.user || null;
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
      const cs = await fetchMyCases();
      setRows((cs || []).map((c) => ({ ...c, court: c.court || null, next: c.next || "", updatedAt: c.updated_at || c.created_at || null })));
    } catch (ex) {
      setErr(ex.message || "تعذر التحميل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [me?.id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const toMs = (v) => (v ? new Date(String(v).includes("T") ? v : String(v).replace(" ", "T")).getTime() : 0);
    let list = rows.slice();
    if (s) list = list.filter((r) => [r.id, r.case_number, r.title, r.status, r.court].some((v) => String(v || "").toLowerCase().includes(s)));
    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.by) {
        case "id": return (Number(a.id) - Number(b.id)) * dir;
        case "title": return String(a.title || "").localeCompare(String(b.title || ""), "ar") * dir;
        case "status": return String(a.status || "").localeCompare(String(b.status || ""), "ar") * dir;
        case "next": return (toMs(a.next) - toMs(b.next)) * dir;
        case "updatedAt":
        default: return (toMs(a.updatedAt || a.next) - toMs(b.updatedAt || b.next)) * dir;
      }
    });
    return list;
  }, [rows, q, sort]);

  const SortBtn = ({ id, children }) => (
    <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 13 }} onClick={() => setSort((s) => ({ by: id, dir: s.by === id && s.dir === "desc" ? "asc" : "desc" }))} type="button">
      {children} {sort.by === id ? (sort.dir === "desc" ? "↓" : "↑") : ""}
    </button>
  );

  if (!me) return <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>الرجاء تسجيل الدخول.</div>;

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", flexWrap: "wrap" }}>
          <input className="input" placeholder="بحث برقم/عنوان/حالة/محكمة…" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 260 }} />
          <button className="btn btn-ghost" onClick={load} type="button">تحديث</button>
        </div>
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 16 }}>جارٍ التحميل…</div>
        ) : err ? (
          <div style={{ margin: 12, color: "#b3261e" }}>{err}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 16, color: "var(--color-neutral-600)" }}>لا توجد قضايا مُسندة لك.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th><SortBtn id="id">الرقم</SortBtn></th>
                  <th><SortBtn id="title">العنوان</SortBtn></th>
                  <th>المحكمة</th>
                  <th><SortBtn id="status">الحالة</SortBtn></th>
                  <th><SortBtn id="next">الموعد القادم</SortBtn></th>
                  <th><SortBtn id="updatedAt">آخر تحديث</SortBtn></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{r.case_number ? r.case_number : `#${r.id}`}</td>
                    <td>{r.title}</td>
                    <td>{r.court || "—"}</td>
                    <td><span className="tag tag-accent">{r.status || "—"}</span></td>
                    <td>{r.next || "—"}</td>
                    <td>{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</td>
                    <td style={{ textAlign: "left" }}><button className="btn btn-primary" onClick={() => nav(`/staff/cases/${encodeURIComponent(r.id)}`)} type="button">فتح</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
