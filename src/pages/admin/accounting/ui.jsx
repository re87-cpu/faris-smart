// FILE: src/pages/admin/accounting/ui.jsx
// عناصر واجهة مشتركة بين تبويبات المحاسبة — لتفادي تكرار نفس الأنماط 13 مرة.
import { fmtMoney } from "../../../data/financialSeed.js";

export function Card({ title, action, children, style }) {
  return (
    <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", ...style }}>
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          {title && <div className="card-title">{title}</div>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Stat({ label, value, color }) {
  return (
    <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", minWidth: 160, flex: "1 1 160px" }}>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, color: color || "var(--color-text)" }}>{value}</div>
      <div style={{ color: "var(--color-neutral-600)", fontSize: 13 }}>{label}</div>
    </div>
  );
}

export function EmptyState({ text }) {
  return <div style={{ padding: 16, color: "var(--color-neutral-600)", textAlign: "center" }}>{text}</div>;
}

export function StatusTag({ status, map }) {
  const cfg = (map || {})[status] || { label: status, cls: "tag-neutral" };
  return <span className={`tag ${cfg.cls}`}>{cfg.label}</span>;
}

export function Money({ n, suffix = " ر.س" }) {
  return <span>{fmtMoney(Number(n || 0))}{suffix}</span>;
}

export function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
      <span style={{ color: "var(--color-neutral-600)" }}>{label}</span>
      {children}
    </label>
  );
}
