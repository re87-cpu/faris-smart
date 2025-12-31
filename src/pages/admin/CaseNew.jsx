// FILE: src/pages/admin/CaseNew.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCase } from "../../mock/api.js";
import { toast } from "../../utils/toast.js";

export default function CaseNew() {
  const navigate = useNavigate();

  // رقم القضية الداخلي + العنوان
  const [caseNo, setCaseNo] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    const no = String(caseNo || "").trim();
    const t = String(title || "").trim();

    if (!no) {
      toast("فضلاً أدخلي رقم القضية الداخلي.");
      return;
    }
    if (!t) {
      toast("فضلاً أدخلي عنوان القضية.");
      return;
    }

    setLoading(true);
    try {
      // نرسل للـ API مع رقم القضية اللي كتبتيه
      const c = await createCase({
        case_number: no,
        title: t,
      });

      toast(`تم إنشاء القضية رقم ${c.case_number}`);

      // تفريغ الحقول
      setCaseNo("");
      setTitle("");

      // توجيه لصفحة القضايا
      navigate("/admin/cases", { replace: true });
    } catch (ex) {
      console.error(ex);

      // لو الباك أرجع case_number_exists نترجمها لرسالة واضحة
      const msg = ex?.message || "";

      if (
        msg === "case_number_exists" ||
        msg.includes("case_number_exists") ||
        msg.includes("duplicate") ||
        msg.includes("موجود مسبقاً")
      ) {
        toast("رقم القضية الداخلي مستخدم مسبقاً، الرجاء إدخال رقم آخر.");
      } else {
        toast(msg || "تعذّر إنشاء القضية.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" style={{ padding: "16px 0" }}>
      <section className="q-card" style={{ padding: 16, maxWidth: 720 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 12,
            color: "var(--accent-dark)",
          }}
        >
          إضافة قضية جديدة
        </div>

        <form onSubmit={onSubmit} className="form" noValidate>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: 12,
            }}
          >
            <div className="field">
              <label className="label">رقم القضية الداخلي</label>
              <input
                className="input"
                value={caseNo}
                onChange={(e) => setCaseNo(e.target.value)}
                placeholder="مثال: TST-001 أو 2025/ق/15"
                required
              />
            </div>

            <div className="field">
              <label className="label">عنوان القضية</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: مطالبة مالية ضد شركة ..."
                required
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 8,
              justifyContent: "flex-start",
            }}
          >
            <button className="q-btn primary" disabled={loading}>
              {loading ? "جاري الحفظ…" : "حفظ القضية"}
            </button>
          </div>

          <p style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
            هذا الرقم مخصّص للمكتب ويمكن لاحقًا ربطه برقم القضية في نظام آخر إن لزم.
          </p>
        </form>
      </section>
    </div>
  );
}
