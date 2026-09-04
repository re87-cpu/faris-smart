// FILE: src/pages/staff/DashboardStaff.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "../../utils/toast.js";
import Loader from "../../components/Loader.jsx";
import { getAuth } from "../../utils/auth.js";
import { fetchMyCases } from "../../mock/api.js";
import StaffSecretarySearch from "../../components/StaffSecretarySearch.jsx";

export default function DashboardStaff() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth?.user || null;
  const [caseNo, setCaseNo] = useState("");
  const [myCases, setMyCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!user) { navigate("/login", { replace: true }); return; }
      setLoading(true);
      try {
        const rows = await fetchMyCases();
        if (!alive) return;
        setMyCases(rows || []);
      } catch (e) {
        console.error(e);
        toast("تعذّر تحميل بياناتك. يرجى تسجيل الدخول من جديد.");
        navigate("/login", { replace: true });
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [user?.id, navigate]);

  async function openByNumber() {
    const cleaned = String(caseNo || "").trim();
    if (!cleaned) return;
    const found = myCases.find((c) => String(c.case_number || "").toLowerCase().trim() === cleaned.toLowerCase());
    if (!found) { toast("لم يتم العثور على قضية بهذا الرقم ضمن قضاياك."); return; }
    navigate(`/staff/cases/${encodeURIComponent(found.id)}`);
  }

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: 0 }}>
        الموظف {user?.full_name || user?.name ? `— ${user.full_name || user.name}` : ""}
      </h1>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <b>بحث مباشر برقم القضية</b>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <input className="input" style={{ flex: 1 }} value={caseNo} onChange={(e) => setCaseNo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && openByNumber()} placeholder="اكتب رقم القضية (مثال: C-0001) ثم Enter ..." />
          <button className="btn btn-ghost" onClick={openByNumber} disabled={!String(caseNo).trim()}>فتح</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--color-neutral-600)", marginTop: 6 }}>يعمل على القضايا الظاهرة أدناه فقط حسب صلاحياتك من السيرفر.</div>
      </div>

      <StaffSecretarySearch myCases={myCases} />

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 0" }}>
          <b>قضاياي</b>
          <Link className="btn btn-ghost" to="/staff/cases">عرض الكل</Link>
        </div>
        <div style={{ marginTop: 10 }}>
          {loading ? (
            <div style={{ padding: 16 }}><Loader text="يتم تحميل قضاياك..." /></div>
          ) : (
            <table className="table">
              <thead><tr><th>رقم القضية</th><th>العنوان</th><th>الوضع</th><th>إجراء</th></tr></thead>
              <tbody>
                {myCases.map((c) => (
                  <tr key={c.id}>
                    <td>{c.case_number || `#${String(c.id).slice(0, 8)}`}</td>
                    <td>{c.title}<div style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>تاريخ الإسناد: {c.assignedAt ? new Date(c.assignedAt).toLocaleString() : c.created_at ? new Date(c.created_at).toLocaleString() : "—"}</div></td>
                    <td><span className="tag tag-accent">{c.status || "—"}</span></td>
                    <td><Link className="btn btn-ghost" to={`/staff/cases/${c.id}`}>فتح</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {myCases.length === 0 && !loading && <div style={{ padding: 16, color: "var(--color-neutral-600)" }}>لا توجد قضايا مسندة لك حالياً.</div>}
        </div>
      </div>
    </div>
  );
}
