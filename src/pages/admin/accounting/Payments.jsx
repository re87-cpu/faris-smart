// FILE: src/pages/admin/accounting/Payments.jsx
import { useEffect, useState } from "react";
import {
  listReceipts, addReceipt, listInvoices, listClients,
  listPaymentsOut, addPaymentOut, listPurchaseInvoices, listVendors, listAccounts,
} from "../../../mock/accountingApi.js";
import { PageHeader, Section, TableWrap, EmptyState, LoadingState, FormError, Field, FormGrid, Money, Drawer } from "./ui.jsx";

const emptyIn = { invoiceId: "", amount: "", method: "cash", accountId: "", paymentDate: "" };
const emptyOut = { purchaseInvoiceId: "", amount: "", accountId: "", paymentDate: "" };

export default function Payments() {
  const [receipts, setReceipts] = useState([]);
  const [paymentsOut, setPaymentsOut] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [drawer, setDrawer] = useState(null); // "in" | "out"
  const [inForm, setInForm] = useState(emptyIn);
  const [inErr, setInErr] = useState("");
  const [outForm, setOutForm] = useState(emptyOut);
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
      setDrawer(null); setInForm(emptyIn);
      await load();
    } catch (e) { setInErr(e.message || "تعذّر الحفظ."); }
  }

  async function savePayment() {
    if (!outForm.amount || !outForm.accountId || !outForm.paymentDate) { setOutErr("أكمل البيانات."); return; }
    try {
      const po = purchases.find((p) => String(p.id) === String(outForm.purchaseInvoiceId));
      await addPaymentOut({ ...outForm, vendorId: po ? po.vendorId : null });
      setDrawer(null); setOutForm(emptyOut);
      await load();
    } catch (e) { setOutErr(e.message || "تعذّر الحفظ."); }
  }

  return (
    <div className="acct">
      <PageHeader
        title="المقبوضات والمدفوعات"
        description="تسجيل ما يُستلم من العملاء وما يُدفع للموردين والمصروفات — يُحدَّث رصيد الفاتورة تلقائيًا."
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => { setOutForm(emptyOut); setOutErr(""); setDrawer("out"); }}>دفعة صادرة</button>
            <button className="btn btn-primary" onClick={() => { setInForm(emptyIn); setInErr(""); setDrawer("in"); }}>دفعة مستلمة</button>
          </>
        }
      />

      {loading ? <LoadingState /> : (
        <>
          <Section title="المقبوضات (من العملاء)">
            {receipts.length === 0 ? <EmptyState text="لا توجد مقبوضات مسجّلة بعد." /> : (
              <TableWrap>
                <table className="table">
                  <thead><tr><th>التاريخ</th><th>الفاتورة</th><th>المبلغ</th><th>الطريقة</th></tr></thead>
                  <tbody>{receipts.map((r) => (<tr key={r.id}><td>{r.paymentDate}</td><td>{r.invoiceId ? invNumber(r.invoiceId) : "—"}</td><td><Money n={r.amount} /></td><td>{r.method}</td></tr>))}</tbody>
                </table>
              </TableWrap>
            )}
          </Section>

          <Section title="المدفوعات (للموردين/المصروفات)" bordered>
            {paymentsOut.length === 0 ? <EmptyState text="لا توجد مدفوعات مسجّلة بعد." /> : (
              <TableWrap>
                <table className="table">
                  <thead><tr><th>التاريخ</th><th>فاتورة المشتريات</th><th>المبلغ</th></tr></thead>
                  <tbody>{paymentsOut.map((p) => (<tr key={p.id}><td>{p.paymentDate}</td><td>{p.purchaseInvoiceId ? poNumber(p.purchaseInvoiceId) : "—"}</td><td><Money n={p.amount} /></td></tr>))}</tbody>
                </table>
              </TableWrap>
            )}
          </Section>
        </>
      )}

      <Drawer
        open={drawer === "in"} onClose={() => setDrawer(null)} title="تسجيل دفعة مستلمة"
        footer={<><button className="btn btn-primary" onClick={saveReceipt}>حفظ</button><FormError>{inErr}</FormError></>}
      >
        <Field label="الفاتورة">
          <select className="input" value={inForm.invoiceId} onChange={(e) => setInForm({ ...inForm, invoiceId: e.target.value })}>
            <option value="">— بدون ربط بفاتورة —</option>
            {receivableInvoices.map((i) => <option key={i.id} value={i.id}>{i.invoiceNumber} ({clientName(i.clientId)}) — متبقي {i.total - i.amountPaid}</option>)}
          </select>
        </Field>
        <FormGrid>
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
        </FormGrid>
      </Drawer>

      <Drawer
        open={drawer === "out"} onClose={() => setDrawer(null)} title="تسجيل دفعة صادرة"
        footer={<><button className="btn btn-primary" onClick={savePayment}>حفظ</button><FormError>{outErr}</FormError></>}
      >
        <Field label="فاتورة المشتريات">
          <select className="input" value={outForm.purchaseInvoiceId} onChange={(e) => setOutForm({ ...outForm, purchaseInvoiceId: e.target.value })}>
            <option value="">— بدون ربط —</option>
            {payablePurchases.map((p) => <option key={p.id} value={p.id}>{p.invoiceNumber} ({vendorName(p.vendorId)}) — متبقي {p.total - p.amountPaid}</option>)}
          </select>
        </Field>
        <FormGrid>
          <Field label="المبلغ"><input className="input" type="number" value={outForm.amount} onChange={(e) => setOutForm({ ...outForm, amount: e.target.value })} /></Field>
          <Field label="دُفع من">
            <select className="input" value={outForm.accountId} onChange={(e) => setOutForm({ ...outForm, accountId: e.target.value })}>
              <option value="">اختر حساب</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <Field label="التاريخ"><input className="input" type="date" value={outForm.paymentDate} onChange={(e) => setOutForm({ ...outForm, paymentDate: e.target.value })} /></Field>
        </FormGrid>
      </Drawer>
    </div>
  );
}
