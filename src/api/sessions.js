// FILE: src/api/sessions.js
import { http } from "../utils/http.js";

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
