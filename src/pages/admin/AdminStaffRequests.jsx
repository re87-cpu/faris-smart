// FILE: src/pages/admin/AdminStaffRequests.jsx
import React, { useEffect, useState } from "react";
import { listPendingUsers, approveUser, rejectUser } from "../../mock/api.js";
import { PageHeader, TableWrap, EmptyState, LoadingSkeleton, FormError, ConfirmButton } from "../../components/admin/ui.jsx";

export default function AdminStaffRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await listPendingUsers();
      setRows(Array.isArray(data) ? data : []);
    } catch (ex) {
      console.error(ex);
      setErr(ex.message || "تعذّر تحميل الطلبات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onApprove(id) {
    setErr(""); setBusyId(id);
    try { await approveUser(id); await load(); }
    catch (ex) { console.error(ex); setErr(ex.message || "تعذّر اعتماد الموظف."); }
    finally { setBusyId(null); }
  }

  async function onReject(id) {
    setErr(""); setBusyId(id);
    try { await rejectUser(id); await load(); }
    catch (ex) { console.error(ex); setErr(ex.message || "تعذّر حذف الطلب."); }
    finally { setBusyId(null); }
  }

  function fmtDate(raw) {
    if (!raw) return "";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div dir="rtl" className="adm">
      <PageHeader
        title={`طلبات تحتاج مراجعتك${rows.length ? ` (${rows.length})` : ""}`}
        description="تظهر هنا الحسابات الجديدة التي تنتظر اعتماد المدير قبل السماح لها بالدخول للنظام."
        actions={<button className="btn btn-ghost" onClick={load} disabled={loading}>تحديث</button>}
      />

      <FormError>{err}</FormError>

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : rows.length === 0 ? (
        <EmptyState text="لا توجد طلبات معلّقة." />
      ) : (
        <TableWrap>
          <table className="table">
            <thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>تاريخ الطلب</th><th style={{ textAlign: "left" }}>إجراءات</th></tr></thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name || u.name || "—"}</td>
                  <td>{u.email}</td>
                  <td>{u.role === "manager" ? "مدير" : "موظف"}</td>
                  <td>{fmtDate(u.created_at)}</td>
                  <td style={{ textAlign: "left", whiteSpace: "nowrap" }}>
                    <button className="btn btn-primary" onClick={() => onApprove(u.id)} disabled={busyId === u.id}>
                      {busyId === u.id ? "جارٍ الاعتماد…" : "موافقة"}
                    </button>
                    <ConfirmButton className="btn btn-danger" style={{ marginInlineStart: 8 }} onConfirm={() => onReject(u.id)} disabled={busyId === u.id}>رفض</ConfirmButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </div>
  );
}
