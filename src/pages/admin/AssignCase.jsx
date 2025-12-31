// FILE: src/pages/admin/AssignCase.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  assignCaseTo,
  fetchAllCases,
  fetchEmployees,
} from "../../mock/api.js";
import { toast } from "../../utils/toast.js";

export default function AssignCase() {
  const [cases, setCases] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [caseId, setCaseId] = useState("");
  const [userId, setUserId] = useState("");
  const [note, setNote] = useState("");

  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [err, setErr] = useState("");

  // تحميل القضايا + الموظفين
  async function load() {
    try {
      setLoadingLists(true);
      setErr("");
      const [cs, emps] = await Promise.all([
        fetchAllCases(),
        fetchEmployees(),
      ]);

      setCases(Array.isArray(cs) ? cs : []);
      setEmployees(Array.isArray(emps) ? emps : []);
    } catch (e) {
      console.error(e);
      setErr("تعذّر تحميل القضايا أو الموظفين، تأكّدي من اتصال الخادم.");
    } finally {
      setLoadingLists(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // قضايا مفتوحة فقط للإسناد
  const openCases = useMemo(
    () => cases.filter((c) => c.status === "open"),
    [cases]
  );

  const selectedCase = useMemo(
    () => openCases.find((c) => String(c.id) === String(caseId)),
    [openCases, caseId]
  );

  const selectedUser = useMemo(
    () => employees.find((u) => String(u.id) === String(userId)),
    [employees, userId]
  );

  async function onAssign(e) {
    e.preventDefault();

    if (!caseId || !userId) {
      toast("فضلاً اختاري القضية والموظف.");
      return;
    }

    try {
      setLoadingForm(true);
      setErr("");

      await assignCaseTo(caseId, userId, note || null);

      toast("تم إسناد القضية بنجاح.");
      setNote("");
      // نخلي نفس القضية والموظف محددين، لكن نحدّث البيانات
      await load();
    } catch (ex) {
      console.error(ex);
      setErr(ex.message || "تعذّر إسناد القضية.");
    } finally {
      setLoadingForm(false);
    }
  }

  return (
    <div dir="rtl" style={{ padding: "16px 0", display: "grid", gap: 12 }}>
      <section className="q-card" style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "var(--accent-dark)",
            }}
          >
            إسناد قضية لموظف
          </div>
          <button
            className="q-btn ghost"
            onClick={load}
            disabled={loadingLists}
          >
            تحديث البيانات
          </button>
        </div>

        {loadingLists ? (
          <div style={{ marginTop: 10 }}>جارٍ تحميل القضايا والموظفين…</div>
        ) : (
          <div
            className="form"
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1.6fr",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            {/* نموذج الإسناد */}
            <form onSubmit={onAssign} style={{ display: "grid", gap: 12 }}>
              {/* اختيار القضية */}
              <div className="field">
                <label className="label">القضية</label>
                <select
                  className="input"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  required
                >
                  <option value="">
                    {openCases.length === 0
                      ? "لا توجد قضايا مفتوحة حالياً"
                      : "اختاري قضية…"}
                  </option>
                  {openCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      قضية #{c.case_number || c.id} — {c.title}{" "}
                      {c.assignedName
                        ? `(المسؤول الحالي: ${c.assignedName})`
                        : "(غير مُسنّدة)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* اختيار الموظف */}
              <div className="field">
                <label className="label">الموظف</label>
                <select
                  className="input"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                >
                  <option value="">اختاري موظف…</option>
                  {employees.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.full_name || u.email}
                    </option>
                  ))}
                </select>
                {employees.length === 0 && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginTop: 4,
                    }}
                  >
                    لا يوجد موظفون معتمدون بعد.
                  </div>
                )}
              </div>

                            <div className="field">
                <label className="label">ملاحظة (اختياري)</label>
                <textarea
                  className="input"
                  style={{ height: 110, padding: "10px 12px" }}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="تفاصيل إضافية عن الإسناد إن لزم (نوع العمل المطلوب، موعد جلسة، تنبيهات...)"
                />
              </div>

              {/* أزرار التنفيذ */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <button className="q-btn primary" disabled={loadingForm}>
                  {loadingForm ? "جاري الإسناد…" : "إسناد القضية"}
                </button>
                <button
                  type="button"
                  className="q-btn ghost"
                  onClick={() => {
                    setCaseId("");
                    setUserId("");
                    setNote("");
                  }}
                  disabled={loadingForm}
                >
                  مسح الحقول
                </button>
              </div>

              {err && (
                <div className="error" style={{ marginTop: 6 }}>
                  {err}
                </div>
              )}
            </form>

            {/* ملخص القضية المختارة */}
            <div className="q-card" style={{ padding: 14, background: "#f9fafb" }}>
              <b>ملخص القضية المختارة</b>
              {!selectedCase ? (
                <div style={{ marginTop: 10, color: "var(--ink-600)" }}>
                  اختاري قضية من القائمة لعرض التفاصيل.
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 10,
                    display: "grid",
                    gap: 6,
                    fontSize: 14,
                  }}
                >
                  <div>
                    <span style={{ color: "#6b7280" }}>رقم القضية:</span>{" "}
                    <b>#{selectedCase.case_number || selectedCase.id}</b>
                  </div>
                  <div>
                    <span style={{ color: "#6b7280" }}>العنوان:</span>{" "}
                    {selectedCase.title}
                  </div>
                  <div>
                    <span style={{ color: "#6b7280" }}>المحكمة:</span>{" "}
                    {selectedCase.court || "—"}
                  </div>
                  <div>
                    <span style={{ color: "#6b7280" }}>الحالة:</span>{" "}
                    <span className="badge">
                      {selectedCase.status === "open"
                        ? "قيد الترافع"
                        : selectedCase.status === "closed"
                        ? "مغلقة"
                        : selectedCase.status === "archived"
                        ? "مؤرشفة"
                        : selectedCase.status}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#6b7280" }}>المسؤول الحالي:</span>{" "}
                    <b>{selectedCase.assignedName || "غير مُسنّدة"}</b>
                  </div>
                  <div>
                    <span style={{ color: "#6b7280" }}>تاريخ الإنشاء:</span>{" "}
                    {selectedCase.created_at
                      ? new Date(
                          selectedCase.created_at
                        ).toLocaleString("ar-SA")
                      : "—"}
                  </div>
                  {selectedUser && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <span style={{ color: "#6b7280" }}>
                        سيتم الإسناد إلى:
                      </span>{" "}
                      <b>{selectedUser.name || selectedUser.email}</b>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
