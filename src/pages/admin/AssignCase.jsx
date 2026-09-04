// FILE: src/pages/admin/AssignCase.jsx
import React, { useEffect, useMemo, useState } from "react";
import { assignCaseTo, fetchAllCases, fetchEmployees } from "../../mock/api.js";
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
  const selectedCase = useMemo(() => openCases.find((c) => String(c.id) === String(caseId)), [openCases, caseId]);
  const selectedUser = useMemo(() => employees.find((u) => String(u.id) === String(userId)), [employees, userId]);

  async function onAssign(e) {
    e.preventDefault();
    if (!caseId || !userId) return toast("فضلاً اختاري القضية والموظف.");
    try {
      setLoadingForm(true);
      setErr("");
      await assignCaseTo(caseId, userId, note || null);
      toast("تم إسناد القضية بنجاح.");
      setNote("");
      await load();
    } catch (ex) {
      console.error(ex);
      setErr(ex.message || "تعذّر إسناد القضية.");
    } finally {
      setLoadingForm(false);
    }
  }

  const STATUS_LABELS = { open: "قيد الترافع", closed: "مغلقة", archived: "مؤرشفة" };

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>إسناد قضية لموظف</div>
          <button className="btn btn-ghost" onClick={load} disabled={loadingLists}>تحديث البيانات</button>
        </div>

        {loadingLists ? (
          <div style={{ marginTop: 10 }}>جارٍ تحميل القضايا والموظفين…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr", gap: 16, alignItems: "flex-start" }}>
            <form onSubmit={onAssign} style={{ display: "grid", gap: 12 }}>
              <div className="field">
                <label>القضية</label>
                <select className="input" value={caseId} onChange={(e) => setCaseId(e.target.value)} required>
                  <option value="">{openCases.length === 0 ? "لا توجد قضايا مفتوحة حالياً" : "اختاري قضية…"}</option>
                  {openCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      قضية #{c.case_number || c.id} — {c.title} {c.assignedName ? `(المسؤول الحالي: ${c.assignedName})` : "(غير مُسنّدة)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>الموظف</label>
                <select className="input" value={userId} onChange={(e) => setUserId(e.target.value)} required>
                  <option value="">اختاري موظف…</option>
                  {employees.map((u) => <option key={u.id} value={u.id}>{u.name || u.full_name || u.email}</option>)}
                </select>
                {employees.length === 0 && <div style={{ fontSize: 12, color: "var(--color-neutral-600)", marginTop: 4 }}>لا يوجد موظفون معتمدون بعد.</div>}
              </div>

              <div className="field">
                <label>ملاحظة (اختياري)</label>
                <textarea className="input" style={{ height: 110 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="تفاصيل إضافية عن الإسناد إن لزم…" />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" disabled={loadingForm}>{loadingForm ? "جاري الإسناد…" : "إسناد القضية"}</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setCaseId(""); setUserId(""); setNote(""); }} disabled={loadingForm}>مسح الحقول</button>
              </div>

              {err && <div style={{ marginTop: 6, color: "#b3261e" }}>{err}</div>}
            </form>

            <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-100)" }}>
              <div className="card-title" style={{ marginBottom: 0 }}>ملخص القضية المختارة</div>
              {!selectedCase ? (
                <div style={{ marginTop: 10, color: "var(--color-neutral-600)" }}>اختاري قضية من القائمة لعرض التفاصيل.</div>
              ) : (
                <div style={{ marginTop: 10, display: "grid", gap: 6, fontSize: 14 }}>
                  <div><span style={{ color: "var(--color-neutral-600)" }}>رقم القضية:</span> <b>#{selectedCase.case_number || selectedCase.id}</b></div>
                  <div><span style={{ color: "var(--color-neutral-600)" }}>العنوان:</span> {selectedCase.title}</div>
                  <div><span style={{ color: "var(--color-neutral-600)" }}>المحكمة:</span> {selectedCase.court || "—"}</div>
                  <div><span style={{ color: "var(--color-neutral-600)" }}>الحالة:</span> <span className="tag tag-accent">{STATUS_LABELS[selectedCase.status] || selectedCase.status}</span></div>
                  <div><span style={{ color: "var(--color-neutral-600)" }}>المسؤول الحالي:</span> <b>{selectedCase.assignedName || "غير مُسنّدة"}</b></div>
                  <div><span style={{ color: "var(--color-neutral-600)" }}>تاريخ الإنشاء:</span> {selectedCase.created_at ? new Date(selectedCase.created_at).toLocaleString("ar-SA") : "—"}</div>
                  {selectedUser && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--color-neutral-200)" }}>
                      <span style={{ color: "var(--color-neutral-600)" }}>سيتم الإسناد إلى:</span> <b>{selectedUser.name || selectedUser.email}</b>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
