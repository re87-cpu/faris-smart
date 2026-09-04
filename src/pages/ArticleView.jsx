// FILE: src/pages/ArticleView.jsx
// صفحة مقال مفرد — تصميم "Articles.dc.html"
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SiteHeader, SiteFooter } from "../components/SiteChrome.jsx";
import { useReveal } from "../utils/site.js";
import { fetchArticle } from "../mock/api.js";

function fmtDate(v) {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

export default function ArticleView() {
  useReveal();
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    fetchArticle(id)
      .then((x) => { if (alive) setA(x); })
      .catch((e) => { if (alive) setErr(e.message || "تعذّر تحميل المقال."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  return (
    <div className="site" dir="rtl">
      <SiteHeader active="articles" />

      <section className="site-pad-sm" style={{ paddingTop: "9rem" }}>
        <div className="site-wrap" style={{ maxWidth: 820 }}>
          <Link to="/articles" className="site-arrowlink" style={{ marginBottom: "2rem", display: "inline-flex" }}>
            <span>→</span> كل المقالات
          </Link>

          {loading ? (
            <p style={{ textAlign: "center", color: "var(--s-muted)", padding: "2rem" }}>جارٍ التحميل…</p>
          ) : err ? (
            <div className="site-card" style={{ color: "#b3261e" }}>{err}</div>
          ) : !a ? (
            <div className="site-card">المقال غير موجود.</div>
          ) : (
            <article className="rv">
              <div className="site-kicker"><span /><span>مقال</span></div>
              <h1 className="site-h2" style={{ fontSize: "clamp(1.8rem,3.4vw,2.8rem)", lineHeight: 1.3, marginBottom: "1.2rem" }}>{a.title}</h1>
              <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#8C99A7", marginBottom: 28, paddingBottom: 18, borderBottom: "1px solid var(--s-line)" }}>
                <span>{a.authorName || "فريق فارس"}</span><span>·</span>
                <span>{fmtDate(a.publishedAt || a.createdAt)}</span>
              </div>
              <div style={{ color: "#334155", fontSize: 17, lineHeight: 2.1, whiteSpace: "pre-wrap", fontWeight: 300 }}>
                {a.content}
              </div>
            </article>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
