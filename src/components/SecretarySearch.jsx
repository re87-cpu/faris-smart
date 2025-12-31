import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllCases } from "../mock/api.js";

/**
 * سكرتير القضايا الحقيقي
 * - بدون بيانات وهمية
 * - يعتمد على API /cases
 * - خاص بصفحة المدير
 */

function normalize(v = "") {
  return String(v).trim().toLowerCase();
}

export default function SecretarySearch({ compact = false }) {
  const [mode, setMode] = useState("all"); // all | number | name
  const [q, setQ] = useState("");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 تحميل القضايا الحقيقية
  useEffect(() => {
    let alive = true;
    setLoading(true);

    fetchAllCases()
      .then((rows) => {
        if (!alive) return;
        setCases(Array.isArray(rows) ? rows : []);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message || "فشل تحميل القضايا");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  // 🔹 نتائج البحث
  const results = useMemo(() => {
    const query = normalize(q);
    if (!query) return [];

    const isDigits = /^[0-9]+$/.test(query);

    return cases.filter((c) => {
      const num = normalize(c.case_number);
      const title = normalize(c.title);
      const court = normalize(c.court);
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
    <section className={`sec-card ${compact ? "sec-card--compact" : ""}`}>
      <div className="sec-head">
        <div>
          <div className="sec-title">سكرتير القضايا</div>
          <div className="sec-sub">
            بحث مباشر في القضايا المسجلة بالنظام.
          </div>
        </div>

        <div className="sec-modes">
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
            عنوان / محكمة
          </button>
        </div>
      </div>

      <form className="sec-form" onSubmit={onSubmit}>
        <input
          className="sec-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="اكتب رقم القضية أو عنوانها"
        />
        <button className="sec-btn" type="submit">
          بحث
        </button>
      </form>

      <div className="sec-results">
        {loading ? (
          <div className="sec-hint">جاري تحميل القضايا…</div>
        ) : error ? (
          <div className="sec-empty">{error}</div>
        ) : !submitted ? (
          <div className="sec-hint">
            اكتب كلمة البحث ثم اضغط “بحث”.
          </div>
        ) : !q.trim() ? (
          <div className="sec-hint">
            فضلاً أدخل رقم قضية أو عنوان.
          </div>
        ) : results.length === 0 ? (
          <div className="sec-empty">
            لا توجد نتائج مطابقة.
          </div>
        ) : (
          <div className="sec-grid">
            {results.map((c) => (
              <div key={c.id} className="sec-item">
                <div className="sec-item-top">
                  <div className="sec-case-no">
                    قضية رقم: {c.case_number}
                  </div>
                  <span className="sec-badge open">
                    {c.status || "—"}
                  </span>
                </div>

                <div className="sec-case-title">{c.title}</div>
                <div className="sec-case-parties">
                  {c.court || "—"}
                </div>

                <div className="sec-item-foot">
                  <div className="sec-date">
                    آخر تحديث:{" "}
                    {c.updatedAt
                      ? new Date(c.updatedAt).toLocaleDateString("ar-SA")
                      : "—"}
                  </div>
                  <div className="sec-actions">
                    <Link className="sec-link" to={`/cases/${c.id}`}>
                      فتح القضية
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
