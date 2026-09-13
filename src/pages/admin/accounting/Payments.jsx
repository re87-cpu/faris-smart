// FILE: src/pages/admin/accounting/Payments.jsx
import { useEffect, useState } from "react";
import {
  listReceipts, addReceipt, listInvoices, listClients,
  listPaymentsOut, addPaymentOut, listPurchaseInvoices, listVendors, listAccounts,
} from "../../../mock/accountingApi.js";
import { Card, EmptyState, Field, Money } from "./ui.jsx";

export default function Payments() {
  const [receipts, setReceipts] = useState([]);
  const [paymentsOut, setPaymentsOut] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openIn, setOpenIn] = useState(false);
  const [inForm, setInForm] = useState({ invoiceId: "", amount: "", method: "cash", accountId: "", paymentDate: "" });
  const [inErr, setInErr] = useState("");

  const [openOut, setOpenOut] = useState(false);
  const [outForm, setOutForm] = useState({ purchaseInvoiceId: "", amount: "", accountId: "", paymentDate: "" });
  const [outErr, setOutErr] = useState("");

  const cashBankAccounts = accounts.filter((a) => a.subtype === "cash" || a.subtype === "bank");
  const receivableInvoices = invoices.filter((i) => ["approved", "sent", "partially_paid"].includes(i.status));
  const payablePurchases = purchases.filter((p) => ["approved", "partially_paid"].includes(p.status));

  async function load() {
    setLoading(true);
    try {
      const [r, po, inv, pur, cl, ve, ac] = await Promise.all([
        listReceipts(), listPaymentsOut(), listInvoices(), listPurchaseInvoices(), listClients(), listVendors(), listAccounts(),
      ]);
      setReceipts(r); setPaymentsOut(po); setInvoices(inv); setPurchases(pur); setClients(cl); setVendors(ve); setAccounts(ac);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function clientName(id) { return clients.find((c) => c.id === id)?.name || "—"; }
  function vendorName(id) { return vendors.find((v) => v.id === id)?.name || "—"; }
  function invNumber(id) { return invoices.find((i) => i.id === id)?.invoiceNumber || "—"; }
  function poNumber(id) { return purchases.find((p) => p.id === id)?.invoiceNumber || "—"; }

  async function saveReceipt() {
    if (!inForm.amount || !inForm.accountId || !inForm.paymentDate) { setInErr("أكمل البيانات."); return; }
    try {
      const inv = invoices.find((i) => String(i.id) === String(inForm.invoiceId));
      await addReceipt({ ...inForm, clientId: inv ? inv.clientId : null });
      setOpenIn(false); setInForm({ invoiceId: "", amount: "", method: "cash", accountId: "", paymentDate: "" });
      await load();
    } catch (e) { setInErr(e.message || "تعذّر الحفظ."); }
  }

  async function savePayment() {
    if (!outForm.amount || !outForm.accountId || !outForm.paymentDate) { setOutErr("أكمل البيانات."); return; }
    try {
      const po = purchases.find((p) => String(p.id) === String(outForm.purchaseInvoiceId));
      await addPaymentOut({ ...outForm, vendorId: po ? po.vendorId : null });
      setOpenOut(false); setOutForm({ purchaseInvoiceId: "", amount: "", accountId: "", paymentDate: "" });
      await load();
    } catch (e) { setOutErr(e.message || "تعذّر الحفظ."); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title="المقبوضات (من العملاء)" action={<button className="btn btn-primary" onClick={() => setOpenIn((o) => !o)}>تسجيل دفعة مستلمة</button>}>
        {openIn && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
            <Field label="الفاتورة">
              <select className="input" value={inForm.invoiceId} onChange={(e) => setInForm({ ...inForm, invoiceId: e.target.value })}>
                <option value="">— بدون ربط بفاتورة —</option>
                {receivableInvoices.map((i) => <option key={i.id} value={i.id}>{i.invoiceNumber} ({clientName(i.clientId)}) — متبقي {i.total - i.amountPaid}</option>)}
              </select>
            </Field>
            <Field label="المبلغ"><input className="input" type="number" value={inForm.amount} onChange={(e) => setInForm({ ...inForm, amount: e.target.value })} /></Field>
            <Field label="طريقة الدفع">
              <select className="input" value={inForm.method} onChange={(e) => setInForm({ ...inForm, method: e.target.value })}>
                <option value="cash">نقدًا</option><option value="bank_transfer">تحويل بنكي</option><option value="card">بطاقة</option><option value="other">أخرى</option>
              </select>
            </Field>
            <Field label="استلمت في">
              <select className="input" value={inForm.accountId} onChange={(e) => setInForm({ ...inForm, accountId: e.target.value })}>
                <option value="">اختر حساب</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="التاريخ"><input className="input" type="date" value={inForm.paymentDate} onChange={(e) => setInForm({ ...inForm, paymentDate: e.target.value })} /></Field>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <button className="btn btn-primary" onClick={saveReceipt}>حفظ</button>
              {inErr && <span style={{ color: "#a3342a", fontSize: 13 }}>{inErr}</span>}
            </div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <div style={{ padding: 16 }}>جارٍ التحميل…</div> : receipts.length === 0 ? <EmptyState text="لا توجد مقبوضات مسجّلة بعد." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>التاريخ</th><th>الفاتورة</th><th>المبلغ</th><th>الطريقة</th></tr></thead>
            <tbody>{receipts.map((r) => (<tr key={r.id}><td>{r.paymentDate}</td><td>{r.invoiceId ? invNumber(r.invoiceId) : "—"}</td><td><Money n={r.amount} /></td><td>{r.method}</td></tr>))}</tbody>
          </table>
        )}
      </Card>

      <Card title="المدفوعات (للموردين/المصروفات)" action={<button className="btn btn-primary" onClick={() => setOpenOut((o) => !o)}>تسجيل دفعة صادرة</button>}>
        {openOut && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
            <Field label="فاتورة المشتريات">
              <select className="input" value={outForm.purchaseInvoiceId} onChange={(e) => setOutForm({ ...outForm, purchaseInvoiceId: e.target.value })}>
                <option value="">— بدون ربط —</option>
                {payablePurchases.map((p) => <option key={p.id} value={p.id}>{p.invoiceNumber} ({vendorName(p.vendorId)}) — متبقي {p.total - p.amountPaid}</option>)}
              </select>
            </Field>
            <Field label="المبلغ"><input className="input" type="number" value={outForm.amount} onChange={(e) => setOutForm({ ...outForm, amount: e.target.value })} /></Field>
            <Field label="دُفع من">
              <select className="input" value={outForm.accountId} onChange={(e) => setOutForm({ ...outForm, accountId: e.target.value })}>
                <option value="">اختر حساب</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="التاريخ"><input className="input" type="date" value={outForm.paymentDate} onChange={(e) => setOutForm({ ...outForm, paymentDate: e.target.value })} /></Field>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <button className="btn btn-primary" onClick={savePayment}>حفظ</button>
              {outErr && <span style={{ color: "#a3342a", fontSize: 13 }}>{outErr}</span>}
            </div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {paymentsOut.length === 0 ? <EmptyState text="لا توجد مدفوعات مسجّلة بعد." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>التاريخ</th><th>فاتورة المشتريات</th><th>المبلغ</th></tr></thead>
            <tbody>{paymentsOut.map((p) => (<tr key={p.id}><td>{p.paymentDate}</td><td>{p.purchaseInvoiceId ? poNumber(p.purchaseInvoiceId) : "—"}</td><td><Money n={p.amount} /></td></tr>))}</tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
