// FILE: src/pages/staff/case/CaseDocuments.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { listCaseDocs, addCaseDoc, removeCaseDoc } from "../../../mock/api.js";
import { getAuth } from "../../../utils/auth.js";

export default function CaseDocuments() {
  const { caseId } = useParams();
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const auth = getAuth();
  const me = auth?.user || null;
  const byLabel = me?.full_name || me?.name || me?.email || "staff";

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const rows = await listCaseDocs(caseId);
      const normalized = (rows || []).map((d) => ({
        id: d.id,
        name: d.name || d.title || d.fileName || "—",
        by: d.uploadedBy || d.uploaded_by || "—",
        ts: d.uploadedAt || d.uploaded_at ? new Date(d.uploadedAt || d.uploaded_at).getTime() : 0,
      }));
      normalized.sort((a, b) => b.ts - a.ts);
      setList(normalized);
    } catch (ex) {
      setErr(ex.message || "تعذّر التحميل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function onAdd(e) {
    e.preventDefault();
    setErr("");
    const trimmed = String(name || "").trim();
    if (!trimmed) {
      setErr("اكتب اسم/وصف للمستند أولاً.");
      return;
    }
    try {
      await addCaseDoc(caseId, { name: trimmed, by: byLabel });
      setName("");
      await load();
    } catch (ex) {
      setErr(ex.message || "تعذّر الإضافة");
    }
  }

  async function onDel(id) {
    try {
      await removeCaseDoc(caseId, id);
      await load();
    } catch (ex) {
      setErr(ex.message || "تعذّر الحذف");
    }
  }

  return (
    <div dir="rtl" style={{ display: "grid", gap: 12 }}>
      <form
        onSubmit={onAdd}
        className="form"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 8,
        }}
      >
        <input
          className="input"
          placeholder="اسم/وصف المستند…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="q-btn primary" disabled={!name.trim()}>
          إضافة
        </button>
      </form>

      {err && <div className="error">{err}</div>}

      <div className="q-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 12 }}>جارٍ التحميل…</div>
        ) : list.length === 0 ? (
          <div style={{ padding: 12, color: "var(--ink-600)" }}>
            لا يوجد مستندات.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>التاريخ</th>
                <th>بواسطة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.ts ? new Date(d.ts).toLocaleString() : "—"}</td>
                  <td>{d.by || "—"}</td>
                  <td style={{ textAlign: "left" }}>
                    <button
                      type="button"
                      className="q-btn ghost"
                      onClick={() => onDel(d.id)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
