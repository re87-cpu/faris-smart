// FILE: src/components/SiteChrome.jsx
// هيدر + فوتر لصفحات الموقع العام (تصميم Law Firm v2)
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { waHref } from "../utils/site.js";

const WA_CONSULT = "السلام عليكم، أرغب في طلب استشارة قانونية.";

const NAV = [
  { key: "home", to: "/", label: "الرئيسية" },
  { key: "services", to: "/services", label: "خدماتنا" },
  { key: "packages", to: "/packages", label: "باقات الاشتراك" },
  { key: "articles", to: "/articles", label: "المقالات" },
];

export function SiteHeader({ active }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="site-header-inner">
        <Link to="/" aria-label="الرئيسية">
          <img src={logo} alt="فارس للمحاماة" className="site-logo" />
        </Link>

        <nav className="site-nav">
          {NAV.map((n) => (
            <Link key={n.key} to={n.to} className={`site-navlink${active === n.key ? " is-active" : ""}`}>
              {n.label}
            </Link>
          ))}
          <Link to="/login" className="site-btn site-btn-outline site-btn-sm">بوابة الموظفين</Link>
          <a href={waHref(WA_CONSULT)} target="_blank" rel="noopener noreferrer" className="site-btn site-btn-primary site-btn-sm">
            اطلب استشارتي
          </a>
        </nav>

        <button className="site-burger" onClick={() => setOpen((v) => !v)} aria-label="القائمة">
          <span /><span /><span />
        </button>
      </div>

      <div className={`site-mobnav${open ? " open" : ""}`}>
        {NAV.map((n) => (
          <Link key={n.key} to={n.to} onClick={() => setOpen(false)}>{n.label}</Link>
        ))}
        <Link to="/login" onClick={() => setOpen(false)}>بوابة الموظفين</Link>
        <a
          href={waHref(WA_CONSULT)}
          target="_blank"
          rel="noopener noreferrer"
          className="site-btn site-btn-primary"
          style={{ marginTop: ".9rem" }}
        >
          اطلب استشارتي
        </a>
      </div>
    </header>
  );
}

const PhoneIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
  </svg>
);

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-wrap">
        <div className="site-footer-grid">
          <div>
            <div className="site-footer-logo-chip">
              <img src={logo} alt="فارس للمحاماة" className="site-footer-logo" />
            </div>
            <p className="about">
              فارس للمحاماة، متخصصة في الاستشارات القانونية والتوثيق أمام المحاكم والجهات الحكومية
              بأعلى معايير الاحترافية والسرية.
            </p>
          </div>
          <div className="site-footer-col">
            <p className="h">الموقع</p>
            <Link to="/">الرئيسية</Link>
            <Link to="/services">خدماتنا</Link>
            <Link to="/packages">باقات الاشتراك</Link>
            <Link to="/articles">المقالات</Link>
            <Link to="/lawyer">معلومات المحامي</Link>
          </div>
          <div className="site-footer-col">
            <p className="h">الخدمات</p>
            <Link to="/services">استشارة قانونية</Link>
            <Link to="/services">صياغة ومراجعة العقود</Link>
            <Link to="/services">إعداد المذكرات واللوائح</Link>
            <Link to="/services">أعمال التوثيق</Link>
            <Link to="/services">التحكيم</Link>
          </div>
          <div className="site-footer-col">
            <p className="h">تواصل معنا</p>
            <a href="mailto:FLF.LAWYER@gmail.com"><MailIcon /> FLF.LAWYER@gmail.com</a>
            <a href={waHref(WA_CONSULT)} target="_blank" rel="noopener noreferrer"><PhoneIcon /> واتساب</a>
            <span>المملكة العربية السعودية</span>
          </div>
        </div>
        <div className="site-footer-bottom">
          <p>© 2026 فارس للمحاماة — جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}
