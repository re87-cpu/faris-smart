// FILE: src/pages/admin/accounting/AccountingLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
import "./accounting.css";

const TABS = [
  { to: "", label: "نظرة عامة", end: true },
  { to: "clients", label: "العملاء" },
  { to: "invoices", label: "الفواتير" },
  { to: "subscriptions", label: "الاشتراكات" },
  { to: "vendors", label: "الموردون والمشتريات" },
  { to: "expenses", label: "المصروفات" },
  { to: "payments", label: "المقبوضات والمدفوعات" },
  { to: "cash-bank", label: "الصندوق والبنوك" },
  { to: "payroll", label: "الرواتب" },
  { to: "assets", label: "الأصول الثابتة" },
  { to: "accounts", label: "دليل الحسابات" },
  { to: "ledger", label: "دفتر الأستاذ" },
  { to: "reports", label: "التقارير" },
  { to: "settings", label: "الإعدادات" },
];

export default function AccountingLayout() {
  return (
    <div dir="rtl" className="acct">
      <div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: 0 }}>المحاسبة</h1>
        <div style={{ color: "var(--color-neutral-600)", fontSize: 13, marginTop: 4 }}>
          نظام محاسبة مستقل عن صفحة "المالية" — كل عملية هنا تُنشئ قيودها المحاسبية تلقائيًا.
        </div>
      </div>

      <nav className="acct-tabs">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `acct-tab${isActive ? " is-active" : ""}`}>
            {t.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
