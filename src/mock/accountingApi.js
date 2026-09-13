// FILE: src/mock/accountingApi.js
// عميل API لنظام المحاسبة الكامل — مستقل عن مالية.jsx/financialSeed.js تمامًا.
// نفس نمط mock/api.js: دوال رفيعة فوق http() الحقيقي، بدون أي بيانات وهمية.
import { http } from "../utils/http.js";

const list = (path) => async () => { const r = await http("GET", path); return Array.isArray(r) ? r : []; };
const get = (path) => async (id) => http("GET", `${path}/${encodeURIComponent(id)}`);
const add = (path) => async (payload) => http("POST", path, payload || {});
const update = (path) => async (id, payload) => http("PATCH", `${path}/${encodeURIComponent(id)}`, payload || {});
const del = (path) => async (id) => http("DELETE", `${path}/${encodeURIComponent(id)}`);

/* ===================== دليل الحسابات ===================== */
export const listAccounts = list("/accounting/accounts");
export const addAccount = add("/accounting/accounts");
export const updateAccount = update("/accounting/accounts");

/* ===================== عملاء / موردون / خدمات / مراكز تكلفة ===================== */
export const listClients = list("/accounting/clients");
export const addClient = add("/accounting/clients");
export const updateClient = update("/accounting/clients");

export const listVendors = list("/accounting/vendors");
export const addVendor = add("/accounting/vendors");
export const updateVendor = update("/accounting/vendors");

export const listServices = list("/accounting/services");
export const addService = add("/accounting/services");
export const updateService = update("/accounting/services");

export const listCostCenters = list("/accounting/cost-centers");
export const addCostCenter = add("/accounting/cost-centers");

/* ===================== إعدادات الضريبة ===================== */
export const listTaxSettings = list("/accounting/tax-settings");
export const addTaxSetting = add("/accounting/tax-settings");

/* ===================== الفواتير ===================== */
export const listInvoices = list("/accounting/invoices");
export const getInvoice = get("/accounting/invoices");
export const addInvoiceDraft = add("/accounting/invoices");
export const updateInvoiceDraft = update("/accounting/invoices");
export const deleteInvoiceDraft = del("/accounting/invoices");
export const approveInvoice = async (id) => http("POST", `/accounting/invoices/${encodeURIComponent(id)}/approve`);
export const sendInvoice = async (id) => http("POST", `/accounting/invoices/${encodeURIComponent(id)}/send`);
export const cancelInvoice = async (id) => http("POST", `/accounting/invoices/${encodeURIComponent(id)}/cancel`);

export const listCreditNotes = list("/accounting/credit-notes");
export const addCreditNote = add("/accounting/credit-notes");
export const listDebitNotes = list("/accounting/debit-notes");
export const addDebitNote = add("/accounting/debit-notes");

/* ===================== الاشتراكات ===================== */
export const listSubscriptions = list("/accounting/subscriptions");
export const addSubscription = add("/accounting/subscriptions");
export const updateSubscription = update("/accounting/subscriptions");

/* ===================== المقبوضات ===================== */
export const listReceipts = list("/accounting/receipts");
export const addReceipt = add("/accounting/receipts");

/* ===================== المشتريات والمصروفات والمدفوعات ===================== */
export const listPurchaseInvoices = list("/accounting/purchase-invoices");
export const getPurchaseInvoice = get("/accounting/purchase-invoices");
export const addPurchaseInvoice = add("/accounting/purchase-invoices");
export const approvePurchaseInvoice = async (id) => http("POST", `/accounting/purchase-invoices/${encodeURIComponent(id)}/approve`);

export const listExpenses = list("/accounting/expenses");
export const addExpense = add("/accounting/expenses");

export const listPaymentsOut = list("/accounting/payments-out");
export const addPaymentOut = add("/accounting/payments-out");

/* ===================== الصندوق والبنوك ===================== */
export const listBankAccounts = list("/accounting/bank-accounts");
export const addBankAccount = add("/accounting/bank-accounts");
export const addTransfer = add("/accounting/transfers");
export const listBankStatementLines = async (bankAccountId) => {
  const r = await http("GET", `/accounting/bank-statement-lines?bankAccountId=${encodeURIComponent(bankAccountId)}`);
  return Array.isArray(r) ? r : [];
};
export const addBankStatementLine = add("/accounting/bank-statement-lines");
export const matchBankStatementLine = async (id, payload) => http("POST", `/accounting/bank-statement-lines/${encodeURIComponent(id)}/match`, payload || {});

/* ===================== الرواتب ===================== */
export const listPayrollProfiles = list("/accounting/payroll/profiles");
export const addPayrollProfile = add("/accounting/payroll/profiles");
export const listPayrollAdvances = list("/accounting/payroll/advances");
export const addPayrollAdvance = add("/accounting/payroll/advances");
export const listPayrollRuns = list("/accounting/payroll/runs");
export const getPayrollRun = get("/accounting/payroll/runs");
export const addPayrollRun = add("/accounting/payroll/runs");
export const approvePayrollRun = async (id) => http("POST", `/accounting/payroll/runs/${encodeURIComponent(id)}/approve`);
export const payPayrollRun = async (id, payload) => http("POST", `/accounting/payroll/runs/${encodeURIComponent(id)}/pay`, payload || {});

/* ===================== الأصول الثابتة ===================== */
export const listFixedAssets = list("/accounting/fixed-assets");
export const addFixedAsset = add("/accounting/fixed-assets");
export const disposeFixedAsset = async (id, payload) => http("POST", `/accounting/fixed-assets/${encodeURIComponent(id)}/dispose`, payload || {});
export const runDepreciation = async (payload) => http("POST", "/accounting/fixed-assets/run-depreciation", payload || {});

/* ===================== دفتر الأستاذ والقيود ===================== */
export const getLedger = async (accountId) => {
  const r = await http("GET", `/accounting/ledger/${encodeURIComponent(accountId)}`);
  return Array.isArray(r) ? r : [];
};
export const getTrialBalance = async () => http("GET", "/accounting/trial-balance");
export const listJournalEntries = list("/accounting/journal-entries");
export const addManualJournalEntry = add("/accounting/journal-entries");

/* ===================== الفترات المالية ===================== */
export const listFiscalYears = list("/accounting/fiscal-years");
export const addFiscalYear = add("/accounting/fiscal-years");
export const listFiscalPeriods = async (fiscalYearId) => {
  const q = fiscalYearId ? `?fiscalYearId=${encodeURIComponent(fiscalYearId)}` : "";
  const r = await http("GET", `/accounting/fiscal-periods${q}`);
  return Array.isArray(r) ? r : [];
};
export const closeFiscalPeriod = async (id) => http("POST", `/accounting/fiscal-periods/${encodeURIComponent(id)}/close`);
export const openFiscalPeriod = async (id) => http("POST", `/accounting/fiscal-periods/${encodeURIComponent(id)}/open`);
export const closeFiscalYear = async (id) => http("POST", `/accounting/fiscal-years/${encodeURIComponent(id)}/close-year`);

/* ===================== كشوف الحسابات والتقارير ===================== */
export const getClientStatement = async (id) => {
  const r = await http("GET", `/accounting/clients/${encodeURIComponent(id)}/statement`);
  return Array.isArray(r) ? r : [];
};
export const getVendorStatement = async (id) => {
  const r = await http("GET", `/accounting/vendors/${encodeURIComponent(id)}/statement`);
  return Array.isArray(r) ? r : [];
};
export const getArAging = async () => { const r = await http("GET", "/accounting/reports/ar-aging"); return Array.isArray(r) ? r : []; };
export const getApAging = async () => { const r = await http("GET", "/accounting/reports/ap-aging"); return Array.isArray(r) ? r : []; };
export const getIncomeStatement = async (params) => http("GET", `/accounting/reports/income-statement?${new URLSearchParams(params || {}).toString()}`);
export const getBalanceSheet = async (params) => http("GET", `/accounting/reports/balance-sheet?${new URLSearchParams(params || {}).toString()}`);
export const getCashFlow = async (params) => http("GET", `/accounting/reports/cash-flow?${new URLSearchParams(params || {}).toString()}`);
export const getAccountingDashboard = async (params) => http("GET", `/accounting/dashboard?${new URLSearchParams(params || {}).toString()}`);
