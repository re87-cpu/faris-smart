// FILE: src/utils/http.js
import { clearAuth } from "./auth.js";

/**
 * ✅ Base URL logic:
 * - إذا فيه VITE_API_BASE استخدمه (اختياري)
 * - إذا نحن على localhost => API = http://localhost:3003
 * - غير كذا (إنتاج) => نفس الدومين window.location.origin
 */
const envBase = String(import.meta.env.VITE_API_BASE || "").trim();

export const API_BASE = (envBase ||
  (window.location.hostname === "localhost"
    ? "http://localhost:3003"
    : window.location.origin)
).replace(/\/+$/g, "");

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
  const direct = localStorage.getItem("faris_token");
  if (direct) {
    const t = normalizeToken(direct);
    if (t) return t;
  }

  const authRaw = localStorage.getItem("auth");
  if (authRaw) {
    try {
      const auth = JSON.parse(authRaw);
      if (auth && auth.token) return String(auth.token);
    } catch {}
  }

  const tokenRaw = localStorage.getItem("token");
  if (tokenRaw) {
    const t = normalizeToken(tokenRaw);
    if (t) return t;
  }

  const fsAuthRaw = localStorage.getItem("fs_auth_v1");
  if (fsAuthRaw) {
    const t = normalizeToken(fsAuthRaw);
    if (t) return t;
  }

  return "";
}

export async function http(method, path, body, headers) {
  const token = getToken();

  const normalizedPath = String(path || "").startsWith("/")
    ? String(path || "")
    : "/" + String(path || "");

  const url = API_BASE + normalizedPath;

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
    // ✅ رسالة أوضح للجوال
    throw new Error("Load failed");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (res.status === 401) {
    try { clearAuth(); } catch {}
    localStorage.removeItem("faris_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    localStorage.removeItem("fs_auth_v1");
    throw new Error((data && (data.error || data.message)) || "غير مصرح. سجلي دخول مرة أخرى.");
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || ("HTTP " + res.status);
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return data;
}
