// FILE: src/utils/auth.js
import { getSecure, setSecure, removeSecure } from "./platformStorage.js";

/**
 * الجلسة الرسمية:
 * fs_auth_v1 = { role:"admin"|"staff", user:{...}, expiresAt: ISOString }
 *
 * ملاحظة مهمة: fs_auth_v1 يبقى متزامنًا (localStorage) في كل الحالات — تقرأه
 * حراس التنقل (RequireAdmin/RequireStaff) وعشرات الصفحات مباشرة أثناء
 * الرسم (render) بدون انتظار، ولا يجوز تحويله لغير متزامن (كان سيتطلب
 * إعادة كتابة كل تلك الأماكن). التوكن الفعلي (JWT) لا يُخزَّن هنا بعد الآن؛
 * له تخزين آمن منفصل عبر getAuthToken/setAuthToken أدناه — يُستخدم فقط داخل
 * http.js وهو أصلًا غير متزامن، فلا حاجة لأي تغيير في الحراس أو الصفحات.
 */

const LS_AUTH = "fs_auth_v1";
const LEGACY_ROLE = "role";
const LEGACY_USER = "user";
const SECURE_TOKEN_KEY = "fs_jwt_v1";
const DEFAULT_TTL_HOURS = 8;

export function setAuth(auth, opts = {}) {
  const ttlHours = Number.isFinite(opts.ttlHours) ? +opts.ttlHours : DEFAULT_TTL_HOURS;
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();

  const payload = auth
    ? {
        role: auth.role,
        user: auth.user,
        expiresAt,
      }
    : null;

  if (payload) localStorage.setItem(LS_AUTH, JSON.stringify(payload));
  else localStorage.removeItem(LS_AUTH);

  // توافق رجعي
  try {
    if (payload?.role) localStorage.setItem(LEGACY_ROLE, payload.role);
    else localStorage.removeItem(LEGACY_ROLE);

    if (payload?.user) localStorage.setItem(LEGACY_USER, JSON.stringify(payload.user));
    else localStorage.removeItem(LEGACY_USER);
  } catch {}
}

export function getAuth() {
  // 1) الرسمي
  try {
    const raw = localStorage.getItem(LS_AUTH);
    if (raw) {
      const obj = JSON.parse(raw);
      if (isValidAuth(obj)) {
        if (isExpired(obj.expiresAt)) {
          clearAuth();
          return null;
        }
        return obj;
      }
    }
  } catch {}

  // 2) توافق رجعي
  try {
    const role = localStorage.getItem(LEGACY_ROLE) || null;
    const user = JSON.parse(localStorage.getItem(LEGACY_USER) || "null");
    if (role && user) {
      setAuth({ role, user, token: null });
      return getAuth();
    }
  } catch {}

  return null;
}

export function clearAuth() {
  localStorage.removeItem(LS_AUTH);
  localStorage.removeItem(LEGACY_ROLE);
  localStorage.removeItem(LEGACY_USER);
  // حذف التوكن الآمن — عملية غير متزامنة، لا داعي لانتظارها هنا (clearAuth
  // نفسها تبقى متزامنة حتى لا يتغيّر توقيع الدالة في كل مكان تُستدعى فيه).
  clearAuthToken().catch(() => {});
}

/* ===================== تخزين التوكن (JWT) — آمن ومنفصل عن fs_auth_v1 ===================== */
// على تطبيق الجوال: Keychain (iOS) / Keystore عبر EncryptedSharedPreferences (Android).
// على الويب: localStorage كما كان الحال دائمًا (لا تراجع أمني، فقط لا يوجد بديل أفضل داخل متصفح).
export async function setAuthToken(token) {
  if (!token) return;
  try { await setSecure(SECURE_TOKEN_KEY, token); } catch { /* تجاهل */ }
}

export async function getAuthToken() {
  try {
    const t = await getSecure(SECURE_TOKEN_KEY);
    if (t) return t;
  } catch { /* تجاهل */ }
  // خط رجوع مؤقت لجلسات سابقة كُتب فيها التوكن بالطريقة القديمة
  return readLegacyToken();
}

export async function clearAuthToken() {
  try { await removeSecure(SECURE_TOKEN_KEY); } catch { /* تجاهل */ }
  try {
    localStorage.removeItem("faris_token");
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
  } catch { /* تجاهل */ }
}

function readLegacyToken() {
  try {
    const direct = localStorage.getItem("faris_token");
    if (direct) return normalizeLegacyToken(direct);

    const authRaw = localStorage.getItem("auth");
    if (authRaw) {
      const a = JSON.parse(authRaw);
      if (a?.token) return String(a.token);
    }

    const tokenRaw = localStorage.getItem("token");
    if (tokenRaw) return normalizeLegacyToken(tokenRaw);

    const fsAuthRaw = localStorage.getItem(LS_AUTH);
    if (fsAuthRaw) {
      const fsAuth = JSON.parse(fsAuthRaw);
      if (fsAuth?.token) return String(fsAuth.token);
    }
  } catch { /* تجاهل */ }
  return "";
}

function normalizeLegacyToken(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed;
    if (parsed && typeof parsed === "object" && parsed.token) return String(parsed.token);
  } catch { /* ليس JSON، هو نص خام */ }
  return String(raw).replace(/^"|"$/g, "");
}

export function getRole() {
  return getAuth()?.role || null;
}
export function getUser() {
  return getAuth()?.user || null;
}
export function isLoggedIn() {
  return !!getAuth();
}
export function isAdmin() {
  return getRole() === "admin";
}
export function isStaff() {
  return getRole() === "staff";
}
export function minutesLeft() {
  const exp = getAuth()?.expiresAt;
  if (!exp) return 0;
  const ms = new Date(exp).getTime() - Date.now();
  return Math.max(0, Math.floor(ms / 60000));
}

function isExpired(expiresAt) {
  if (!expiresAt) return true;
  return Date.now() > new Date(expiresAt).getTime();
}

function isValidAuth(a) {
  if (!a) return false;
  if (!(a.role === "admin" || a.role === "staff")) return false;
  if (!a.user || typeof a.user !== "object") return false;
  return true;
}
