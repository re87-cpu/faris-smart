// FILE: src/api/auth.js
import { http } from "../utils/http.js";
import { saveToken } from "./_token.js";

export async function fetchMe() {
  return await http("GET", "/me");
}

export async function signIn(payload) {
  payload = payload || {};
  const email = payload.email;
  const password = payload.password;

  const res = await http("POST", "/auth/login", { email, password });
  const token = res ? res.token : null;

  // 🧹 نظّفي القديم (اختياري لكنه ممتاز)
  localStorage.removeItem("token");
  localStorage.removeItem("faris_token");
  localStorage.removeItem("fs_auth_v1");
  localStorage.removeItem("auth");

  saveToken(token);

  const me = await fetchMe();
  return { role: me && me.role === "manager" ? "admin" : "staff", user: me, token };
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

export async function rejectUser(userId) {
  if (!userId) throw new Error("userId_required");
  return await http("POST", "/auth/reject", { userId: userId, user_id: userId });
}
