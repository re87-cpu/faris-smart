// FILE: src/pages/admin/AdminStaffRequests.jsx
import React, { useEffect, useState } from "react";
import {
  listPendingUsers,
  approveUser,
  rejectUser,
} from "../../mock/api.js";

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

  useEffect(() => {
    load();
  }, []);

  async function onApprove(id) {
    if (!window.confirm("تأكيد اعتماد هذا الموظف ومنحه صلاحية الدخول؟")) {
      return;
    }
    setErr("");
    setBusyId(id);
    try {
      await approveUser(id);
      await load();
    } catch (ex) {
      console.error(ex);
      setErr(ex.message || "تعذّر اعتماد الموظف.");
    } finally {
      setBusyId(null);
    }
  }

  async function onReject(id) {
    if (!window.confirm("تأكيد رفض/حذف هذا الطلب؟")) {
      return;
    }
    setErr("");
    setBusyId(id);
    try {
      await rejectUser(id);
      await load();
    } catch (ex) {
      console.error(ex);
      setErr(ex.message || "تعذّر حذف الطلب.");
    } finally {
      setBusyId(null);
    }
  }

  function fmtDate(raw) {
    if (!raw) return "";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div dir="rtl" style={{ padding: "16px 0", display: "grid", gap: 12 }}>
      <section className="q-card" style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "var(--accent-dark)",
              }}
            >
              طلبات إنشاء حساب موظف
            </div>
            <div style={{ color: "var(--ink-600)", marginTop: 4 }}>
              تظهر هنا الحسابات الجديدة التي تنتظر اعتماد المدير قبل السماح
              لها بالدخول للنظام.
            </div>
          </div>
          <button className="q-btn ghost" onClick={load} disabled={loading}>
            تحديث
          </button>
        </div>
      </section>

      <section className="q-card" style={{ padding: 16 }}>
        {loading ? (
          <div>جارٍ التحميل…</div>
        ) : err ? (
          <div className="error">{err}</div>
        ) : rows.length === 0 ? (
          <div style={{ color: "var(--ink-500)" }}>لا توجد طلبات معلّقة.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>البريد</th>
                  <th>الدور</th>
                  <th>تاريخ الطلب</th>
                  <th style={{ textAlign: "left" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name || u.name || "—"}</td>
                    <td>{u.email}</td>
                    <td>{u.role === "manager" ? "مدير" : "موظف"}</td>
                    <td>{fmtDate(u.created_at)}</td>
                    <td style={{ textAlign: "left", whiteSpace: "nowrap" }}>
                      <button
                        className="q-btn primary"
                        onClick={() => onApprove(u.id)}
                        disabled={busyId === u.id}
                      >
                        {busyId === u.id ? "جارٍ الاعتماد…" : "موافقة"}
                      </button>
                      <button
                        className="q-btn ghost"
                        style={{ marginInlineStart: 8 }}
                        onClick={() => onReject(u.id)}
                        disabled={busyId === u.id}
                      >
                        رفض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {err && !loading && (
          <div className="error" style={{ marginTop: 10 }}>
            {err}
          </div>
        )}
      </section>
    </div>
  );
}
