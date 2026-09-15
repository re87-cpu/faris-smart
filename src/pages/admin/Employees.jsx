// FILE: src/pages/admin/Employees.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchEmployees } from "../../mock/api.js";
import { PageHeader, Toolbar, ToolbarSpacer, StatRow, TableWrap, EmptyState, LoadingSkeleton, FormError } from "../../components/admin/ui.jsx";

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
    <div dir="rtl" className="adm">
      <PageHeader
        title="الموظفون"
        description="قائمة بكل المستخدمين المعتمدين في النظام (مدير + موظفين)."
        actions={<button className="btn btn-ghost" onClick={load} disabled={loading}>تحديث</button>}
      />

      <StatRow items={[
        { value: total, label: "الإجمالي" },
        { value: managers, label: "المديرون" },
        { value: staff, label: "الموظفون" },
      ]} />

      <Toolbar>
        <input className="assign-select" placeholder="بحث باسم/بريد الموظف…" style={{ minWidth: 260 }} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="assign-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">كل الأدوار</option>
          <option value="manager">المديرون فقط</option>
          <option value="staff">الموظفون فقط</option>
        </select>
        <ToolbarSpacer />
      </Toolbar>

      <FormError>{err}</FormError>

      {loading ? <LoadingSkeleton rows={4} /> : filtered.length === 0 ? <EmptyState text="لا يوجد موظفون مطابقون لنتيجة البحث." /> : (
        <TableWrap>
          <table className="table">
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
        </TableWrap>
      )}
    </div>
  );
}
