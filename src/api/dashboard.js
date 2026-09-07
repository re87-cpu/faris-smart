// FILE: src/api/dashboard.js
import { http } from "../utils/http.js";
import { fetchAllCases } from "./cases.js";
import { listPendingUsers } from "./auth.js";

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
    // ✅ نفضّل استخدام sessionAt القادم من الـ API (ISO) عشان ما نخسر الدقة
    var raw = r.sessionAt || r.session_at || r.session_at || null;
    var dt = raw ? new Date(raw) : null;

    // نعرض تاريخ/وقت بشكل مفهوم، لكن نخلي raw موجود للتقويم
    var date = dt && !isNaN(dt) ? dt.toLocaleDateString("ar-SA") : (r.date || "—");
    var time = dt && !isNaN(dt) ? dt.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : (r.time || "—");

    out.push({
      id: r.id,
      sessionAt: raw || r.sessionAt || r.session_at || null,
      session_at: raw || r.sessionAt || r.session_at || null,
      date: date,
      time: time,
      caseId: r.caseId || r.case_id || r.caseId || null,
      caseNo: r.caseNo || r.case_number || r.case_number || r.caseId || r.case_id || "—",
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
