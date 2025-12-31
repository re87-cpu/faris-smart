// FILE: src/pages/staff/StaffDocuments.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  addCaseDoc,
  listCaseDocs,
  fetchMyCases,
  updateCaseDoc,
  deleteCaseDoc,
} from "../../mock/api.js";
import { getAuth } from "../../utils/auth.js";
import DownloadTemplateButton from "../../components/DownloadTemplateButton.jsx";

export default function StaffDocuments() {
  const me = getAuth()?.user || null;
  const [list, setList] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ caseId: "", name: "" });
  const [err, setErr] = useState("");

  async function load() {
    if (!me) return;
    setLoading(true);
    setErr("");
    try {
      const myCases = await fetchMyCases(me.id);
      const safeCases = myCases || [];
      setCases(safeCases);

      const docsArrays = await Promise.all(
        safeCases.map((c) => listCaseDocs(c.id))
      );

      const allDocs = [];
      safeCases.forEach((c, idx) => {
        (docsArrays[idx] || []).forEach((d) => {
          const displayName = d.title || d.name || d.fileName || "—";
          allDocs.push({
            id: d.id,
            caseId: c.id,
            caseTitle: c.title || "",
            name: displayName,
            fileUrl: d.fileUrl || null,
            by: d.uploadedBy || "—",
            ts: d.uploadedAt ? new Date(d.uploadedAt).getTime() : 0,
          });
        });
      });

      allDocs.sort((a, b) => b.ts - a.ts);
      setList(allDocs);
    } catch (e) {
      console.error(e);
      setErr(e.message || "تعذّر تحميل المستندات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let arr = list.slice();
    if (s) {
      arr = arr.filter((d) =>
        [d.name, d.caseId, d.caseTitle].some((v) =>
          String(v || "").toLowerCase().includes(s)
        )
      );
    }
    return arr;
  }, [list, q]);

  async function onAdd(e) {
    e.preventDefault();
    if (!form.caseId) return alert("اختاري قضية.");
    if (!form.name.trim()) return alert("اكتبي اسمًا للمستند.");

    try {
      setBusyId("add");
      await addCaseDoc(form.caseId, {
        name: form.name.trim(),
        fileUrl: null,
        by: me?.full_name || me?.name || "staff",
      });
      setForm({ caseId: "", name: "" });
      await load();
    } catch (e2) {
      alert(e2.message || "فشل إضافة المستند.");
    } finally {
      setBusyId(null);
    }
  }

  async function onEdit(d) {
    const nextName = window.prompt("عدّلي اسم المستند:", d.name || "");
    if (nextName == null) return;
    const name = String(nextName).trim();
    if (!name) return alert("الاسم لا يكون فاضي.");

    try {
      setBusyId(`${d.caseId}-${d.id}`);
      await updateCaseDoc(d.caseId, d.id, { name });
      await load();
    } catch (e) {
      alert(e.message || "فشل التعديل.");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(d) {
    const ok = window.confirm(`تأكيد حذف المستند: "${d.name}" ؟`);
    if (!ok) return;

    try {
      setBusyId(`${d.caseId}-${d.id}`);
      await deleteCaseDoc(d.caseId, d.id);
      await load();
    } catch (e) {
      alert(e.message || "فشل الحذف.");
    } finally {
      setBusyId(null);
    }
  }

  if (!me) {
    return (
      <div className="q-card" style={{ padding: 16 }}>
        الرجاء تسجيل الدخول.
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ display: "grid", gap: 12, padding: "16px 0" }}>
      {/* تنزيل قالب */}
      <section className="q-card" style={{ padding: 16 }}>
        <b>قوالب جاهزة</b>
        <div style={{ marginTop: 10 }}>
          <DownloadTemplateButton templateName="مذكرة_جلسة.docx" />
        </div>
      </section>

      {/* إضافة مستند (metadata فقط الآن) */}
      <section className="q-card" style={{ padding: 16 }}>
        <b>إضافة مستند (مؤقتًا بدون رفع ملف)</b>
        <form
          onSubmit={onAdd}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr auto",
            gap: 8,
            marginTop: 10,
          }}
        >
          <select
            className="input"
            value={form.caseId}
            onChange={(e) => setForm((s) => ({ ...s, caseId: e.target.value }))}
            required
          >
            <option value="">اختر القضية…</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.id} — {c.title}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="اسم/وصف المستند…"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            required
          />

          <button className="q-btn primary" disabled={busyId === "add"}>
            {busyId === "add" ? "جارٍ الإضافة…" : "إضافة"}
          </button>
        </form>
      </section>

      {/* قائمة المستندات */}
      <section className="q-card" style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <b>مستنداتي</b>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="بحث…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="q-btn ghost" type="button" onClick={load}>
              تحديث
            </button>
          </div>
        </div>

        {err && (
          <div className="error" style={{ marginTop: 10 }}>
            {err}
          </div>
        )}

        {loading ? (
          <div style={{ marginTop: 10 }}>جارٍ التحميل…</div>
        ) : filtered.length === 0 ? (
          <div style={{ marginTop: 10, color: "var(--ink-600)" }}>
            لا توجد مستندات.
          </div>
        ) : (
          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>القضية</th>
                  <th>المستند</th>
                  <th>التاريخ</th>
                  <th>بواسطة</th>
                  <th style={{ width: 170 }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const key = `${d.caseId}-${d.id}`;
                  const isBusy = busyId === key;
                  return (
                    <tr key={key}>
                      <td>
                        #{d.caseId} — {d.caseTitle || "—"}
                      </td>
                      <td>{d.name}</td>
                      <td>{d.ts ? new Date(d.ts).toLocaleString() : "—"}</td>
                      <td>{d.by || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="q-btn"
                            type="button"
                            onClick={() => onEdit(d)}
                            disabled={isBusy}
                          >
                            تعديل
                          </button>
                          <button
                            className="q-btn danger"
                            type="button"
                            onClick={() => onDelete(d)}
                            disabled={isBusy}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
