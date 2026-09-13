// FILE: src/pages/admin/accounting/AccountingLayout.jsx
import { NavLink, Outlet } from "react-router-dom";

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
  { to: "ledger", label: "دفتر الأستاذ وميزان المراجعة" },
  { to: "reports", label: "التقارير المالية" },
  { to: "settings", label: "الإعدادات" },
];

export default function AccountingLayout() {
  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: 0 }}>المحاسبة</h1>
        <div style={{ color: "var(--color-neutral-600)", fontSize: 13, marginTop: 4 }}>
          نظام محاسبة مستقل عن صفحة "المالية" — كل عملية هنا تُنشئ قيودها المحاسبية تلقائيًا.
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", borderBottom: "1px solid var(--color-neutral-200)", paddingBottom: 8 }}>
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            style={({ isActive }) => ({
              padding: "6px 12px", borderRadius: "var(--radius-sm)", fontSize: 13, textDecoration: "none",
              background: isActive ? "var(--color-accent-700)" : "transparent",
              color: isActive ? "#fff" : "var(--color-text)",
              border: isActive ? "none" : "1px solid var(--color-neutral-200)",
            })}
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
