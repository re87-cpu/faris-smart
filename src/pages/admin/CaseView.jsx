// FILE: src/pages/admin/CaseView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchCase,
  fetchEmployees,
  updateCaseMeta,
  assignCaseTo,
  closeCase,
  reopenCase,
  deleteCase,
  listCaseSessions,
  createSession,
  addSessionSummary,
  listCaseDocs,
  addCaseDoc,
  removeCaseDoc,
  uploadCaseDocFile,
  listCaseNotes,
  addCaseNote,
  removeCaseNote,
} from "../../mock/api.js";

const STATUS_LABELS = {
  open: "قيد الترافع",
  closed: "مغلقة",
  archived: "مؤرشفة",
};

const STATUS_OPTIONS = [
  { value: "open", label: "قيد الترافع" },
  { value: "closed", label: "مغلقة" },
  { value: "archived", label: "مؤرشفة" },
];

const TABS = [
  { id: "overview", label: "بيانات القضية" },
  { id: "sessions", label: "الجلسات" },
  { id: "documents", label: "المستندات" },
  { id: "notes", label: "الملاحظات" },
];

export default function CaseView() {
  const { id } = useParams();

  const [row, setRow] = useState(null);
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [savingMeta, setSavingMeta] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);
  const [busyAction, setBusyAction] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  const [form, setForm] = useState({
    title: "",
    status: "open",
    next: "",
    assignedTo: "",
    court: "",
  });

  const [tabLoading, setTabLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [docs, setDocs] = useState([]);
  const [notes, setNotes] = useState([]);

  const [newSession, setNewSession] = useState({
    session_at: "",
    court: "",
    room: "",
    notes: "",
  });

  const [summaryDraft, setSummaryDraft] = useState({});
  const [savingSummaryId, setSavingSummaryId] = useState(null);

  const [newDoc, setNewDoc] = useState({ name: "", fileUrl: "" });
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  async function loadMain() {
    setLoading(true);
    setErr("");
    try {
      const [c, es] = await Promise.all([fetchCase(id), fetchEmployees()]);
      setRow(c);
      setEmps(es || []);
      if (c) {
        setForm({
          title: c.title || "",
          status: c.status || "open",
          next: normalizeForInput(c.next),
          assignedTo: c.assignedTo ?? c.assigned_to ?? "",
          court: c.court || "",
        });
      }
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر التحميل");
    } finally {
      setLoading(false);
    }
  }

  async function loadTabs(which = activeTab) {
    if (!id) return;
    setTabLoading(true);
    setErr("");
    try {
      if (which === "sessions") {
        const rows = await listCaseSessions(id);
        setSessions(Array.isArray(rows) ? rows : []);
      } else if (which === "documents") {
        const rows = await listCaseDocs(id);
        setDocs(Array.isArray(rows) ? rows : []);
      } else if (which === "notes") {
        const rows = await listCaseNotes(id);
        setNotes(Array.isArray(rows) ? rows : []);
      }
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر التحميل");
    } finally {
      setTabLoading(false);
    }
  }

  useEffect(() => {
    loadMain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!row) return;
    if (activeTab === "sessions" || activeTab === "documents" || activeTab === "notes") {
      loadTabs(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, row?.id]);

  // ✅ اسم الموظف المكلَّف
  const assignedName = useMemo(() => {
    const assigned = row?.assignedTo ?? row?.assigned_to ?? null;
    if (!assigned) return "—";
    const u = emps.find((e) => String(e.id) === String(assigned));

  const staffEmps = useMemo(() => {
    return (emps || []).filter((e) => {
      const role = String(e.role || "").toLowerCase();
      const active = (e.is_active ?? e.active ?? true) === true;
      return role === "staff" && active;
    });
  }, [emps]);
    return u ? (u.full_name || u.name || u.email) : String(assigned);
  }, [row, emps]);

  const lastUpdated = row ? row.updatedAt || row.updated_at || row.created_at || null : null;
  const caseNo = row?.case_number || row?.caseNumber || row?.no || row?.id || id;

  async function onSaveMeta(e) {
    e?.preventDefault?.();
    if (!row) return;

    setSavingMeta(true);
    setErr("");
    try {
      await updateCaseMeta(id, {
        title: form.title,
        status: form.status,
        court: form.court || null,
        next: form.next ? inputToIso(form.next) : null,
      });
      await loadMain();
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر الحفظ");
    } finally {
      setSavingMeta(false);
    }
  }

  async function onAssign() {
    if (!row) return;

    const caseId = Number(row.id);
    const assigneeId = Number(form.assignedTo);

    if (!caseId || Number.isNaN(caseId)) {
      return setErr("تعذر الإسناد: رقم القضية غير صحيح.");
    }
    if (!assigneeId || Number.isNaN(assigneeId)) {
      return setErr("تعذر الإسناد: اختاري موظفًا صحيحًا.");
    }

    // ✅ منع إسناد القضية لغير الموظفين (حتى لو صار خطأ بالواجهة)
    const chosen = (emps || []).find((e) => Number(e.id) === assigneeId);
    const chosenRole = String(chosen?.role || "").toLowerCase();
    if (chosenRole && chosenRole !== "staff") {
      return setErr("لا يمكن إسناد القضية لمدير. اختاري موظفًا فقط.");
    }

    setSavingAssign(true);
    setErr("");
    try {
      await assignCaseTo(caseId, assigneeId);
      await loadMain();
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر الإسناد");
    } finally {
      setSavingAssign(false);
    }
  }

  async function onClose() {
    if (!row) return;
    if (!window.confirm("تأكيد إغلاق القضية؟")) return;

    setBusyAction(true);
    setErr("");
    try {
      await closeCase(id);
      await loadMain();
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر الإغلاق");
    } finally {
      setBusyAction(false);
    }
  }

  async function onReopen() {
    if (!row) return;

    setBusyAction(true);
    setErr("");
    try {
      await reopenCase(id);
      await loadMain();
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر إعادة الفتح");
    } finally {
      setBusyAction(false);
    }
  }

  async function onDelete() {
    if (!row) return;
    if (!window.confirm(`سيتم حذف القضية رقم ${caseNo} نهائيًا.\nهل أنتِ متأكدة؟`)) return;

    setBusyAction(true);
    setErr("");
    try {
      await deleteCase(id);
      window.location.href = "/admin/cases";
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذّر حذف القضية.");
    } finally {
      setBusyAction(false);
    }
  }

  async function onCreateSession(e) {
    e.preventDefault();
    const at = String(newSession.session_at || "").trim();
    if (!at) return setErr("تاريخ/وقت الجلسة مطلوب.");

    setTabLoading(true);
    setErr("");
    try {
      await createSession(id, {
        session_at: inputToIsoLocal(at),
        court: newSession.court || null,
        room: newSession.room || null,
        notes: newSession.notes || null,
      });
      setNewSession({ session_at: "", court: "", room: "", notes: "" });
      await loadTabs("sessions");
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر إضافة الجلسة");
    } finally {
      setTabLoading(false);
    }
  }

  async function onSaveSummary(sessionId) {
    const text = String(summaryDraft[sessionId] || "").trim();
    if (!text) return setErr("الملخص مطلوب.");

    setSavingSummaryId(sessionId);
    setErr("");
    try {
      await addSessionSummary(id, sessionId, { summary: text });
      setSummaryDraft((s) => ({ ...s, [sessionId]: "" }));
      await loadTabs("sessions");
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر حفظ ملخص الجلسة");
    } finally {
      setSavingSummaryId(null);
    }
  }

  async function onUploadDocFile(file) {
    if (!file) return;
    setUploadingDoc(true);
    setErr("");
    try {
      await uploadCaseDocFile(id, file, { name: file.name, kind: "case_doc" });
      await loadTabs("documents");
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر رفع المستند");
    } finally {
      setUploadingDoc(false);
    }
  }

  async function onAddDocLink(e) {
    e.preventDefault();
    const name = String(newDoc.name || "").trim();
    const fileUrl = String(newDoc.fileUrl || "").trim();
    if (!name) return setErr("اسم المستند مطلوب.");

    setTabLoading(true);
    setErr("");
    try {
      await addCaseDoc(id, { name, fileUrl: fileUrl || null });
      setNewDoc({ name: "", fileUrl: "" });
      await loadTabs("documents");
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر إضافة المستند");
    } finally {
      setTabLoading(false);
    }
  }

  async function onRemoveDoc(docId) {
    if (!window.confirm("حذف المستند؟")) return;
    setTabLoading(true);
    setErr("");
    try {
      await removeCaseDoc(id, docId);
      await loadTabs("documents");
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر حذف المستند");
    } finally {
      setTabLoading(false);
    }
  }

  async function onAddNote(e) {
    e.preventDefault();
    const body = String(newNote || "").trim();
    if (!body) return setErr("نص الملاحظة مطلوب.");

    setSavingNote(true);
    setErr("");
    try {
      await addCaseNote(id, { body });
      setNewNote("");
      await loadTabs("notes");
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر إضافة الملاحظة");
    } finally {
      setSavingNote(false);
    }
  }

  async function onRemoveNote(noteId) {
    if (!window.confirm("حذف الملاحظة؟")) return;
    setTabLoading(true);
    setErr("");
    try {
      await removeCaseNote(id, noteId);
      await loadTabs("notes");
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر حذف الملاحظة");
    } finally {
      setTabLoading(false);
    }
  }

  return (
    <div dir="rtl" style={{ display: "grid", gap: 12 }}>
      <section className="q-card" style={{ padding: 16 }}>
        {loading ? (
          <b>جارٍ التحميل…</b>
        ) : row ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>قضية #{caseNo}</div>
                <div style={{ color: "var(--ink-600)" }}>
                  الحالة:
                  <span className="badge" style={{ marginInlineStart: 6 }}>
                    {STATUS_LABELS[row.status] || row.status || "—"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Link className="q-btn ghost" to="/admin/cases">جميع القضايا</Link>
                <button className="q-btn ghost" onClick={onDelete} disabled={busyAction}>حذف</button>
                {row.status !== "closed" ? (
                  <button className="q-btn rose" onClick={onClose} disabled={busyAction}>إغلاق</button>
                ) : (
                  <button className="q-btn primary" onClick={onReopen} disabled={busyAction}>إعادة فتح</button>
                )}
              </div>
            </div>

            <div style={{ marginTop: 8, color: "var(--ink-600)", display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div>المسؤول: <b>{assignedName}</b></div>
              <div>الموعد القادم: <b>{row.next ? humanDT(row.next) : "—"}</b></div>
              <div>آخر تحديث: <b>{lastUpdated ? humanDT(lastUpdated) : "—"}</b></div>
            </div>
          </>
        ) : (
          <b>القضية غير موجودة.</b>
        )}
      </section>

      {!loading && row && (
        <section className="q-card" style={{ padding: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="q-btn"
                onClick={() => setActiveTab(t.id)}
                style={{
                  borderRadius: 12,
                  padding: "10px 14px",
                  border: "1px solid var(--border)",
                  background: activeTab === t.id ? "var(--accent)" : "#fff",
                  color: activeTab === t.id ? "#fff" : "var(--accent-dark)",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}

            <div style={{ flex: 1 }} />

            <button
              className="q-btn q-outline"
              type="button"
              onClick={() => {
                if (activeTab === "overview") loadMain();
                else loadTabs(activeTab);
              }}
              disabled={tabLoading || loading}
            >
              {tabLoading ? "جارٍ التحديث..." : "تحديث"}
            </button>
          </div>
        </section>
      )}

      {err && (
        <div className="q-card" style={{ padding: 12, borderColor: "#fecaca", background: "#fff1f2" }}>
          <b style={{ color: "#9f1239" }}>تنبيه:</b>{" "}
          <span style={{ color: "#9f1239" }}>{err}</span>
        </div>
      )}

      {!loading && row && activeTab === "overview" && (
        <section className="q-card" style={{ padding: 16 }}>
          <b>تعديل بيانات القضية</b>

          <form onSubmit={onSaveMeta} style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 8 }}>
              <input className="input" placeholder="عنوان القضية" value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />

              <input className="input" placeholder="المحكمة" value={form.court}
                onChange={(e) => setForm((s) => ({ ...s, court: e.target.value }))} />

              <select className="input" value={form.status}
                onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              <input className="input" type="datetime-local" value={form.next}
                onChange={(e) => setForm((s) => ({ ...s, next: e.target.value }))} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, color: "var(--ink-700)" }}>
                  إسناد إلى
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                  <select className="input" value={form.assignedTo}
                    onChange={(e) => setForm((s) => ({ ...s, assignedTo: e.target.value }))}>
                    <option value="">— بدون —</option>
                    {staffEmps.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name || u.email}
                      </option>
                    ))}
                  </select>

                  <button type="button" className="q-btn ghost" onClick={onAssign}
                    disabled={savingAssign || !form.assignedTo}>
                    {savingAssign ? "يحفظ..." : "حفظ الإسناد"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end", gap: 8 }}>
                <button className="q-btn primary" disabled={savingMeta}>
                  {savingMeta ? "يحفظ…" : "حفظ التعديلات"}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {!loading && row && activeTab === "sessions" && (
        <section className="q-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <b>الجلسات</b>
          </div>

          <form onSubmit={onCreateSession} style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 2fr auto", gap: 8 }}>
              <input className="input" type="datetime-local" value={newSession.session_at}
                onChange={(e) => setNewSession((s) => ({ ...s, session_at: e.target.value }))} />
              <input className="input" placeholder="المحكمة" value={newSession.court}
                onChange={(e) => setNewSession((s) => ({ ...s, court: e.target.value }))} />
              <input className="input" placeholder="القاعة/الغرفة" value={newSession.room}
                onChange={(e) => setNewSession((s) => ({ ...s, room: e.target.value }))} />
              <input className="input" placeholder="ملاحظات للجلسة (اختياري)" value={newSession.notes}
                onChange={(e) => setNewSession((s) => ({ ...s, notes: e.target.value }))} />
              <button className="q-btn primary" type="submit" disabled={tabLoading}>
                {tabLoading ? "..." : "إضافة"}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 14 }}>
            {tabLoading ? (
              <div style={{ color: "var(--ink-600)" }}>جارٍ التحميل…</div>
            ) : sessions.length === 0 ? (
              <div style={{ color: "var(--ink-600)" }}>لا توجد جلسات مسجلة.</div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {sessions.map((s) => {
                  const sid = s.id;
                  const when = s.at || s.sessionAt || s.session_at || "";
                  return (
                    <div key={sid} className="q-card" style={{ padding: 12, boxShadow: "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 900, color: "var(--accent-dark)" }}>جلسة #{sid}</div>
                        <div style={{ color: "var(--ink-600)" }}>{when ? humanDT(when) : "—"}</div>
                      </div>

                      <div style={{ marginTop: 8, color: "var(--ink-700)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <div>المحكمة: <b>{s.court || "—"}</b></div>
                        <div>القاعة: <b>{s.room || "—"}</b></div>
                      </div>

                      {s.notes ? (
                        <div style={{ marginTop: 8, color: "var(--ink-700)" }}>
                          <b>ملاحظات:</b> {s.notes}
                        </div>
                      ) : null}

                      <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>ملخص الجلسة</div>

                        {s.summary ? (
                          <div className="q-card" style={{ padding: 10, boxShadow: "none", background: "#f8fafc" }}>
                            <div style={{ color: "var(--ink-900)", fontWeight: 800 }}>{s.summary}</div>
                            <div style={{ color: "var(--ink-600)", fontSize: 12, marginTop: 6 }}>
                              {s.summaryAt || s.summary_at ? `آخر تحديث: ${humanDT(s.summaryAt || s.summary_at)}` : ""}
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: "var(--ink-600)" }}>لا يوجد ملخص بعد.</div>
                        )}

                        <textarea
                          className="input"
                          style={{ marginTop: 10, minHeight: 90, resize: "vertical", paddingTop: 12 }}
                          placeholder="اكتب/حدّث ملخص الجلسة هنا..."
                          value={summaryDraft[sid] ?? ""}
                          onChange={(e) => setSummaryDraft((st) => ({ ...st, [sid]: e.target.value }))}
                        />

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                          <button
                            type="button"
                            className="q-btn primary"
                            onClick={() => onSaveSummary(sid)}
                            disabled={savingSummaryId === sid}
                          >
                            {savingSummaryId === sid ? "يحفظ..." : "حفظ الملخص"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {!loading && row && activeTab === "documents" && (
        <section className="q-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <b>المستندات</b>

            <label className="q-btn q-outline" style={{ cursor: uploadingDoc ? "not-allowed" : "pointer", opacity: uploadingDoc ? 0.7 : 1 }}>
              {uploadingDoc ? "جاري الرفع..." : "رفع ملف"}
              <input
                type="file"
                style={{ display: "none" }}
                disabled={uploadingDoc}
                onChange={(e) => onUploadDocFile(e.target.files?.[0])}
              />
            </label>
          </div>

          <form onSubmit={onAddDocLink} style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr auto", gap: 8 }}>
              <input className="input" placeholder="اسم المستند" value={newDoc.name}
                onChange={(e) => setNewDoc((s) => ({ ...s, name: e.target.value }))} />
              <input className="input" placeholder="رابط الملف (اختياري)" value={newDoc.fileUrl}
                onChange={(e) => setNewDoc((s) => ({ ...s, fileUrl: e.target.value }))} />
              <button className="q-btn primary" type="submit" disabled={tabLoading}>إضافة</button>
            </div>
          </form>

          <div style={{ marginTop: 14 }}>
            {tabLoading ? (
              <div style={{ color: "var(--ink-600)" }}>جارٍ التحميل…</div>
            ) : docs.length === 0 ? (
              <div style={{ color: "var(--ink-600)" }}>لا توجد مستندات.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {docs.map((d) => {
                  const did = d.id ?? d.docId ?? d.doc_id ?? d._id;
                  const name = d.name || d.title || d.fileName || "مستند";
                  const url = d.fileUrl || d.file_url || d.url || "";
                  const createdAt = d.createdAt || d.created_at || d.at || d.uploadedAt || null;

                  return (
                    <div key={String(did || name)} className="q-card" style={{ padding: 12, boxShadow: "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 900, color: "var(--accent-dark)" }}>{name}</div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {url ? (
                            <a className="q-btn q-outline" href={url} target="_blank" rel="noreferrer">فتح</a>
                          ) : null}
                          {did ? (
                            <button className="q-btn ghost" type="button" onClick={() => onRemoveDoc(did)} disabled={tabLoading}>حذف</button>
                          ) : null}
                        </div>
                      </div>

                      {createdAt ? (
                        <div style={{ color: "var(--ink-600)", fontSize: 12, marginTop: 6 }}>
                          أضيف: {humanDT(createdAt)}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {!loading && row && activeTab === "notes" && (
        <section className="q-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <b>الملاحظات</b>
          </div>

          <form onSubmit={onAddNote} style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <textarea className="input" style={{ minHeight: 110, resize: "vertical", paddingTop: 12 }}
              placeholder="اكتب الملاحظة..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="q-btn primary" type="submit" disabled={savingNote}>
                {savingNote ? "يحفظ..." : "حفظ الملاحظة"}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 14 }}>
            {tabLoading ? (
              <div style={{ color: "var(--ink-600)" }}>جارٍ التحميل…</div>
            ) : notes.length === 0 ? (
              <div style={{ color: "var(--ink-600)" }}>لا توجد ملاحظات بعد.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {notes.map((n) => {
                  const nid = n.id ?? n.noteId ?? n.note_id ?? n._id;
                  const body = n.body ?? n.text ?? n.note ?? "";
                  const createdAt = n.createdAt || n.created_at || n.at || null;

                  return (
                    <div key={String(nid || body.slice(0, 12))} className="q-card" style={{ padding: 12, boxShadow: "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 800, color: "var(--ink-900)" }}>{body}</div>
                        {nid ? (
                          <button className="q-btn ghost" type="button" onClick={() => onRemoveNote(nid)} disabled={tabLoading}>حذف</button>
                        ) : null}
                      </div>
                      {createdAt ? (
                        <div style={{ color: "var(--ink-600)", fontSize: 12, marginTop: 6 }}>
                          {humanDT(createdAt)}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* Helpers */
function normalizeForInput(dt) {
  if (!dt) return "";
  const s = String(dt);
  if (s.includes("T")) return s.slice(0, 16);
  return s.replace(" ", "T").slice(0, 16);
}

function inputToIsoLocal(v) {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d) ? "" : d.toISOString();
}

function inputToIso(v) {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d) ? "" : d.toISOString();
}

function humanDT(s) {
  try {
    return new Date(s).toLocaleString("ar-SA");
  } catch {
    return String(s);
  }
}
