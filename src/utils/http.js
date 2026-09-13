// FILE: src/utils/http.js
import { Capacitor } from "@capacitor/core";
import { clearAuth, getAuthToken } from "./auth.js";

// =====================================================
// API base resolution
// =====================================================
// ✅ القاعدة:
// - لو VITE_API_BASE موجودة: استخدميها (أفضل ممارسة في الإنتاج، وإلزامية داخل تطبيق الجوال)
// - لو على localhost أثناء التطوير: استخدمي http://localhost:3003
// - غير كذا على الويب فقط (إنتاج بدون متغير): استخدمي نفس الدومين (window.location.origin)
//   *هذا يفيد لو عندك Proxy/Rewrite على نفس الدومين*
// - داخل تطبيق Capacitor: window.location.origin يكون capacitor://localhost أو
//   https://localhost، وهذا ليس عنوان الـ API الحقيقي أبدًا — لو نسينا ضبط
//   VITE_API_BASE وقت بناء الجوال (vite build --mode mobile)، نفشل بوضوح
//   فورًا بدل إرسال كل الطلبات لعنوان خاطئ بصمت.
export const API_BASE = (() => {
  const fromEnv = String(import.meta.env.VITE_API_BASE || "").trim().replace(/\/+$/g, "");
  if (fromEnv) return fromEnv;

  if (Capacitor.isNativePlatform()) {
    throw new Error(
      "VITE_API_BASE غير مضبوط في بناء تطبيق الجوال. شغّلي: vite build --mode mobile " +
      "(يقرأ .env.mobile) قبل npx cap sync — لا يجوز الاعتماد على window.location.origin داخل التطبيق."
    );
  }

  // داخل المتصفح فقط
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "http://localhost:3003";
    return String(window.location.origin || "").replace(/\/+$/g, "");
  }

  return "";
})();

export async function http(method, path, body, headers) {
  const token = await getAuthToken();

  const normalizedPath = String(path || "").startsWith("/") ? String(path || "") : "/" + String(path || "");
  const url = API_BASE ? API_BASE + normalizedPath : normalizedPath;

  let res;
  try {
    res = await fetch(url, {
      method: String(method || "GET").toUpperCase(),
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("تعذّر الاتصال بالخادم. تأكدي أن الخادم يعمل وأن VITE_API_BASE صحيح.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch { /* استجابة بدون JSON، مقبول (مثلاً 204) */ }

  // 401 -> امسحي الجلسة
  if (res.status === 401) {
    try { clearAuth(); } catch { /* تجاهل */ }
    throw new Error((data && (data.error || data.message)) || "غير مصرح. سجلي دخول مرة أخرى.");
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || ("HTTP " + res.status);
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return data;
}
