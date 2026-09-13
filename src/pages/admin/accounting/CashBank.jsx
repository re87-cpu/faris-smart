// FILE: src/pages/admin/accounting/CashBank.jsx
import { useEffect, useState } from "react";
import {
  listBankAccounts, addBankAccount, addTransfer, listAccounts,
  listBankStatementLines, addBankStatementLine, matchBankStatementLine,
} from "../../../mock/accountingApi.js";
import { Card, EmptyState, Field, Money } from "./ui.jsx";

export default function CashBank() {
  const [banks, setBanks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openBank, setOpenBank] = useState(false);
  const [bankForm, setBankForm] = useState({ accountName: "", bankName: "", iban: "", accountNumber: "" });

  const [openTransfer, setOpenTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({ fromAccountId: "", toAccountId: "", amount: "", date: "", notes: "" });
  const [transferErr, setTransferErr] = useState("");

  const [reconcileFor, setReconcileFor] = useState(null);
  const [lines, setLines] = useState([]);
  const [lineForm, setLineForm] = useState({ stmtDate: "", description: "", amount: "" });

  const cashBankAccounts = accounts.filter((a) => a.subtype === "cash" || a.subtype === "bank");

  async function load() {
    setLoading(true);
    try { const [b, a] = await Promise.all([listBankAccounts(), listAccounts()]); setBanks(b); setAccounts(a); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function saveBank() {
    if (!bankForm.accountName || !bankForm.bankName) return;
    await addBankAccount(bankForm);
    setOpenBank(false); setBankForm({ accountName: "", bankName: "", iban: "", accountNumber: "" });
    await load();
  }

  async function saveTransfer() {
    if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount || !transferForm.date) { setTransferErr("أكمل البيانات."); return; }
    try { await addTransfer(transferForm); setOpenTransfer(false); setTransferForm({ fromAccountId: "", toAccountId: "", amount: "", date: "", notes: "" }); await load(); }
    catch (e) { setTransferErr(e.message || "تعذّر التحويل."); }
  }

  async function openReconcile(b) { setReconcileFor(b); setLines(await listBankStatementLines(b.id)); }
  async function addLine() {
    if (!lineForm.stmtDate || !lineForm.amount) return;
    await addBankStatementLine({ bankAccountId: reconcileFor.id, ...lineForm });
    setLineForm({ stmtDate: "", description: "", amount: "" });
    setLines(await listBankStatementLines(reconcileFor.id));
  }
  async function mark(id, status) { await matchBankStatementLine(id, { status }); setLines(await listBankStatementLines(reconcileFor.id)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title="الحسابات البنكية" action={<button className="btn btn-primary" onClick={() => setOpenBank((o) => !o)}>إضافة حساب بنكي</button>}>
        {openBank && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
            <Field label="اسم الحساب (للعرض)"><input className="input" value={bankForm.accountName} onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })} /></Field>
            <Field label="اسم البنك"><input className="input" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} /></Field>
            <Field label="IBAN"><input className="input" value={bankForm.iban} onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })} /></Field>
            <Field label="رقم الحساب"><input className="input" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} /></Field>
            <div style={{ gridColumn: "1 / -1" }}><button className="btn btn-primary" onClick={saveBank}>حفظ</button></div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <div style={{ padding: 16 }}>جارٍ التحميل…</div> : banks.length === 0 ? <EmptyState text="لا توجد حسابات بنكية بعد (الصندوق النقدي متاح دائمًا كحساب افتراضي)." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>الحساب</th><th>البنك</th><th>الرصيد</th><th></th></tr></thead>
            <tbody>
              {banks.map((b) => (
                <tr key={b.id}><td><b>{b.accountName}</b></td><td>{b.bankName}</td><td><Money n={b.balance} /></td>
                  <td style={{ textAlign: "left" }}><button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openReconcile(b)}>تسوية بنكية</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="تحويل بين حسابات (صندوق/بنوك)" action={<button className="btn btn-primary" onClick={() => setOpenTransfer((o) => !o)}>تحويل جديد</button>}>
        {openTransfer && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-neutral-200)" }}>
            <Field label="من حساب">
              <select className="input" value={transferForm.fromAccountId} onChange={(e) => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}>
                <option value="">اختر</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="إلى حساب">
              <select className="input" value={transferForm.toAccountId} onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })}>
                <option value="">اختر</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="المبلغ"><input className="input" type="number" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} /></Field>
            <Field label="التاريخ"><input className="input" type="date" value={transferForm.date} onChange={(e) => setTransferForm({ ...transferForm, date: e.target.value })} /></Field>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn btn-primary" onClick={saveTransfer}>تنفيذ التحويل</button>
              {transferErr && <span style={{ color: "#a3342a", fontSize: 13 }}>{transferErr}</span>}
            </div>
          </div>
        )}
      </Card>

      {reconcileFor && (
        <Card title={`تسوية بنكية: ${reconcileFor.accountName}`} action={<button className="btn btn-ghost" onClick={() => setReconcileFor(null)}>إغلاق</button>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr auto", gap: 10, marginBottom: 12 }}>
            <input className="input" type="date" value={lineForm.stmtDate} onChange={(e) => setLineForm({ ...lineForm, stmtDate: e.target.value })} />
            <input className="input" placeholder="وصف الحركة من كشف البنك" value={lineForm.description} onChange={(e) => setLineForm({ ...lineForm, description: e.target.value })} />
            <input className="input" type="number" placeholder="المبلغ" value={lineForm.amount} onChange={(e) => setLineForm({ ...lineForm, amount: e.target.value })} />
            <button className="btn btn-secondary" onClick={addLine}>إضافة سطر</button>
          </div>
          {lines.length === 0 ? <EmptyState text="لا توجد سطور كشف بنكي مُدخلة بعد." /> : (
            <table className="table" style={{ margin: 0 }}>
              <thead><tr><th>التاريخ</th><th>الوصف</th><th>المبلغ</th><th>الحالة</th><th></th></tr></thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.id}>
                    <td>{l.date}</td><td>{l.description}</td><td><Money n={l.amount} /></td><td>{l.status}</td>
                    <td style={{ textAlign: "left" }}>
                      {l.status === "unmatched" && (
                        <>
                          <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => mark(l.id, "matched")}>مطابقة</button>
                          <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12, marginRight: 6 }} onClick={() => mark(l.id, "adjusted")}>تسجيل كتعديل</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}
