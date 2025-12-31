// FILE: src/store/db.js
// قاعدة بيانات محلية بسيطة عبر localStorage — بدون أي بيانات وهمية
// v2: إيقاف الزرع الافتراضي + حقول createdAt/updatedAt/closedAt + توحيد تاريخ next (ISO)

const KEY = "farisDB_v2"; // ← رفعنا الإصدار لتجاوز بيانات v1 السابقة (الوهمية)

// قاعدة فارغة 100%
const seed = {
  users: [],          // ملاحظة: المستخدمون يُدارون الآن عبر mock/api.js (fs_users_v1)
  cases: [],          // لا قضايا افتراضيًا
  notifications: [],  // لا تنبيهات افتراضيًا
};

// ------- I/O ------- //
export function getDB() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return structuredClone(seed);
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return structuredClone(seed);
  }
}

export function setDB(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

// ------- Users (اختياري، لأجل التوافق) ------- //
export function listUsers(role) {
  const db = getDB();
  const list = db.users || [];
  return role ? list.filter(u => u.role === role) : list;
}
export function findUserById(id) {
  return (getDB().users || []).find(u => u.id === id);
}

// ------- Cases ------- //
export function listCases() {
  return getDB().cases || [];
}
export function listCasesByStaff(userId) {
  return (getDB().cases || []).filter(c => c.assignedTo === userId);
}
export function getCase(caseId) {
  return (getDB().cases || []).find(c => String(c.id) === String(caseId));
}
export function caseExists(caseId) {
  return !!getCase(caseId);
}

export function addCase(payload) {
  const db = getDB();
  const id = payload.id || genId("C");

  const nowIso = new Date().toISOString();

  // نحافظ على هيكل قياسي للقضية
  const row = {
    id,
    title: "قضية بدون عنوان",
    court: "",                 // حقل اختياري للمحكمة
    status: "قيد الترافع",
    assignedTo: null,          // userId أو null
    next: "",                  // نخزن تواريخ next كـ ISO فقط (مثال: "2025-11-20T09:30:00.000Z")
    sessions: [],              // [{id,date,status,summaryDone}]
    documents: [],             // deprecated (نستخدم mock/api.js لحفظ المستندات منفصلًا)
    notes: [],                 // deprecated (نستخدم mock/api.js للملاحظات)
    createdAt: nowIso,
    updatedAt: nowIso,
    closedAt: "",              // عند الإغلاق نحط ISO هنا
    ...payload,
  };

  // توحيد next إلى ISO إن كان نصًّا قديمًا
  row.next = normalizeNext(row.next);

  db.cases.push(row);
  setDB(db);
  return id;
}

export function assignCase(caseId, userId) {
  const db = getDB();
  const c = db.cases.find(x => String(x.id) === String(caseId));
  if (!c) throw new Error("Case not found");
  c.assignedTo = userId || null;
  c.updatedAt = new Date().toISOString();
  setDB(db);
}

export function updateCase(caseId, patch) {
  const db = getDB();
  const i = db.cases.findIndex(c => String(c.id) === String(caseId));
  if (i < 0) throw new Error("Case not found");

  // لو في next ضمن الترقيع، نطبّق توحيد التاريخ
  const upd = { ...patch };
  if ("next" in upd) {
    upd.next = normalizeNext(upd.next);
  }
  // لا نطمس createdAt
  db.cases[i] = {
    ...db.cases[i],
    ...upd,
    updatedAt: new Date().toISOString(),
  };
  setDB(db);
}

export function markLastFinishedSessionAsSummarized(caseId) {
  const db = getDB();
  const c = db.cases.find(x => String(x.id) === String(caseId));
  if (!c) throw new Error("Case not found");
  const finished = (c.sessions || [])
    .filter(s => s.status === "منتهية")
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  if (finished) finished.summaryDone = true;
  c.updatedAt = new Date().toISOString();
  setDB(db);
}

// ------- Notifications ------- //
export function listNotifications(userId) {
  return (getDB().notifications || []).filter(n => n.userId === userId);
}
export function addNotification(userId, text) {
  const db = getDB();
  db.notifications = db.notifications || [];
  db.notifications.unshift({
    id: genId("N"),
    userId,
    text,
    date: new Date().toISOString().slice(0, 10),
  });
  setDB(db);
}

// ------- Utils ------- //
function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
}

/** توحيد next إلى ISO (إن جاءنا كنص قديم) */
function normalizeNext(value) {
  if (!value) return "";
  const s = String(value).trim();

  // إن كان ISO أصلاً
  if (/\d{4}-\d{2}-\d{2}T/.test(s)) return s;

  // إن كان بصيغة "YYYY-MM-DD hh:mm"
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s)) {
    const iso = new Date(s.replace(" ", "T"));
    return isNaN(iso) ? "" : iso.toISOString();
  }

  // أي صيغة غير مدعومة (مثل "جلسة 12-11 09:30") → نتركه فارغًا (تجنّب فساد)
  // يمكنكِ لاحقًا كتابة محوّل مخصّص إن لزم
  return "";
}
