// FILE: src/pages/admin/accounting/AccountingLayout.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./accounting.css";

const NAV = [
  { to: "", label: "نظرة عامة", end: true },
  { label: "المبيعات", children: [
    { to: "clients", label: "العملاء" },
    { to: "invoices", label: "الفواتير" },
    { to: "subscriptions", label: "الاشتراكات" },
  ]},
  { label: "المشتريات", children: [
    { to: "vendors", label: "الموردون والمشتريات" },
    { to: "expenses", label: "المصروفات" },
  ]},
  { label: "الخزينة والأصول", children: [
    { to: "payments", label: "المقبوضات والمدفوعات" },
    { to: "cash-bank", label: "الصندوق والبنوك" },
    { to: "payroll", label: "الرواتب" },
    { to: "assets", label: "الأصول الثابتة" },
  ]},
  { label: "المحاسبة والتقارير", children: [
    { to: "accounts", label: "دليل الحسابات" },
    { to: "ledger", label: "دفتر الأستاذ" },
    { to: "reports", label: "التقارير" },
  ]},
  { to: "settings", label: "الإعدادات" },
];

// القائمة تُرسم عبر Portal مباشرة على <body> بموضع ثابت (fixed) محسوب من مكان
// الزر — بهذا لا تتأثر أبدًا بأي تمرير أو قصّ (overflow) من شريط التبويبات
// أو أي عنصر أب، وتظهر كاملة وواضحة فوق الصفحة.
function NavDropdown({ group, isChildActive }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  function openMenu() {
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const onScrollOrResize = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`acct-tab acct-navdd-trigger${isChildActive ? " is-active" : ""}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-expanded={open}
      >
        {group.label}
      </button>
      {open && pos && createPortal(
        <div className="acct-navdd-menu" ref={menuRef} style={{ top: pos.top, right: pos.right }}>
          {group.children.map((c) => (
            <NavLink key={c.to} to={c.to} onClick={() => setOpen(false)} className={({ isActive }) => `acct-navdd-item${isActive ? " is-active" : ""}`}>
              {c.label}
            </NavLink>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

export default function AccountingLayout() {
  const location = useLocation();

  return (
    <div dir="rtl" className="acct">
      <div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: 0 }}>المحاسبة</h1>
        <div style={{ color: "var(--color-neutral-600)", fontSize: 13, marginTop: 4 }}>
          نظام محاسبة مستقل عن صفحة "المالية" — كل عملية هنا تُنشئ قيودها المحاسبية تلقائيًا.
        </div>
      </div>

      <nav className="acct-tabs">
        {NAV.map((item, i) => {
          if (item.children) {
            const isChildActive = item.children.some((c) => location.pathname.endsWith(`/accounting/${c.to}`));
            return <NavDropdown key={i} group={item} isChildActive={isChildActive} />;
          }
          return (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `acct-tab${isActive ? " is-active" : ""}`}>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
