// FILE: src/pages/admin/Financial.jsx
// صفحة المالية — مربوطة بالـ API الفعلي (جدول financial_transactions).
// كل الإجماليات والتفصيل حسب القضية تُحسب من قائمة المعاملات المُحمّلة — لا أرقام ثابتة.
import { useEffect, useState } from "react";
import { listFinancialTransactions, addFinancialTransaction, deleteFinancialTransaction } from "../../mock/api.js";
import { fmtMoney as fmt, typeLabels, financialTotals } from "../../data/financialSeed.js";
import { PageHeader, Section, StatRow, FormError, FormGrid, Field, Drawer, ConfirmButton, EmptyState, LoadingSkeleton, TableWrap } from "../../components/admin/ui.jsx";

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
    <div dir="rtl" className="adm">
      <PageHeader
        title="المالية"
        description={new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}
        actions={<button className="btn btn-primary" onClick={() => setOpen(true)}>إضافة معاملة مالية</button>}
      />
      <FormError>{err}</FormError>

      <Section title="الملخّص">
        <StatRow items={[
          { value: loading ? "—" : `${fmt(totalIncome)} ر.س`, label: "الإيرادات المحصّلة", color: "#2e7d5b" },
          { value: loading ? "—" : `${fmt(totalExpense)} ر.س`, label: "المصروفات", color: "#a3342a" },
          { value: loading ? "—" : `${fmt(net)} ر.س`, label: "صافي الدخل" },
          { value: loading ? "—" : `${fmt(totalDue)} ر.س`, label: "مستحقات غير محصّلة", color: "var(--color-accent-700)" },
        ]} />
      </Section>

      <Section title="الدخل حسب القضية" bordered>
        {loading ? <LoadingSkeleton rows={3} /> : caseTotals.length === 0 ? <EmptyState text="لا توجد معاملات مرتبطة بقضايا بعد." /> : (
          <TableWrap>
            <table className="table">
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
          </TableWrap>
        )}
      </Section>

      <Section title={`جميع المعاملات (${tx.length})`} bordered>
        {loading ? <LoadingSkeleton rows={4} /> : tx.length === 0 ? <EmptyState text="لا توجد معاملات مسجّلة بعد." /> : (
          <TableWrap>
            <table className="table">
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
                      <ConfirmButton
                        className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }}
                        disabled={busyId === t.id} onConfirm={() => removeTx(t.id)}
                      >
                        {busyId === t.id ? "…" : "حذف"}
                      </ConfirmButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Section>

      <Drawer
        open={open}
        onClose={() => { setOpen(false); setFormErr(""); }}
        title="معاملة مالية جديدة"
        footer={
          <>
            <button className="btn btn-primary" onClick={saveTx} disabled={saving}>{saving ? "جارٍ الحفظ…" : "حفظ المعاملة"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setOpen(false); setFormErr(""); }}>إلغاء</button>
          </>
        }
      >
        <FormError>{formErr}</FormError>
        <FormGrid>
          <Field label="النوع">
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="income">إيراد (مدفوع)</option>
              <option value="due">مستحق (غير محصّل)</option>
              <option value="expense">مصروف</option>
            </select>
          </Field>
          <Field label="المبلغ (ر.س)">
            <input className="input" type="number" placeholder="المبلغ" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
        </FormGrid>
        <FormGrid>
          <Field label="القضية">
            <select className="input" value={form.caseId} onChange={(e) => setForm({ ...form, caseId: e.target.value })}>
              <option value="">— بدون قضية —</option>
              {caseOptions.map(([id, label]) => <option key={id} value={id}>#{id} — {label}</option>)}
            </select>
          </Field>
          <Field label="التاريخ">
            <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
        </FormGrid>
        <Field label="وصف المعاملة">
          <input className="input" placeholder="وصف المعاملة" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
        </Field>
      </Drawer>
    </div>
  );
}
