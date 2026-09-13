// FILE: src/pages/admin/accounting/CashBank.jsx
import { useEffect, useState } from "react";
import {
  listBankAccounts, addBankAccount, addTransfer, listAccounts,
  listBankStatementLines, addBankStatementLine, matchBankStatementLine,
} from "../../../mock/accountingApi.js";
import { PageHeader, Section, TableWrap, EmptyState, LoadingState, FormError, Field, FormGrid, Money, Drawer } from "./ui.jsx";

const emptyBank = { accountName: "", bankName: "", iban: "", accountNumber: "" };
const emptyTransfer = { fromAccountId: "", toAccountId: "", amount: "", date: "", notes: "" };

export default function CashBank() {
  const [banks, setBanks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [drawer, setDrawer] = useState(null); // "bank" | "transfer" | { reconcile: bank }
  const [bankForm, setBankForm] = useState(emptyBank);
  const [transferForm, setTransferForm] = useState(emptyTransfer);
  const [transferErr, setTransferErr] = useState("");

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
    setDrawer(null); setBankForm(emptyBank);
    await load();
  }

  async function saveTransfer() {
    if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount || !transferForm.date) { setTransferErr("أكمل البيانات."); return; }
    try { await addTransfer(transferForm); setDrawer(null); setTransferForm(emptyTransfer); await load(); }
    catch (e) { setTransferErr(e.message || "تعذّر التحويل."); }
  }

  async function openReconcile(b) { setDrawer({ reconcile: b }); setLines(await listBankStatementLines(b.id)); }
  async function addLine() {
    if (!lineForm.stmtDate || !lineForm.amount) return;
    await addBankStatementLine({ bankAccountId: drawer.reconcile.id, ...lineForm });
    setLineForm({ stmtDate: "", description: "", amount: "" });
    setLines(await listBankStatementLines(drawer.reconcile.id));
  }
  async function mark(id, status) { await matchBankStatementLine(id, { status }); setLines(await listBankStatementLines(drawer.reconcile.id)); }

  return (
    <div className="acct">
      <PageHeader
        title="الصندوق والبنوك"
        description="حسابات الصندوق والبنوك، التحويلات بينها، ومطابقة كشوف الحسابات البنكية."
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => { setTransferForm(emptyTransfer); setTransferErr(""); setDrawer("transfer"); }}>تحويل بين حسابات</button>
            <button className="btn btn-primary" onClick={() => { setBankForm(emptyBank); setDrawer("bank"); }}>إضافة حساب بنكي</button>
          </>
        }
      />

      {loading ? <LoadingState /> : banks.length === 0 ? (
        <EmptyState text="لا توجد حسابات بنكية بعد (الصندوق النقدي متاح دائمًا كحساب افتراضي)." />
      ) : (
        <TableWrap>
          <table className="table">
            <thead><tr><th>الحساب</th><th>البنك</th><th>الرصيد</th><th></th></tr></thead>
            <tbody>
              {banks.map((b) => (
                <tr key={b.id}>
                  <td><b>{b.accountName}</b></td><td>{b.bankName}</td><td><Money n={b.balance} /></td>
                  <td style={{ textAlign: "left" }}><button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openReconcile(b)}>تسوية بنكية</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Drawer open={drawer === "bank"} onClose={() => setDrawer(null)} title="إضافة حساب بنكي" footer={<button className="btn btn-primary" onClick={saveBank}>حفظ</button>}>
        <Field label="اسم الحساب (للعرض)"><input className="input" value={bankForm.accountName} onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })} /></Field>
        <Field label="اسم البنك"><input className="input" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} /></Field>
        <FormGrid>
          <Field label="IBAN"><input className="input" value={bankForm.iban} onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })} /></Field>
          <Field label="رقم الحساب"><input className="input" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} /></Field>
        </FormGrid>
      </Drawer>

      <Drawer
        open={drawer === "transfer"} onClose={() => setDrawer(null)} title="تحويل بين حسابات"
        footer={<><button className="btn btn-primary" onClick={saveTransfer}>تنفيذ التحويل</button><FormError>{transferErr}</FormError></>}
      >
        <FormGrid>
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
        </FormGrid>
      </Drawer>

      <Drawer open={!!drawer?.reconcile} onClose={() => setDrawer(null)} title={drawer?.reconcile ? `تسوية بنكية: ${drawer.reconcile.accountName}` : ""}>
        <Section title="إضافة سطر من كشف البنك">
          <FormGrid cols={1}>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" type="date" value={lineForm.stmtDate} onChange={(e) => setLineForm({ ...lineForm, stmtDate: e.target.value })} />
              <input className="input" type="number" placeholder="المبلغ" value={lineForm.amount} onChange={(e) => setLineForm({ ...lineForm, amount: e.target.value })} />
            </div>
            <input className="input" placeholder="وصف الحركة" value={lineForm.description} onChange={(e) => setLineForm({ ...lineForm, description: e.target.value })} />
            <button className="btn btn-secondary" style={{ alignSelf: "flex-start" }} onClick={addLine}>إضافة سطر</button>
          </FormGrid>
        </Section>
        <Section title="السطور" bordered>
          {lines.length === 0 ? <EmptyState text="لا توجد سطور كشف بنكي مُدخلة بعد." /> : (
            <TableWrap>
              <table className="table">
                <thead><tr><th>التاريخ</th><th className="wrap">الوصف</th><th>المبلغ</th><th>الحالة</th><th></th></tr></thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id}>
                      <td>{l.date}</td><td className="wrap">{l.description}</td><td><Money n={l.amount} /></td><td>{l.status}</td>
                      <td>
                        {l.status === "unmatched" && (
                          <div className="acct-row-actions">
                            <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => mark(l.id, "matched")}>مطابقة</button>
                            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => mark(l.id, "adjusted")}>تعديل</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Section>
      </Drawer>
    </div>
  );
}
