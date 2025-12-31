// FILE: src/pages/staff/case/CaseNotes.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  listCaseNotes,
  addCaseNote,
  removeCaseNote,
  updateCaseNote,
} from "../../../mock/api.js";
import { getAuth } from "../../../utils/auth.js";

export default function CaseNotes() {
  const { caseId } = useParams();
  const [list, setList] = useState([]);
  const [txt, setTxt] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTxt, setEditTxt] = useState("");

  const auth = getAuth();
  const me = auth?.user || null;
  const byLabel = me?.full_name || me?.name || me?.email || "staff";

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const rows = await listCaseNotes(caseId);
      const normalized = (rows || []).map((n) => ({
        id: n.id,
        txt: n.body || n.txt || "",
        by: n.createdBy || n.created_by || "—",
        ts: n.createdAt || n.created_at ? new Date(n.createdAt || n.created_at).getTime() : 0,
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
    setEditingId(null);
    setEditTxt("");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function onAdd(e) {
    e.preventDefault();
    setErr("");
    const trimmed = String(txt || "").trim();
    if (!trimmed) {
      setErr("اكتبي نص الملاحظة أولاً.");
      return;
    }
    try {
      await addCaseNote(caseId, { body: trimmed });
      setTxt("");
      await load();
    } catch (ex) {
      setErr(ex.message || "تعذّر الإضافة");
    }
  }

  function startEdit(n) {
    setErr("");
    setEditingId(n.id);
    setEditTxt(n.txt || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTxt("");
  }

  async function saveEdit(noteId) {
    setErr("");
    const trimmed = String(editTxt || "").trim();
    if (!trimmed) {
      setErr("نص الملاحظة لا يمكن أن يكون فارغًا.");
      return;
    }

    try {
      await updateCaseNote(caseId, noteId, { txt: trimmed, by: byLabel });
      setEditingId(null);
      setEditTxt("");
      await load();
    } catch (ex) {
      setErr(ex.message || "تعذّر التعديل");
    }
  }

  async function onDel(id) {
    setErr("");
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("حذف الملاحظة؟")) return;

    if (editingId === id) cancelEdit();

    try {
      await removeCaseNote(caseId, id);
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
        <textarea
          className="input"
          placeholder="اكتب ملاحظة مختصرة وواضحة…"
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          style={{ minHeight: 80, padding: "8px 10px", resize: "vertical" }}
        />
        <button className="q-btn primary" disabled={!txt.trim()}>
          إضافة
        </button>
      </form>

      {err && <div className="error">{err}</div>}

      <div className="q-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 12 }}>جارٍ التحميل…</div>
        ) : list.length === 0 ? (
          <div style={{ padding: 12, color: "var(--ink-600)" }}>
            لا توجد ملاحظات.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>الملاحظة</th>
                <th>التاريخ</th>
                <th>بواسطة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((n) => {
                const isEditing = editingId === n.id;

                return (
                  <tr key={n.id}>
                    <td style={{ whiteSpace: "pre-wrap" }}>
                      {isEditing ? (
                        <textarea
                          className="input"
                          value={editTxt}
                          onChange={(e) => setEditTxt(e.target.value)}
                          style={{
                            width: "100%",
                            minHeight: 70,
                            padding: "8px 10px",
                            resize: "vertical",
                          }}
                        />
                      ) : (
                        n.txt
                      )}
                    </td>

                    <td>{n.ts ? new Date(n.ts).toLocaleString() : "—"}</td>
                    <td>{n.by || "—"}</td>

                    <td style={{ textAlign: "left", whiteSpace: "nowrap" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="q-btn primary"
                            onClick={() => saveEdit(n.id)}
                            disabled={!String(editTxt || "").trim()}
                          >
                            حفظ
                          </button>
                          <button type="button" className="q-btn ghost" onClick={cancelEdit}>
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button type="button" className="q-btn ghost" onClick={() => startEdit(n)}>
                            تعديل
                          </button>
                          <button type="button" className="q-btn ghost" onClick={() => onDel(n.id)}>
                            حذف
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
