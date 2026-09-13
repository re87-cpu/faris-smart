// FILE: src/components/UploadCaseDoc.jsx
// ✅ توكن موحّد عبر getAuthToken() (نفس مصدر http.js — يشمل التخزين الآمن على الجوال)
// ✅ رفع ملفات مستندات القضية عبر /cases/:id/docs/upload
// ✅ داخل تطبيق الجوال: زر إضافي لالتقاط صورة أو اختيار من المعرض (Capacitor Camera)

import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { getAuthToken } from "../utils/auth.js";
import { API_BASE } from "../utils/http.js";

async function fileFromWebPath(webPath, fileName, mimeType) {
  const res = await fetch(webPath);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || mimeType || "image/jpeg" });
}

async function uploadCaseDocFile(caseId, file, meta) {
  meta = meta || {};
  const cid = String(caseId || "").trim();
  if (!cid) throw new Error("case_id_required");
  if (!file) throw new Error("file_required");

  const token = await getAuthToken();
  if (!token) throw new Error("no_token");

  const form = new FormData();
  form.append("file", file);
  form.append("name", meta.name || file.name);
  form.append("kind", meta.kind || "case_doc");

  const url = (API_BASE || "") + "/cases/" + encodeURIComponent(cid) + "/docs/upload";

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

  async function captureAndUpload(source) {
    setErr("");
    setBusy(true);
    try {
      const { Camera } = await import("@capacitor/camera");
      const result = source === "camera"
        ? await Camera.takePhoto({ quality: 85 })
        : (await Camera.chooseFromGallery({})).results[0];
      if (!result) return; // المستخدم ألغى بدون اختيار من المعرض
      const fileName = `مستند-${Date.now()}.jpg`;
      const file = await fileFromWebPath(result.webPath, fileName, "image/jpeg");
      const data = await uploadCaseDocFile(caseId, file, { name: fileName, kind: kind || "case_doc" });
      if (typeof onUploaded === "function") onUploaded(data);
    } catch (ex) {
      const msg = String(ex?.message || ex || "");
      // إلغاء المستخدم للاختيار ليس خطأً يُعرض
      if (!/cancel/i.test(msg)) setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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

        {Capacitor.isNativePlatform() && (
          <>
            <button
              type="button" onClick={() => captureAndUpload("camera")} disabled={busy}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)",
                cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1, background: "transparent",
              }}
            >
              📷 كاميرا
            </button>
            <button
              type="button" onClick={() => captureAndUpload("gallery")} disabled={busy}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)",
                cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1, background: "transparent",
              }}
            >
              🖼️ المعرض
            </button>
          </>
        )}
      </div>

      {err ? (
        <div style={{ color: "#b00020", fontSize: 13 }}>
          {err}
        </div>
      ) : null}
    </div>
  );
}
