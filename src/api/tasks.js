// FILE: src/api/tasks.js
import { http } from "../utils/http.js";
import { normalizeMyTask } from "./_normalize.js";

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
