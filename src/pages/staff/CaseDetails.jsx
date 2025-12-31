// FILE: src/pages/staff/CaseDetails.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useParams, NavLink, useNavigate } from "react-router-dom";
import CaseHeader from "../../components/CaseHeader.jsx";
import CriticalBar from "../../components/CriticalBar.jsx";
import { fetchCase } from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";

export default function CaseDetails() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  // نقرأ المستخدم مرة واحدة
  const auth = getAuth();
  const me = auth?.user || null;
  const meId = me?.id ? String(me.id) : null; // قيمة نصية ثابتة للـ useEffect

  const [meta, setMeta] = useState(null); // بيانات القضية من الباك
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    // لو ما فيه مستخدم معروف → نرجع لصفحة الدخول
    if (!meId) {
      navigate("/login", { replace: true });
      return;
    }

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const c = await fetchCase(caseId); // يقرأ من /cases عبر mock/api
        if (!alive) return;

        // هل هذه القضية مسندة لهذا الموظف؟
        const isMine =
          c.assignedTo && meId ? String(c.assignedTo) === meId : false;

        const assignedLabel =
          isMine && (c.assignedName || me?.full_name || me?.name)
            ? "أنا"
            : c.assignedName
            ? c.assignedName
            : c.assignedTo
            ? `#${c.assignedTo}`
            : "غير مسندة";

        setMeta({
          id: c.id,
          case_number: c.case_number,
          title: c.title,
          status: c.status || "—",
          next: c.next || "", // حقل مفتوح للتوسعة لاحقًا
          assignedTo: assignedLabel,
          alerts: [], // لاحقًا نربطها بالمهل/المهام/الإشعارات
        });
      } catch (ex) {
        console.error("CaseDetails load error:", ex);
        if (!alive) return;
        setErr(ex.message || "تعذّر تحميل بيانات القضية.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [caseId, meId, navigate]);

  // حالة التحميل
  if (loading) {
    return (
      <div
        dir="rtl"
        style={{ minHeight: 200, display: "grid", placeItems: "center" }}
      >
        <div className="q-card" style={{ padding: 16 }}>
          جارٍ تحميل بيانات القضية…
        </div>
      </div>
    );
  }

  // حالة الخطأ أو عدم العثور
  if (err || !meta) {
    return (
      <div
        dir="rtl"
        style={{ minHeight: 220, display: "grid", placeItems: "center" }}
      >
        <div
          className="q-card"
          style={{ padding: 20, maxWidth: 480, textAlign: "center" }}
        >
          <div className="error" style={{ marginBottom: 12 }}>
            {err || "القضية غير موجودة."}
          </div>
          <button className="q-btn ghost" onClick={() => navigate(-1)}>
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ display: "grid", gap: 12 }}>
      {/* هيدر القضية الموحد */}
      <CaseHeader
        id={meta.id}
        case_number={meta.case_number}
        title={meta.title}
        status={meta.status}
        next={meta.next}
        assignedTo={meta.assignedTo}
        role="staff"
      />

      {/* شريط تنبيهات حرجة (ممكن تربطينه لاحقًا بالمهام/الإشعارات) */}
      {meta.alerts && meta.alerts.length > 0 && (
        <CriticalBar items={meta.alerts} />
      )}

      {/* تبويب تنقل داخلي */}
      <div className="q-card" style={{ padding: 10 }}>
        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tab to="" end>
            الخط الزمني
          </Tab>
          <Tab to="sessions">الجلسات</Tab>
          {/*<Tab to="sessions/summary">ملخص الجلسة</Tab>*/}
          <Tab to="documents">المستندات</Tab>
          <Tab to="notes">ملاحظات</Tab>
        </nav>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 12,
          alignItems: "start",
        }}
      >
        {/* محتوى التبويب الحالي */}
        <section className="q-card" style={{ padding: 16, minHeight: 220 }}>
          <Outlet />
        </section>

        {/* مساعد جانبي بسيط للموظف (شات داخلي مستقبلي) */}
        <aside className="q-card" style={{ padding: 14 }}>
          <b style={{ display: "block", marginBottom: 8 }}>مساعد سريع</b>
          <textarea
            className="input"
            placeholder="اكتب ملاحظة للفريق أو نقاط سريعة عن القضية…"
            style={{ height: 120, padding: "10px 12px", resize: "vertical" }}
          />
          <button className="q-btn primary" style={{ marginTop: 8 }}>
            إرسال
          </button>
        </aside>
      </div>
    </div>
  );
}

function Tab({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `q-btn ${isActive ? "primary" : "ghost"}`}
    >
      {children}
    </NavLink>
  );
}
