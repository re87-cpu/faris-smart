// FILE: src/components/admin/ui.jsx
// عناصر واجهة مشتركة لكل صفحات لوحة المدير (عدا المحاسبة، التي تملك نظامها
// المستقل والمنشور بالفعل في src/pages/admin/accounting/ui.jsx ولا يُمس هنا).
// نفس فلسفة التصميم الهادئ: مساحات وفواصل خفيفة بدل تكرار الصناديق.
import { useEffect, useState } from "react";

export function PageHeader({ title, description, actions }) {
  return (
    <div className="adm-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="adm-header-actions">{actions}</div>}
    </div>
  );
}

export function Toolbar({ children }) {
  return <div className="adm-toolbar">{children}</div>;
}
export function ToolbarSpacer() { return <div className="adm-toolbar-spacer" />; }

export function Section({ title, hint, actions, bordered, children }) {
  return (
    <div className={`adm-section${bordered ? " bordered" : ""}`}>
      {(title || actions) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          {title && <div className="adm-section-title">{title}</div>}
          {actions}
        </div>
      )}
      {hint && <div className="adm-section-hint">{hint}</div>}
      {children}
    </div>
  );
}

export function StatRow({ items }) {
  return (
    <div className="adm-statrow">
      {items.map((it, i) => (
        <div className="adm-stat" key={i}>
          <b style={it.color ? { color: it.color } : undefined}>{it.value}</b>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

export function AlertList({ items, empty }) {
  if (!items || items.length === 0) return <div className="adm-empty">{empty || "لا يوجد ما يحتاج انتباهك حاليًا."}</div>;
  return (
    <div className="adm-alerts">
      {items.map((it, i) => (
        <div className="adm-alert-row" key={i}>
          <span>{it.label}</span>
          <span style={{ color: it.color || "var(--color-neutral-700)", fontWeight: 600 }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}

export function TableWrap({ children }) {
  return <div className="adm-table-wrap">{children}</div>;
}

export function EmptyState({ text }) {
  return <div className="adm-empty">{text}</div>;
}
export function LoadingState({ text = "جارٍ التحميل…" }) {
  return <div className="adm-loading">{text}</div>;
}

/* هيكل تحميل صامت (Skeleton) بديل نص "جارٍ التحميل…" في الجداول/القوائم الطويلة */
export function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="adm-skeleton" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="adm-skeleton-row" key={i} />
      ))}
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return <div className="adm-error">{children}</div>;
}

export function StatusTag({ status, map }) {
  const cfg = (map || {})[status] || { label: status, cls: "tag-neutral" };
  return <span className={`tag ${cfg.cls}`}>{cfg.label}</span>;
}

export function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
      <span style={{ color: "var(--color-neutral-600)" }}>{label}</span>
      {children}
    </label>
  );
}

/* زر بتأكيد من نقرتين بدل confirm() المتصفح */
export function ConfirmButton({ children, confirmLabel = "تأكيد؟", onConfirm, className = "btn btn-danger", style, disabled }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 3000); return () => clearTimeout(t); }, [armed]);
  return (
    <button
      type="button" className={className} style={style} disabled={disabled}
      onClick={() => (armed ? onConfirm() : setArmed(true))}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}

/* عدّاد صغير (Badge) — لأعداد الشريط الجانبي مثلًا */
export function Badge({ count, tone = "accent" }) {
  if (!count) return null;
  return <span className={`adm-badge adm-badge-${tone}`}>{count > 99 ? "99+" : count}</span>;
}

/* نافذة جانبية (Drawer) — نفس نمط المحاسبة المُثبت، عبر CSS بدون Portal */
export function Drawer({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="adm-drawer-overlay" onClick={onClose} />
      <div className="adm-drawer" role="dialog" aria-modal="true">
        <div className="adm-drawer-head">
          <h3>{title}</h3>
          <button type="button" className="adm-drawer-close" onClick={onClose} aria-label="إغلاق">✕</button>
        </div>
        <div className="adm-drawer-body">{children}</div>
        {footer && <div className="adm-drawer-foot">{footer}</div>}
      </div>
    </>
  );
}

export function FormGrid({ cols = 2, children }) {
  return <div className={`adm-form-grid${cols === 1 ? " cols-1" : ""}`}>{children}</div>;
}
