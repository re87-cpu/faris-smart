// FILE: src/utils/http.js
import { clearAuth } from "./auth.js";

// إذا ما تم تحديد VITE_API_BASE، نستخدم نفس الدومين (أفضل للنشر برابط واحد)
export const API_BASE = String(import.meta.env.VITE_API_BASE || "")
  .trim()
  .replace(/\/+$/g, "");

function normalizeToken(raw) {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed;
    if (parsed && typeof parsed === "object" && parsed.token) return String(parsed.token);
  } catch {}
  return String(raw).replace(/^"|"$/g, "");
}

function getToken() {
  // 1) المفتاح الأساسي اللي نخزّن فيه
  const direct = localStorage.getItem("faris_token");
  if (direct) {
    const t = normalizeToken(direct);
    if (t) return t;
  }

  // 2) مفتاح قديم ممكن موجود
  const authRaw = localStorage.getItem("auth");
  if (authRaw) {
    try {
      const auth = JSON.parse(authRaw);
      if (auth && auth.token) return String(auth.token);
    } catch {}
  }

  // 3) token كسترنق JSON
  const tokenRaw = localStorage.getItem("token");
  if (tokenRaw) {
    const t = normalizeToken(tokenRaw);
    if (t) return t;
  }

  // 4) (اختياري) مفتاح آخر
  const fsAuthRaw = localStorage.getItem("fs_auth_v1");
  if (fsAuthRaw) {
    try {
      const fsAuth = JSON.parse(fsAuthRaw);
      if (fsAuth && fsAuth.token) return String(fsAuth.token);
    } catch {}
  }

  return "";
}

export async function http(method, path, body, headers) {
  const token = getToken();

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
  } catch {}

  // 401 -> امسحي الجلسة
  if (res.status === 401) {
    try { clearAuth(); } catch {}
    localStorage.removeItem("faris_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    throw new Error((data && (data.error || data.message)) || "غير مصرح. سجلي دخول مرة أخرى.");
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || ("HTTP " + res.status);
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return data;
}
