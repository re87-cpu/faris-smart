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
    <div dir="rtl" className="adm" style={{ maxWidth: 640 }}>
      <div style={{ paddingBottom: 28, borderBottom: "1px solid var(--color-divider)" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 700, margin: 0 }}>قضية جديدة</h1>
      </div>

      <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column" }}>
        <div className="adm-num-field">
          <span className="num">01</span>
          <label htmlFor="case-no">رقم القضية الداخلي</label>
          <input id="case-no" className="assign-select" value={caseNo} onChange={(e) => setCaseNo(e.target.value)} placeholder="مثال: TST-001 أو 2025/ق/15" required />
        </div>
        <div className="adm-num-field">
          <span className="num">02</span>
          <label htmlFor="case-title">عنوان القضية</label>
          <input id="case-title" className="assign-select" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مطالبة مالية ضد شركة ..." required />
        </div>

        <div style={{ paddingTop: 30 }}>
          <button className="btn btn-primary" style={{ padding: "13px 30px", fontSize: 15 }} disabled={loading}>{loading ? "جاري الحفظ…" : "حفظ القضية"}</button>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: "var(--color-neutral-600)" }}>
          هذا الرقم داخلي ويمكن لاحقًا ربطه برقم القضية في نظام آخر إن لزم.
        </p>
      </form>
    </div>
  );
}
