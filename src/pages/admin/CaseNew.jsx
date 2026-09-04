// FILE: src/pages/admin/CaseNew.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCase } from "../../mock/api.js";
import { toast } from "../../utils/toast.js";

export default function CaseNew() {
  const navigate = useNavigate();
  const [caseNo, setCaseNo] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const no = String(caseNo || "").trim();
    const t = String(title || "").trim();
    if (!no) return toast("فضلاً أدخلي رقم القضية الداخلي.");
    if (!t) return toast("فضلاً أدخلي عنوان القضية.");

    setLoading(true);
    try {
      const c = await createCase({ case_number: no, title: t });
      toast(`تم إنشاء القضية رقم ${c.case_number}`);
      setCaseNo("");
      setTitle("");
      navigate("/admin/cases", { replace: true });
    } catch (ex) {
      console.error(ex);
      const msg = ex?.message || "";
      if (msg === "case_number_exists" || msg.includes("case_number_exists") || msg.includes("duplicate") || msg.includes("موجود مسبقاً")) {
        toast("رقم القضية الداخلي مستخدم مسبقاً، الرجاء إدخال رقم آخر.");
      } else {
        toast(msg || "تعذّر إنشاء القضية.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl">
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", maxWidth: 720 }}>
        <div className="card-title" style={{ fontSize: 20 }}>إضافة قضية جديدة</div>
        <form onSubmit={onSubmit} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginTop: 12 }}>
            <div className="field">
              <label>رقم القضية الداخلي</label>
              <input className="input" value={caseNo} onChange={(e) => setCaseNo(e.target.value)} placeholder="مثال: TST-001 أو 2025/ق/15" required />
            </div>
            <div className="field">
              <label>عنوان القضية</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مطالبة مالية ضد شركة ..." required />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" disabled={loading}>{loading ? "جاري الحفظ…" : "حفظ القضية"}</button>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--color-neutral-600)" }}>
            هذا الرقم مخصّص للشركة ويمكن لاحقًا ربطه برقم القضية في نظام آخر إن لزم.
          </p>
        </form>
      </div>
    </div>
  );
}
