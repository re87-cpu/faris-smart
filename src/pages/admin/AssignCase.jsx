// FILE: src/pages/admin/AssignCase.jsx
import React, { useEffect, useMemo, useState } from "react";
import { assignCaseTo, fetchAllCases, fetchEmployees } from "../../mock/api.js";
import { toast } from "../../utils/toast.js";
import { LoadingSkeleton, FormError } from "../../components/admin/ui.jsx";

const STEPS = ["القضية", "الموظف", "ملاحظة", "إسناد"];

export default function AssignCase() {
  const [cases, setCases] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [userId, setUserId] = useState("");
  const [note, setNote] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setLoadingLists(true);
      setErr("");
      const [cs, emps] = await Promise.all([fetchAllCases(), fetchEmployees()]);
      setCases(Array.isArray(cs) ? cs : []);
      setEmployees(Array.isArray(emps) ? emps : []);
    } catch (e) {
      console.error(e);
      setErr("تعذّر تحميل القضايا أو الموظفين، تأكّدي من اتصال الخادم.");
    } finally {
      setLoadingLists(false);
    }
  }

  useEffect(() => { load(); }, []);

  const openCases = useMemo(() => cases.filter((c) => c.status === "open"), [cases]);

  async function onAssign(e) {
    e.preventDefault();
    if (!caseId || !userId) return toast("فضلاً اختاري القضية والموظف.");
    try {
      setLoadingForm(true);
      setErr("");
      await assignCaseTo(caseId, userId, note || null);
      toast("تم إسناد القضية بنجاح.");
      setCaseId(""); setUserId(""); setNote("");
      await load();
    } catch (ex) {
      console.error(ex);
      setErr(ex.message || "تعذّر إسناد القضية.");
    } finally {
      setLoadingForm(false);
    }
  }

  const activeStep = !caseId ? 0 : !userId ? 1 : 2;

  return (
    <div dir="rtl" className="adm" style={{ maxWidth: 640 }}>
      <div style={{ paddingBottom: 28, borderBottom: "1px solid var(--color-divider)" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 700, margin: 0 }}>إسناد قضية</h1>
        <div style={{ color: "var(--color-neutral-600)", fontSize: 14, marginTop: 8 }}>اختر القضية والموظف المسؤول لإكمال الإسناد.</div>
      </div>

      <div className="adm-steps">
        <div className="adm-steps-line" />
        <div className="adm-steps-row">
          {STEPS.map((label, i) => (
            <div className="adm-steps-item" key={label}>
              <span className={`adm-steps-dot${i <= activeStep ? " done" : ""}`} />
              <span className={`adm-steps-label${i === activeStep ? " on" : ""}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loadingLists ? (
        <LoadingSkeleton rows={3} />
      ) : (
        <form onSubmit={onAssign} style={{ display: "flex", flexDirection: "column" }}>
          <div className="adm-num-field">
            <span className="num">01</span>
            <label htmlFor="assign-case">القضية</label>
            <select id="assign-case" className="assign-select" value={caseId} onChange={(e) => setCaseId(e.target.value)} required>
              <option value="">{openCases.length === 0 ? "لا توجد قضايا مفتوحة حالياً" : "اختاري قضية…"}</option>
              {openCases.map((c) => (
                <option key={c.id} value={c.id}>
                  قضية #{c.case_number || c.id} — {c.title} {c.assignedName ? `(المسؤول الحالي: ${c.assignedName})` : "(غير مُسنّدة)"}
                </option>
              ))}
            </select>
          </div>

          <div className="adm-num-field">
            <span className="num">02</span>
            <label htmlFor="assign-employee">الموظف المسؤول</label>
            <select id="assign-employee" className="assign-select" value={userId} onChange={(e) => setUserId(e.target.value)} required>
              <option value="">اختاري موظف…</option>
              {employees.map((u) => <option key={u.id} value={u.id}>{u.name || u.full_name || u.email}</option>)}
            </select>
            {employees.length === 0 && <div style={{ fontSize: 12, color: "var(--color-neutral-600)", marginTop: 8 }}>لا يوجد موظفون معتمدون بعد.</div>}
          </div>

          <div className="adm-num-field">
            <span className="num muted">03 — اختياري</span>
            <label htmlFor="assign-note">ملاحظة</label>
            <textarea id="assign-note" className="assign-select" style={{ height: 96, resize: "none" }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="تفاصيل إضافية عن الإسناد إن لزم…" />
          </div>

          <div style={{ paddingTop: 30, display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn btn-primary" style={{ padding: "13px 30px", fontSize: 15 }} disabled={loadingForm}>{loadingForm ? "جاري الإسناد…" : "إسناد القضية"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setCaseId(""); setUserId(""); setNote(""); }} disabled={loadingForm}>مسح الحقول</button>
          </div>

          <FormError>{err}</FormError>
        </form>
      )}
    </div>
  );
}
