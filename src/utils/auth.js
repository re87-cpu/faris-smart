// FILE: src/utils/auth.js

/**
 * الجلسة الرسمية:
 * fs_auth_v1 = { role:"admin"|"staff", user:{...}, token?:string, expiresAt: ISOString }
 */

const LS_AUTH = "fs_auth_v1";
const LEGACY_ROLE = "role";
const LEGACY_USER = "user";
const DEFAULT_TTL_HOURS = 8;

export function setAuth(auth, opts = {}) {
  const ttlHours = Number.isFinite(opts.ttlHours) ? +opts.ttlHours : DEFAULT_TTL_HOURS;
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();

  const payload = auth
    ? {
        role: auth.role,
        user: auth.user,
        token: auth.token || null,
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
