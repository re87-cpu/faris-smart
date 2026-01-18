// FILE: src/LandingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/logo.png";
import lawyerImg from "./assets/lawyer.jpeg";

/* أيقونات SVG */
const IconDoc = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="var(--accent-dark)"
      d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1v5h5"
      opacity=".9"
    />
    <path fill="var(--accent-soft)" d="M8 12h8v2H8zm0 4h8v2H8zM8 8h5v2H8z" />
  </svg>
);

const IconSearch = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="var(--accent-dark)"
      d="M10 2a8 8 0 1 1 5.29 13.94l4.38 4.38-1.41 1.41-4.38-4.38A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4Z"
    />
    <circle cx="10" cy="10" r="3" fill="var(--accent-soft)" />
  </svg>
);

const IconCalendar = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="var(--accent-dark)"
      d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1h4V2Z"
    />
    <path fill="var(--accent-soft)" d="M4 8h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Z" />
    <path
      fill="var(--accent-dark)"
      d="M7 11h3v3H7zM12 11h3v3h-3zM7 15h3v3H7zM12 15h3v3h-3z"
      opacity=".9"
    />
  </svg>
);

const IconTags = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="var(--accent-dark)"
      d="M10.59 2a1 1 0 0 0-.7.29L2.3 9.88a1 1 0 0 0 0 1.41l6.4 6.4a1 1 0 0 0 1.41 0l7.59-7.59a1 1 0 0 0 .29-.7V3a1 1 0 0 0-1-1h-6.4Z"
    />
    <circle cx="15.5" cy="6.5" r="1.5" fill="var(--accent-soft)" />
  </svg>
);

export default function LandingPage() {
  const [open, setOpen] = useState(false);
  const pageRef = useRef(null);

  // رابط افتراضي ثابت (عشان ما يصير رمادي لو .env مو شغال)
  const DEFAULT_MAPS_URL =
    "https://www.google.com/maps/place/21.28821262,39.27168497";

  // يقرأ من env لو موجود، وإلا يستخدم الافتراضي
  const mapsUrl =
    (import.meta?.env?.VITE_GOOGLE_MAPS_URL || "").toString().trim() ||
    DEFAULT_MAPS_URL;

  // خريطة داخل الصفحة (Embed)
  const embedUrl =
    "https://www.google.com/maps?q=21.28821262,39.27168497&z=16&output=embed";

  useEffect(() => {
    const root = pageRef.current || document;
    const items = root.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
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
          <Link className="q-link" to="/services">الخدمات</Link>

          <div className={`q-dd ${open ? "open" : ""}`}>
            <button className="q-dd-btn" onClick={() => setOpen((v) => !v)}>
              روابط ▾
            </button>
            <div className="q-dd-menu" onMouseLeave={() => setOpen(false)}>
              <a className="q-dd-item" href="#about">من نحن</a>
              <a className="q-dd-item" href="#contact">موقع المكتب</a>
              <a
                className="q-dd-item"
                href="https://laws.boe.gov.sa/"
                target="_blank"
                rel="noreferrer"
              >
                بوابة الأنظمة واللوائح
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* الترحيب */}
      <section className="q-hero reveal">
        <h1 className="q-h1">أهلًا بكم</h1>
        <p className="q-sub" style={{ lineHeight: 2 }}>
          ﴿ إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالإِحْسَانِ ﴾
          <br />
          ممارسة قانونية تُدار بالأمانة، وتُنفَّذ بوضوح، وتُحتكم فيها الأنظمة قبل كل إجراء.
        </p>
      </section>

      <main className="q-container">
        {/* الخدمات */}
        <section className="q-sec reveal">
          <h2 className="q-sec-title">خدماتنا</h2>

          <div className="q-feats">
            {[
              { icon: <IconSearch />, title: "استشارة قانونية", desc: "توجيه قانوني واضح يضعك على المسار الصحيح وفق حالتك." },
              { icon: <IconDoc />, title: "صياغة ومراجعة العقود", desc: "صياغة احترافية أو مراجعة دقيقة لضمان الحقوق وتخفيف المخاطر." },
              { icon: <IconDoc />, title: "مذكرات ولوائح", desc: "إعداد لوائح ومذكرات قانونية بصياغة منضبطة وحجج مرتبة." },
              { icon: <IconTags />, title: "خطابات وإنذارات", desc: "خطابات قانونية وإنذارات رسمية بصيغة قوية وواضحة." },
              { icon: <IconDoc />, title: "وكالات وتفويضات", desc: "إعداد صيغ وكالات وتفويضات بما يتوافق مع المتطلبات النظامية." },
              { icon: <IconCalendar />, title: "متابعة المواعيد", desc: "تنظيم المواعيد والجلسات وفق إجراءات واضحة ومتابعة دقيقة." },
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

          {/* زر واحد فقط تحت الخدمات */}
          <div style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
            <Link
              className="q-btn q-primary"
              to="/services"
              style={{ padding: "14px 34px", borderRadius: 999, fontWeight: 900, fontSize: 16 }}
            >
              ابدأ الخدمة
            </Link>
          </div>
        </section>

        {/* ✅ من نحن (لحال + فيه كرت المحامي وصورته) */}
        <section id="about" className="q-sec reveal">
          <h2 className="q-sec-title">من نحن</h2>

          <div className="q-card" style={{ display: "grid", gap: 16 }}>
            <div style={{ color: "#475569", lineHeight: 1.9 }}>
              مكتب قانوني يقدم خدماته وفق الأنظمة المعمول بها في المملكة العربية السعودية،
              مع التزام بالسرية المهنية ووضوح الإجراءات.
            </div>

       

            {/* ✅ كرت المحامي هنا فقط (بدون تكرار في الفوتر) */}
            <div
              style={{
                marginTop: 6,
                paddingTop: 14,
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <img
                  src={lawyerImg}
                  alt="صورة المحامي"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 999,
                    objectFit: "cover",
                    border: "1px solid var(--border)",
                  }}
                />
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 950, color: "var(--accent-dark)" }}>
                    المحامي: فارس محمد الغامدي
                  </div>
                  <div style={{ color: "#475569", lineHeight: 1.7, fontSize: 13 }}>
                    نؤدي الأمانة ونحفظ أسرار عملائنا، مع وضوح الإجراءات وجودة الصياغة.
                  </div>
                </div>
              </div>

              <Link className="q-btn q-outline" to="/lawyer">
                عرض بيانات المحامي
              </Link>
            </div>
          </div>
        </section>

        {/* ✅ ما هو القانون + العدل ومخافة الله (سوا بنفس القسم) */}
        <section className="q-sec reveal">
          <h2 className="q-sec-title">مبادئنا</h2>

          <div
            className="q-feats"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
          >
            <div className="q-card reveal">
              <h3 className="h2">ما هو القانون؟</h3>
              <div className="muted">منظومة قواعد تُنظّم حياة الناس وتحقق العدالة.</div>
            </div>

            <div className="q-card reveal">
              <h3 className="h2">العدل ومخافة الله</h3>
              <div className="muted">“اتقوا الله في أعمالكم، فإن العدل أساس الملك.”</div>
            </div>
          </div>
        </section>

        {/* روابط إرشادية */}
        <section className="q-sec reveal">
          <h2 className="q-sec-title">روابط إرشادية</h2>
          <div className="q-card" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 800, color: "#334155" }}>بوابة الأنظمة واللوائح (الرسمية):</span>
            <a className="q-btn q-outline" href="https://laws.boe.gov.sa/" target="_blank" rel="noreferrer">
              الدخول إلى بوابة هيئة الخبراء
            </a>
          </div>
        </section>

        {/* موقع المكتب */}
        <section id="contact" className="q-sec reveal">
          <h2 className="q-sec-title">موقع المكتب</h2>

          <div className="q-card" style={{ maxWidth: 560, margin: "0 auto", display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 900, color: "#0f172a" }}>📍 جدة — حي الفضيلة</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>
                  اضغط على الخريطة للتكبير أو افتحها في خرائط Google.
                </div>
              </div>

              <a
                className="q-btn q-primary"
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                style={{ borderRadius: 999, padding: "10px 14px", fontWeight: 900, whiteSpace: "nowrap" }}
              >
                فتح في خرائط Google
              </a>
            </div>

            <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                }}
              >
                <iframe
                  title="موقع المكتب على الخريطة"
                  src={embedUrl}
                  width="100%"
                  height="240"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0, display: "block", pointerEvents: "none" }}
                />
              </div>
            </a>

            <div style={{ color: "#64748b", fontSize: 13 }}>يتم استقبال العملاء حسب موعد مسبق.</div>
          </div>
        </section>
      </main>

      {/* ✅ فوتر بسيط بدون كرت المحامي */}
      <footer className="q-footer">
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <Link className="q-btn q-outline" to="/dashboard-admin">دخول المدير</Link>
          <Link className="q-btn q-outline" to="/dashboard-staff">دخول الموظف</Link>
        </div>

        © 2026 واجهة فارس — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
