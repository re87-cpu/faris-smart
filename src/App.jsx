// FILE: src/App.jsx
import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getAuth } from "./utils/auth.js";
import { initPushNotifications } from "./utils/pushNotifications.js";
import OfflineBanner from "./components/OfflineBanner.jsx";
import LandingPage from "./LandingPage.jsx";
import ClientServices from "./pages/ClientServices.jsx";
import LawyerProfile from "./pages/LawyerProfile.jsx";
import Articles from "./pages/Articles.jsx";
import ArticleView from "./pages/ArticleView.jsx";
import Packages from "./pages/Packages.jsx";
import Forbidden403 from "./pages/Forbidden403.jsx";

/* Auth — صغيرة وضرورية لأول تحميل، تبقى فورية (eager) */
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

/* الحراس — صغيرة، تبقى فورية */
import RequireAdmin from "./guards/RequireAdmin.jsx";
import RequireStaff from "./guards/RequireStaff.jsx";

/* ===================== تحميل كسول (Code Splitting) ===================== */
// كل صفحات المدير/الموظف/المحاسبة محمية بحراس أصلًا (RequireAdmin/RequireStaff)
// ولا يحتاجها زائر الموقع العام إطلاقًا — تحميلها عند الطلب فقط يقلّل حزمة
// الإقلاع الأولى، خصوصًا لتطبيق الجوال الذي يفتح من ملفات محلية ويريد أول
// شاشة سريعة قدر الإمكان. لا تغيير في أي وظيفة أو تصميم، فقط توقيت التحميل.
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.jsx"));
const DashboardAdmin = lazy(() => import("./pages/admin/DashboardAdmin.jsx"));
const CasesList = lazy(() => import("./pages/admin/CasesList.jsx"));
const CaseNew = lazy(() => import("./pages/admin/CaseNew.jsx"));
const CaseView = lazy(() => import("./pages/admin/CaseView.jsx"));
const Employees = lazy(() => import("./pages/admin/Employees.jsx"));
const Archive = lazy(() => import("./pages/admin/Archive.jsx"));
const CalendarAdmin = lazy(() => import("./pages/admin/CalendarAdmin.jsx"));
const AssignCase = lazy(() => import("./pages/admin/AssignCase.jsx"));
const Drafts = lazy(() => import("./pages/admin/Drafts.jsx"));
const AdminStaffRequests = lazy(() => import("./pages/admin/AdminStaffRequests.jsx"));
const AdminTasks = lazy(() => import("./pages/admin/AdminTasks.jsx"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications.jsx"));
const AdminArticles = lazy(() => import("./pages/admin/AdminArticles.jsx"));
const Financial = lazy(() => import("./pages/admin/Financial.jsx"));

/* المحاسبة — نظام مستقل تمامًا عن صفحة المالية، أثقل قسم في اللوحة */
const AccountingLayout = lazy(() => import("./pages/admin/accounting/AccountingLayout.jsx"));
const AccountingOverview = lazy(() => import("./pages/admin/accounting/Overview.jsx"));
const AccountingClients = lazy(() => import("./pages/admin/accounting/Clients.jsx"));
const AccountingInvoices = lazy(() => import("./pages/admin/accounting/Invoices.jsx"));
const AccountingSubscriptions = lazy(() => import("./pages/admin/accounting/Subscriptions.jsx"));
const AccountingVendors = lazy(() => import("./pages/admin/accounting/Vendors.jsx"));
const AccountingExpenses = lazy(() => import("./pages/admin/accounting/Expenses.jsx"));
const AccountingPayments = lazy(() => import("./pages/admin/accounting/Payments.jsx"));
const AccountingCashBank = lazy(() => import("./pages/admin/accounting/CashBank.jsx"));
const AccountingPayroll = lazy(() => import("./pages/admin/accounting/Payroll.jsx"));
const AccountingAssets = lazy(() => import("./pages/admin/accounting/Assets.jsx"));
const AccountingChartOfAccounts = lazy(() => import("./pages/admin/accounting/ChartOfAccounts.jsx"));
const AccountingLedger = lazy(() => import("./pages/admin/accounting/Ledger.jsx"));
const AccountingReports = lazy(() => import("./pages/admin/accounting/Reports.jsx"));
const AccountingSettings = lazy(() => import("./pages/admin/accounting/Settings.jsx"));

/* الموظف */
const StaffLayout = lazy(() => import("./pages/staff/StaffLayout.jsx"));
const StaffHeaderOnly = lazy(() => import("./pages/staff/StaffHeaderOnly.jsx"));
const DashboardStaff = lazy(() => import("./pages/staff/DashboardStaff.jsx"));
const MyCases = lazy(() => import("./pages/staff/MyCases.jsx"));
const CaseDetails = lazy(() => import("./pages/staff/CaseDetails.jsx"));
const CaseTimeline = lazy(() => import("./pages/staff/case/CaseTimeline.jsx"));
const CaseSessions = lazy(() => import("./pages/staff/case/CaseSessions.jsx"));
const SessionSummaryForm = lazy(() => import("./pages/staff/case/SessionSummaryForm.jsx"));
const CaseDocuments = lazy(() => import("./pages/staff/case/CaseDocuments.jsx"));
const CaseNotes = lazy(() => import("./pages/staff/case/CaseNotes.jsx"));
const StaffCalendar = lazy(() => import("./pages/staff/StaffCalendar.jsx"));
const StaffTasks = lazy(() => import("./pages/staff/StaffTasks.jsx"));
const StaffDocuments = lazy(() => import("./pages/staff/StaffDocuments.jsx"));
const StaffNotifications = lazy(() => import("./pages/staff/StaffNotifications.jsx"));
const StaffArticles = lazy(() => import("./pages/staff/StaffArticles.jsx"));

function RouteLoading() {
  return (
    <div dir="rtl" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh", color: "var(--color-neutral-600, #7a7a7d)", fontSize: 14 }}>
      جارٍ التحميل…
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // لو المستخدم داخل جلسة فعلًا عند فتح التطبيق (لا يحتاج إعادة تسجيل دخول)،
    // سجّل الجهاز لاستقبال الإشعارات الفورية. لا شيء يحدث على الويب.
    if (getAuth()) initPushNotifications();
  }, []);

  return (
    <>
      <OfflineBanner />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
        {/* الواجهة العامة */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ClientServices />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/lawyer" element={<LawyerProfile />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:id" element={<ArticleView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forbidden" element={<Forbidden403 />} />

        {/* لوحة المدير: صفحة رئيسية مع سايدبار */}
        <Route
          path="/dashboard-admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<DashboardAdmin />} />
        </Route>

        {/* باقي صفحات المدير: نفس السايدبار المجمّع */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          {/* فتح /admin مباشرة يوجّه للرئيسية */}
          <Route index element={<Navigate to="/dashboard-admin" replace />} />

          {/* صفحات الإدارة */}
          <Route path="cases" element={<CasesList />} />
          <Route path="cases/new" element={<CaseNew />} />
          <Route path="cases/:id" element={<CaseView />} />
          <Route path="employees" element={<Employees />} />
          <Route path="archive" element={<Archive />} />
          <Route path="calendar" element={<CalendarAdmin />} />
          <Route path="assign" element={<AssignCase />} />
          <Route path="drafts" element={<Drafts />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="staff-requests" element={<AdminStaffRequests />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="financial" element={<Financial />} />

          <Route path="accounting" element={<AccountingLayout />}>
            <Route index element={<AccountingOverview />} />
            <Route path="clients" element={<AccountingClients />} />
            <Route path="invoices" element={<AccountingInvoices />} />
            <Route path="subscriptions" element={<AccountingSubscriptions />} />
            <Route path="vendors" element={<AccountingVendors />} />
            <Route path="expenses" element={<AccountingExpenses />} />
            <Route path="payments" element={<AccountingPayments />} />
            <Route path="cash-bank" element={<AccountingCashBank />} />
            <Route path="payroll" element={<AccountingPayroll />} />
            <Route path="assets" element={<AccountingAssets />} />
            <Route path="accounts" element={<AccountingChartOfAccounts />} />
            <Route path="ledger" element={<AccountingLedger />} />
            <Route path="reports" element={<AccountingReports />} />
            <Route path="settings" element={<AccountingSettings />} />
          </Route>
        </Route>

        {/* لوحة الموظف */}
        <Route
          path="/staff"
          element={
            <RequireStaff>
              <StaffLayout />
            </RequireStaff>
          }
        >
          <Route index element={<DashboardStaff />} />
          <Route path="cases" element={<MyCases />} />
          <Route path="cases/:caseId" element={<CaseDetails />}>
            <Route index element={<CaseTimeline />} />
            <Route path="sessions" element={<CaseSessions />} />
            <Route path="sessions/summary" element={<SessionSummaryForm />} />
            <Route path="documents" element={<CaseDocuments />} />
            <Route path="notes" element={<CaseNotes />} />
          </Route>
          <Route path="calendar" element={<StaffCalendar />} />
          <Route path="tasks" element={<StaffTasks />} />
          <Route path="documents" element={<StaffDocuments />} />
          <Route path="notifications" element={<StaffNotifications />} />
          <Route path="articles" element={<StaffArticles />} />
        </Route>

        {/* تخطيط موظف بدون سايدبار (اختياري) */}
        <Route path="/staff-plain" element={<StaffHeaderOnly />}>
          <Route
            path="standalone"
            element={<div className="q-card" style={{ padding: 18 }}>عرض مستقل</div>}
          />
        </Route>

        {/* توافق قديم */}
        <Route path="/dashboard-staff" element={<Navigate to="/staff" replace />} />

        {/* أي مسار غلط */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
