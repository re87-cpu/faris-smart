// FILE: src/pages/admin/accounting/AccountingLayout.jsx
import { useEffect, useRef, useState } from "react";
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

function NavDropdown({ group, isChildActive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="acct-navdd" ref={ref}>
      <button
        type="button"
        className={`acct-tab acct-navdd-trigger${isChildActive ? " is-active" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {group.label}
      </button>
      {open && (
        <div className="acct-navdd-menu">
          {group.children.map((c) => (
            <NavLink key={c.to} to={c.to} onClick={() => setOpen(false)} className={({ isActive }) => `acct-navdd-item${isActive ? " is-active" : ""}`}>
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
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
