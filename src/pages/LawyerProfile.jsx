// FILE: src/pages/LawyerProfile.jsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import lawyerImg from "../assets/lawyer.jpeg";

// نفس منطق صفحة الخدمات: fallback ثابت + تنظيف أي رموز
const WHATSAPP = ((import.meta.env.VITE_WHATSAPP_NUMBER || "966536679918") + "")
  .replace(/[^\d]/g, "")
  .trim();

const WA_TEXT = "السلام عليكم، أرغب بالتواصل بخصوص خدمة قانونية.";

export default function LawyerProfile() {
  const waReady = Boolean(WHATSAPP);
  const waHref = waReady
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WA_TEXT)}`
    : `https://wa.me/966536679918?text=${encodeURIComponent(WA_TEXT)}`;

  return (
    <div dir="rtl" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* الهيدر */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="شعار شركة الفارس" style={{ height: 40 }} />
        </Link>

        <nav style={{ display: "flex", gap: 18 }}>
          <Link
            to="/services"
            style={{
              fontWeight: 800,
              color: "#1e3a5f",
              textDecoration: "none",
            }}
          >
            الخدمات
          </Link>
          <Link
            to="/"
            style={{
              fontWeight: 800,
              color: "#1e3a5f",
              textDecoration: "none",
            }}
          >
            الرئيسية
          </Link>
        </nav>
      </header>

      {/* العنوان */}
      <section style={{ padding: "36px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: 34, fontWeight: 950, color: "#0f172a" }}>
          معلومات المحامي
        </h1>
       
      </section>

      {/* المحتوى */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
            display: "grid",
            gap: 18,
          }}
        >
          {/* بطاقة التعريف */}
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <img
              src={lawyerImg}
              alt="صورة المحامي"
              style={{
                width: 104,
                height: 104,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #e5e7eb",
              }}
            />

            <div style={{ flex: 1, minWidth: 240 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 950,
                  color: "#1e3a5f",
                  lineHeight: 1.3,
                }}
              >
                فارس محمد الغامدي
              </div>

              <div style={{ marginTop: 8, color: "#475569", lineHeight: 1.95 }}>
                محامٍ يلتزم بالأمانة ومخافة الله، ويحفظ أسرار عملائه، ويحرص على وضوح
                الإجراء وجودة الصياغة.
                <div style={{ marginTop: 8 }}>
                  <span style={pill}> التزام مهني</span>{" "}
                  <span style={pill}> سرية تامة</span>{" "}
                  <span style={pill}> وضوح الإجراءات</span>
                </div>

               <div
  style={{
    marginTop: 12,
    padding: "10px 14px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    color: "#334155",
    lineHeight: 1.9,
  }}
>
  <b>المؤهل العلمي:</b><br />
  بكالوريوس قانون – جامعة الباحة<br />
</div>

              </div>
            </div>
          </div>

          {/* منهج العمل */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 16,
              background: "#fbfdff",
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ fontWeight: 950, color: "#0f172a" }}>المنهج المهني</div>

            <div style={{ display: "grid", gap: 8, color: "#334155", lineHeight: 1.9 }}>
              <div style={rowItem}>
                <span style={dot} />
                الالتزام بالأنظمة واللوائح الرسمية داخل المملكة.
              </div>
              <div style={rowItem}>
                <span style={dot} />
                شرح الخطوات بوضوح قبل أي إجراء، وبشفافية في التوقعات.
              </div>
              <div style={rowItem}>
                <span style={dot} />
                عناية دقيقة بالصّياغة القانونية لضمان الحقوق وتقليل المخاطر.
              </div>
              <div style={rowItem}>
                <span style={dot} />
                سرية مهنية تامة وحفظ بيانات العملاء دون مساومة.
              </div>
            </div>

            <div
              style={{
                marginTop: 4,
                padding: "10px 12px",
                borderRadius: 12,
                background: "#f1f5f9",
                color: "#0f172a",
                fontWeight: 800,
                lineHeight: 1.9,
              }}
            >
              “نؤدي الأمانة، ونخاف الله في أعمالنا، ونسعى لحلول نظامية تحفظ الحقوق.”
            </div>
          </div>

          {/* بيانات الترخيص (رجعناها) */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 16,
              background: "#fbfdff",
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ fontWeight: 950, color: "#0f172a" }}>بيانات الترخيص</div>

            <div style={{ display: "grid", gap: 8, color: "#334155", lineHeight: 1.9 }}>
              <div style={licenseLine}>
                <span style={licenseLabel}>رقم ترخيص مزاولة المحاماة</span>
                <span style={licenseValue}>472814</span>
              </div>
              <div style={licenseLine}>
                <span style={licenseLabel}>رقم ترخيص التوثيق</span>
                <span style={licenseValue}>47/111672</span>
              </div>
            </div>

           
          </div>

          {/* قنوات التواصل */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 16,
              background: "#fff",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 950, color: "#0f172a" }}>قنوات التواصل</div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href="https://sa.linkedin.com/in/%D9%81%D8%A7%D8%B1%D8%B3-%D8%A7%D9%84%D8%BA%D8%A7%D9%85%D8%AF%D9%8A-7566972a1"
                target="_blank"
                rel="noreferrer"
                style={btnOutline}
              >
                LinkedIn
              </a>

              <a href="mailto:FLF.LAWYER@gmail.com" style={btnOutline}>
                البريد الإلكتروني
              </a>

              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                style={{
                  ...btnPrimary,
                  opacity: 1,
                  pointerEvents: "auto",
                }}
              >
                تواصل عبر واتساب
              </a>
            </div>

        
            {!waReady && (
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.9 }}>
                ملاحظة: لم يتم قراءة <b>VITE_WHATSAPP_NUMBER</b> من env في هذا التشغيل،
                وتم استخدام رقم افتراضي. أعد تشغيل Vite بعد تعديل .env.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* الفوتر */}
      <footer
        style={{
          textAlign: "center",
          marginTop: 40,
          padding: "18px 12px 24px",
          color: "#64748b",
        }}
      >
        © 2026 واجهة فارس — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}

/* عناصر مساعدة */
const btnPrimary = {
  background: "#1e3a5f",
  color: "#fff",
  padding: "10px 18px",
  borderRadius: 999,
  fontWeight: 900,
  textDecoration: "none",
};

const btnOutline = {
  border: "1px solid #1e3a5f",
  color: "#1e3a5f",
  padding: "10px 18px",
  borderRadius: 999,
  fontWeight: 900,
  textDecoration: "none",
};

const pill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#f1f5f9",
  color: "#0f172a",
  fontSize: 12,
  fontWeight: 800,
};

const rowItem = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
};

const dot = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background: "#1e3a5f",
  marginTop: 8,
  flex: "0 0 8px",
};

const licenseLine = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  padding: "10px 12px",
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
};

const licenseLabel = {
  fontWeight: 900,
  color: "#0f172a",
};

const licenseValue = {
  fontWeight: 900,
  color: "#1e3a5f",
};
