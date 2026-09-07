// FILE: src/api/drafts.js
import { http } from "../utils/http.js";

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
  var did = String(id || "").trim();
  if (!did) throw new Error("draft_id_required");
  return await http("DELETE", "/drafts/" + encodeURIComponent(did));
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
