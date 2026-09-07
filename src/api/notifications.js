// FILE: src/api/notifications.js
import { http } from "../utils/http.js";

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
