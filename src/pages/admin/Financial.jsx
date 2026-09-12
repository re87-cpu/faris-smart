// FILE: src/pages/admin/Financial.jsx
// صفحة المالية — مربوطة بالـ API الفعلي (جدول financial_transactions).
// كل الإجماليات والتفصيل حسب القضية تُحسب من قائمة المعاملات المُحمّلة — لا أرقام ثابتة.
import { useEffect, useState } from "react";
import { listFinancialTransactions, addFinancialTransaction, deleteFinancialTransaction } from "../../mock/api.js";
import { fmtMoney as fmt, typeLabels, financialTotals } from "../../data/financialSeed.js";

function Stat({ label, value, color }) {
  return (
    <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", minWidth: 160, flex: "1 1 160px" }}>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 700, color: color || "var(--color-text)" }}>
        {value} ر.س
      </div>
      <div style={{ color: "var(--color-neutral-600)", fontSize: 13 }}>{label}</div>
    </div>
  );
}

export default function Financial() {
  const [tx, setTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "income", amount: "", caseId: "", date: "", desc: "" });
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const rows = await listFinancialTransactions();
      setTx(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setErr(e.message || "تعذّر تحميل البيانات المالية.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const { totalIncome, totalExpense, totalDue, net } = financialTotals(tx);

  const caseIds = [...new Set(tx.filter((t) => t.caseId).map((t) => t.caseId))];
  const caseTotals = caseIds.map((id) => {
    const rows = tx.filter((t) => t.caseId === id);
    const paid = rows.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const due = rows.filter((t) => t.type === "due").reduce((s, t) => s + t.amount, 0);
    return { id, label: rows[0].caseLabel, paid, due };
  });

  const caseOptions = [...new Map(tx.filter((t) => t.caseId).map((t) => [t.caseId, t.caseLabel])).entries()];

  async function saveTx() {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { setFormErr("أدخل مبلغًا صحيحًا أكبر من صفر."); return; }
    const chosen = caseOptions.find(([id]) => id === form.caseId);
    setSaving(true);
    setFormErr("");
    try {
      await addFinancialTransaction({
        type: form.type, amount,
        caseId: form.caseId || "", caseLabel: chosen ? chosen[1] : "",
        date: form.date || undefined,
        desc: form.desc || "",
      });
      setOpen(false);
      setForm({ type: "income", amount: "", caseId: "", date: "", desc: "" });
      await load();
    } catch (e) {
      setFormErr(e.message || "تعذّر حفظ المعاملة.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTx(id) {
    setBusyId(id);
    try { await deleteFinancialTransaction(id); await load(); }
    catch (e) { setErr(e.message || "تعذّر حذف المعاملة."); }
    finally { setBusyId(null); }
  }

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="card-title">المالية</div>
            <div style={{ color: "var(--color-neutral-600)", marginTop: 4 }}>
              {new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setOpen((o) => !o)}>إضافة معاملة مالية</button>
        </div>

        {open && (
          <div
            style={{
              marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-neutral-200)",
              display: "flex", flexDirection: "column", gap: 10, maxWidth: 640,
            }}
          >
            <div style={{ fontWeight: 700 }}>معاملة مالية جديدة</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="income">إيراد (مدفوع)</option>
                <option value="due">مستحق (غير محصّل)</option>
                <option value="expense">مصروف</option>
              </select>
              <input className="input" type="number" placeholder="المبلغ (ر.س)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <select className="input" value={form.caseId} onChange={(e) => setForm({ ...form, caseId: e.target.value })}>
                <option value="">— بدون قضية —</option>
                {caseOptions.map(([id, label]) => <option key={id} value={id}>#{id} — {label}</option>)}
              </select>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <input className="input" placeholder="وصف المعاملة" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn btn-primary" onClick={saveTx} disabled={saving}>{saving ? "جارٍ الحفظ…" : "حفظ المعاملة"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setOpen(false); setFormErr(""); }}>إلغاء</button>
              {formErr && <span style={{ color: "#a3342a", fontSize: 13 }}>{formErr}</span>}
            </div>
          </div>
        )}
      </div>

      {err && <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", color: "#a3342a" }}>{err}</div>}

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Stat label="الإيرادات المحصّلة" value={loading ? "—" : fmt(totalIncome)} color="#2e7d5b" />
        <Stat label="المصروفات" value={loading ? "—" : fmt(totalExpense)} color="#a3342a" />
        <Stat label="صافي الدخل" value={loading ? "—" : fmt(net)} />
        <Stat label="مستحقات غير محصّلة" value={loading ? "—" : fmt(totalDue)} color="var(--color-accent-700)" />
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", padding: 0, overflow: "hidden" }}>
        <div style={{ fontWeight: 700, padding: "14px 16px 0" }}>الدخل حسب القضية</div>
        {loading ? (
          <div style={{ padding: 16 }}>جارٍ التحميل…</div>
        ) : caseTotals.length === 0 ? (
          <div style={{ padding: 16, color: "var(--color-neutral-600)" }}>لا توجد معاملات مرتبطة بقضايا بعد.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ margin: 0 }}>
              <thead><tr><th>الرقم</th><th>العنوان</th><th>المدفوع</th><th>المستحق</th></tr></thead>
              <tbody>
                {caseTotals.map((c) => (
                  <tr key={c.id}>
                    <td><b>#{c.id}</b></td>
                    <td>{c.label}</td>
                    <td>{fmt(c.paid)} ر.س</td>
                    <td>{c.due > 0 ? fmt(c.due) + " ر.س" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card elev-sm" style={{ border: "1px solid var(--color-neutral-300)", padding: 0, overflow: "hidden" }}>
        <div style={{ fontWeight: 700, padding: "14px 16px 0" }}>جميع المعاملات ({tx.length})</div>
        {loading ? (
          <div style={{ padding: 16 }}>جارٍ التحميل…</div>
        ) : tx.length === 0 ? (
          <div style={{ padding: 16, color: "var(--color-neutral-600)" }}>لا توجد معاملات مسجّلة بعد.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ margin: 0 }}>
              <thead><tr><th>التاريخ</th><th>النوع</th><th>الوصف</th><th>القضية</th><th>المبلغ</th><th></th></tr></thead>
              <tbody>
                {tx.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td><span className={`tag ${t.type === "income" ? "tag-accent" : t.type === "due" ? "tag-outline" : "tag-neutral"}`}>{typeLabels[t.type]}</span></td>
                    <td>{t.desc || "—"}</td>
                    <td>{t.caseId ? "#" + t.caseId : "—"}</td>
                    <td style={{ fontWeight: 700 }}>{t.type === "expense" ? "-" : ""}{fmt(t.amount)} ر.س</td>
                    <td style={{ textAlign: "left" }}>
                      <button
                        type="button" className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }}
                        disabled={busyId === t.id} onClick={() => removeTx(t.id)}
                      >
                        {busyId === t.id ? "…" : "حذف"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
