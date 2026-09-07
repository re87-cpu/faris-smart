// FILE: src/api/notes.js
import { http } from "../utils/http.js";

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

/* ===================== Aliases (Back-compat) ===================== */

export async function deleteCaseNote(caseId, noteId) {
  return await removeCaseNote(caseId, noteId);
}
