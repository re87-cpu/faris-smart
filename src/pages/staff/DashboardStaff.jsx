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
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      setLoading(true);
      try {
        const rows = await fetchMyCases(); // ✅ بدون user.id
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
    return () => {
      alive = false;
    };
  }, [user?.id, navigate]);

  async function openByNumber() {
    const cleaned = String(caseNo || "").trim();
    if (!cleaned) return;

    const found = myCases.find(
      (c) =>
        String(c.case_number || "")
          .toLowerCase()
          .trim() === cleaned.toLowerCase()
    );

    if (!found) {
      toast("لم يتم العثور على قضية بهذا الرقم ضمن قضاياك.");
      return;
    }

    navigate(`/staff/cases/${encodeURIComponent(found.id)}`);
  }

  return (
    <div dir="rtl" className="page" style={{ paddingBottom: 24 }}>
      <div className="q-container">
        <section className="q-sec">
          <h2 className="q-sec-title" style={{ marginTop: 0 }}>
             الموظف{" "}
            {user?.full_name || user?.name ? `— ${user.full_name || user.name}` : ""}
          </h2>

          <div className="q-card">
            <b>بحث مباشر برقم القضية</b>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <input
                className="ai-input"
                value={caseNo}
                onChange={(e) => setCaseNo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && openByNumber()}
                placeholder="اكتب رقم القضية (مثال: C-0001) ثم Enter ..."
              />
              <button
                className="q-btn ghost"
                onClick={openByNumber}
                disabled={!String(caseNo).trim()}
                style={{
                  opacity: String(caseNo).trim() ? 1 : 0.6,
                  cursor: String(caseNo).trim() ? "pointer" : "not-allowed",
                }}
              >
                فتح
              </button>
            </div>

            <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
              يعمل على القضايا الظاهرة أدناه فقط حسب صلاحياتك من السيرفر.
            </div>
          </div>
        </section>

        {/* ✅ سكرتير الموظف (بحث داخل قضايا الموظف فقط) */}
        <section className="q-sec" style={{ paddingTop: 0 }}>
          <StaffSecretarySearch myCases={myCases} />
        </section>

        <section className="q-sec" style={{ paddingTop: 0 }}>
          <div className="q-feats" style={{ gridTemplateColumns: "1fr" }}>
            <div className="q-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b>قضاياي</b>
                <Link className="q-link" to="/staff/cases">
                  عرض الكل
                </Link>
              </div>

              <div style={{ marginTop: 10 }}>
                {loading ? (
                  <div style={{ padding: 12 }}>
                    <Loader text="يتم تحميل قضاياك..." />
                  </div>
                ) : (
                  <div className="table-min">
                    <div className="row head">
                      <div>رقم القضية</div>
                      <div>العنوان</div>
                      <div>الوضع</div>
                      <div>إجراء</div>
                    </div>

                    {myCases.map((c) => (
                      <div key={c.id} className="row">
                        <div>{c.case_number || `#${String(c.id).slice(0, 8)}`}</div>
                        <div>
                          <div>{c.title}</div>
                          <div style={{ fontSize: 12, opacity: 0.75 }}>
                            تاريخ الإسناد:{" "}
                            {c.assignedAt
                              ? new Date(c.assignedAt).toLocaleString()
                              : c.created_at
                              ? new Date(c.created_at).toLocaleString()
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <span className="badge">{c.status || "—"}</span>
                        </div>
                        <div>
                          <Link className="q-btn ghost" to={`/staff/cases/${c.id}`}>
                            فتح
                          </Link>
                        </div>
                      </div>
                    ))}

                    {myCases.length === 0 && !loading && (
                      <div style={{ padding: "10px 0", color: "#666" }}>
                        لا توجد قضايا مسندة لك حالياً.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
