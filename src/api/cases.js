// FILE: src/api/cases.js
import { http } from "../utils/http.js";
import { fetchEmployees } from "./employees.js";
import { buildEmpById, normalizeCaseRow } from "./_normalize.js";

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

  // ✅ تأكد أن القضية موجودة قبل الإسناد (حتى لا يكون الصمت)
  try {
    await http("GET", "/cases/" + encodeURIComponent(String(case_id)));
  } catch (e) {
    throw new Error("القضية غير موجودة في قاعدة البيانات (case_not_found).");
  }

  return await http("POST", "/assign", {
    case_id: Number(case_id),
    user_id: Number(user_id),
    note: note ? String(note) : null,
  });
}
