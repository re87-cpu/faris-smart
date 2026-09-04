// FILE: src/pages/admin/Employees.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchEmployees } from "../../mock/api.js";

function fmtDate(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Employees() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const list = await fetchEmployees();
      setRows(Array.isArray(list) ? list : []);
    } catch (ex) {
      console.error(ex);
      setErr(ex.message || "تعذّر تحميل بيانات الموظفين.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    let list = rows.slice();
    if (text) list = list.filter((u) => [u.name, u.full_name, u.email].some((v) => String(v || "").toLowerCase().includes(text)));
    if (roleFilter !== "all") list = list.filter((u) => (roleFilter === "manager" ? u.role === "manager" : u.role !== "manager"));
    return list;
  }, [rows, q, roleFilter]);

  const total = rows.length;
  const managers = rows.filter((u) => u.role === "manager").length;
  const staff = total - managers;

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div className="card-title">الموظفون</div>
            <div style={{ color: "var(--color-neutral-600)", marginTop: 4 }}>قائمة بكل المستخدمين المعتمدين في النظام (مدير + موظفين).</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="tag tag-outline">الإجمالي: {total}</span>
            <span className="tag tag-outline">المديرون: {managers}</span>
            <span className="tag tag-outline">الموظفون: {staff}</span>
            <button className="btn btn-ghost" onClick={load} disabled={loading}>تحديث</button>
          </div>
        </div>
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input className="input" placeholder="بحث باسم/بريد الموظف…" style={{ minWidth: 260 }} value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">كل الأدوار</option>
            <option value="manager">المديرون فقط</option>
            <option value="staff">الموظفون فقط</option>
          </select>
        </div>
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 16 }}>جارٍ التحميل…</div>
        ) : err ? (
          <div style={{ margin: 12, color: "#b3261e" }}>{err}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 16, color: "var(--color-neutral-600)" }}>لا يوجد موظفون مطابقون لنتيجة البحث.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ margin: 0 }}>
              <thead><tr><th>الاسم</th><th>البريد الإلكتروني</th><th>الدور</th><th>تاريخ الإضافة</th></tr></thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name || u.full_name || "—"}</td>
                    <td>{u.email}</td>
                    <td>{u.role === "manager" ? "مدير" : "موظف"}</td>
                    <td>{fmtDate(u.createdAt || u.created_at)}</td>
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
