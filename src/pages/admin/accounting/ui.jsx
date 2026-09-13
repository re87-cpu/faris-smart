// FILE: src/pages/admin/accounting/ui.jsx
// عناصر واجهة مشتركة بين تبويبات المحاسبة — نظام هادئ يعتمد على المساحات
// والجداول والفواصل الخفيفة بدل تكرار الصناديق. لا منطق محاسبي هنا إطلاقًا.
import { useEffect, useState } from "react";
import { fmtMoney } from "../../../data/financialSeed.js";

/* رأس الصفحة: عنوان + وصف مختصر + إجراء رئيسي (يظهر مرة واحدة أعلى كل صفحة) */
export function PageHeader({ title, description, actions }) {
  return (
    <div className="acct-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="acct-header-actions">{actions}</div>}
    </div>
  );
}

/* شريط أدوات ثابت المكان: بحث + فلاتر + أزرار مساعدة */
export function Toolbar({ children }) {
  return <div className="acct-toolbar">{children}</div>;
}
export function ToolbarSpacer() { return <div className="acct-toolbar-spacer" />; }

/* قسم محتوى بسيط بدون صندوق مستقل — فاصل علوي فقط عند الحاجة للفصل بين الأقسام */
export function Section({ title, hint, actions, bordered, children }) {
  return (
    <div className={`acct-section${bordered ? " bordered" : ""}`}>
      {(title || actions) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          {title && <div className="acct-section-title">{title}</div>}
          {actions}
        </div>
      )}
      {hint && <div className="acct-section-hint">{hint}</div>}
      {children}
    </div>
  );
}

/* شريط مؤشرات أفقي هادئ — بديل بطاقات الإحصائيات الملوّنة */
export function StatRow({ items }) {
  return (
    <div className="acct-statrow">
      {items.map((it, i) => (
        <div className="acct-stat" key={i}>
          <b style={it.color ? { color: it.color } : undefined}>{it.value}</b>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

/* قائمة تنبيهات/عناصر تحتاج انتباه — صفوف مفصولة بخط بدل بطاقات */
export function AlertList({ items, empty }) {
  if (!items || items.length === 0) return <div className="acct-empty">{empty || "لا يوجد ما يحتاج انتباهك حاليًا."}</div>;
  return (
    <div className="acct-alerts">
      {items.map((it, i) => (
        <div className="acct-alert-row" key={i}>
          <span>{it.label}</span>
          <span style={{ color: it.color || "var(--color-neutral-700)", fontWeight: 600 }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}

/* جدول: غلاف بتمرير أفقي حتى لا ينكسر على الجوال، يستخدم كلاس .table الموجود */
export function TableWrap({ children }) {
  return <div className="acct-table-wrap">{children}</div>;
}

export function EmptyState({ text }) {
  return <div className="acct-empty">{text}</div>;
}
export function LoadingState({ text = "جارٍ التحميل…" }) {
  return <div className="acct-loading">{text}</div>;
}
export function FormError({ children }) {
  if (!children) return null;
  return <div className="acct-error">{children}</div>;
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

/* زر بتأكيد من نقرتين بدل confirm() المتصفح — أول نقرة تحوّل التسمية لتأكيد */
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

/* نافذة جانبية (Drawer) — تُستخدم لكل نماذج الإضافة وعرض التفاصيل بدل تكديسها بالصفحة */
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
      <div className="acct-drawer-overlay" onClick={onClose} />
      <div className="acct-drawer" role="dialog" aria-modal="true">
        <div className="acct-drawer-head">
          <h3>{title}</h3>
          <button type="button" className="acct-drawer-close" onClick={onClose} aria-label="إغلاق">✕</button>
        </div>
        <div className="acct-drawer-body">{children}</div>
        {footer && <div className="acct-drawer-foot">{footer}</div>}
      </div>
    </>
  );
}

export function FormGrid({ cols = 2, children }) {
  return <div className={`acct-form-grid${cols === 1 ? " cols-1" : ""}`}>{children}</div>;
}
