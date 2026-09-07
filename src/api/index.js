// FILE: src/api/index.js
// ✅ Strict API only (No Mock)
// - كل العمليات عبر الـ API الحقيقي فقط (utils/http.js)
// - توحيد أسماء الحقول للواجهة قدر الإمكان
// - متسامح مع التواقيع القديمة عشان ما تتكسر الصفحات
//
// نقطة الدخول الموحّدة: تعيد تصدير كل وحدات المجالات.

export * from "./auth.js";
export * from "./employees.js";
export * from "./cases.js";
export * from "./dashboard.js";
export * from "./sessions.js";
export * from "./docs.js";
export * from "./notes.js";
export * from "./notifications.js";
export * from "./tasks.js";
export * from "./drafts.js";
export * from "./articles.js";
