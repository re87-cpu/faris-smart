// FILE: src/api/articles.js
// الباكند المتوقع:
//   GET    /articles            عام  (المنشور فقط) ?limit=N
//   GET    /articles/:id        عام  (منشور واحد)
//   GET    /articles/mine       محمي (مقالاتي بكل الحالات)
//   GET    /articles/pending    محمي (مدير فقط)
//   POST   /articles            محمي (مدير=منشور فورًا / موظف=قيد المراجعة)
//   PATCH  /articles/:id        محمي (الكاتب لمقاله أو المدير)
//   POST   /articles/:id/approve  محمي (مدير)
//   POST   /articles/:id/reject   محمي (مدير)
//   DELETE /articles/:id        محمي (الكاتب أو المدير)

import { http } from "../utils/http.js";
import { normalizeArticle, toArray } from "./_normalize.js";

export async function listArticles(opts) {
  opts = opts || {};
  var q = opts.limit ? "?limit=" + encodeURIComponent(opts.limit) : "";
  var res = await http("GET", "/articles" + q);
  return toArray(res).map(normalizeArticle);
}

export async function fetchArticle(id) {
  var aid = String(id || "").trim();
  if (!aid) throw new Error("معرّف المقال غير صالح.");
  return normalizeArticle(await http("GET", "/articles/" + encodeURIComponent(aid)));
}

export async function listMyArticles() {
  var res = await http("GET", "/articles/mine");
  return toArray(res).map(normalizeArticle);
}

export async function listPendingArticles() {
  var res = await http("GET", "/articles/pending");
  return toArray(res).map(normalizeArticle);
}

export async function createArticle(payload) {
  payload = payload || {};
  return normalizeArticle(
    await http("POST", "/articles", {
      title: String(payload.title || "").trim(),
      content: String(payload.content || payload.body || "").trim(),
    })
  );
}

export async function updateArticle(id, patch) {
  var aid = String(id || "").trim();
  if (!aid) throw new Error("معرّف المقال غير صالح.");
  return normalizeArticle(await http("PATCH", "/articles/" + encodeURIComponent(aid), patch || {}));
}

export async function approveArticle(id) {
  var aid = String(id || "").trim();
  try {
    return await http("POST", "/articles/" + encodeURIComponent(aid) + "/approve", {});
  } catch {
    return await http("PATCH", "/articles/" + encodeURIComponent(aid), { status: "published" });
  }
}

export async function rejectArticle(id) {
  var aid = String(id || "").trim();
  try {
    return await http("POST", "/articles/" + encodeURIComponent(aid) + "/reject", {});
  } catch {
    return await http("PATCH", "/articles/" + encodeURIComponent(aid), { status: "rejected" });
  }
}

export async function deleteArticle(id) {
  var aid = String(id || "").trim();
  if (!aid) throw new Error("معرّف المقال غير صالح.");
  return await http("DELETE", "/articles/" + encodeURIComponent(aid));
}
