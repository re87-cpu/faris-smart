// FILE: src/components/StaffSecretarySearch.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function normalize(v = "") {
  return String(v ?? "").trim().toLowerCase();
}

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("ar-SA");
}

/**
 * سكرتير الموظف:
 * - لا يستدعي API إضافي (يستخدم myCases المحمّلة من /my/cases)
 * - بحث شامل داخل قضايا الموظف فقط حسب الصلاحيات
 */
export default function StaffSecretarySearch({ myCases = [], loading = false }) {
  const [mode, setMode] = useState("all"); // all | number | name
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    const query = normalize(q);
    if (!query) return [];

    const isDigits = /^[0-9]+$/.test(query);

    return (Array.isArray(myCases) ? myCases : []).filter((c) => {
      const num = normalize(c.case_number ?? c.number ?? c.no ?? "");
      const title = normalize(c.title ?? "");
      const court = normalize(c.court ?? "");
      const hay = `${num} ${title} ${court}`;

      if (mode === "number") return num.includes(query);
      if (mode === "name") return `${title} ${court}`.includes(query);

      // all
      if (isDigits) return num.includes(query) || hay.includes(query);
      return hay.includes(query);
    });
  }, [q, mode, myCases]);

  function onSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="q-card" dir="rtl" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, color: "var(--accent-dark)" }}>سكرتير الموظف</div>
          <div style={{ fontSize: 12, color: "var(--ink-600)", marginTop: 4 }}>
            بحث سريع داخل <b>قضاياك المسندة</b> فقط.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className={`q-btn q-outline ${mode === "all" ? "active" : ""}`}
            onClick={() => setMode("all")}
            style={{ padding: "8px 10px" }}
          >
            شامل
          </button>
          <button
            type="button"
            className={`q-btn q-outline ${mode === "number" ? "active" : ""}`}
            onClick={() => setMode("number")}
            style={{ padding: "8px 10px" }}
          >
            رقم
          </button>
          <button
            type="button"
            className={`q-btn q-outline ${mode === "name" ? "active" : ""}`}
            onClick={() => setMode("name")}
            style={{ padding: "8px 10px" }}
          >
            عنوان/محكمة
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginTop: 10 }}>
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="اكتب رقم القضية أو كلمة من العنوان/المحكمة..."
        />
        <button className="q-btn primary" type="submit" disabled={loading}>
          {loading ? "..." : "بحث"}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        {loading ? (
          <div style={{ color: "var(--ink-600)" }}>جارٍ تحميل قضاياك…</div>
        ) : (Array.isArray(myCases) ? myCases.length : 0) === 0 ? (
          <div style={{ color: "var(--ink-600)" }}>لا توجد قضايا مسندة لك حالياً.</div>
        ) : !submitted ? (
          <div style={{ color: "var(--ink-600)" }}>اكتب كلمة بحث ثم اضغط “بحث”.</div>
        ) : !q.trim() ? (
          <div style={{ color: "var(--ink-600)" }}>فضلاً اكتب رقم قضية أو عنوان.</div>
        ) : results.length === 0 ? (
          <div style={{ color: "var(--ink-600)" }}>لا توجد نتائج مطابقة.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {results.slice(0, 10).map((c) => {
              const status = c.status || "—";
              const assignedAt = c.assignedAt || c.assigned_at || null;
              const createdAt = c.created_at || c.createdAt || null;

              return (
                <div key={c.id} className="q-card" style={{ padding: 12, boxShadow: "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900 }}>قضية: {c.case_number || `#${c.id}`}</div>
                    <span className="badge">{status}</span>
                  </div>

                  <div style={{ marginTop: 6, color: "var(--ink-900)", fontWeight: 800 }}>
                    {c.title || "—"}
                  </div>

                  {c.court ? (
                    <div style={{ marginTop: 4, color: "var(--ink-600)" }}>{c.court}</div>
                  ) : null}

                  <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--ink-600)" }}>
                      {assignedAt ? `تاريخ الإسناد: ${fmtDate(assignedAt)}` : createdAt ? `أضيفت: ${fmtDate(createdAt)}` : ""}
                    </div>
                    <Link className="q-btn q-outline" to={`/staff/cases/${c.id}`}>
                      فتح
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
