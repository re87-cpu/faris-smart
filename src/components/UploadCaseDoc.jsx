// FILE: src/components/UploadCaseDoc.jsx
// ✅ توكن موحّد (نفس منطق http.js) حتى ما يتكرر خطأ no_token
// ✅ رفع ملفات مستندات القضية عبر /cases/:id/docs/upload

import React, { useState } from "react";

/** اقرأ التوكن من كل المفاتيح المحتملة بدون JSON.parse غلط */
function getTokenAny() {
  // المفاتيح الموجودة عندك فعليًا
  const direct =
    localStorage.getItem("faris_token") ||
    localStorage.getItem("fs_auth_v1") ||
    localStorage.getItem("token");

  if (direct && typeof direct === "string") {
    const t = direct.trim();
    // إزالة اقتباسات لو كانت محفوظة بشكل قديم
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      return t.slice(1, -1);
    }
    // لو كان JSON بالغلط
    if (t.startsWith("{")) {
      try {
        const obj = JSON.parse(t);
        const tok = obj?.token || obj?.accessToken || null;
        if (tok) return String(tok).trim();
      } catch {
        // ignore
      }
    }
    return t;
  }

  // auth كـ JSON {token}
  const authRaw = localStorage.getItem("auth");
  if (authRaw) {
    try {
      const obj = JSON.parse(authRaw);
      const tok = obj?.token || obj?.accessToken || null;
      if (tok) return String(tok).trim();
    } catch {
      // ignore
    }
  }

  return null;
}

function apiBase() {
  // يدعم VITE_API_BASE (مستحسن) وإلا يستخدم نفس الدومين
  const raw = String(import.meta?.env?.VITE_API_BASE || "").trim();
  return raw ? raw.replace(/\/+$/g, "") : "";
}

async function uploadCaseDocFile(caseId, file, meta) {
  meta = meta || {};
  const cid = String(caseId || "").trim();
  if (!cid) throw new Error("case_id_required");
  if (!file) throw new Error("file_required");

  const token = getTokenAny();
  if (!token) throw new Error("no_token");

  const form = new FormData();
  form.append("file", file);
  form.append("name", meta.name || file.name);
  form.append("kind", meta.kind || "case_doc");

  const base = apiBase();
  const url = (base ? base : "") + "/cases/" + encodeURIComponent(cid) + "/docs/upload";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      // ⚠️ لا تضيف Content-Type مع FormData
    },
    body: form,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || ("HTTP " + res.status);
    throw new Error(msg);
  }

  return data;
}

export default function UploadCaseDoc({ caseId, onUploaded, kind }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setErr("");
    setBusy(true);

    try {
      const data = await uploadCaseDocFile(caseId, file, { name: file.name, kind: kind || "case_doc" });
      if (typeof onUploaded === "function") onUploaded(data);
    } catch (ex) {
      const msg = String(ex?.message || ex || "");
      setErr(msg === "no_token" ? "الرجاء تسجيل الدخول مرة أخرى." : msg);
    } finally {
      setBusy(false);
      // إعادة تعيين input حتى يسمح برفع نفس الملف مرة أخرى
      e.target.value = "";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.15)",
          cursor: busy ? "not-allowed" : "pointer",
          opacity: busy ? 0.7 : 1,
          width: "fit-content",
        }}
      >
        <input type="file" onChange={onChange} disabled={busy} style={{ display: "none" }} />
        <span>{busy ? "جاري الرفع..." : "رفع مستند"}</span>
      </label>

      {err ? (
        <div style={{ color: "#b00020", fontSize: 13 }}>
          {err}
        </div>
      ) : null}
    </div>
  );
}
