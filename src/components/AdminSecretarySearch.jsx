// FILE: src/components/AdminSecretarySearch.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function normalize(v = "") {
  return String(v ?? "").trim().toLowerCase();
}

// يحاول يلقط التوكن مهما كان اسم المفتاح
function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("faris_token") ||
    ""
  );
}

function apiBase() {
  // لو عندك VITE_API_URL خليه مثل: http://localhost:3003
  return (import.meta.env?.VITE_API_URL || "http://localhost:3003").replace(/\/$/, "");
}

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy}`;
}

export default function AdminSecretarySearch({ title = "سكرتير القضايا (للإدارة)" }) {
  const [mode, setMode] = useState("all"); // all | number | name
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cases, setCases] = useState([]);

  // ✅ تحميل القضايا مرة واحدة من السيرفر
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");

      try {
        const token = getToken();
        if (!token) {
          setCases([]);
          setErr("لا يوجد توكن دخول. سجّل دخولك كمدير أولاً.");
          return;
        }

        const res = await fetch(`${apiBase()}/cases`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setCases([]);
          setErr(data?.error || "فشل تحميل القضايا من السيرفر.");
          return;
        }

        // API يرجّع حقول: id, case_number, title, status, court, next, created_at, updated_at, assigned_to
        const list = Array.isArray(data) ? data : [];
        setCases(list);
      } catch (e) {
        setCases([]);
        setErr(e?.message || "خطأ غير معروف أثناء الاتصال بالسيرفر.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const results = useMemo(() => {
    const query = normalize(q);
    if (!query) return [];

    const isDigits = /^[0-9]+$/.test(query);

    return cases.filter((c) => {
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
  }, [q, mode, cases]);

  function onSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="sec-card" dir="rtl">
      <div className="sec-head">
        <div>
          <div className="sec-title">{title}</div>
          <div className="sec-sub">
            ابحث برقم القضية أو عنوانها/المحكمة، وستظهر النتائج مباشرة من قاعدة البيانات.
          </div>
        </div>

        <div className="sec-modes" role="tablist" aria-label="أنماط البحث">
          <button
            type="button"
            className={`sec-chip ${mode === "all" ? "is-active" : ""}`}
            onClick={() => setMode("all")}
          >
            بحث شامل
          </button>
          <button
            type="button"
            className={`sec-chip ${mode === "number" ? "is-active" : ""}`}
            onClick={() => setMode("number")}
          >
            رقم القضية
          </button>
          <button
            type="button"
            className={`sec-chip ${mode === "name" ? "is-active" : ""}`}
            onClick={() => setMode("name")}
          >
            عنوان/محكمة
          </button>
        </div>
      </div>

      <form className="sec-form" onSubmit={onSubmit}>
        <input
          className="sec-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="مثال: 1008 أو (مطالبة) أو (المحكمة)"
        />
        <button className="sec-btn" type="submit">
          بحث
        </button>
      </form>

      <div className="sec-results">
        {loading ? (
          <div className="sec-hint">جارٍ تحميل القضايا من قاعدة البيانات…</div>
        ) : err ? (
          <div className="sec-empty">{err}</div>
        ) : cases.length === 0 ? (
          <div className="sec-empty">لا توجد قضايا في قاعدة البيانات.</div>
        ) : !submitted ? (
          <div className="sec-hint">اكتب كلمة بحث ثم اضغط “بحث”.</div>
        ) : !q.trim() ? (
          <div className="sec-hint">فضلاً اكتب رقم قضية أو عنوان.</div>
        ) : results.length === 0 ? (
          <div className="sec-empty">لا توجد نتائج مطابقة. جرّب كلمات أخرى.</div>
        ) : (
          <div className="sec-grid">
            {results.map((c) => {
              const status = c.status || "—";
              const updatedAt = fmtDate(c.updated_at || c.updatedAt);
              const next = c.next ? String(c.next) : null;
              const court = c.court ? String(c.court) : "";

              return (
                <div key={c.id} className="sec-item">
                  <div className="sec-item-top">
                    <div className="sec-case-no">قضية رقم: {c.case_number}</div>
                    <span
                      className={`sec-badge ${
                        status === "closed" || status === "مكتملة"
                          ? "done"
                          : status.includes("قريبة")
                          ? "soon"
                          : "open"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="sec-case-title">{c.title || "—"}</div>
                  <div className="sec-case-parties">{court}</div>

                  <div className="sec-summary">
                    {next ? `الموعد/الإجراء القادم: ${next}` : "لا يوجد موعد/إجراء قادم مسجل."}
                  </div>

                  <div className="sec-item-foot">
                    <div className="sec-date">آخر تحديث: {updatedAt}</div>
                    <div className="sec-actions">
                      <Link className="sec-link" to={`/admin/cases/${c.id}`}>
                        فتح التفاصيل
                      </Link>
                    </div>
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
