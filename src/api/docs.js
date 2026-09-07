// FILE: src/api/docs.js
import { http } from "../utils/http.js";
import { getTokenAny } from "./_token.js";

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
  var cid = String(caseId || "").trim();
  var did = String(docId || "").trim();
  patch = patch || {};
  if (!cid || !did) throw new Error("invalid_doc_id");

  var body = {};
  if (patch.name !== undefined) body.name = patch.name;

  var hasAny = false;
  for (var k in body) { hasAny = true; break; }
  if (!hasAny) throw new Error("nothing_to_update");

  return await http("PATCH", "/cases/" + encodeURIComponent(cid) + "/docs/" + encodeURIComponent(did), body);
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

  // ✅ token من كل الأماكن المحتملة + بدون JSON.parse غلط
  var token = getTokenAny();

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

/* ===================== Aliases (Back-compat) ===================== */

export async function deleteCaseDoc(caseId, docId) {
  return await removeCaseDoc(caseId, docId);
}

export async function addDoc(caseId, payload) {
  return await addCaseDoc(caseId, payload);
}
