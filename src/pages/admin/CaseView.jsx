// FILE: src/pages/admin/CaseView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchCase, fetchEmployees, updateCaseMeta, assignCaseTo, closeCase, reopenCase, deleteCase,
  listCaseSessions, createSession, addSessionSummary, listCaseDocs, addCaseDoc, removeCaseDoc,
  uploadCaseDocFile, listCaseNotes, addCaseNote, removeCaseNote,
} from "../../mock/api.js";
import { toFileUrl } from "../../utils/files";
import { PageHeader, Section, FormGrid, Field, FormError, EmptyState, LoadingState, ConfirmButton } from "../../components/admin/ui.jsx";

const STATUS_LABELS = { open: "قيد الترافع", closed: "مغلقة", archived: "مؤرشفة" };
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
  const [form, setForm] = useState({ title: "", status: "open", next: "", assignedTo: "", court: "" });
  const [tabLoading, setTabLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [docs, setDocs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newSession, setNewSession] = useState({ session_at: "", court: "", room: "", notes: "" });
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
      if (c) setForm({ title: c.title || "", status: c.status || "open", next: normalizeForInput(c.next), assignedTo: c.assignedTo ?? c.assigned_to ?? "", court: c.court || "" });
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
      if (which === "sessions") setSessions((await listCaseSessions(id)) || []);
      else if (which === "documents") setDocs((await listCaseDocs(id)) || []);
      else if (which === "notes") setNotes((await listCaseNotes(id)) || []);
    } catch (ex) {
      console.error(ex);
      setErr(ex?.message || "تعذر التحميل");
    } finally {
      setTabLoading(false);
    }
  }

  useEffect(() => { loadMain(); /* eslint-disable-next-line */ }, [id]);
  useEffect(() => { if (!row) return; if (["sessions", "documents", "notes"].includes(activeTab)) loadTabs(activeTab); /* eslint-disable-next-line */ }, [activeTab, row?.id]);

  const assignedName = useMemo(() => {
    const assigned = row?.assignedTo ?? row?.assigned_to ?? null;
    if (!assigned) return "—";
    const u = emps.find((e) => String(e.id) === String(assigned));
    return u ? (u.full_name || u.name || u.email) : String(assigned);
  }, [row, emps]);

  const staffEmps = useMemo(() => (emps || []).filter((e) => {
    const role = String(e.role || "").toLowerCase();
    const active = (e.is_active ?? e.active ?? true) === true;
    return role === "staff" && active;
  }), [emps]);

  const lastUpdated = row ? row.updatedAt || row.updated_at || row.created_at || null : null;
  const caseNo = row?.case_number || row?.caseNumber || row?.no || row?.id || id;

  async function onSaveMeta(e) {
    e?.preventDefault?.();
    if (!row) return;
    setSavingMeta(true);
    setErr("");
    try {
      await updateCaseMeta(id, { title: form.title, status: form.status, court: form.court || null, next: form.next ? inputToIso(form.next) : null });
      await loadMain();
    } catch (ex) { console.error(ex); setErr(ex?.message || "تعذر الحفظ"); }
    finally { setSavingMeta(false); }
  }

  async function onAssign() {
    if (!row) return;
    const caseId = Number(row.id);
    const assigneeId = Number(form.assignedTo);
    if (!caseId || Number.isNaN(caseId)) return setErr("تعذر الإسناد: رقم القضية غير صحيح.");
    if (!assigneeId || Number.isNaN(assigneeId)) return setErr("تعذر الإسناد: اختاري موظفًا صحيحًا.");
    const chosen = (emps || []).find((e) => Number(e.id) === assigneeId);
    const chosenRole = String(chosen?.role || "").toLowerCase();
    if (chosenRole && chosenRole !== "staff") return setErr("لا يمكن إسناد القضية لمدير. اختاري موظفًا فقط.");
    setSavingAssign(true);
    setErr("");
    try { await assignCaseTo(caseId, assigneeId); await loadMain(); }
    catch (ex) { console.error(ex); setErr(ex?.message || "تعذر الإسناد"); }
    finally { setSavingAssign(false); }
  }

  async function onClose() {
    if (!row) return;
    setBusyAction(true); setErr("");
    try { await closeCase(id); await loadMain(); }
    catch (ex) { console.error(ex); setErr(ex?.message || "تعذر الإغلاق"); }
    finally { setBusyAction(false); }
  }

  async function onReopen() {
    if (!row) return;
    setBusyAction(true); setErr("");
    try { await reopenCase(id); await loadMain(); }
    catch (ex) { console.error(ex); setErr(ex?.message || "تعذر إعادة الفتح"); }
    finally { setBusyAction(false); }
  }

  async function onDelete() {
    if (!row) return;
    setBusyAction(true); setErr("");
    try { await deleteCase(id); window.location.href = "/admin/cases"; }
    catch (ex) { console.error(ex); setErr(ex?.message || "تعذّر حذف القضية."); }
    finally { setBusyAction(false); }
  }

  async function onCreateSession(e) {
    e.preventDefault();
    const at = String(newSession.session_at || "").trim();
    if (!at) return setErr("تاريخ/وقت الجلسة مطلوب.");
    setTabLoading(true); setErr("");
    try {
      await createSession(id, { session_at: inputToIsoLocal(at), court: newSession.court || null, room: newSession.room || null, notes: newSession.notes || null });
      setNewSession({ session_at: "", court: "", room: "", notes: "" });
      await loadTabs("sessions");
    } catch (ex) { console.error(ex); setErr(ex?.message || "تعذر إضافة الجلسة"); }
    finally { setTabLoading(false); }
  }

  async function onSaveSummary(sessionId) {
    const text = String(summaryDraft[sessionId] || "").trim();
    if (!text) return setErr("الملخص مطلوب.");
    setSavingSummaryId(sessionId); setErr("");
    try { await addSessionSummary(id, sessionId, { summary: text }); setSummaryDraft((s) => ({ ...s, [sessionId]: "" })); await loadTabs("sessions"); }
    catch (ex) { console.error(ex); setErr(ex?.message || "تعذر حفظ ملخص الجلسة"); }
    finally { setSavingSummaryId(null); }
  }

  async function onUploadDocFile(file) {
    if (!file) return;
    setUploadingDoc(true); setErr("");
    try { await uploadCaseDocFile(id, file, { name: file.name, kind: "case_doc" }); await loadTabs("documents"); }
    catch (ex) { console.error(ex); setErr(ex?.message || "تعذر رفع المستند"); }
    finally { setUploadingDoc(false); }
  }

  async function onAddDocLink(e) {
    e.preventDefault();
    const name = String(newDoc.name || "").trim();
    const fileUrl = String(newDoc.fileUrl || "").trim();
    if (!name) return setErr("اسم المستند مطلوب.");
    setTabLoading(true); setErr("");
    try { await addCaseDoc(id, { name, fileUrl: fileUrl || null }); setNewDoc({ name: "", fileUrl: "" }); await loadTabs("documents"); }
    catch (ex) { console.error(ex); setErr(ex?.message || "تعذر إضافة المستند"); }
    finally { setTabLoading(false); }
  }

  async function onRemoveDoc(docId) {
    setTabLoading(true); setErr("");
    try { await removeCaseDoc(id, docId); await loadTabs("documents"); }
    catch (ex) { console.error(ex); setErr(ex?.message || "تعذر حذف المستند"); }
    finally { setTabLoading(false); }
  }

  async function onAddNote(e) {
    e.preventDefault();
    const body = String(newNote || "").trim();
    if (!body) return setErr("نص الملاحظة مطلوب.");
    setSavingNote(true); setErr("");
    try { await addCaseNote(id, { body }); setNewNote(""); await loadTabs("notes"); }
    catch (ex) { console.error(ex); setErr(ex?.message || "تعذر إضافة الملاحظة"); }
    finally { setSavingNote(false); }
  }

  async function onRemoveNote(noteId) {
    setTabLoading(true); setErr("");
    try { await removeCaseNote(id, noteId); await loadTabs("notes"); }
    catch (ex) { console.error(ex); setErr(ex?.message || "تعذر حذف الملاحظة"); }
    finally { setTabLoading(false); }
  }

  return (
    <div dir="rtl" className="adm">
      {loading ? (
        <LoadingState text="جارٍ التحميل…" />
      ) : row ? (
        <>
          <PageHeader
            title={`مساحة عمل القضية #${caseNo}`}
            description={`المسؤول: ${assignedName} · الموعد القادم: ${row.next ? humanDT(row.next) : "—"} · آخر تحديث: ${lastUpdated ? humanDT(lastUpdated) : "—"}`}
            actions={
              <>
                <span className="tag tag-accent">{STATUS_LABELS[row.status] || row.status || "—"}</span>
                <Link className="btn btn-ghost" to="/admin/cases">جميع القضايا</Link>
                {row.status !== "closed" ? (
                  <ConfirmButton className="btn" style={{ background: "#b3261e", color: "#fff", border: "none" }} onConfirm={onClose} disabled={busyAction}>إغلاق</ConfirmButton>
                ) : (
                  <button className="btn btn-primary" onClick={onReopen} disabled={busyAction}>إعادة فتح</button>
                )}
                <ConfirmButton onConfirm={onDelete} disabled={busyAction}>حذف</ConfirmButton>
              </>
            }
          />

          <div className="adm-tabs">
            {TABS.map((t) => (
              <button key={t.id} type="button" className={`adm-tab${activeTab === t.id ? " is-active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
            ))}
            <div style={{ flex: 1 }} />
            <button className="btn btn-ghost" type="button" style={{ padding: "4px 10px", fontSize: 12.5 }} onClick={() => (activeTab === "overview" ? loadMain() : loadTabs(activeTab))} disabled={tabLoading || loading}>
              {tabLoading ? "جارٍ التحديث..." : "تحديث"}
            </button>
          </div>

          <FormError>{err}</FormError>

          {activeTab === "overview" && (
            <Section title="تعديل بيانات القضية" bordered>
              <form onSubmit={onSaveMeta} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <FormGrid cols={2}>
                  <Field label="عنوان القضية">
                    <input className="input" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
                  </Field>
                  <Field label="المحكمة">
                    <input className="input" value={form.court} onChange={(e) => setForm((s) => ({ ...s, court: e.target.value }))} />
                  </Field>
                  <Field label="الحالة">
                    <select className="input" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                      {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </Field>
                  <Field label="الموعد القادم">
                    <input className="input" type="datetime-local" value={form.next} onChange={(e) => setForm((s) => ({ ...s, next: e.target.value }))} />
                  </Field>
                </FormGrid>
                <FormGrid cols={2}>
                  <Field label="إسناد إلى">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                      <select className="input" value={form.assignedTo} onChange={(e) => setForm((s) => ({ ...s, assignedTo: e.target.value }))}>
                        <option value="">— بدون —</option>
                        {staffEmps.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                      </select>
                      <button type="button" className="btn btn-ghost" onClick={onAssign} disabled={savingAssign || !form.assignedTo}>{savingAssign ? "يحفظ..." : "حفظ الإسناد"}</button>
                    </div>
                  </Field>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                    <button className="btn btn-primary" disabled={savingMeta}>{savingMeta ? "يحفظ…" : "حفظ التعديلات"}</button>
                  </div>
                </FormGrid>
              </form>
            </Section>
          )}

          {activeTab === "sessions" && (
            <Section title="الجلسات" bordered>
              <form onSubmit={onCreateSession} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 2fr auto", gap: 8 }}>
                <input className="input" type="datetime-local" value={newSession.session_at} onChange={(e) => setNewSession((s) => ({ ...s, session_at: e.target.value }))} />
                <input className="input" placeholder="المحكمة" value={newSession.court} onChange={(e) => setNewSession((s) => ({ ...s, court: e.target.value }))} />
                <input className="input" placeholder="القاعة/الغرفة" value={newSession.room} onChange={(e) => setNewSession((s) => ({ ...s, room: e.target.value }))} />
                <input className="input" placeholder="ملاحظات للجلسة (اختياري)" value={newSession.notes} onChange={(e) => setNewSession((s) => ({ ...s, notes: e.target.value }))} />
                <button className="btn btn-primary" type="submit" disabled={tabLoading}>{tabLoading ? "..." : "إضافة"}</button>
              </form>

              {tabLoading ? <LoadingState /> : sessions.length === 0 ? <EmptyState text="لا توجد جلسات مسجلة." /> : (
                <div>
                  {sessions.map((s) => {
                    const sid = s.id;
                    const when = s.at || s.sessionAt || s.session_at || "";
                    return (
                      <div key={sid} className="adm-item-row">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 700 }}>جلسة #{sid}</div>
                          <div style={{ color: "var(--color-neutral-600)" }}>{when ? humanDT(when) : "—"}</div>
                        </div>
                        <div style={{ marginTop: 6, color: "var(--color-neutral-700)", display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13.5 }}>
                          <div>المحكمة: <b>{s.court || "—"}</b></div>
                          <div>القاعة: <b>{s.room || "—"}</b></div>
                        </div>
                        {s.notes && <div style={{ marginTop: 6, color: "var(--color-neutral-700)", fontSize: 13.5 }}><b>ملاحظات:</b> {s.notes}</div>}
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>ملخص الجلسة</div>
                          {s.summary ? (
                            <div style={{ fontSize: 13.5 }}>
                              <div>{s.summary}</div>
                              <div style={{ color: "var(--color-neutral-600)", fontSize: 12, marginTop: 4 }}>{(s.summaryAt || s.summary_at) ? `آخر تحديث: ${humanDT(s.summaryAt || s.summary_at)}` : ""}</div>
                            </div>
                          ) : <div style={{ color: "var(--color-neutral-600)", fontSize: 13 }}>لا يوجد ملخص بعد.</div>}
                          <textarea className="input" style={{ marginTop: 8, minHeight: 80 }} placeholder="اكتب/حدّث ملخص الجلسة هنا..." value={summaryDraft[sid] ?? ""} onChange={(e) => setSummaryDraft((st) => ({ ...st, [sid]: e.target.value }))} />
                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                            <button type="button" className="btn btn-primary" onClick={() => onSaveSummary(sid)} disabled={savingSummaryId === sid}>{savingSummaryId === sid ? "يحفظ..." : "حفظ الملخص"}</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          )}

          {activeTab === "documents" && (
            <Section
              title="المستندات" bordered
              actions={
                <label className="btn btn-ghost" style={{ cursor: uploadingDoc ? "not-allowed" : "pointer", opacity: uploadingDoc ? 0.7 : 1 }}>
                  {uploadingDoc ? "جاري الرفع..." : "رفع ملف"}
                  <input type="file" style={{ display: "none" }} disabled={uploadingDoc} onChange={(e) => onUploadDocFile(e.target.files?.[0])} />
                </label>
              }
            >
              <form onSubmit={onAddDocLink} style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr auto", gap: 8 }}>
                <input className="input" placeholder="اسم المستند" value={newDoc.name} onChange={(e) => setNewDoc((s) => ({ ...s, name: e.target.value }))} />
                <input className="input" placeholder="رابط الملف (اختياري)" value={newDoc.fileUrl} onChange={(e) => setNewDoc((s) => ({ ...s, fileUrl: e.target.value }))} />
                <button className="btn btn-primary" type="submit" disabled={tabLoading}>إضافة</button>
              </form>

              {tabLoading ? <LoadingState /> : docs.length === 0 ? <EmptyState text="لا توجد مستندات." /> : (
                <div>
                  {docs.map((d) => {
                    const did = d.id ?? d.docId ?? d.doc_id ?? d._id;
                    const name = d.name || d.title || d.fileName || "مستند";
                    const url = d.fileUrl || d.file_url || d.url || "";
                    const createdAt = d.createdAt || d.created_at || d.at || d.uploadedAt || null;
                    return (
                      <div key={String(did || name)} className="adm-item-row">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 700 }}>{name}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {url && <a className="btn btn-ghost" href={toFileUrl(url)} target="_blank" rel="noreferrer">فتح</a>}
                            {did && <ConfirmButton onConfirm={() => onRemoveDoc(did)} disabled={tabLoading}>حذف</ConfirmButton>}
                          </div>
                        </div>
                        {createdAt && <div style={{ color: "var(--color-neutral-600)", fontSize: 12, marginTop: 4 }}>أضيف: {humanDT(createdAt)}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          )}

          {activeTab === "notes" && (
            <Section title="الملاحظات" bordered>
              <form onSubmit={onAddNote} style={{ display: "grid", gap: 10 }}>
                <textarea className="input" style={{ minHeight: 100 }} placeholder="اكتب الملاحظة..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn btn-primary" type="submit" disabled={savingNote}>{savingNote ? "يحفظ..." : "حفظ الملاحظة"}</button>
                </div>
              </form>

              {tabLoading ? <LoadingState /> : notes.length === 0 ? <EmptyState text="لا توجد ملاحظات بعد." /> : (
                <div>
                  {notes.map((n) => {
                    const nid = n.id ?? n.noteId ?? n.note_id ?? n._id;
                    const body = n.body ?? n.text ?? n.note ?? "";
                    const createdAt = n.createdAt || n.created_at || n.at || null;
                    return (
                      <div key={String(nid || body.slice(0, 12))} className="adm-item-row">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{body}</div>
                          {nid && <ConfirmButton onConfirm={() => onRemoveNote(nid)} disabled={tabLoading}>حذف</ConfirmButton>}
                        </div>
                        {createdAt && <div style={{ color: "var(--color-neutral-600)", fontSize: 12, marginTop: 4 }}>{humanDT(createdAt)}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          )}
        </>
      ) : (
        <PageHeader title="القضية غير موجودة" />
      )}
    </div>
  );
}

function normalizeForInput(dt) { if (!dt) return ""; const s = String(dt); return s.includes("T") ? s.slice(0, 16) : s.replace(" ", "T").slice(0, 16); }
function inputToIsoLocal(v) { if (!v) return ""; const d = new Date(v); return isNaN(d) ? "" : d.toISOString(); }
function inputToIso(v) { if (!v) return ""; const d = new Date(v); return isNaN(d) ? "" : d.toISOString(); }
function humanDT(s) { try { return new Date(s).toLocaleString("ar-SA"); } catch { return String(s); } }
