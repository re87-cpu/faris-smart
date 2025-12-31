import { api } from "../utils/api.js";

export default function UploadCaseDoc({ caseId }) {
  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    await fetch(
      `${import.meta.env.VITE_API_BASE}/cases/${caseId}/docs/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("fs_auth_v1")
          )?.token}`,
        },
        body: form,
      }
    );

    alert("تم رفع المستند بنجاح");
  }

  return (
    <div>
      <label className="q-btn ghost">
        رفع المستند بعد التعديل
        <input
          type="file"
          accept=".docx"
          hidden
          onChange={handleUpload}
        />
      </label>
    </div>
  );
}
