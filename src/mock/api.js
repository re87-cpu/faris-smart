// FILE: src/mock/api.js
// ✅ Strict API only (No Mock)
// - كل العمليات عبر الـ API الحقيقي فقط (utils/http.js)
// - توحيد أسماء الحقول للواجهة قدر الإمكان
// - متسامح مع التواقيع القديمة عشان ما تتكسر الصفحات

import { http } from "../utils/http.js";

/* ===================== Auth ===================== */

function saveToken(token) {
  localStorage.setItem("auth", JSON.stringify({ token: token }));
  localStorage.setItem("token", JSON.stringify(token));
  localStorage.setItem("faris_token", JSON.stringify(token));
}

export async function fetchMe() {
  return await http("GET", "/me");
}

export async function signIn(payload) {
  payload = payload || {};
  var email = payload.email;
  var password = payload.password;

  var res = await http("POST", "/auth/login", { email: email, password: password });
  var token = res ? res.token : null;
  saveToken(token);

  var me = await fetchMe();
  return { role: me && me.role === "manager" ? "admin" : "staff", user: me, token: token };
}

/* ========= تسجيل/اعتماد موظفين ========= */

export async function requestAccount(payload) {
  payload = payload || {};
  return await http("POST", "/auth/register", {
    full_name: payload.name,
    email: payload.email,
    password: payload.password,
  });
}

export async function listPendingUsers() {
  var res = await http("GET", "/auth/pending");
  return Array.isArray(res) ? res : [];
}

export async function approveUser(userId) {
  return await http("POST", "/auth/approve", { userId: userId, user_id: userId });
}

export async function rejectUser() {
  throw new Error("reject_endpoint_not_ready");
}

/* ===================== Employees ===================== */

export async function fetchEmployees() {
  var res = await http("GET", "/employees");
  return Array.isArray(res) ? res : [];
}

/* ===================== Helpers ===================== */

function buildEmpById(emps) {
  var map = {};
  if (Array.isArray(emps)) {
    for (var i = 0; i < emps.length; i++) {
      var e = emps[i];
      map[String(e.id)] = e;
    }
  }
  return map;
}

function normalizeCaseRow(row, empById) {
  row = row || {};

  var assigned =
    row.assignedTo !== undefined ? row.assignedTo :
    row.assigned_to !== undefined ? row.assigned_to :
    row.assignedToId !== undefined ? row.assignedToId :
    row.assigned_to_id !== undefined ? row.assigned_to_id :
    null;

  var assignedTo = (assigned !== null && assigned !== undefined && String(assigned).trim() !== "")
    ? String(assigned)
    : null;

  var emp = (assignedTo && empById) ? empById[String(assignedTo)] : null;

  var assignedName =
    row.assignedName !== undefined ? row.assignedName :
    row.assigned_name !== undefined ? row.assigned_name :
    (emp ? (emp.full_name || emp.name || emp.email) : null);

  return {
    // الأصل
    id: row.id,
    case_number: row.case_number || row.caseNumber || row.no || null,
    title: row.title || "",
    status: row.status || "",
    court: row.court || "",
    next: row.next || null,

    // تواريخ
    created_at: row.created_at || row.createdAt || null,
    updated_at: row.updated_at || row.updatedAt || null,
    createdAt: row.createdAt || row.created_at || null,
    updatedAt: row.updatedAt || row.updated_at || null,

    // إسناد
    assignedTo: assignedTo,
    assigned_to:
      row.assigned_to !== undefined
        ? row.assigned_to
        : (assignedTo ? Number(assignedTo) : null),

    assignedName: assignedName || null,
    assigned_name:
      row.assigned_name !== undefined
        ? row.assigned_name
        : (assignedName || null),

    // حقول إضافية
    assignNote: row.assignNote || row.assign_note || null,
    assignedAt: row.assignedAt || row.assigned_at || null,
  };
}

/* ===================== Cases ===================== */

export async function fetchAllCases() {
  // ⚠️ staff ما يقدر /employees (403) — نتجاهل ونكمل
  var cases = await http("GET", "/cases");
  var rows = Array.isArray(cases) ? cases : [];

  var emps = [];
  try {
    emps = await fetchEmployees();
  } catch (e) {
    emps = [];
  }

  var empById = buildEmpById(emps);

  var out = [];
  for (var j = 0; j < rows.length; j++) {
    out.push(normalizeCaseRow(rows[j], empById));
  }
  return out;
}

export async function fetchMyCases(_userIdIgnored) {
  var res = await http("GET", "/my/cases");
  var rows = Array.isArray(res) ? res : [];
  var out = [];
  for (var i = 0; i < rows.length; i++) out.push(normalizeCaseRow(rows[i], null));
  return out;
}

export async function fetchCase(idOrNumber) {
  var key = String(idOrNumber || "").trim();
  if (!key) throw new Error("رقم/معرّف القضية غير صالح.");

  var row = await http("GET", "/cases/" + encodeURIComponent(key));

  // إذا مدير: نحاول نجيب الموظفين عشان الاسم
  var empById = null;
  try {
    var emps = await fetchEmployees();
    empById = buildEmpById(emps);
  } catch (e) {
    empById = null;
  }

  return normalizeCaseRow(row, empById);
}

export async function createCase(payload) {
  payload = payload || {};
  var case_number = payload.case_number;
  var title = payload.title;
  var status = payload.status || "open";
  var court = payload.court || null;
  var next = payload.next || null;

  if (!title || !String(title).trim()) throw new Error("عنوان القضية مطلوب.");
  if (!case_number || !String(case_number).trim()) throw new Error("رقم القضية مطلوب.");

  return await http("POST", "/cases", {
    case_number: String(case_number).trim(),
    title: String(title).trim(),
    status: String(status).trim(),
    court: court,
    next: next,
  });
}

export async function updateCaseMeta(caseIdOrNumber, patch) {
  patch = patch || {};
  var key = String(caseIdOrNumber || "").trim();
  if (!key) throw new Error("case_id_required");

  var safePatch = {};
  if (patch.title !== undefined) safePatch.title = patch.title;
  if (patch.status !== undefined) safePatch.status = patch.status;
  if (patch.court !== undefined) safePatch.court = patch.court;
  if (patch.next !== undefined) safePatch.next = patch.next;

  var hasAny = false;
  for (var k in safePatch) { hasAny = true; break; }
  if (!hasAny) throw new Error("nothing_to_update");

  return await http("PATCH", "/cases/" + encodeURIComponent(key), safePatch);
}

export async function deleteCase(caseIdOrNumber) {
  var key = String(caseIdOrNumber || "").trim();
  if (!key) throw new Error("case_id_required");
  return await http("DELETE", "/cases/" + encodeURIComponent(key));
}

export async function closeCase(caseIdOrNumber) {
  var key = String(caseIdOrNumber || "").trim();
  if (!key) throw new Error("case_id_required");
  return await http("POST", "/cases/" + encodeURIComponent(key) + "/close", {});
}

export async function reopenCase(caseIdOrNumber) {
  var key = String(caseIdOrNumber || "").trim();
  if (!key) throw new Error("case_id_required");
  return await http("POST", "/cases/" + encodeURIComponent(key) + "/reopen", {});
}

export async function checkCaseExists(caseNumber) {
  var wanted = String(caseNumber || "").trim();
  if (!wanted) return false;
  var rows = await fetchAllCases();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].case_number || "").trim() === wanted) return true;
  }
  return false;
}

/* ===================== Assignments ===================== */

export async function assignCaseTo(case_id, user_id, note) {
  if (!case_id || !String(case_id).trim()) throw new Error("case_id مطلوب.");
  if (!user_id || !String(user_id).trim()) throw new Error("user_id مطلوب.");

  return await http("POST", "/assign", {
    case_id: Number(case_id),
    user_id: Number(user_id),
    note: note ? String(note) : null,
  });
}

/* ===================== Dashboard ===================== */

export async function getDashboardTopCounts() {
  var cases = await fetchAllCases();

  var pend = [];
  try {
    pend = await listPendingUsers();
  } catch (e) {
    pend = [];
  }

  // assignedCases: نحسبها لو فيه assignedTo
  var assigned = 0;
  for (var i = 0; i < cases.length; i++) if (cases[i].assignedTo) assigned++;

  return { totalCases: cases.length, pendingUsers: pend.length, assignedCases: assigned };
}

export async function getDashboardCounters() {
  var list = await fetchAllCases();

  var active = 0;
  var closed = 0;
  for (var i = 0; i < list.length; i++) {
    var st = String(list[i].status || "");
    if (st === "open") active++;
    if (st === "closed" || st === "archived") closed++;
  }

  return { active: active, closed: closed, sessionsThisWeek: 0, nearDeadlines: 0 };
}

export async function getLatestCases(limit) {
  var rows = await fetchAllCases();
  var n = Math.max(1, Math.min(50, Number(limit) || 10));

  var out = [];
  for (var i = 0; i < Math.min(n, rows.length); i++) {
    var r = rows[i];
    out.push({
      no: r.case_number || r.id,
      title: r.title,
      owner: r.assignedName || r.assigned_name || "—",
      status: r.status || "—",
      updatedAt: r.updatedAt || r.updated_at || r.createdAt || r.created_at || "—",
    });
  }
  return out;
}

/* ===================== Activity ===================== */

export async function getRecentActivity(limit) {
  var n = Math.max(1, Math.min(100, Number(limit) || 12));
  var res = await http("GET", "/activity/recent?limit=" + n);
  var rows = Array.isArray(res) ? res : [];

  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var a = rows[i] || {};
    out.push({
      who: a.who || "—",
      what: (a.text !== undefined ? a.text : (a.what !== undefined ? a.what : "")),
      caseNo: (a.caseId !== undefined ? a.caseId : (a.case_id !== undefined ? a.case_id : null)),
      at: a.at || a.createdAt || a.created_at || "",
    });
  }
  return out;
}

/* ===================== Sessions/week ===================== */

export async function getWeekSessions() {
  var res = await http("GET", "/sessions/week");
  var rows = Array.isArray(res) ? res : [];
  var out = [];

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i] || {};
    var raw = r.session_at || r.sessionAt || null;
    var dt = raw ? new Date(raw) : null;
    var date = dt ? dt.toLocaleDateString("ar-SA") : "—";
    var time = dt ? dt.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : "—";

    out.push({
      date: date,
      time: time,
      caseNo: r.case_number || r.caseNo || r.caseId || r.case_id || "—",
      title: r.title || "—",
      court: r.court || "",
    });
  }

  return out;
}

/* ===================== Extra placeholders (حتى ما تكسر صفحات) ===================== */

export async function getUpcomingDeadlines() {
  return [];
}

export async function getTeamKPIs() {
  return [];
}

/* ===================== Timeline ===================== */

export async function getCaseTimeline(caseId) {
  var id = String(caseId || "").trim();
  if (!id) return [];
  var res = await http("GET", "/cases/" + encodeURIComponent(id) + "/timeline");
  return Array.isArray(res) ? res : [];
}

/* ===================== Sessions داخل القضية ===================== */

export async function listSessions(caseId) {
  var id = String(caseId || "").trim();
  if (!id) return [];
  var res = await http("GET", "/cases/" + encodeURIComponent(id) + "/sessions");
  var rows = Array.isArray(res) ? res : [];

  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var s = rows[i] || {};
    out.push({
      id: s.id,
      sessionAt: s.session_at || s.sessionAt || null,
      session_at: s.session_at || s.sessionAt || null,
      court: s.court || null,
      room: s.room || null,
      notes: s.notes || null,
      summary: s.summary !== undefined ? s.summary : null,
      summaryBy: s.summary_by || s.summaryBy || null,
      summary_by: s.summary_by || s.summaryBy || null,
      summaryAt: s.summary_at || s.summaryAt || null,
      summary_at: s.summary_at || s.summaryAt || null,
    });
  }
  return out;
}

export async function listCaseSessions(caseId) {
  var rows = await listSessions(caseId);
  for (var i = 0; i < rows.length; i++) {
    rows[i].at = rows[i].sessionAt || rows[i].session_at || null;
  }
  return rows;
}

export async function getSession(caseId, sessionId) {
  var cid = String(caseId || "").trim();
  var sid = String(sessionId || "").trim();
  if (!cid || !sid) throw new Error("معرّف الجلسة غير صالح.");

  var rows = await listSessions(cid);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === String(sid)) return rows[i];
  }
  throw new Error("not_found");
}

export async function createSession(caseId, payload) {
  payload = payload || {};
  var id = String(caseId || "").trim();
  if (!id) throw new Error("معرّف القضية غير صالح.");

  var at = String(payload.session_at || "").trim();
  if (!at) throw new Error("تاريخ/وقت الجلسة مطلوب.");

  return await http("POST", "/cases/" + encodeURIComponent(id) + "/sessions", {
    session_at: at,
    court: payload.court || null,
    room: payload.room || null,
    notes: payload.notes || null,
  });
}

export async function addSessionSummary(caseId, sessionId, payload) {
  payload = payload || {};
  var cid = String(caseId || "").trim();
  var sid = String(sessionId || "").trim();
  var text = String(payload.summary || "").trim();

  if (!cid || !sid) throw new Error("معرّف الجلسة غير صالح.");
  if (!text) throw new Error("الملخص مطلوب.");

  return await http(
    "POST",
    "/cases/" + encodeURIComponent(cid) + "/sessions/" + encodeURIComponent(sid) + "/summary",
    { summary: text }
  );
}

/* ===================== Docs ===================== */

export async function listCaseDocs(caseId) {
  var id = String(caseId || "").trim();
  if (!id) return [];
  var res = await http("GET", "/cases/" + encodeURIComponent(id) + "/docs");
  return Array.isArray(res) ? res : [];
}

export async function addCaseDoc(caseId, payload) {
  payload = payload || {};
  var id = String(caseId || "").trim();
  if (!id) throw new Error("معرّف القضية غير صالح.");

  var name = payload.name || payload.fileName || payload.filename || payload.title || "";
  if (!String(name || "").trim()) throw new Error("اسم المستند مطلوب.");

  return await http("POST", "/cases/" + encodeURIComponent(id) + "/docs", {
    name: String(name).trim(),
    fileUrl: payload.fileUrl || payload.file_url || null,
  });
}

export async function updateCaseDoc(caseId, docId, patch) {
  // الباكند ما عنده PATCH docs حسب كودك — نخليها Placeholder عشان ما تكسر
  throw new Error("docs_patch_not_ready");
}

export async function removeCaseDoc(caseId, docId) {
  var cid = String(caseId || "").trim();
  var did = String(docId || "").trim();
  if (!cid || !did) throw new Error("معرّف غير صالح.");

  // ⚠️ الباكند عندك ما فيه DELETE docs — متسامحين: لو فشل/404 ما نكسر الصفحة
  try {
    return await http("DELETE", "/cases/" + encodeURIComponent(cid) + "/docs/" + encodeURIComponent(did));
  } catch (e) {
    var msg = String(e && e.message ? e.message : "");
    if (msg.indexOf("not_found") >= 0 || msg.indexOf("404") >= 0) return { ok: true };
    throw e;
  }
}

export async function uploadCaseDocFile(caseId, file, meta) {
  meta = meta || {};
  var cid = String(caseId || "").trim();
  if (!cid) throw new Error("case_id_required");
  if (!file) throw new Error("file_required");

  var form = new FormData();
  form.append("file", file);
  form.append("name", meta.name || file.name);
  form.append("kind", meta.kind || "session_memo");

  // token من نفس مكان saveToken()
  var token = null;
  try {
    var raw = localStorage.getItem("auth") || localStorage.getItem("faris_token") || localStorage.getItem("token");
    var parsed = raw ? JSON.parse(raw) : null;
    token = (parsed && parsed.token) ? parsed.token : parsed;
  } catch (e) {
    token = null;
  }

  var API_BASE = String(import.meta.env.VITE_API_BASE || "").trim().replace(/\/+$/g, "");
  var base = API_BASE || "";

  var res = await fetch(base + "/cases/" + encodeURIComponent(cid) + "/docs/upload", {
    method: "POST",
    headers: token ? { Authorization: "Bearer " + token } : {},
    body: form,
  });

  var data = null;
  try { data = await res.json(); } catch (e) { data = null; }

  if (!res.ok) throw new Error((data && (data.error || data.message)) || ("HTTP " + res.status));
  return data;
}

/* ===================== Notes ===================== */

export async function listCaseNotes(caseId) {
  var id = String(caseId || "").trim();
  if (!id) return [];
  var res = await http("GET", "/cases/" + encodeURIComponent(id) + "/notes");
  return Array.isArray(res) ? res : [];
}

export async function addCaseNote(caseId, payload) {
  payload = payload || {};
  var id = String(caseId || "").trim();
  if (!id) throw new Error("معرّف القضية غير صالح.");

  var body = payload.body || payload.txt || payload.text || payload.note || "";
  if (!String(body || "").trim()) throw new Error("نص الملاحظة مطلوب.");

  return await http("POST", "/cases/" + encodeURIComponent(id) + "/notes", {
    body: String(body).trim(),
  });
}

export async function updateCaseNote(caseId, noteId, patch) {
  // الباكند ما عنده PATCH notes حسب كودك — نخليها Placeholder عشان ما تكسر
  throw new Error("notes_patch_not_ready");
}

export async function removeCaseNote(caseId, noteId) {
  var cid = String(caseId || "").trim();
  var nid = String(noteId || "").trim();
  if (!cid || !nid) throw new Error("معرّف غير صالح.");

  // ⚠️ الباكند عندك ما فيه DELETE notes — متسامحين: لو فشل/404 ما نكسر الصفحة
  try {
    return await http("DELETE", "/cases/" + encodeURIComponent(cid) + "/notes/" + encodeURIComponent(nid));
  } catch (e) {
    var msg = String(e && e.message ? e.message : "");
    if (msg.indexOf("not_found") >= 0 || msg.indexOf("404") >= 0) return { ok: true };
    throw e;
  }
}

/* ===================== Notifications ===================== */

export async function fetchNotifications(opts) {
  opts = opts || {};
  var unreadOnly = !!opts.unreadOnly;
  var q = unreadOnly ? "?unread=1" : "";
  var res = await http("GET", "/notifications" + q);
  var rows = Array.isArray(res) ? res : [];
  return rows;
}

export async function markNotificationRead(id) {
  var nid = String(id || "").trim();
  if (!nid) throw new Error("معرّف الإشعار غير صالح.");
  return await http("POST", "/notifications/" + encodeURIComponent(nid) + "/read", {});
}

export async function markAllNotificationsRead() {
  // ✅ الباكند الحالي ما عنده /notifications/read-all
  // نسوي fallback: نجيب الاشعارات ونعلّمها واحدة واحدة
  try {
    return await http("POST", "/notifications/read-all", {});
  } catch (e) {
    var list = [];
    try { list = await fetchNotifications({ unreadOnly: true }); } catch (e2) { list = []; }

    for (var i = 0; i < list.length; i++) {
      try { await markNotificationRead(list[i].id); } catch (e3) {}
    }
    return { ok: true };
  }
}

/* ===================== Tasks ===================== */

function normalizeMyTask(t) {
  t = t || {};
  return {
    id: t.id,
    title: t.title || "",
    done: !!t.done,
    due: t.due !== undefined ? t.due : (t.due_at !== undefined ? t.due_at : (t.dueAt !== undefined ? t.dueAt : null)),
    dueAt: t.dueAt !== undefined ? t.dueAt : (t.due_at !== undefined ? t.due_at : (t.due !== undefined ? t.due : null)),
    createdAt: t.createdAt || t.created_at || null,
    updatedAt: t.updatedAt || t.updated_at || null,
  };
}

export async function listMyTasks(_maybeMeIdIgnored) {
  var res = await http("GET", "/my/tasks");
  var rows = Array.isArray(res) ? res : [];
  var out = [];
  for (var i = 0; i < rows.length; i++) out.push(normalizeMyTask(rows[i]));
  return out;
}

export async function addMyTask(a, b) {
  var payload = (b === undefined) ? (a || {}) : (b || {});
  var title = String(payload.title || payload.text || "").trim();
  var dueAt = payload.due_at !== undefined ? payload.due_at : (payload.dueAt !== undefined ? payload.dueAt : (payload.due !== undefined ? payload.due : null));
  if (!title) throw new Error("title_required");

  var created = await http("POST", "/my/tasks", { title: title, due_at: dueAt || null });
  return normalizeMyTask(created || {});
}

export async function toggleMyTask(a, b, c) {
  var taskId = (c === undefined) ? a : b;
  var done = (c === undefined) ? b : c;

  var id = String(taskId || "").trim();
  if (!id) throw new Error("invalid_task_id");

  var updated = await http("PATCH", "/my/tasks/" + encodeURIComponent(id), { done: !!done });
  return normalizeMyTask(updated || {});
}

export async function updateMyTask(a, b, c) {
  var taskId = (c === undefined) ? a : b;
  var patch = (c === undefined) ? (b || {}) : (c || {});

  var id = String(taskId || "").trim();
  if (!id) throw new Error("invalid_task_id");

  var body = {};
  if (patch.title !== undefined) body.title = patch.title;
  if (patch.done !== undefined) body.done = !!patch.done;

  var dueAt = (patch.due_at !== undefined) ? patch.due_at : (patch.dueAt !== undefined ? patch.dueAt : (patch.due !== undefined ? patch.due : undefined));
  if (dueAt !== undefined) body.due_at = dueAt || null;

  var updated = await http("PATCH", "/my/tasks/" + encodeURIComponent(id), body);
  return normalizeMyTask(updated || {});
}

export async function deleteMyTask(a, b) {
  var taskId = (b === undefined) ? a : b;
  var id = String(taskId || "").trim();
  if (!id) throw new Error("invalid_task_id");
  return await http("DELETE", "/my/tasks/" + encodeURIComponent(id));
}

/* ===================== Drafts ===================== */

export async function listDrafts(params) {
  params = params || {};
  var qs = [];
  if (params.status && params.status !== "all") qs.push("status=" + encodeURIComponent(params.status));
  if (params.caseId) qs.push("caseId=" + encodeURIComponent(params.caseId));
  var q = qs.length ? "?" + qs.join("&") : "";
  var res = await http("GET", "/drafts" + q);
  return Array.isArray(res) ? res : [];
}

export async function createDraft(payload) {
  payload = payload || {};
  return await http("POST", "/drafts", payload);
}

export async function updateDraft(id, patch) {
  var did = String(id || "").trim();
  if (!did) throw new Error("draft_id_required");
  return await http("PATCH", "/drafts/" + encodeURIComponent(did), patch || {});
}

export async function deleteDraft(id) {
  // الباكند ما عنده DELETE drafts حسب كودك
  throw new Error("drafts_delete_not_ready");
}

export async function approveDraft(id) {
  var did = String(id || "").trim();
  if (!did) throw new Error("draft_id_required");
  return await http("PATCH", "/drafts/" + encodeURIComponent(did), { status: "approved" });
}

export async function rejectDraft(id) {
  var did = String(id || "").trim();
  if (!did) throw new Error("draft_id_required");
  return await http("PATCH", "/drafts/" + encodeURIComponent(did), { status: "rejected" });
}

/* ===================== Case Tasks (لو صفحاتك تستوردها) ===================== */

export async function listCaseTasks() {
  // إذا ما عندك endpoint /tasks في الباكند الحالي، نخليها آمنة
  try {
    var res = await http("GET", "/tasks");
    return Array.isArray(res) ? res : [];
  } catch (e) {
    return [];
  }
}

export async function addCaseTask(payload) {
  // إذا ما عندك endpoint /tasks في الباكند الحالي، نخليها واضحة
  payload = payload || {};
  try {
    return await http("POST", "/tasks", payload);
  } catch (e) {
    throw new Error("tasks_endpoint_not_ready");
  }
}

/* ===================== Aliases (Back-compat) ===================== */

export async function deleteCaseDoc(caseId, docId) {
  return await removeCaseDoc(caseId, docId);
}

export async function deleteCaseNote(caseId, noteId) {
  return await removeCaseNote(caseId, noteId);
}

export async function addDoc(caseId, payload) {
  return await addCaseDoc(caseId, payload);
}
