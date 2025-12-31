// FILE: src/LandingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/logo.png";
import SecretarySearch from "./components/SecretarySearch.jsx";

/* أيقونات SVG */
const IconDoc = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
    <path fill="var(--accent-dark)" d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1v5h5" opacity=".9"/>
    <path fill="var(--accent-soft)" d="M8 12h8v2H8zm0 4h8v2H8zM8 8h5v2H8z"/>
  </svg>
);
const IconSearch = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
    <path fill="var(--accent-dark)" d="M10 2a8 8 0 1 1 5.29 13.94l4.38 4.38-1.41 1.41-4.38-4.38A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4Z"/>
    <circle cx="10" cy="10" r="3" fill="var(--accent-soft)"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
    <path fill="var(--accent-dark)" d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1h4V2Z"/>
    <path fill="var(--accent-soft)" d="M4 8h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Z"/>
    <path fill="var(--accent-dark)" d="M7 11h3v3H7zM12 11h3v3h-3zM7 15h3v3H7zM12 15h3v3h-3z" opacity=".9"/>
  </svg>
);
const IconTags = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
    <path fill="var(--accent-dark)" d="M10.59 2a1 1 0 0 0-.7.29L2.3 9.88a1 1 0 0 0 0 1.41l6.4 6.4a1 1 0 0 0 1.41 0l7.59-7.59a1 1 0 0 0 .29-.7V3a1 1 0 0 0-1-1h-6.4Z"/>
    <circle cx="15.5" cy="6.5" r="1.5" fill="var(--accent-soft)"/>
  </svg>
);

export default function LandingPage() {
  const [open, setOpen] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current || document;
    const items = root.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
          else e.target.classList.remove("in");
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div dir="rtl" className="page" ref={pageRef}>
      {/* الشريط العلوي */}
      <header className="q-nav">
        <img src={logo} alt="شعار شركة الفارس" className="q-logo" />

        <nav className="q-left">
          <div className={`q-dd ${open ? "open" : ""}`}>
            <button className="q-dd-btn" onClick={() => setOpen((v) => !v)}>
              المهام ▾
            </button>
            <div className="q-dd-menu" onMouseLeave={() => setOpen(false)}>
              <a className="q-dd-item" href="#">إضافة قضية</a>
              <a className="q-dd-item" href="#">عرض وتتبع القضايا</a>
              <a className="q-dd-item" href="#">الأرشيف</a>
              <a className="q-dd-item" href="#">إدارة الموظفين (للمدير)</a>
            </div>
          </div>

          <Link className="q-link" to="/dashboard-admin">مدير</Link>
          <Link className="q-link" to="/dashboard-staff">موظف</Link>
          <a className="q-link" href="#">اللغة</a>
        </nav>
      </header>

      {/* الترحيب */}
      <section className="q-hero reveal">
        <h1 className="q-h1">واجهة الفارس الذكية</h1>
        <p className="q-sub">
          نظام داخلي لإدارة القضايا — تنظيم الملفات، متابعة الجلسات، وإظهار ملخصات القضايا بسرعة ووضوح.
        </p>
        <div className="q-actions">
          <Link className="q-btn q-primary" to="/dashboard-admin">لوحة المدير</Link>
          <Link className="q-btn q-outline" to="/dashboard-staff">لوحة الموظف</Link>
        </div>
      </section>

      <main className="q-container">
        {/* ✅ سكرتير القضايا (بدل الذكاء) */}
        <section className="q-sec reveal">
          <SecretarySearch />
        </section>

        {/* مميزات للموظفين */}
        <section className="q-sec reveal">
          <h2 className="q-sec-title">مزايا أساسية للموظفين</h2>
          <div className="q-feats">
            {[
              { icon: <IconDoc />, title: "نماذج جاهزة للمذكرات", desc: "قوالب معيارية تُسهّل إعداد المذكرات وتضمن اتساق الصياغة." },
              { icon: <IconSearch />, title: "بحث موحّد للقضايا", desc: "ابحث برقم القضية أو اسم الأطراف واعرض الملخص مباشرة." },
              { icon: <IconCalendar />, title: "جلسات وتنبيهات", desc: "متابعة المواعيد والتنبيه قبل الجلسات وفق صلاحيات الموظف." },
              { icon: <IconTags />, title: "تنظيم الأدلة والمرفقات", desc: "ترتيب المستندات داخل القضية لتسهيل الرجوع والمراجعة." },
              { icon: <IconDoc />, title: "ملخصات جلسات إلزامية", desc: "توثيق ملخص الجلسة بشكل منظم بعد كل موعد." },
              { icon: <IconSearch />, title: "أرشفة مرتبة", desc: "حفظ المرفقات داخل الأرشيف وربطها بالقضايا بسرعة." },
            ].map((f, i) => (
              <div key={i} className="q-card q-feat reveal">
                <div className="q-feat-ico">{f.icon}</div>
                <div>
                  <div className="q-feat-title">{f.title}</div>
                  <div className="q-feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* مؤسس الشركة */}
        <section className="q-sec reveal">
          <h2 className="q-sec-title">من هو مؤسس الشركة</h2>
          <div className="q-card">
            <div style={{ fontWeight: 900, color: "var(--accent-dark)", marginBottom: 8 }}>
              المحامي فارس محمد الغامدي
            </div>
            <div style={{ color: "#475569", lineHeight: 1.9 }}>
              مؤسس شركة الفارس للمحاماة والاستشارات القانونية. قيادة مؤسسية قائمة على الدقة والالتزام،
              مع تنظيم عملي لإدارة القضايا وسير العمل داخل المكتب.
            </div>
          </div>
        </section>

        {/* روابط إرشادية */}
        <section className="q-sec reveal">
          <h2 className="q-sec-title">روابط إرشادية</h2>
          <div className="q-card" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 800, color: "#334155" }}>
              بوابة الأنظمة واللوائح (الرسمية):
            </span>
            <a className="q-btn q-outline" href="https://laws.boe.gov.sa/" target="_blank" rel="noreferrer">
              الدخول إلى بوابة هيئة الخبراء
            </a>
          </div>
        </section>
      </main>

      <footer className="q-footer">© 2025 واجهة الفارس — جميع الحقوق محفوظة</footer>
    </div>
  );
}
