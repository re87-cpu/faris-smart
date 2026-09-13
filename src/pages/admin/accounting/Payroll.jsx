// FILE: src/pages/admin/accounting/Payroll.jsx
import { useEffect, useState } from "react";
import {
  listPayrollProfiles, addPayrollProfile, listPayrollAdvances, addPayrollAdvance,
  listPayrollRuns, addPayrollRun, approvePayrollRun, payPayrollRun, getPayrollRun, listAccounts,
} from "../../../mock/accountingApi.js";
import { fetchEmployees } from "../../../mock/api.js";
import { Card, EmptyState, Field, Money, StatusTag } from "./ui.jsx";

const RUN_STATUS = { draft: { label: "مسودة", cls: "tag-neutral" }, approved: { label: "معتمد", cls: "tag-accent" }, paid: { label: "مدفوع", cls: "tag-accent" } };

export default function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [runs, setRuns] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({ userId: "", baseSalary: "", allowances: "0", defaultDeductions: "0" });
  const [advanceForm, setAdvanceForm] = useState({ userId: "", amount: "", date: "", accountId: "" });
  const [runForm, setRunForm] = useState({ periodYear: new Date().getFullYear(), periodMonth: new Date().getMonth() + 1 });
  const [payForm, setPayForm] = useState({ accountId: "", paymentDate: "" });
  const [selectedRun, setSelectedRun] = useState(null);
  const [err, setErr] = useState("");

  const cashBankAccounts = accounts.filter((a) => a.subtype === "cash" || a.subtype === "bank");

  async function load() {
    setLoading(true);
    try {
      const [emp, pr, adv, rn, ac] = await Promise.all([fetchEmployees(), listPayrollProfiles(), listPayrollAdvances(), listPayrollRuns(), listAccounts()]);
      setEmployees(emp || []); setProfiles(pr); setAdvances(adv); setRuns(rn); setAccounts(ac);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function saveProfile() {
    if (!profileForm.userId || !profileForm.baseSalary) return;
    await addPayrollProfile(profileForm);
    setProfileForm({ userId: "", baseSalary: "", allowances: "0", defaultDeductions: "0" });
    await load();
  }

  async function saveAdvance() {
    if (!advanceForm.userId || !advanceForm.amount || !advanceForm.date || !advanceForm.accountId) { setErr("أكمل بيانات السلفة."); return; }
    try { await addPayrollAdvance(advanceForm); setAdvanceForm({ userId: "", amount: "", date: "", accountId: "" }); await load(); }
    catch (e) { setErr(e.message || "تعذّر الحفظ."); }
  }

  async function createRun() {
    try { await addPayrollRun(runForm); await load(); } catch (e) { setErr(e.message || "تعذّر إنشاء المسير."); }
  }

  async function viewRun(id) { setSelectedRun(await getPayrollRun(id)); }
  async function approve(id) { await approvePayrollRun(id); await load(); if (selectedRun?.id === id) viewRun(id); }
  async function pay(id) {
    if (!payForm.accountId || !payForm.paymentDate) { setErr("اختر حساب الدفع والتاريخ."); return; }
    await payPayrollRun(id, payForm); await load(); viewRun(id);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title="ملفات رواتب الموظفين">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 10, marginBottom: 12 }}>
          <select className="input" value={profileForm.userId} onChange={(e) => setProfileForm({ ...profileForm, userId: e.target.value })}>
            <option value="">اختر موظفًا</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name || e.fullName || e.name}</option>)}
          </select>
          <input className="input" type="number" placeholder="الراتب الأساسي" value={profileForm.baseSalary} onChange={(e) => setProfileForm({ ...profileForm, baseSalary: e.target.value })} />
          <input className="input" type="number" placeholder="البدلات" value={profileForm.allowances} onChange={(e) => setProfileForm({ ...profileForm, allowances: e.target.value })} />
          <input className="input" type="number" placeholder="الخصومات الثابتة" value={profileForm.defaultDeductions} onChange={(e) => setProfileForm({ ...profileForm, defaultDeductions: e.target.value })} />
          <button className="btn btn-primary" onClick={saveProfile}>حفظ</button>
        </div>
        {loading ? <div style={{ padding: 16 }}>جارٍ التحميل…</div> : profiles.length === 0 ? <EmptyState text="لا توجد ملفات رواتب بعد." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>الموظف</th><th>الأساسي</th><th>البدلات</th><th>الخصومات</th></tr></thead>
            <tbody>{profiles.map((p) => (<tr key={p.id}><td>{p.userName}</td><td><Money n={p.baseSalary} /></td><td><Money n={p.allowances} /></td><td><Money n={p.defaultDeductions} /></td></tr>))}</tbody>
          </table>
        )}
      </Card>

      <Card title="السلف">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 10, marginBottom: 12 }}>
          <select className="input" value={advanceForm.userId} onChange={(e) => setAdvanceForm({ ...advanceForm, userId: e.target.value })}>
            <option value="">اختر موظفًا</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.full_name || e.fullName || e.name}</option>)}
          </select>
          <input className="input" type="number" placeholder="المبلغ" value={advanceForm.amount} onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })} />
          <input className="input" type="date" value={advanceForm.date} onChange={(e) => setAdvanceForm({ ...advanceForm, date: e.target.value })} />
          <select className="input" value={advanceForm.accountId} onChange={(e) => setAdvanceForm({ ...advanceForm, accountId: e.target.value })}>
            <option value="">صُرفت من</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={saveAdvance}>حفظ</button>
        </div>
        {advances.length === 0 ? <EmptyState text="لا توجد سلف مسجّلة." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>الموظف</th><th>المبلغ</th><th>التاريخ</th><th>الحالة</th></tr></thead>
            <tbody>{advances.map((a) => (<tr key={a.id}><td>{a.userName}</td><td><Money n={a.amount} /></td><td>{a.date}</td><td>{a.status === "outstanding" ? "قائمة" : "مسدّدة"}</td></tr>))}</tbody>
          </table>
        )}
        {err && <div style={{ color: "#a3342a", fontSize: 13, marginTop: 8 }}>{err}</div>}
      </Card>

      <Card title="مسير الرواتب">
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <input className="input" type="number" style={{ width: 100 }} value={runForm.periodYear} onChange={(e) => setRunForm({ ...runForm, periodYear: e.target.value })} />
          <select className="input" value={runForm.periodMonth} onChange={(e) => setRunForm({ ...runForm, periodMonth: e.target.value })}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button className="btn btn-primary" onClick={createRun}>إنشاء مسير جديد</button>
        </div>
        {runs.length === 0 ? <EmptyState text="لا يوجد مسير رواتب بعد." /> : (
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th>الشهر/السنة</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id}>
                  <td>{r.periodMonth}/{r.periodYear}</td><td><StatusTag status={r.status} map={RUN_STATUS} /></td>
                  <td style={{ textAlign: "left", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => viewRun(r.id)}>عرض</button>
                    {r.status === "draft" && <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => approve(r.id)}>اعتماد</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {selectedRun && (
        <Card title={`تفاصيل مسير ${selectedRun.periodMonth}/${selectedRun.periodYear}`} action={<button className="btn btn-ghost" onClick={() => setSelectedRun(null)}>إغلاق</button>}>
          <table className="table" style={{ margin: 0, marginBottom: 12 }}>
            <thead><tr><th>الموظف</th><th>الأساسي</th><th>البدلات</th><th>الخصومات</th><th>خصم السلفة</th><th>الصافي</th></tr></thead>
            <tbody>
              {selectedRun.items.map((it, i) => (
                <tr key={i}><td>{it.userName}</td><td><Money n={it.baseSalary} /></td><td><Money n={it.allowances} /></td><td><Money n={it.deductions} /></td><td><Money n={it.advanceDeduction} /></td><td><b><Money n={it.netSalary} /></b></td></tr>
              ))}
            </tbody>
          </table>
          {selectedRun.status === "approved" && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select className="input" value={payForm.accountId} onChange={(e) => setPayForm({ ...payForm, accountId: e.target.value })}>
                <option value="">الدفع من حساب</option>{cashBankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <input className="input" type="date" value={payForm.paymentDate} onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })} />
              <button className="btn btn-primary" onClick={() => pay(selectedRun.id)}>دفع الرواتب</button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
