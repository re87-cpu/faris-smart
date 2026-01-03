export function filesBase() {
  const b =
    (import.meta.env.VITE_FILES_BASE || import.meta.env.VITE_API_BASE || "").toString().trim();
  return b ? b.replace(/\/+$/g, "") : "";
}

/**
 * يحول أي مسار نسبي (/uploads/.. أو uploads/..) إلى رابط مطلق على الـ API.
 * إذا كان الرابط أصلاً مطلق (http/https) يرجعه كما هو.
 */
export function toFileUrl(u) {
  if (!u) return "";
  const s = String(u).trim();

  if (/^https?:\/\//i.test(s)) return s; // already absolute

  const base = filesBase();
  if (!base) return s.startsWith("/") ? s : "/" + s;

  const path = s.startsWith("/") ? s : "/" + s;
  return base + path;
}
