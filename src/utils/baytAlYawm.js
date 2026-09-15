// FILE: src/utils/baytAlYawm.js
// اختيار "بيت اليوم" مرة واحدة فقط عند تحميل الصفحة (لا Timer، لا تبديل تلقائي).
// نستخدم sessionStorage لتذكّر آخر أبيات ظهرت خلال هذه الجلسة (نفس التبويب)
// فقط لتفادي تكرارها مباشرة بعد Refresh — لا يوجد أي استدعاء شبكة هنا.
import { POETRY } from "../data/poetry.js";

const HISTORY_KEY = "fs_bayt_history_v1";
const HISTORY_LIMIT = 5;

function readHistory() {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeHistory(ids) {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(ids.slice(-HISTORY_LIMIT)));
  } catch {
    /* sessionStorage غير متاح (وضع خاص مثلاً) — لا شيء يعطّل الصفحة */
  }
}

/** يُستدعى مرة واحدة فقط عند تحميل الصفحة (داخل useState/useEffect بلا dependency متغيّر). */
export function pickBaytAlYawm(pool = POETRY) {
  if (!pool || pool.length === 0) return null;
  const history = readHistory();
  let candidates = pool.filter((b) => !history.includes(b.id));
  if (candidates.length === 0) candidates = pool;
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  writeHistory([...history, chosen.id]);
  return chosen;
}
