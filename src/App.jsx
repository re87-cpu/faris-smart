// FILE: src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage.jsx";
import Forbidden403 from "./pages/Forbidden403.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";

/* Auth */
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

/* تخطيطات الأدمن */
import AdminLayout from "./pages/admin/AdminLayout.jsx";         // مع سايدبار للوحة الرئيسية فقط
import AdminHeaderOnly from "./pages/admin/AdminHeaderOnly.jsx"; // بدون سايدبار لباقي صفحات المدير

/* صفحات المدير */
import DashboardAdmin from "./pages/admin/DashboardAdmin.jsx";
import CasesList from "./pages/admin/CasesList.jsx";
import CaseNew from "./pages/admin/CaseNew.jsx";
import CaseView from "./pages/admin/CaseView.jsx";
import Employees from "./pages/admin/Employees.jsx";
import Archive from "./pages/admin/Archive.jsx";
import CalendarAdmin from "./pages/admin/CalendarAdmin.jsx";
import AssignCase from "./pages/admin/AssignCase.jsx";
import Drafts from "./pages/admin/Drafts.jsx";
import AdminStaffRequests from "./pages/admin/AdminStaffRequests.jsx";
import AdminTasks from "./pages/admin/AdminTasks.jsx";
import AdminNotifications from "./pages/admin/AdminNotifications.jsx";

/* الحراس */
import RequireAdmin from "./guards/RequireAdmin.jsx";
import RequireStaff from "./guards/RequireStaff.jsx";

/* الموظف */
import StaffLayout from "./pages/staff/StaffLayout.jsx";
import StaffHeaderOnly from "./pages/staff/StaffHeaderOnly.jsx";
import DashboardStaff from "./pages/staff/DashboardStaff.jsx";
import MyCases from "./pages/staff/MyCases.jsx";
import CaseDetails from "./pages/staff/CaseDetails.jsx";
import CaseTimeline from "./pages/staff/case/CaseTimeline.jsx";
import CaseSessions from "./pages/staff/case/CaseSessions.jsx";
import SessionSummaryForm from "./pages/staff/case/SessionSummaryForm.jsx";
import CaseDocuments from "./pages/staff/case/CaseDocuments.jsx";
import CaseNotes from "./pages/staff/case/CaseNotes.jsx";
import StaffCalendar from "./pages/staff/StaffCalendar.jsx";
import StaffTasks from "./pages/staff/StaffTasks.jsx";
import StaffDocuments from "./pages/staff/StaffDocuments.jsx";
import StaffNotifications from "./pages/staff/StaffNotifications.jsx";

export default function App() {
  return (
    <Routes>
      {/* الواجهة العامة */}
      <Route path="/" element={<LandingPage />} />
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

      {/* باقي صفحات المدير: بدون سايدبار */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminHeaderOnly />
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
  );
}

