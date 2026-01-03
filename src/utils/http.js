import { clearAuth } from "./auth.js";

/**
 * ✅ Production-safe API base
 * - لو فيه VITE_API_BASE → استخدمه
 * - غير كذا → استخدم نفس الدومين (faris-legal.com)
 * ❌ ممنوع localhost في الإنتاج
 */
const RAW_ENV_BASE = String(import.meta.env.VITE_API_BASE || "").trim();

export const API_BASE = (
  RAW_ENV_BASE
    ? RAW_ENV_BASE
    : window.location.origin
).replace(/\/+$/, "");

/* ================= TOKEN ================= */

function normalizeToken(raw) {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed;
    if (parsed?.token) return String(parsed.token);
    if (parsed?.accessToken) return String(parsed.accessToken);
  } catch {}
  return String(raw).replace(/^"|"$/g, "");
}

function getToken() {
  const keys = [
    "faris_token",
    "token",
    "auth",
    "auth_token",
    "fs_auth_v1",
  ];

  for (const k of keys) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    const t = normalizeToken(raw);
    if (t) return t;
  }

  return "";
}

/* ================= HTTP ================= */

export async function http(method, path, body, headers = {}) {
  const token = getToken();

  const cleanPath = path.startsWith("/") ? path : "/" + path;
  const url = API_BASE + cleanPath;

  let res;
  try {
    res = await fetch(url, {
      method: method.toUpperCase(),
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error("Load failed");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (res.status === 401) {
    try { clearAuth(); } catch {}
    localStorage.clear();
    throw new Error("انتهت الجلسة، سجّل الدخول مرة أخرى");
  }

  if (!res.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      `HTTP ${res.status}`
    );
  }

  return data;
}
