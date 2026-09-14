// FILE: src/pages/admin/CaseNew.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCase } from "../../mock/api.js";
import { toast } from "../../utils/toast.js";
import { PageHeader, Section, FormGrid, Field } from "../../components/admin/ui.jsx";

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
    <div dir="rtl" className="adm">
      <PageHeader title="إضافة قضية جديدة" description="سجّلي رقمًا داخليًا وعنوانًا؛ يمكن استكمال بقية التفاصيل لاحقًا من صفحة القضية." />
      <Section bordered>
        <form onSubmit={onSubmit} noValidate style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>
          <FormGrid>
            <Field label="رقم القضية الداخلي">
              <input className="input" value={caseNo} onChange={(e) => setCaseNo(e.target.value)} placeholder="مثال: TST-001 أو 2025/ق/15" required />
            </Field>
            <Field label="عنوان القضية">
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مطالبة مالية ضد شركة ..." required />
            </Field>
          </FormGrid>
          <div>
            <button className="btn btn-primary" disabled={loading}>{loading ? "جاري الحفظ…" : "حفظ القضية"}</button>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>
            هذا الرقم داخلي ويمكن لاحقًا ربطه برقم القضية في نظام آخر إن لزم.
          </p>
        </form>
      </Section>
    </div>
  );
}
