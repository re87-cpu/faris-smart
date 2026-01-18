import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const WHATSAPP = (import.meta.env.VITE_WHATSAPP_NUMBER || "966536679918").trim();

const services = [
  { title: "استشارة قانونية", icon: "⚖️" },
  { title: "صياغة العقود", icon: "📝" },
  { title: "مراجعة العقود", icon: "📄" },
  { title: "مذكرات ولوائح", icon: "📑" },
  { title: "اعمال التوثيق", icon: "✍️" },
  { title: "خطابات وإنذارات", icon: "📨" },
  { title: "خدمات الشركات", icon: "🏢" },
  { title: "متابعة الطلبات", icon: "📆" },
];

const waLink = (service) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `السلام عليكم، أرغب بطلب خدمة: ${service}`
  )}`;

export default function ClientServices() {
  return (
    <div dir="rtl" className="page">
      {/* Header */}
     <header className="q-nav" style={{ justifyContent: "space-between" }}>
  <Link to="/" className="q-link">
    <img src={logo} className="q-logo" alt="شعار المكتب" />
  </Link>

  <Link
    to="/"
    className="q-btn q-outline"
    style={{
      borderRadius: 999,
      padding: "8px 14px",
      fontWeight: 800,
    }}
  >
    عودة
  </Link>
</header>


      {/* Title */}
      <section className="q-hero" style={{ paddingTop: 24 }}>
        <h1 className="q-h1">الخدمات </h1>
        <p className="q-sub">اختر الخدمة واضغط ابدأ الخدمة للتواصل عبر واتساب</p>

        {/* ثقة مختصرة */}
        <div className="q-card" style={{ maxWidth: 700, margin: "16px auto" }}>
          <div style={{ color: "#475569", marginTop: 6 }}>
            نخاف الله في أعمالنا، نؤدي الأمانة، ونحفظ أسرار عملائنا.
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <main className="q-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 18,
          }}
        >
          {services.map((s, i) => (
            <div
              key={i}
              className="q-card"
              style={{
                textAlign: "center",
                padding: 22,
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ fontSize: 34 }}>{s.icon}</div>
              <div style={{ fontWeight: 900, color: "var(--accent-dark)" }}>
                {s.title}
              </div>
              <a
                href={waLink(s.title)}
                target="_blank"
                rel="noreferrer"
                className="q-btn q-primary"
                style={{ marginTop: "auto" }}
              >
                ابدأ الخدمة
              </a>
            </div>
          ))}
        </div>
      </main>

      <footer className="q-footer" style={{ marginTop: 40 }}>
        © 2026 واجهة فارس — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
